'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Circle } from 'lucide-react';
import { PipelineLogsTableProps } from '../../../types';
import LogDetailsPanel from './LogDetailsPanel';

/**
 * Pipeline Logs Table Component
 * 
 * 파이프라인 로그 목록을 테이블 형태로 표시
 * 무한 스크롤, 상세보기, 읽음 처리 기능 포함
 */
const PipelineLogsTable: React.FC<PipelineLogsTableProps> = ({
  logs,
  newLogIds,
  onLoadMore,
  hasMore,
  isLoading,
  searchQuery,
  onMarkAsRead,
}) => {
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [unreadLogIds, setUnreadLogIds] = useState<Set<string>>(newLogIds);
  const observerRef = useRef<HTMLTableRowElement>(null);

  // newLogIds 변경 시 unreadLogIds 업데이트
  useEffect(() => {
    setUnreadLogIds(prev => {
      const newSet = new Set(prev);
      newLogIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, [newLogIds]);

  // 무한 스크롤 관찰자
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // 읽음 처리
  const markLogAsRead = (logId: string) => {
    setUnreadLogIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(logId);
      return newSet;
    });
    onMarkAsRead?.(logId);
  };

  // 행 클릭 처리
  const handleRowClick = (logId: string) => {
    markLogAsRead(logId);
    setSelectedBuildId(logId);
    setIsDetailsOpen(true);
  };

  // 상세보기 닫기
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBuildId(null);
  };

  // 상태별 아이콘 및 색상
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: <Check className='w-4 h-4 text-green-600' />,
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'failed':
        return {
          icon: <Circle className='w-4 h-4 text-red-600' />,
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'running':
        return {
          icon: <Circle className='w-4 h-4 text-blue-600 animate-pulse' />,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'pending':
        return {
          icon: <Circle className='w-4 h-4 text-yellow-600' />,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      default:
        return {
          icon: <Circle className='w-4 h-4 text-gray-600' />,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  // 읽지 않은 로그 확인
  const isUnreadLog = (logId: string): boolean => {
    return unreadLogIds.has(logId);
  };

  return (
    <>
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Pipeline
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Trigger
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Branch
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Commit
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {logs.map((log, index) => {
                const statusDisplay = getStatusDisplay(log.status);
                const isUnread = isUnreadLog(log.id);
                
                return (
                  <tr
                    key={log.id}
                    onClick={() => handleRowClick(log.id)}
                    className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      isUnread ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                    }`}
                    ref={index === logs.length - 3 ? observerRef : null}
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
                        {statusDisplay.icon}
                        <span className='ml-1.5 capitalize'>{log.status}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        {isUnread && (
                          <div className='w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse' />
                        )}
                        <div className='text-sm font-medium text-gray-900'>
                          {log.pipelineName}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>{log.trigger.type}</div>
                      <div className='text-sm text-gray-500'>by {log.trigger.author}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                        {log.branch}
                      </span>
                    </td>
                    <td className='px-6 py-4 max-w-xs'>
                      <div className='text-sm text-gray-900 truncate'>{log.commit.message}</div>
                      <div className='text-sm text-gray-500'>
                        {log.commit.sha} by {log.commit.author}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {log.duration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <div className='flex items-center gap-3'>
              <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
              <span className='text-gray-600'>Loading more logs...</span>
            </div>
          </div>
        )}

        {/* 더 이상 로드할 데이터가 없을 때 */}
        {!hasMore && logs.length > 0 && (
          <div className='flex items-center justify-center py-6 border-t border-gray-200'>
            <span className='text-gray-500 text-sm'>No more logs to load</span>
          </div>
        )}

        {/* 로그가 없을 때 */}
        {logs.length === 0 && !isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='text-gray-400 text-4xl mb-4'>📝</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No logs found</h3>
              <p className='text-gray-500'>
                {searchQuery ? 'Try adjusting your search or filters' : 'No pipeline logs available'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 로그 상세보기 패널 */}
      {selectedBuildId && (
        <LogDetailsPanel
          buildId={selectedBuildId}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export default PipelineLogsTable;