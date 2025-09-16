/**
 * Otto Pipeline Logs API Client
 *
 * CloudWatch Logs API 기반 백엔드와의 통신을 담당
 * Server-Sent Events(SSE)를 통한 실시간 로그 스트리밍 지원
 */

import { LogItem } from "@/types/logs";

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_VERSION = "v1";

export interface LogsApiResponse {
  success: boolean;
  data?: LogItem[];
  message?: string;
  timestamp?: number;
}

export class LogsApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "LogsApiError";
    this.status = status;
    this.code = code;
  }
}

export interface LogCollectionStatus {
  buildId: string;
  isActive: boolean;
  startTime?: number;
  logCount?: number;
  lastUpdate?: number;
}

export interface SSELogEvent {
  buildId: string;
  events: LogItem[];
  timestamp: number;
}

/**
 * Pipeline Logs API Client
 */
export class LogsApiClient {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = `${baseUrl}/api/${API_VERSION}`;
  }

  /**
   * HTTP 요청 헬퍼 함수
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new LogsApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          `HTTP_${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * 로그 수집 시작
   * POST /logs/builds/{buildId}/start
   */
  async startLogCollection(buildId: string): Promise<LogsApiResponse> {
    return this.request<LogsApiResponse>(`/logs/builds/${buildId}/start`, {
      method: "POST",
    });
  }

  /**
   * 로그 수집 중지
   * POST /logs/builds/{buildId}/stop
   */
  async stopLogCollection(buildId: string): Promise<LogsApiResponse> {
    return this.request<LogsApiResponse>(`/logs/builds/${buildId}/stop`, {
      method: "POST",
    });
  }

  /**
   * 캐시된 모든 로그 조회
   * GET /logs/builds/{buildId}
   */
  async getAllLogs(buildId: string): Promise<LogsApiResponse> {
    return this.request<LogsApiResponse>(`/logs/builds/${buildId}`);
  }

  /**
   * 최근 N개 로그 조회
   * GET /logs/builds/{buildId}/recent?limit=N
   */
  async getRecentLogs(
    buildId: string,
    limit: number = 100
  ): Promise<LogsApiResponse> {
    return this.request<LogsApiResponse>(
      `/logs/builds/${buildId}/recent?limit=${limit}`
    );
  }

  /**
   * 로그 수집 상태 확인
   * GET /logs/builds/{buildId}/status
   */
  async getLogStatus(buildId: string): Promise<LogCollectionStatus> {
    return this.request<LogCollectionStatus>(`/logs/builds/${buildId}/status`);
  }

  /**
   * Server-Sent Events 연결 생성
   * GET /logs/builds/{buildId}/stream
   */
  createSSEConnection(
    buildId: string,
    onMessage: (event: SSELogEvent) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void,
    onClose?: () => void
  ): EventSource {
    // 기존 연결이 있으면 종료
    this.closeSSEConnection();

    const sseUrl = `${this.baseUrl}/logs/builds/${buildId}/stream`;
    const eventSource = new EventSource(sseUrl);

    // 메시지 수신 핸들러
    eventSource.onmessage = (event) => {
      try {
        const data: SSELogEvent = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("SSE message parsing error:", error);
      }
    };

    // 연결 열림 핸들러
    eventSource.onopen = () => {
      console.log(`🔗 SSE connected to build: ${buildId}`);
      onOpen?.();
    };

    // 에러 핸들러
    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      onError?.(error);

      // 연결이 끊어지면 자동 재연결 시도 (3초 후)
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("SSE connection closed, attempting reconnect in 3s...");
        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            this.createSSEConnection(
              buildId,
              onMessage,
              onError,
              onOpen,
              onClose
            );
          }
        }, 3000);
      }
    };

    // 연결 종료 시 정리
    const originalClose = eventSource.close.bind(eventSource);
    eventSource.close = () => {
      console.log(`🔌 SSE disconnected from build: ${buildId}`);
      onClose?.();
      originalClose();
    };

    return eventSource;
  }

  /**
   * SSE 연결 종료
   */
  closeSSEConnection(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

/**
 * 싱글톤 API 클라이언트 인스턴스
 */
export const logsApi = new LogsApiClient();

/**
 * API 헬퍼 함수들 (기존 코드와의 호환성 유지)
 */
export const fetchLogData = async (buildId: string): Promise<LogItem[]> => {
  try {
    const response = await logsApi.getRecentLogs(buildId, 500);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch log data:", error);
    throw error;
  }
};

export const startLogStream = (
  buildId: string,
  onMessage: (logs: LogItem[]) => void,
  onError?: (error: Event) => void
): EventSource => {
  return logsApi.createSSEConnection(
    buildId,
    (event: SSELogEvent) => {
      onMessage(event.events);
    },
    onError,
    () => console.log("Log stream connected"),
    () => console.log("Log stream disconnected")
  );
};

export const stopLogStream = (eventSource: EventSource): void => {
  eventSource.close();
};
