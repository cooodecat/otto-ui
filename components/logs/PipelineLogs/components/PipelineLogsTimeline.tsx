'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Circle, Check, X, Activity, 
  Clock, GitCommit, ChevronDown, ChevronUp 
} from 'lucide-react';
import { PipelineLogsTableProps } from '@/types/logs';
import { truncateMessage } from '@/lib/logs';
import LogDetailsDualPanel from './LogDetailsDualPanel';
import { cn } from '@/lib/utils';

interface TimelineGroup {
  date: string;
  logs: any[];
  isExpanded: boolean;
}

const PipelineLogsTimeline: React.FC<PipelineLogsTableProps> = ({
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const observerRef = useRef<HTMLDivElement>(null);

  // Update unread IDs
  useEffect(() => {
    setUnreadLogIds(prev => {
      const newSet = new Set(prev);
      newLogIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, [newLogIds]);

  // Infinite scroll observer
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

  // Mark as read
  const markLogAsRead = (logId: string) => {
    setUnreadLogIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(logId);
      return newSet;
    });
    onMarkAsRead?.(logId);
  };

  // Handle log click
  const handleLogClick = (logId: string) => {
    markLogAsRead(logId);
    setSelectedBuildId(logId);
    setIsDetailsOpen(true);
  };

  // Group logs by date and time
  const groupLogsByDate = (logsToGroup: typeof logs): TimelineGroup[] => {
    const groups: { [key: string]: any[] } = {};
    
    logsToGroup.forEach((log: any) => {
      const date = new Date(log.timestamp);
      const dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return Object.entries(groups).map(([date, logs]) => ({
      date,
      logs: logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      isExpanded: expandedGroups.has(date)
    }));
  };

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Circle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Search highlight
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const timelineGroups = groupLogsByDate(logs);

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
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

        {/* Timeline Groups */}
        <div className="space-y-8">
          {timelineGroups.map((group, groupIndex) => (
            <div key={group.date} className="relative">
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-blue-600 text-center">
                      {new Date(group.logs[0].timestamp).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.date}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({group.logs.length} builds)
                    </span>
                  </h3>
                  <button
                    onClick={() => toggleGroup(group.date)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedGroups.has(group.date) ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Timeline Items */}
              <div className={cn(
                "ml-20 space-y-4 transition-all duration-300",
                !expandedGroups.has(group.date) && group.logs.length > 3 && "max-h-[400px] overflow-hidden relative"
              )}>
                {group.logs.map((log, index) => {
                  const isUnread = unreadLogIds.has(log.id);
                  const isLastItem = groupIndex === timelineGroups.length - 1 && 
                                    index === group.logs.length - 1;
                  
                  // Show only first 3 if collapsed
                  if (!expandedGroups.has(group.date) && index >= 3) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={log.id}
                      ref={isLastItem && hasMore ? observerRef : null}
                      onClick={() => handleLogClick(log.id)}
                      className={cn(
                        "relative group cursor-pointer"
                      )}
                    >
                      {/* Connection Line */}
                      <div className="absolute -left-[52px] top-6 w-10 h-0.5 bg-gray-300" />
                      
                      {/* Status Dot */}
                      <div className={cn(
                        "absolute -left-[68px] top-5 w-4 h-4 rounded-full border-2 border-white shadow",
                        getStatusColor(log.status),
                        log.status === 'running' && 'animate-pulse'
                      )} />

                      {/* Content Card */}
                      <div className={cn(
                        "bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
                        isUnread ? "border-blue-400 bg-blue-50/50" : "border-gray-200",
                        "group-hover:border-blue-300"
                      )}>
                        {/* Unread Badge */}
                        {isUnread && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                        )}

                        <div className="flex items-start justify-between gap-4">
                          {/* Main Content */}
                          <div className="flex-1 space-y-2">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                              {getStatusIcon(log.status)}
                              <h4 className="font-semibold text-gray-900"
                                  dangerouslySetInnerHTML={{ __html: highlightText(log.pipelineName) }} />
                              <span className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full",
                                log.status === 'success' ? 'bg-green-100 text-green-700' :
                                log.status === 'failed' ? 'bg-red-100 text-red-700' :
                                log.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              )}>
                                {log.status}
                              </span>
                            </div>

                            {/* Commit Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <GitCommit className="w-4 h-4" />
                                <span className="font-mono">{log.commit.sha.slice(0, 7)}</span>
                              </div>
                              <span className="text-gray-900"
                                    dangerouslySetInnerHTML={{ __html: highlightText(truncateMessage(log.commit.message, 60)) }} />
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{log.branch}</span>
                              <span>•</span>
                              <span>{log.commit.author}</span>
                              <span>•</span>
                              <span>{log.trigger.type}</span>
                              <span>•</span>
                              <span>{log.duration}</span>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show More Indicator */}
                {!expandedGroups.has(group.date) && group.logs.length > 3 && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>

              {/* Expand Button for Collapsed Groups */}
              {!expandedGroups.has(group.date) && group.logs.length > 3 && (
                <div className="ml-20 mt-4">
                  <button
                    onClick={() => toggleGroup(group.date)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Show {group.logs.length - 3} more builds
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Loading more logs...</span>
            </div>
          </div>
        )}

        {/* End of Timeline */}
        {!hasMore && logs.length > 10 && (
          <div className="relative text-center py-8">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg mx-auto">
                <Check className="w-6 h-6 text-gray-500" />
              </div>
              <p className="mt-4 text-sm text-gray-500">End of timeline</p>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedBuildId && (
        <LogDetailsDualPanel
          buildId={selectedBuildId}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedBuildId(null);
          }}
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

export default PipelineLogsTimeline;
