import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BasicFlowCanvas from "@/components/flow/BasicFlowCanvas";

interface Props {
  params: Promise<{
    projectId: string;
    pipelineId: string;
  }>;
}

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