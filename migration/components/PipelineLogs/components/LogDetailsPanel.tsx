'use client';

import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { LogDetailsPanelProps, ViewMode } from '../../../types';
import { useLogData } from '../../../hooks/useLogData';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';

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

  // 로그 데이터 로드 (새 프로젝트에서 API 함수 주입 필요)
  const { logData, loading, error, refetch } = useLogData(buildId, {
    // 새 프로젝트에서 구현:
    // fetchLogData: async (buildId) => await api.getLogs(buildId),
    // getMockData: (buildId) => mockLogDataCollection[buildId] || null,
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
      return 'max-w-3xl lg:max-w-4xl xl:max-w-6xl';
    }
  };

  const getResponsiveWidth = () => {
    if (typeof window === 'undefined') return '672px';

    const screenWidth = window.innerWidth;

    if (viewMode === 'summary') {
      if (screenWidth >= 1024) return '768px';
      return '672px';
    } else {
      return '1100px';
    }
  };

  const getModalClasses = () => {
    const baseClasses =
      'fixed right-[30px] top-1/2 transform -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out overflow-hidden';
    const widthClasses = getModalWidth();
    const heightClasses = viewMode === 'summary' ? 'max-h-[80vh]' : 'max-h-[90vh] h-[90vh]';

    return `${baseClasses} ${widthClasses} ${heightClasses}`;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* 오버레이 */}
        <Dialog.Overlay className='fixed inset-0 bg-black/10 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />

        {/* 메인 컨텐츠 */}
        <Dialog.Content
          className={getModalClasses()}
          style={{
            zIndex: 50,
            width: getResponsiveWidth(),
            maxWidth: '90vw',
          }}
        >
          {/* 접근성을 위한 숨겨진 제목과 설명 */}
          <Dialog.Title className='sr-only'>Build Details - {buildId}</Dialog.Title>
          <Dialog.Description className='sr-only'>
            Detailed view of build logs, pipeline stages, and build information for build {buildId}
          </Dialog.Description>

          {/* 로딩 상태 */}
          {loading && (
            <div className='flex items-center justify-center h-96'>
              <div className='flex flex-col items-center gap-4'>
                <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
                <p className='text-gray-600'>Loading build details...</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className='flex items-center justify-center h-96'>
              <div className='text-center'>
                <div className='text-red-500 text-4xl mb-4'>⚠️</div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Error Loading Build</h3>
                <p className='text-gray-600 mb-4'>{error}</p>
                <div className='flex gap-2 justify-center'>
                  <button
                    onClick={refetch}
                    className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors'
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className='px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors'
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 성공 상태 - 실제 컨텐츠 */}
          {logData && !loading && !error && (
            <div className='p-6'>
              {/* 헤더 */}
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Build #{logData.buildNumber}
                  </h2>
                  <p className='text-gray-500'>{logData.projectName}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={toggleViewMode}
                    className='px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                  >
                    {viewMode === 'summary' ? 'Expand' : 'Collapse'}
                  </button>
                  <button
                    onClick={handleOpenInNewWindow}
                    className='px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors'
                  >
                    New Window
                  </button>
                  <button
                    onClick={onClose}
                    className='px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className='grid grid-cols-2 gap-4 mb-6'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Status</label>
                  <p className={`text-sm font-medium ${
                    logData.overallStatus === 'SUCCESS' ? 'text-green-600' :
                    logData.overallStatus === 'FAILED' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {logData.overallStatus}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Duration</label>
                  <p className='text-sm text-gray-900'>{logData.duration}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Branch</label>
                  <p className='text-sm text-gray-900'>{logData.branch}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Trigger</label>
                  <p className='text-sm text-gray-900'>{logData.trigger}</p>
                </div>
              </div>

              {/* 커밋 정보 */}
              <div className='mb-6'>
                <label className='text-sm font-medium text-gray-500'>Commit</label>
                <div className='mt-1 p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-900'>{logData.commitMessage}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {logData.commitHash} by {logData.commitAuthor}
                  </p>
                </div>
              </div>

              {/* 파이프라인 단계 */}
              <div className='mb-6'>
                <label className='text-sm font-medium text-gray-500 mb-3 block'>Pipeline Stages</label>
                <div className='space-y-2'>
                  {logData.pipeline.map((stage, index) => (
                    <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className={`w-3 h-3 rounded-full ${
                          stage.status === 'SUCCESS' ? 'bg-green-500' :
                          stage.status === 'FAILED' ? 'bg-red-500' :
                          stage.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-300'
                        }`} />
                        <span className='text-sm font-medium text-gray-900'>{stage.stage}</span>
                      </div>
                      <span className='text-sm text-gray-500'>{stage.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 로그 미리보기 */}
              <div>
                <label className='text-sm font-medium text-gray-500 mb-3 block'>Recent Logs</label>
                <div className='bg-gray-900 text-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-xs'>
                  {logData.logs.recentLines.map((line, index) => (
                    <div key={index} className='mb-1'>
                      <span className='text-gray-400'>{line.timestamp}</span>
                      <span className={`ml-2 ${
                        line.level === 'ERROR' ? 'text-red-400' :
                        line.level === 'WARN' ? 'text-yellow-400' :
                        line.level === 'INFO' ? 'text-blue-400' :
                        'text-gray-300'
                      }`}>
                        [{line.level}]
                      </span>
                      <span className='ml-2'>{line.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 키보드 단축키 안내 */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <p className='text-xs text-gray-500'>
                  Keyboard shortcuts: <kbd>Space</kbd> toggle view, <kbd>Esc</kbd> close, <kbd>Ctrl+F</kbd> search
                </p>
              </div>
            </div>
          )}

          {/* 숨겨진 검색 input */}
          <input ref={searchInputRef} type='text' className='sr-only' tabIndex={-1} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LogDetailsPanel;