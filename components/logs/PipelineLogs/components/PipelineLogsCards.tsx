'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Check, Circle, GitBranch, User, Clock, Hash, 
  ChevronRight, AlertCircle, Activity, Zap
} from 'lucide-react';
import { PipelineLogsTableProps } from '@/types/logs';
import { truncateMessage } from '@/lib/logs';
import LogDetailsDualPanel from './LogDetailsDualPanel';
import { cn } from '@/lib/utils';

interface PipelineLogsCardsProps extends PipelineLogsTableProps {
  viewMode?: 'cards' | 'table';
}

const PipelineLogsCards: React.FC<PipelineLogsCardsProps> = ({
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
  const observerRef = useRef<HTMLDivElement>(null);

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

  // 카드 클릭 처리
  const handleCardClick = (logId: string) => {
    markLogAsRead(logId);
    setSelectedBuildId(logId);
    setIsDetailsOpen(true);
  };

  // 상세보기 닫기
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBuildId(null);
  };

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success':
        return {
          gradient: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: Check,
          iconColor: 'text-green-600',
          badge: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'failed':
        return {
          gradient: 'from-red-50 to-pink-50',
          border: 'border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          badge: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'running':
        return {
          gradient: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: Activity,
          iconColor: 'text-blue-600 animate-pulse',
          badge: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'pending':
        return {
          gradient: 'from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          icon: Circle,
          iconColor: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-50',
          border: 'border-gray-200',
          icon: Circle,
          iconColor: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }
  };

  // 검색어 하이라이트
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // 시간 그룹화
  const groupLogsByTime = (logsToGroup: typeof logs) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: { [key: string]: typeof logs } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    };

    logsToGroup.forEach((log: any) => {
      const logDate = new Date(log.timestamp);
      if (logDate >= today) {
        groups['Today'].push(log);
      } else if (logDate >= yesterday) {
        groups['Yesterday'].push(log);
      } else if (logDate >= thisWeek) {
        groups['This Week'].push(log);
      } else {
        groups['Older'].push(log);
      }
    });

    return groups;
  };

  const groupedLogs = groupLogsByTime(logs);

  if (logs.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center'>
        <Circle className='w-12 h-12 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No logs found</h3>
        <p className='text-gray-500'>
          {searchQuery ? 'Try adjusting your search criteria' : 'No pipeline logs available yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        {Object.entries(groupedLogs).map(([group, groupLogs]) => {
          if (groupLogs.length === 0) return null;
          
          return (
            <div key={group}>
              {/* Time Group Header */}
              <div className='flex items-center gap-3 mb-3'>
                <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                  {group}
                </h3>
                <div className='flex-1 h-px bg-gray-200'></div>
                <span className='text-xs text-gray-400'>
                  {groupLogs.length} log{groupLogs.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Log Cards */}
              <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
                {groupLogs.map((log: any, index: number) => {
                  const statusStyle = getStatusStyle(log.status);
                  const StatusIcon = statusStyle.icon;
                  const isUnread = unreadLogIds.has(log.id);
                  const isLastItem = index === logs.length - 1;
                  
                  return (
                    <div
                      key={log.id}
                      ref={isLastItem && hasMore ? observerRef : null}
                      onClick={() => handleCardClick(log.id)}
                      className={cn(
                        'group relative bg-gradient-to-r rounded-xl border-2 p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
                        statusStyle.gradient,
                        statusStyle.border,
                        isUnread && 'ring-2 ring-blue-400 ring-offset-2'
                      )}
                    >
                      {/* Unread Indicator */}
                      {isUnread && (
                        <div className='absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse' />
                      )}

                      {/* Card Header */}
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className={cn('p-2 rounded-lg', statusStyle.badge)}>
                            <StatusIcon className={cn('w-5 h-5', statusStyle.iconColor)} />
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900 text-base'
                                dangerouslySetInnerHTML={{ __html: highlightText(log.pipelineName) }} />
                            <p className='text-xs text-gray-500 mt-0.5'>
                              Build #{log.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
                      </div>

                      {/* Card Body */}
                      <div className='space-y-2'>
                        {/* Branch & Author */}
                        <div className='flex items-center gap-4 text-sm'>
                          <div className='flex items-center gap-1.5'>
                            <GitBranch className='w-4 h-4 text-gray-400' />
                            <span className='font-mono text-gray-700'
                                  dangerouslySetInnerHTML={{ __html: highlightText(log.branch) }} />
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <User className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-600'>{log.trigger.author}</span>
                          </div>
                        </div>

                        {/* Commit Message */}
                        <div className='bg-white/60 rounded-lg p-2.5'>
                          <div className='flex items-start gap-2'>
                            <Hash className='w-4 h-4 text-gray-400 mt-0.5' />
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm text-gray-800 break-words'
                                 dangerouslySetInnerHTML={{ __html: highlightText(truncateMessage(log.commit.message, 60)) }} />
                              <p className='text-xs text-gray-500 mt-1'>
                                {log.commit.sha.slice(0, 7)} • {log.commit.author}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className='flex items-center justify-between pt-2 border-t border-gray-200/50'>
                          <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                            <Clock className='w-3.5 h-3.5' />
                            <span>{log.duration}</span>
                          </div>
                          <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                            <Zap className='w-3.5 h-3.5' />
                            <span>{log.trigger.type}</span>
                          </div>
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full border',
                            statusStyle.badge
                          )}>
                            {log.status}
                          </span>
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <div className='flex items-center gap-3'>
              <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
              <span className='text-sm text-gray-600'>Loading more logs...</span>
            </div>
          </div>
        )}

        {/* End of List */}
        {!hasMore && logs.length > 10 && (
          <div className='text-center py-4'>
            <span className='text-sm text-gray-500'>You&apos;ve reached the end of the logs</span>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedBuildId && (
        <LogDetailsDualPanel
          buildId={selectedBuildId}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          buildMetadata={logs.find(l => l.id === selectedBuildId) ? {
            pipeline: logs.find(l => l.id === selectedBuildId)!.pipelineName,
            branch: logs.find(l => l.id === selectedBuildId)!.branch,
            commit: logs.find(l => l.id === selectedBuildId)!.commit.sha,
            author: logs.find(l => l.id === selectedBuildId)!.commit.author,
            duration: logs.find(l => l.id === selectedBuildId)!.duration,
            status: logs.find(l => l.id === selectedBuildId)!.status
          } : undefined}
        />
      )}
    </>
  );
};

export default PipelineLogsCards;