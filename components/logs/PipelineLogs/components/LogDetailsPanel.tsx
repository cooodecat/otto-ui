'use client';

import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Maximize2, Minimize2, ExternalLink, Copy, Download } from 'lucide-react';
import { LogDetailsPanelProps, ViewMode } from '@/types/logs';
import { useLogData } from '@/hooks/logs/useLogData';
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
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 로그 데이터 로드 - Phase 5에서 실제 API로 교체 예정
  const { logData, loading, error, refetch } = useLogData(buildId, {
    // 목업 데이터 함수 (실제 API 연동 전까지 사용)
    getMockData: (buildId) => {
      // 간단한 목업 데이터 반환
      return {
        buildId,
        buildNumber: Math.floor(Math.random() * 1000) + 1,
        projectName: 'otto-ui',
        buildStatus: 'SUCCEEDED' as const,
        overallStatus: 'SUCCESS' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: '3m 45s',
        trigger: 'GitHub Push' as const,
        branch: 'main',
        commitHash: 'a1b2c3d',
        commitMessage: 'feat: implement pipeline logs',
        commitAuthor: 'developer',
        pipeline: [
          {
            stage: 'Source Download',
            status: 'SUCCESS' as const,
            duration: '30s',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
          },
          {
            stage: 'Build & Test',
            status: 'SUCCESS' as const,
            duration: '2m 45s',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
          },
          {
            stage: 'Deploy',
            status: 'SUCCESS' as const,
            duration: '30s',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
          }
        ],
        logs: {
          totalLines: 150,
          recentLines: [
            {
              timestamp: new Date().toISOString(),
              level: 'INFO' as const,
              message: 'Starting build process...',
              source: 'build'
            },
            {
              timestamp: new Date().toISOString(),
              level: 'INFO' as const,
              message: 'Installing dependencies...',
              source: 'npm'
            },
            {
              timestamp: new Date().toISOString(),
              level: 'INFO' as const,
              message: 'Build completed successfully',
              source: 'build'
            }
          ],
          hasErrors: false,
          cloudWatchUrl: '#'
        }
      };
    },
    simulateDelay: 500
  });

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'summary' ? 'expanded' : 'summary');
  };

  const handleOpenInNewWindow = () => {
    if (logData) {
      const url = `/logs/${buildId}?mode=expanded`;
      window.open(url, '_blank', 'width=1200,height=800');
    }
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
    if (viewMode === 'summary') {
      return 'max-w-2xl lg:max-w-3xl';
    } else {
      return 'max-w-7xl';
    }
  };

  const copyBuildId = () => {
    navigator.clipboard.writeText(buildId);
  };

  const downloadLogs = () => {
    if (logData?.logs) {
      const content = logData.logs.recentLines
        .map(line => `[${line.timestamp}] ${line.level}: ${line.message}`)
        .join('\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `build-${buildId}-logs.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
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
                  Build #{logData?.buildNumber || '...'}
                </Dialog.Title>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">ID: {buildId}</span>
                  <button
                    onClick={copyBuildId}
                    className="p-1 hover:bg-gray-100 rounded"
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={viewMode === 'summary' ? 'Expand view' : 'Collapse view'}
              >
                {viewMode === 'summary' ? (
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={handleOpenInNewWindow}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={downloadLogs}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download logs"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* 내용 */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Loading build details...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-600 mb-2">Failed to load build details</div>
                  <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : logData ? (
              <div className="p-6 h-full overflow-y-auto">
                {/* 빌드 정보 요약 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="font-semibold text-green-600">{logData.overallStatus}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Duration</div>
                    <div className="font-semibold">{logData.duration}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Branch</div>
                    <div className="font-semibold font-mono">{logData.branch}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Commit</div>
                    <div className="font-semibold font-mono">{logData.commitHash}</div>
                  </div>
                </div>

                {/* 파이프라인 단계 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pipeline Stages</h3>
                  <div className="space-y-2">
                    {logData.pipeline.map((stage, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          stage.status === 'SUCCESS' ? 'bg-green-500' :
                          stage.status === 'FAILED' ? 'bg-red-500' :
                          stage.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium">{stage.stage}</div>
                          <div className="text-sm text-gray-500">{stage.duration}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-600">{stage.status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 로그 미리보기 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Logs</h3>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 max-h-64 overflow-y-auto">
                    {logData.logs.recentLines.map((line, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-400">[{new Date(line.timestamp).toLocaleTimeString()}]</span>
                        <span className={`ml-2 ${
                          line.level === 'ERROR' ? 'text-red-400' :
                          line.level === 'WARN' ? 'text-yellow-400' :
                          line.level === 'INFO' ? 'text-blue-400' :
                          'text-gray-300'
                        }`}>
                          {line.level}:
                        </span>
                        <span className="ml-2">{line.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View full logs ({logData.logs.totalLines} lines)
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LogDetailsPanel;