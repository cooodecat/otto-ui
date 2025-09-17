'use client';

import React, { useEffect, useState } from 'react';
import { getBuildMetadata, BuildMetadata as BuildMetadataType } from '@/lib/api/unified-logs-api';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  GitCommit,
  User,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive,
  HardDrive,
  FileText,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface BuildMetadataProps {
  buildId: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const BuildMetadata: React.FC<BuildMetadataProps> = ({
  buildId,
  className,
  autoRefresh = false,
  refreshInterval = 10000
}) => {
  const [metadata, setMetadata] = useState<BuildMetadataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBuildMetadata(buildId);
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metadata');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching metadata:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();

    if (autoRefresh) {
      const interval = setInterval(fetchMetadata, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [buildId, autoRefresh, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RUNNING':
        return <PlayCircle className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'STOPPED':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'RUNNING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'STOPPED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchMetadata}
            className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Build Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Build #{metadata.buildNumber}</h3>
          <button
            onClick={fetchMetadata}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Refresh metadata"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          {getStatusIcon(metadata.status)}
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium border',
            getStatusColor(metadata.status)
          )}>
            {metadata.status}
          </span>
          {metadata.isArchived && (
            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              <Archive className="w-3 h-3" />
              Archived
            </span>
          )}
        </div>

        {/* Trigger Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Trigger</p>
            <p className="font-medium">{metadata.trigger.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Author</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <p className="font-medium">{metadata.trigger.author}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Branch</p>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-400" />
              <p className="font-medium">{metadata.repository.branch}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Started</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="font-medium">{formatTimestamp(metadata.trigger.timestamp)}</p>
            </div>
          </div>
        </div>

        {/* Commit Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GitCommit className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-mono text-gray-600 mb-1">
                {metadata.repository.commitHash}
              </p>
              <p className="text-sm text-gray-700">
                {metadata.repository.commitMessage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Build Phases */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Build Phases</h3>
        <div className="space-y-3">
          {metadata.phases.map((phase, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(phase.status)}
                <span className="font-medium">{phase.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {phase.duration && (
                  <span className="font-mono">{phase.duration}</span>
                )}
                {phase.startTime && (
                  <span>{formatTimestamp(phase.startTime)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-gray-500">Total Logs</p>
            </div>
            <p className="text-2xl font-semibold">
              {metadata.metrics.totalLines.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-gray-500">Errors</p>
            </div>
            <p className="text-2xl font-semibold text-red-600">
              {metadata.metrics.errorCount}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <p className="text-sm text-gray-500">Warnings</p>
            </div>
            <p className="text-2xl font-semibold text-yellow-600">
              {metadata.metrics.warningCount}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-500">Log Size</p>
            </div>
            <p className="text-2xl font-semibold">
              {formatFileSize(metadata.metrics.fileSize)}
            </p>
          </div>
        </div>

        {/* Archive Status */}
        {metadata.isArchived && metadata.archivedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Archive className="w-4 h-4" />
                <span>Archived on {formatTimestamp(metadata.archivedAt)}</span>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                Logs stored in database
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildMetadata;