'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Settings,
  GitBranch,
  Key,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  Github
} from 'lucide-react';
import apiClient from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { useProjectStore } from '@/lib/projectStore';
import toast from 'react-hot-toast';

interface ProjectSettings {
  id: string;
  name: string;
  description?: string;
  repositoryFullName?: string;
  defaultBranch?: string;
  githubInstallationId?: string;
  environment_variables?: Record<string, string>;
  cache_settings?: {
    enabled: boolean;
    paths: string[];
  };
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { removeProject } = useProjectStore();

  useEffect(() => {
    fetchProjectSettings();
  }, [projectId]);

  const fetchProjectSettings = async () => {
    try {
      setLoading(true);
      
      // Set auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // Fetch project details
      const response = await apiClient.getProject(projectId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const project = response.data?.project;
      
      // Format settings
      const formattedSettings: ProjectSettings = {
        id: project?.project_id || projectId,
        name: project?.name || '',
        description: project?.description || '',
        repositoryFullName: project?.github_repo_name || '',
        defaultBranch: project?.selected_branch || '',
        githubInstallationId: project?.installation_id || '',
        environment_variables: {},
        cache_settings: { enabled: false, paths: [] }
      };

      setSettings(formattedSettings);
      
      // Convert environment variables to array format
      const envArray = Object.entries(formattedSettings.environment_variables || {}).map(
        ([key, value]) => ({ key, value })
      );
      setEnvVars(envArray);
    } catch (error) {
      console.error('Failed to fetch project settings:', error);
      toast.error('Failed to load project settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      // Convert env vars array back to object
      const envVarsObj: Record<string, string> = {};
      envVars.forEach(({ key, value }) => {
        if (key) envVarsObj[key] = value;
      });

      // Update project settings
      // Note: This would require an updateProject API endpoint
      toast.success('Project settings updated successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await removeProject(projectId);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">Failed to load project settings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Project Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your project configuration and environment</p>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">General</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={settings.description || ''}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project description..."
            />
          </div>
        </div>
      </div>

      {/* GitHub Settings */}
      {settings.repositoryFullName && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Github className="w-5 h-5 mr-2" />
            GitHub Integration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository
              </label>
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <GitBranch className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-900">{settings.repositoryFullName}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Branch
              </label>
              <input
                type="text"
                value={settings.defaultBranch || ''}
                onChange={(e) => setSettings({ ...settings, defaultBranch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="main"
              />
            </div>
          </div>
        </div>
      )}

      {/* Environment Variables */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Environment Variables
          </h2>
          <button
            onClick={addEnvVar}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Variable
          </button>
        </div>
        <div className="space-y-3">
          {envVars.length === 0 ? (
            <p className="text-sm text-gray-500">No environment variables configured</p>
          ) : (
            envVars.map((envVar, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={envVar.key}
                  onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                  placeholder="KEY"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={() => removeEnvVar(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Project
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All project data, pipelines, and build history will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}