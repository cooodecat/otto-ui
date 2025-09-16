import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BasicFlowCanvas from "@/components/flow/BasicFlowCanvas";

interface Props {
  params: Promise<{
    projectId: string;
    pipelineId: string;
  }>;
}

/**
 * 파이프라인 상세 페이지 컴포넌트
 * @param params - URL 파라미터 (projectId, pipelineId)
 * @returns 파이프라인 에디터 컴포넌트
 */
export default async function PipelinePage({ params }: Props) {
  const supabase = await createClient();
  const { projectId, pipelineId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <BasicFlowCanvas projectId={projectId} pipelineId={pipelineId} />;
}