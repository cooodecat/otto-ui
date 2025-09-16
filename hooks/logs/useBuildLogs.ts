import { useCallback, useEffect, useRef, useState } from "react";
import { logsApi, LogsApiError } from "@/lib/api/logs-api";
import type {
  NormalizedLog,
  RawLogEvent,
  SSEPayload,
  BuildExecStatus,
} from "@/types/logs";

interface UseBuildLogsOptions {
  autoScroll?: boolean;
  idleCheckSeconds?: number; // no events for N seconds triggers status check
  maxBackoffMs?: number; // cap for reconnect backoff
}

interface UseBuildLogsResult {
  logs: NormalizedLog[];
  isLive: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  buildStatus: BuildExecStatus;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reconnect: () => void;
  refetchCache: () => Promise<void>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const toNormalized = (
  events: RawLogEvent[],
  normalized?: NormalizedLog[]
): NormalizedLog[] => {
  if (normalized && normalized.length === events.length) {
    return normalized;
  }
  return events.map((e) => ({
    ts: e.timestamp,
    message: e.message,
    level: "UNKNOWN",
  }));
};

export function useBuildLogs(
  buildId: string,
  options: UseBuildLogsOptions = {}
): UseBuildLogsResult {
  const {
    autoScroll: initialAutoScroll = true,
    idleCheckSeconds = 20,
    maxBackoffMs = 60000,
  } = options;

  const [logs, setLogs] = useState<NormalizedLog[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildExecStatus>("UNKNOWN");
  const [autoScroll, setAutoScroll] = useState<boolean>(initialAutoScroll);

  const containerRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const dedupRef = useRef<Set<string>>(new Set());
  const backoffRef = useRef<number>(1000);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(async () => {
      try {
        const status = await logsApi.getBuildStatus(buildId);
        if (status?.status) setBuildStatus(status.status);
      } catch {
        // ignore polling error
      }
    }, idleCheckSeconds * 1000);
  }, [buildId, idleCheckSeconds]);

  const scrollToBottom = useCallback(() => {
    if (!autoScroll) return;
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [autoScroll]);

  const mergePayload = useCallback(
    (payload: { events: RawLogEvent[]; normalized?: NormalizedLog[] }) => {
      const normalized = toNormalized(payload.events || [], payload.normalized);
      if (!normalized.length) return;

      setLogs((prev) => {
        const merged = [...prev];
        for (const n of normalized) {
          const key = `${n.ts}|${n.message}`;
          if (dedupRef.current.has(key)) continue;
          dedupRef.current.add(key);
          merged.push(n);
          lastTsRef.current = Math.max(lastTsRef.current || 0, n.ts);
          if (n.buildStatus && n.buildStatus !== "IN_PROGRESS") {
            setBuildStatus(n.buildStatus);
          }
        }
        // keep ascending order by ts
        merged.sort((a, b) => a.ts - b.ts);
        return merged;
      });
      resetIdleTimer();
      // defer scroll to next frame
      requestAnimationFrame(scrollToBottom);
    },
    [resetIdleTimer, scrollToBottom]
  );

  const refetchCache = useCallback(async () => {
    try {
      const cache = await logsApi.getBuildCachedLogs(buildId);
      mergePayload(cache);
    } catch (e) {
      const msg =
        e instanceof LogsApiError ? e.message : "Failed to load cached logs";
      setError(msg);
    }
  }, [buildId, mergePayload]);

  const backfillGap = useCallback(async () => {
    try {
      const recent = await logsApi.getBuildRecentLogs(buildId, 200);
      const cutoff = lastTsRef.current || 0;
      const filtered: RawLogEvent[] = (recent.events || []).filter(
        (e) => e.timestamp > cutoff
      );
      mergePayload({ events: filtered, normalized: recent.normalized });
    } catch {
      // ignore backfill error
    }
  }, [buildId, mergePayload]);

  const connect = useCallback(() => {
    if (esRef.current) return;
    setIsConnecting(true);
    setError(null);
    esRef.current = logsApi.createBuildSSEConnection(
      buildId,
      (payload: SSEPayload) => {
        setIsConnected(true);
        setIsConnecting(false);
        backoffRef.current = 1000; // reset backoff on success
        if (payload?.events) mergePayload(payload);
      },
      async (_err: Event) => {
        setIsConnected(false);
        setIsConnecting(false);
        // schedule reconnect with exponential backoff
        const delay = backoffRef.current;
        backoffRef.current = Math.min(backoffRef.current * 2, maxBackoffMs);
        setTimeout(() => {
          // attempt gap backfill before reconnect
          backfillGap().finally(() => {
            disconnect();
            connect();
          });
        }, delay);
      },
      () => {
        // onOpen
      },
      () => {
        setIsConnected(false);
      }
    );
  }, [buildId, backfillGap, maxBackoffMs, mergePayload]);

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      await logsApi.startLogCollection(buildId);
      setIsLive(true);
      // initial cache fetch if empty
      if (logs.length === 0) await refetchCache();
      connect();
    } catch (e) {
      const msg =
        e instanceof LogsApiError ? e.message : "Failed to start collection";
      setError(msg);
      setIsLive(false);
    }
  }, [buildId, connect, logs.length, refetchCache]);

  const stop = useCallback(async () => {
    try {
      setError(null);
      await logsApi.stopLogCollection(buildId);
    } catch {
      // ignore stop error
    } finally {
      setIsLive(false);
      disconnect();
    }
  }, [buildId, disconnect]);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // initial load of cache
  useEffect(() => {
    if (!buildId) return;
    lastTsRef.current = null;
    dedupRef.current = new Set();
    setLogs([]);
    setBuildStatus("UNKNOWN");
    refetchCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId]);

  // cleanup
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      disconnect();
    };
  }, [disconnect]);

  return {
    logs,
    isLive,
    isConnecting,
    isConnected,
    error,
    buildStatus,
    autoScroll,
    setAutoScroll,
    start,
    stop,
    reconnect,
    refetchCache,
    containerRef,
  };
}
