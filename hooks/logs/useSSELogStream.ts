/**
 * Server-Sent Events Hook for Real-time Log Streaming
 * 
 * CloudWatch Logs API 백엔드와 SSE 연결을 관리하는 커스텀 훅
 * 실시간 로그 스트리밍, 자동 재연결, 연결 상태 관리 기능 제공
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { LogItem } from '@/types/logs';
import { logsApi, SSELogEvent } from '@/lib/api/logs-api';

export interface SSEConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessageTime: number | null;
  reconnectCount: number;
}

export interface UseSSELogStreamOptions {
  // 자동 연결 여부 (기본값: false)
  autoConnect?: boolean;
  // 재연결 간격 (기본값: 3000ms)
  reconnectInterval?: number;
  // 최대 재연결 시도 횟수 (기본값: 5)
  maxReconnectAttempts?: number;
  // 연결 타임아웃 (기본값: 30000ms)
  connectionTimeout?: number;
}

export interface UseSSELogStreamResult {
  // 연결 상태
  connectionState: SSEConnectionState;
  
  // 연결 제어 함수들
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // 상태 체크 함수
  isConnected: boolean;
  isConnecting: boolean;
  hasError: boolean;
}

export const useSSELogStream = (
  buildId: string,
  onMessage: (logs: LogItem[]) => void,
  options: UseSSELogStreamOptions = {}
): UseSSELogStreamResult => {
  const {
    autoConnect = false,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    connectionTimeout = 30000
  } = options;

  // EventSource 참조
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 연결 상태 관리
  const [connectionState, setConnectionState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessageTime: null,
    reconnectCount: 0
  });

  // 타임아웃 정리 함수
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  // EventSource 정리 함수
  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    clearTimeouts();
  }, [clearTimeouts]);

  // 연결 함수
  const connect = useCallback(() => {
    if (eventSourceRef.current || !buildId) return;

    console.log(`🔗 Attempting SSE connection to build: ${buildId}`);
    
    setConnectionState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    try {
      // 연결 타임아웃 설정
      connectionTimeoutRef.current = setTimeout(() => {
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Connection timeout'
        }));
        cleanupEventSource();
      }, connectionTimeout);

      // SSE 연결 생성
      const eventSource = logsApi.createSSEConnection(
        buildId,
        // onMessage 핸들러
        (event: SSELogEvent) => {
          const now = Date.now();
          setConnectionState(prev => ({
            ...prev,
            lastMessageTime: now,
            error: null,
            reconnectCount: 0 // 메시지 수신 시 재연결 카운터 리셋
          }));
          
          console.log(`📡 Received ${event.events.length} log events`);
          onMessage(event.events);
        },
        
        // onError 핸들러
        (error: Event) => {
          console.error('SSE connection error:', error);
          setConnectionState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            error: 'Connection error occurred'
          }));
          
          // 자동 재연결 시도
          const currentReconnectCount = connectionState.reconnectCount;
          if (currentReconnectCount < maxReconnectAttempts) {
            console.log(`🔄 Scheduling reconnection attempt ${currentReconnectCount + 1}/${maxReconnectAttempts} in ${reconnectInterval}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setConnectionState(prev => ({
                ...prev,
                reconnectCount: prev.reconnectCount + 1
              }));
              cleanupEventSource();
              connect();
            }, reconnectInterval);
          } else {
            console.error('🚫 Max reconnection attempts reached');
            setConnectionState(prev => ({
              ...prev,
              error: `Connection failed after ${maxReconnectAttempts} attempts`
            }));
          }
        },
        
        // onOpen 핸들러
        () => {
          clearTimeouts();
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: null,
            reconnectCount: 0
          }));
          console.log(`✅ SSE connected successfully to build: ${buildId}`);
        },
        
        // onClose 핸들러
        () => {
          setConnectionState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false
          }));
          console.log(`🔌 SSE connection closed for build: ${buildId}`);
        }
      );

      eventSourceRef.current = eventSource;

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      clearTimeouts();
    }
  }, [buildId, onMessage, connectionTimeout, reconnectInterval, maxReconnectAttempts, connectionState.reconnectCount, cleanupEventSource, clearTimeouts]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    console.log(`🔌 Manually disconnecting SSE for build: ${buildId}`);
    cleanupEventSource();
    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectCount: 0
    }));
  }, [buildId, cleanupEventSource]);

  // 재연결 함수
  const reconnect = useCallback(() => {
    console.log(`🔄 Manual reconnection for build: ${buildId}`);
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [buildId, disconnect, connect]);

  // 컴포넌트 마운트 시 자동 연결
  useEffect(() => {
    if (autoConnect && buildId) {
      connect();
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      cleanupEventSource();
    };
  }, [buildId, autoConnect]); // connect는 의존성에서 제외 (무한 루프 방지)

  // buildId 변경 시 재연결
  useEffect(() => {
    if (eventSourceRef.current && buildId) {
      console.log(`🔄 Build ID changed, reconnecting to: ${buildId}`);
      reconnect();
    }
  }, [buildId]); // reconnect는 의존성에서 제외 (무한 루프 방지)

  return {
    connectionState,
    connect,
    disconnect,
    reconnect,
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    hasError: !!connectionState.error
  };
};