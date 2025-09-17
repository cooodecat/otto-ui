"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, GitBranch, Clock, Activity } from "lucide-react";
import apiClient from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface Pipeline {
  pipeline_id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  project_id: string;
  name: string;
  description?: string;
  github_owner?: string;
  github_repo_name?: string;
  selected_branch?: string;
}

export default function ProjectPipelinesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAndFetch();
  }, [projectId]);

  const initializeAndFetch = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      apiClient.setSupabaseToken(session.access_token);
    }
    
    await Promise.all([
      fetchProject(),
      fetchPipelines()
    ]);
  };

  const fetchProject = async () => {
    try {
      const response = await apiClient.getProject(projectId);
      if (response.data) {
        setProject(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    }
  };

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPipelines(projectId);
      const pipelinesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.pipelines || []);
      setPipelines(pipelinesData);
    } catch (error) {
      console.error("Failed to fetch pipelines:", error);
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePipeline = () => {
    router.push(`/projects/${projectId}/pipelines/new`);
  };

  const handlePipelineClick = (pipelineId: string) => {
    router.push(`/projects/${projectId}/pipelines/${pipelineId}`);
  };

  const handleBack = () => {
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>프로젝트 목록으로</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project?.name || "프로젝트"} 파이프라인
              </h1>
              {project?.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
              {project?.github_repo_name && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <GitBranch className="w-4 h-4" />
                  <span>
                    {project.github_owner}/{project.github_repo_name}
                  </span>
                  {project.selected_branch && (
                    <span className="text-gray-500">
                      ({project.selected_branch})
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleCreatePipeline}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>파이프라인 생성</span>
            </button>
          </div>
        </div>

        {/* Pipelines Grid */}
        {pipelines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              파이프라인이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 번째 파이프라인을 생성하여 CI/CD 워크플로우를 구성해보세요
            </p>
            <button
              onClick={handleCreatePipeline}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              파이프라인 생성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelines.map((pipeline) => (
              <div
                key={pipeline.pipeline_id}
                onClick={() => handlePipelineClick(pipeline.pipeline_id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pipeline.name}
                  </h3>
                  <Activity 
                    className={`w-5 h-5 ${
                      pipeline.status === 'active' 
                        ? 'text-green-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </div>

                {pipeline.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {pipeline.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      생성: {new Date(pipeline.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePipelineClick(pipeline.pipeline_id);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    파이프라인 편집 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}