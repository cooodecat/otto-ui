"use client";

import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Maximize2, Minimize2, ExternalLink, Copy, Download, Play, Square, ArrowDownToLine, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LogDetailsPanelProps, ViewMode } from '@/types/logs';
import { useBuildLogs } from '@/hooks/logs/useBuildLogs';
import { useKeyboardShortcuts } from '@/hooks/logs/useKeyboardShortcuts';

/**
 * Log Details Panel Component
 *
 * 파이프라인 로그의 상세 정보를 표시하는 모달 패널
 * Summary/Expanded 뷰 모드 지원
 */
const LogDetailsPanel: React.FC<LogDetailsPanelProps> = ({
  buildId,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 실시간 빌드 로그 + 캐시 통합 훅
  const {
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
  } = useBuildLogs(buildId, { autoScroll: true, idleCheckSeconds: 20 });

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "summary" ? "expanded" : "summary"));
  };

  const handleOpenInNewWindow = () => {
    const url = `/logs/${buildId}?mode=expanded`;
    window.open(url, '_blank', 'width=1200,height=800');
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  // 키보드 단축키
  useKeyboardShortcuts({
    isOpen,
    viewMode,
    onClose,
    onToggleViewMode: toggleViewMode,
    onNavigate: onNavigate || (() => {}),
    onFocusSearch: focusSearch,
    onOpenInNewWindow: handleOpenInNewWindow,
  });

  // 뷰 모드에 따른 모달 크기
  const getModalWidth = () => {
    if (viewMode === "summary") {
      return "max-w-2xl lg:max-w-3xl";
    } else {
      return "max-w-7xl";
    }
  };

  const copyBuildId = () => {
    navigator.clipboard.writeText(buildId);
  };

  const downloadLogs = () => {
    const content = logs
      .map(line => {
        const ts = new Date(line.ts).toISOString();
        const lvl = line.level || 'INFO';
        const src = line.source ? `[${line.source}] ` : '';
        return `[${ts}] ${lvl}: ${src}${line.message}`;
      })
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-${buildId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full ${getModalWidth()} max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col`}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Build #{buildId}
                </Dialog.Title>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">ID: {buildId}</span>
                  <button
                    onClick={copyBuildId}
                    className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                    title="Copy Build ID"
                  >
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleViewMode}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={viewMode === 'summary' ? 'Expand view' : 'Collapse view'}
              >
                {viewMode === "summary" ? (
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-600" />
                )}
              </button>

              <button
                onClick={() => (isLive ? stop() : start())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={isLive ? 'Stop live' : 'Start live'}
              >
                {isLive ? (
                  <Square className="w-4 h-4 text-red-600" />
                ) : (
                  <Play className="w-4 h-4 text-green-600" />
                )}
              </button>

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={autoScroll ? 'Autoscroll on' : 'Autoscroll off'}
              >
                <ArrowDownToLine className={`w-4 h-4 ${autoScroll ? 'text-blue-600' : 'text-gray-600'}`} />
              </button>
              
              <button
                onClick={handleOpenInNewWindow}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={downloadLogs}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Download logs"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>

              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* 내용 */}
          <div className="flex-1 overflow-hidden">
            {isConnecting && !isConnected && logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Connecting live log stream...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-600 mb-2">{error}</div>
                  <button
                    onClick={reconnect}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-0 h-full flex flex-col">
                {/* 상태 배지 영역 */}
                <div className="px-6 pt-6 flex items-center gap-3">
                  {buildStatus === 'SUCCEEDED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Build Succeeded
                    </span>
                  )}
                  {buildStatus === 'FAILED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" /> Build Failed
                    </span>
                  )}
                  {error && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" /> {error}
                    </span>
                  )}
                  <div className="ml-auto text-xs text-gray-500 pr-6">
                    {isConnected ? 'Live connected' : isConnecting ? 'Connecting…' : 'Idle'}
                  </div>
                </div>

                {/* 로그 뷰 */}
                <div ref={containerRef} className="flex-1 bg-black text-gray-100 font-mono text-xs overflow-y-auto rounded-b-xl p-4 mt-3">
                  {logs.map((line, idx) => {
                    const levelColor = line.level === 'ERROR' ? 'text-red-400' :
                      line.level === 'WARN' ? 'text-yellow-300' :
                      line.level === 'DEBUG' ? 'text-gray-400' :
                      'text-blue-300';
                    const phaseColor = line.phase === 'BUILD' ? 'bg-indigo-700/40' :
                      line.phase === 'PRE_BUILD' ? 'bg-sky-700/40' :
                      line.phase === 'POST_BUILD' ? 'bg-teal-700/40' :
                      line.phase === 'INSTALL' ? 'bg-emerald-700/40' :
                      line.phase === 'FINAL' ? 'bg-purple-700/40' : 'bg-gray-700/40';
                    return (
                      <div key={`${line.ts}-${idx}`} className="mb-1 whitespace-pre-wrap break-words">
                        <span className="text-gray-400">[{new Date(line.ts).toLocaleTimeString()}]</span>
                        <span className={`ml-2 ${levelColor}`}>{line.level}</span>
                        {line.phase && (
                          <span className={`ml-2 inline-flex items-center px-1 py-0.5 rounded ${phaseColor}`}>{line.phase}</span>
                        )}
                        {line.source && (
                          <span className="ml-2 inline-flex items-center px-1 py-0.5 rounded bg-gray-700/40">[{line.source}]</span>
                        )}
                        {line.code && (
                          <span className="ml-2 inline-flex items-center px-1 py-0.5 rounded bg-red-700/40">{line.code}</span>
                        )}
                        <span className="ml-2">{line.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LogDetailsPanel;
