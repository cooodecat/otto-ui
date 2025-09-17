"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PipelineFlowEditor from "@/components/flow/PipelineFlowEditor";

export default function NewPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const handleBack = () => {
    router.push(`/projects/${projectId}/pipelines`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>파이프라인 목록으로</span>
            </button>
            <h1 className="text-xl font-semibold">새 파이프라인 생성</h1>
          </div>
        </div>
      </div>
      
      <div className="h-[calc(100vh-73px)]">
        <PipelineFlowEditor projectId={projectId} />
      </div>
    </div>
  );
}