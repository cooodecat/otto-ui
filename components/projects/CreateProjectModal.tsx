"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ExternalLink,
  Settings,
  GitBranch,
  X,
  Plus,
} from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import apiClient from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import ProjectCreationWizard from "./ProjectCreationWizard";

interface CreateProjectModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

/**
 * 새 프로젝트 생성 모달 - 간단한 버전
 * 바로 프로젝트 생성 마법사를 실행
 */
export function CreateProjectModal({
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const handleProjectCreate = (project: any) => {
    if (onProjectCreated) {
      onProjectCreated(project);
    }
    onClose();
  };

  return (
    <ProjectCreationWizard
      isOpen={true}
      onClose={onClose}
      onProjectCreated={handleProjectCreate}
    />
  );
}

/**
 * 새 프로젝트 생성 모달 - 전체 버전
 * /projects 페이지의 기능을 모달로 제공
 */
export default function CreateProjectModalFull({
  isOpen = true,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepository, setSelectedRepository] = useState<{
    name: string;
    owner: string;
    visibility: "Public" | "Private";
    updated: string;
  } | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    selectedProjectId,
    setSelectedProject,
  } = useProjectStore();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      loadGithubRepositories();
    }
  }, [isOpen, fetchProjects]);

  const loadGithubRepositories = async () => {
    setIsLoadingRepos(true);
    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // 먼저 GitHub installations을 가져옵니다
      const installationsResponse = await apiClient.getGithubInstallations();
      if (installationsResponse.data && installationsResponse.data.length > 0) {
        // 첫 번째 installation의 repositories를 가져옵니다
        const installationId = installationsResponse.data[0].installationId || installationsResponse.data[0].installation_id;
        const reposResponse = await apiClient.getGithubRepositories(installationId);
        if (reposResponse.data) {
          setRepositories(reposResponse.data);
        }
      } else {
        console.log("No GitHub installations found");
        setRepositories([]);
      }
    } catch (error) {
      console.error("Failed to load GitHub repositories:", error);
      // Use mock data as fallback
      setRepositories(mockRepositories);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleCreateProject = () => {
    setIsWizardOpen(true);
  };

  const handleWizardClose = () => {
    setIsWizardOpen(false);
    onClose();
  };

  const handleProjectCreated = (project: any) => {
    setIsWizardOpen(false);
    if (onProjectCreated) {
      onProjectCreated(project);
    }
    onClose();
  };

  const mockRepositories = [
    {
      name: "otto-frontend",
      owner: "team-otto",
      visibility: "Public" as const,
      updated: "2 hours ago",
    },
    {
      name: "otto-backend",
      owner: "team-otto",
      visibility: "Private" as const,
      updated: "1 day ago",
    },
    {
      name: "data-pipeline",
      owner: "team-otto",
      visibility: "Private" as const,
      updated: "3 days ago",
    },
  ];

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Create New Project</h2>
              <p className="text-sm text-gray-500 mt-1">
                Connect a GitHub repository to start building your CI/CD
                pipeline
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Repository List */}
            <div className="space-y-3">
              {isLoadingRepos ? (
                <div className="text-center py-8 text-gray-500">
                  Loading repositories...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading repositories
                </div>
              ) : filteredRepositories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No repositories found
                </div>
              ) : (
                filteredRepositories.map((repo) => (
                  <div
                    key={repo.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRepository?.name === repo.name
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRepository(repo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{repo.name}</span>
                          {repo.visibility === "Private" && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {repo.owner}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated {repo.updated}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">
                    Need to configure GitHub?
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Make sure you have installed the GitHub App and granted
                    access to your repositories.
                  </p>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-2"
                  >
                    Configure GitHub App
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        </div>
      </div>

      {/* Project Creation Wizard */}
      {isWizardOpen && (
        <ProjectCreationWizard
          isOpen={isWizardOpen}
          onClose={handleWizardClose}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </>,
    document.body
  );
}