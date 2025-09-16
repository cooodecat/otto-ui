import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

interface Pipeline {
  pipeline_id: string;
  project_id: string;
  data: any;
  env: any;
  created_at: string;
}

interface Project {
  project_id: string;
  name: string;
}

/**
 * GET /api/projects/[projectId]/pipelines
 * 특정 프로젝트의 파이프라인 목록을 조회합니다.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = (await supabase
      .from("projects")
      .select("project_id, name")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single()) as { data: Project | null; error: any };

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // 파이프라인 목록 조회
    const { data: pipelines, error: pipelinesError } = await supabase
      .from("pipelines")
      .select(
        `
        pipeline_id,
        project_id,
        data,
        env,
        created_at
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (pipelinesError) {
      console.error("Error fetching pipelines:", pipelinesError);
      return NextResponse.json(
        { error: "Failed to fetch pipelines" },
        { status: 500 }
      );
    }

    // 각 파이프라인의 최근 실행 정보 조회
    const pipelinesWithRunInfo = await Promise.all(
      ((pipelines as Pipeline[]) || []).map(async (pipeline) => {
        // 파이프라인 데이터에서 이름 추출 (data.name이 있다고 가정)
        const pipelineData = pipeline.data;
        const pipelineName =
          pipelineData?.name || `Pipeline ${pipeline.pipeline_id.slice(0, 8)}`;

        // 최근 빌드 실행 정보 조회
        const { data: lastRun } = await supabase
          .from("build_histories")
          .select(
            `
            aws_build_id,
            build_execution_status,
            start_time,
            end_time
          `
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...pipeline,
          name: pipelineName,
          last_run: lastRun || null,
        };
      })
    );

    return NextResponse.json({
      project: {
        project_id: project.project_id,
        name: project.name,
      },
      pipelines: pipelinesWithRunInfo,
      total: pipelinesWithRunInfo.length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/pipelines
 * 새 파이프라인을 생성합니다.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = (await supabase
      .from("projects")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single()) as { data: { project_id: string } | null; error: any };

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { data: pipelineData, env } = body;

    // 필수 필드 검증
    if (!pipelineData) {
      return NextResponse.json(
        { error: "Pipeline data is required" },
        { status: 400 }
      );
    }

    // 파이프라인 생성
    const { data: pipeline, error: createError } = await supabase
      .from("pipelines")
      .insert({
        project_id: projectId,
        data: pipelineData,
        env: env || {},
      } as any)
      .select()
      .single();

    if (createError) {
      console.error("Error creating pipeline:", createError);
      return NextResponse.json(
        { error: "Failed to create pipeline" },
        { status: 500 }
      );
    }

    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/pipelines
 * 프로젝트의 모든 파이프라인을 삭제합니다.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = (await supabase
      .from("projects")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single()) as { data: { project_id: string } | null; error: any };

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // 모든 파이프라인 삭제
    const { error: deleteError } = await supabase
      .from("pipelines")
      .delete()
      .eq("project_id", projectId);

    if (deleteError) {
      console.error("Error deleting pipelines:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete pipelines" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "All pipelines deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
