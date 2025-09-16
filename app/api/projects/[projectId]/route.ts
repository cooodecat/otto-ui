import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * GET /api/projects/[projectId]
 * 특정 프로젝트의 상세 정보를 조회합니다.
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 프로젝트 상세 정보 조회
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        pipelines:pipelines(count)
      `)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching project:", projectError);
      return NextResponse.json(
        { error: "Failed to fetch project" },
        { status: 500 }
      );
    }

    // 최근 빌드 이력 조회 (있다면)
    const { data: recentBuilds } = await supabase
      .from("build_histories")
      .select(`
        aws_build_id,
        build_execution_status,
        start_time,
        end_time,
        duration_seconds
      `)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      project,
      recent_builds: recentBuilds || [],
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
 * PATCH /api/projects/[projectId]
 * 프로젝트 정보를 수정합니다.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const updateData: any = {};

    // 업데이트 가능한 필드만 추출
    const allowedFields = [
      "name",
      "description",
      "selected_branch",
      "build_image",
      "compute_type",
      "build_timeout",
      "artifact_bucket",
      "artifact_retention_days",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // 업데이트할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // 프로젝트 업데이트
    const { data: project, error: updateError } = await (supabase
      .from("projects") as any)
      .update(updateData)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      console.error("Error updating project:", updateError);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]
 * 프로젝트를 삭제합니다.
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 프로젝트 삭제 (관련 파이프라인과 빌드 이력은 CASCADE로 자동 삭제)
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting project:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Project deleted successfully" },
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