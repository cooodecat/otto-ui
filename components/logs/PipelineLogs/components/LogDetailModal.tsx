'use client';

import React from 'react';
import { X, ExternalLink, Clock, GitBranch, Hash } from 'lucide-react';
import UnifiedLogViewer from '@/components/logs/UnifiedLogViewer';
import { LogItem } from '@/types/logs';
import { cn } from '@/lib/utils';

interface LogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: LogItem | null;
  projectName?: string;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
  projectName
}) => {
  if (!isOpen || !log) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-7xl h-[90vh] mx-4 bg-white rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                빌드 로그 상세
              </h2>
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full border',
                getStatusColor(log.status)
              )}>
                {log.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {projectName && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">프로젝트:</span>
                  <span>{projectName}</span>
                </div>
              )}
              
              {log.pipelineName && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">파이프라인:</span>
                  <span>{log.pipelineName}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span>{log.id.slice(0, 7)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                <span>{log.branch}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{log.duration}</span>
              </div>
            </div>
            
            {log.commit && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">커밋 메시지</div>
                <div className="text-sm text-gray-700 font-mono">
                  {log.commit.sha.slice(0, 7)} - {log.commit.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  by {log.commit.author}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Log Viewer */}
        <div className="flex-1 overflow-hidden p-6">
          <UnifiedLogViewer
            buildId={log.awsBuildId || log.id} // awsBuildId가 있으면 사용, 없으면 id 사용
            autoRefresh={log.status === 'running'}
            refreshInterval={3000}
            className="h-full"
            onLogClick={(logEntry) => {
              console.log('Log clicked:', logEntry);
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {log.trigger && (
              <span>
                트리거: {log.trigger.type} by {log.trigger.author} at {log.trigger.time}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // AWS CodeBuild 콘솔로 이동
                window.open(
                  `https://console.aws.amazon.com/codesuite/codebuild/projects/${log.pipelineName}/build/${log.id}`,
                  '_blank'
                );
              }}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              AWS Console에서 보기
            </button>
            
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;