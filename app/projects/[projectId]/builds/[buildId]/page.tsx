'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  GitBranch,
  User,
  Calendar,
  Activity,
  Loader2,
  StopCircle,
  Play,
  RefreshCw,
  Terminal,
  Package,
  Settings,
  AlertCircle
} from 'lucide-react';
import apiClient from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface BuildDetail {
  id: string;
  buildId: string;
  projectId: string;
  pipelineId: string;
  buildNumber: number;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED' | 'PENDING';
  trigger: {
    type: string;
    author: string;
    branch?: string;
    commit?: string;
    commitMessage?: string;
  };
  startTime: string;
  endTime?: string;
  duration?: string;
  phases?: {
    name: string;
    status: string;
    startTime?: string;
    endTime?: string;
    duration?: string;
  }[];
  environment?: {
    computeType: string;
    image: string;
    privilegedMode: boolean;
  };
  artifacts?: {
    location: string;
    files: string[];
  };
  error?: string;
}

export default function BuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const buildId = params.buildId as string;
  
  const [build, setBuild] = useState<BuildDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuildDetail();
    
    // Auto-refresh if build is in progress
    const interval = setInterval(() => {
      if (build?.status === 'IN_PROGRESS') {
        fetchBuildDetail();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [buildId, build?.status]);

  const fetchBuildDetail = async () => {
    try {
      setLoading(true);
      
      // Set auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // Fetch build details
      const response = await apiClient.getBuild(buildId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const buildData = response.data;
      
      // Format build data
      const formattedBuild: BuildDetail = {
        id: buildData.id,
        buildId: buildData.build_id || buildData.id,
        projectId: buildData.project_id || projectId,
        pipelineId: buildData.pipeline_id,
        buildNumber: buildData.build_number || 0,
        status: buildData.status || 'PENDING',
        trigger: {
          type: buildData.trigger_type || 'Manual',
          author: buildData.trigger_author || 'Unknown',
          branch: buildData.branch,
          commit: buildData.commit_sha,
          commitMessage: buildData.commit_message
        },
        startTime: buildData.start_time || buildData.created_at,
        endTime: buildData.end_time,
        duration: buildData.duration,
        phases: buildData.phases || [],
        environment: buildData.environment,
        artifacts: buildData.artifacts,
        error: buildData.error_message
      };

      setBuild(formattedBuild);
    } catch (err) {
      console.error('Failed to fetch build details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch build details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'IN_PROGRESS':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'STOPPED':
        return <StopCircle className="w-6 h-6 text-gray-500" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STOPPED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !build) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading build</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Build not found</h3>
          <p className="text-gray-600">This build may have been deleted or does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(build.status)}
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Build #{build.buildNumber || build.buildId.slice(0, 8)}
              </h1>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                <span>{build.trigger.author}</span>
                <span className="mx-2">•</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDistanceToNow(new Date(build.startTime), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {build.status === 'FAILED' && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Build
              </button>
            )}
            <Link
              href={`/projects/${projectId}/logs/${build.buildId}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <Terminal className="w-4 h-4 mr-2" />
              View Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className={`mb-6 p-4 rounded-lg border ${getStatusColor(build.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Build Status: {build.status}</h2>
            {build.error && (
              <p className="text-sm mt-1">{build.error}</p>
            )}
          </div>
          {build.duration && (
            <div className="text-right">
              <p className="text-sm">Duration</p>
              <p className="text-lg font-semibold">{build.duration}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Build Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Trigger Type</dt>
              <dd className="text-sm font-medium text-gray-900">{build.trigger.type}</dd>
            </div>
            {build.trigger.branch && (
              <div>
                <dt className="text-sm text-gray-500">Branch</dt>
                <dd className="flex items-center text-sm font-medium text-gray-900">
                  <GitBranch className="w-4 h-4 mr-1" />
                  {build.trigger.branch}
                </dd>
              </div>
            )}
            {build.trigger.commit && (
              <div>
                <dt className="text-sm text-gray-500">Commit</dt>
                <dd className="text-sm font-medium text-gray-900 font-mono">
                  {build.trigger.commit}
                </dd>
              </div>
            )}
            {build.trigger.commitMessage && (
              <div>
                <dt className="text-sm text-gray-500">Commit Message</dt>
                <dd className="text-sm text-gray-900">{build.trigger.commitMessage}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">Started</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(build.startTime).toLocaleString()}
              </dd>
            </div>
            {build.endTime && (
              <div>
                <dt className="text-sm text-gray-500">Ended</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(build.endTime).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Environment */}
        {build.environment && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Environment
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Compute Type</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {build.environment.computeType}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Image</dt>
                <dd className="text-sm font-medium text-gray-900 font-mono">
                  {build.environment.image}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Privileged Mode</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {build.environment.privilegedMode ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Build Phases */}
      {build.phases && build.phases.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Build Phases
          </h3>
          <div className="space-y-3">
            {build.phases.map((phase, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {phase.status === 'SUCCEEDED' && <CheckCircle className="w-5 h-5 text-green-500 mr-3" />}
                  {phase.status === 'FAILED' && <XCircle className="w-5 h-5 text-red-500 mr-3" />}
                  {phase.status === 'IN_PROGRESS' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-3" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{phase.name}</p>
                    {phase.duration && (
                      <p className="text-xs text-gray-500">Duration: {phase.duration}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  phase.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                  phase.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  phase.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {phase.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifacts */}
      {build.artifacts && build.artifacts.files.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Artifacts
          </h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-2">Location: {build.artifacts.location}</p>
            <ul className="space-y-1">
              {build.artifacts.files.map((file, index) => (
                <li key={index} className="text-sm text-gray-900 font-mono">
                  {file}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}