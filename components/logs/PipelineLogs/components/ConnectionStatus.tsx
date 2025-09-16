'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting?: boolean;
  error?: string;
  reconnectCount?: number;
  lastMessageTime?: number;
  onReconnect?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting = false,
  error,
  reconnectCount = 0,
  lastMessageTime,
  onReconnect
}) => {
  const getLatency = () => {
    if (!lastMessageTime) return null;
    const diff = Date.now() - lastMessageTime;
    if (diff < 1000) return `${diff}ms`;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    return `${Math.floor(diff / 60000)}m ago`;
  };

  const latency = getLatency();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={cn(
        "bg-white rounded-lg shadow-lg border p-3 min-w-[200px] transition-all duration-300",
        isConnected ? "border-green-200" : error ? "border-red-200" : "border-yellow-200"
      )}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="relative">
                  <Wifi className="w-4 h-4 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Live</span>
                  {latency && (
                    <span className="text-xs text-gray-500 ml-1">• {latency}</span>
                  )}
                </div>
              </>
            ) : isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
                <div>
                  <span className="text-sm font-medium text-yellow-700">Connecting...</span>
                  {reconnectCount > 0 && (
                    <span className="text-xs text-gray-500 block">
                      Attempt {reconnectCount}
                    </span>
                  )}
                </div>
              </>
            ) : error ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-red-700">Disconnected</span>
                  <span className="text-xs text-gray-500 block truncate max-w-[150px]">
                    {error}
                  </span>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Offline</span>
              </>
            )}
          </div>

          {!isConnected && !isConnecting && onReconnect && (
            <button
              onClick={onReconnect}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>

        {/* Latency Indicator Bar */}
        {isConnected && lastMessageTime && (
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                latency && latency.includes('ms') ? "bg-green-500 w-full" :
                latency && latency.includes('s ago') ? "bg-yellow-500 w-3/4" :
                "bg-red-500 w-1/2"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;