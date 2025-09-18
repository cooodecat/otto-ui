"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, Circle, GitBranch, User, Clock, Hash } from 'lucide-react';
import { LogItem, PipelineLogsTableProps } from '@/types/logs';
import { truncateMessage } from '@/lib/logs';
import LogDetailsDualPanel from './LogDetailsDualPanel';

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
  onLogClick,
}) => {
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [unreadLogIds, setUnreadLogIds] = useState<Set<string>>(newLogIds);
  const observerRef = useRef<HTMLTableRowElement>(null);

  // newLogIds 변경 시 unreadLogIds 업데이트
  useEffect(() => {
    setUnreadLogIds((prev) => {
      const newSet = new Set(prev);
      newLogIds.forEach((id) => newSet.add(id));
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
    setUnreadLogIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(logId);
      return newSet;
    });
    onMarkAsRead?.(logId);
  };

  // 행 클릭 처리
  const handleRowClick = (log: LogItem) => {
    markLogAsRead(log.id);
    if (onLogClick) {
      onLogClick(log);
    } else {
      setSelectedBuildId(log.id);
      setIsDetailsOpen(true);
    }
  };

  // 상세보기 닫기
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBuildId(null);
  };

  // 상태별 아이콘 및 색상
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "success":
        return {
          icon: <Check className="w-4 h-4" />,
          color: "text-green-600",
          bg: "bg-green-50",
        };
      case "failed":
        return {
          icon: <Circle className="w-4 h-4" />,
          color: "text-red-600",
          bg: "bg-red-50",
        };
      case "running":
        return {
          icon: <Circle className="w-4 h-4 animate-pulse" />,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      case "pending":
        return {
          icon: <Circle className="w-4 h-4" />,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
        };
      default:
        return {
          icon: <Circle className="w-4 h-4" />,
          color: "text-gray-600",
          bg: "bg-gray-50",
        };
    }
  };

  // 검색어 하이라이트
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
    );
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <Circle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No logs found
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? "Try adjusting your search criteria"
            : "No pipeline logs available yet"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pipeline
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commit
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log, index) => {
                const statusDisplay = getStatusDisplay(log.status);
                const isUnread = unreadLogIds.has(log.id);
                const isLastItem = index === logs.length - 1;

                return (
                  <tr
                    key={log.id}
                    ref={isLastItem && hasMore ? observerRef : null}
                    onClick={() => handleRowClick(log)}
                    className={`group cursor-pointer transition-all duration-200 hover:bg-blue-50/50 hover:shadow-sm ${
                      isUnread
                        ? "bg-blue-50/30 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} ${statusDisplay.bg}`}
                      >
                        {statusDisplay.icon}
                        <span className="capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="font-medium text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(log.pipelineName),
                          }}
                        />
                        {isUnread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{log.trigger.type}</div>
                          <div className="text-xs text-gray-500">
                            by {log.trigger.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span
                          className="font-mono text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(log.branch),
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-gray-600">
                            {log.commit.sha}
                          </span>
                        </div>
                        <div
                          className="text-sm text-gray-900 max-w-xs"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              truncateMessage(log.commit.message, 50)
                            ),
                          }}
                        />
                        <div className="text-xs text-gray-500">
                          by {log.commit.author}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{log.duration}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">
                Loading more logs...
              </span>
            </div>
          </div>
        )}

        {/* 더 이상 로드할 데이터가 없는 경우 */}
        {!hasMore && logs.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-center">
            <span className="text-sm text-gray-500">
              You&apos;ve reached the end of the logs
            </span>
          </div>
        )}
      </div>

      {/* 로그 상세보기 모달 */}
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

export default PipelineLogsTable;
