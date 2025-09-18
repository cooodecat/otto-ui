'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  GitBranch,
  User,
  Calendar,
  Activity,
  Loader2,
  StopCircle
} from 'lucide-react';
import apiClient from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Build {
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
  };
  startTime: string;
  endTime?: string;
  duration?: string;
  error?: string;
}

export default function BuildsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuilds();
  }, [projectId]);

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      
      // Set auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // Fetch builds
      const response = await apiClient.getProjectBuilds(projectId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // API 응답이 배열인지 확인
      const responseData = response.data;
      const buildsData = Array.isArray(responseData) ? responseData : [];
      
      console.log('Builds API Response:', response.data);
      console.log('Extracted builds:', buildsData);
      
      // Format builds data
      const formattedBuilds: Build[] = Array.isArray(buildsData)
        ? buildsData.map((build: any) => ({
        id: build.id,
        buildId: build.build_id || build.id,
        projectId: build.project_id || projectId,
        pipelineId: build.pipeline_id,
        buildNumber: build.build_number || 0,
        status: build.status || 'PENDING',
        trigger: {
          type: build.trigger_type || 'Manual',
          author: build.trigger_author || 'Unknown',
          branch: build.branch,
          commit: build.commit_sha
        },
        startTime: build.start_time || build.created_at,
        endTime: build.end_time,
        duration: build.duration,
        error: build.error_message
      }))
      : [];

      setBuilds(formattedBuilds);
    } catch (err) {
      console.error('Failed to fetch builds:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch builds');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'IN_PROGRESS':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'STOPPED':
        return <StopCircle className="w-5 h-5 text-gray-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'STOPPED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
              <h3 className="text-sm font-medium text-red-800">Error loading builds</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Build History</h1>
        <p className="text-gray-600 mt-1">View all build executions for this project</p>
      </div>

      {builds.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No builds yet</h3>
          <p className="text-gray-600">Start your first build from the pipeline editor</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Build
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {builds.map((build) => (
                <tr key={build.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(build.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        #{build.buildNumber || build.buildId.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(build.status)}`}>
                      {build.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      {build.trigger.author}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {build.trigger.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {build.trigger.branch && (
                      <div className="flex items-center text-sm text-gray-900">
                        <GitBranch className="w-4 h-4 mr-1 text-gray-400" />
                        {build.trigger.branch}
                      </div>
                    )}
                    {build.trigger.commit && (
                      <div className="text-xs text-gray-500 mt-1">
                        {build.trigger.commit.slice(0, 7)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {build.duration || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDistanceToNow(new Date(build.startTime), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/projects/${projectId}/builds/${build.buildId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}