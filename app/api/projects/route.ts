import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 프로젝트 타입 정의
interface ProjectRow {
  project_id: string;
  user_id: string;
  name: string;
  description: string | null;
  github_repo_name: string;
  github_repo_url: string | null;
  github_owner: string;
  selected_branch: string;
  installation_id: string | null;
  github_repo_id: string | null;
  codebuild_project_name: string;
  build_image: string;
  compute_type: string;
  build_timeout: number;
  codebuild_status: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/projects
 * 현재 로그인한 사용자의 프로젝트 목록을 조회합니다.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자의 프로젝트 목록 조회
    const { data: projects, error: projectsError } = (await supabase
      .from("projects")
      .select(
        `
        project_id,
        name,
        description,
        github_repo_name,
        github_repo_url,
        github_owner,
        selected_branch,
        codebuild_status,
        created_at,
        updated_at
      `
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })) as {
      data:
        | Pick<
            ProjectRow,
            | "project_id"
            | "name"
            | "description"
            | "github_repo_name"
            | "github_repo_url"
            | "github_owner"
            | "selected_branch"
            | "codebuild_status"
            | "created_at"
            | "updated_at"
          >[]
        | null;
      error: any;
    };

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    // 각 프로젝트의 파이프라인 개수 조회
    const projectsWithPipelineCount = await Promise.all(
      (projects || []).map(async (project) => {
        const { count, error } = await supabase
          .from("pipelines")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.project_id);

        if (error) {
          console.error("Error fetching pipeline count:", error);
        }

        return {
          ...project,
          pipeline_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      projects: projectsWithPipelineCount,
      total: projectsWithPipelineCount.length,
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
 * POST /api/projects
 * 새 프로젝트를 생성합니다.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 요청 본문 파싱
    const body = await request.json();
    const {
      name,
      description,
      github_repo_name,
      github_repo_url,
      github_owner,
      selected_branch,
      installation_id,
      github_repo_id,
    } = body;

    // 필수 필드 검증
    if (!name || !github_repo_name || !github_owner) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // CodeBuild 프로젝트명 생성 (user_id와 timestamp 조합)
    const timestamp = Date.now();
    const codebuildProjectName = `otto-${user.id.slice(0, 8)}-${timestamp}`;

    // 프로젝트 생성
    const { data: project, error: createError } = await (
      supabase.from("projects") as any
    )
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        github_repo_name,
        github_repo_url: github_repo_url || null,
        github_owner,
        selected_branch: selected_branch || "main",
        installation_id: installation_id || null,
        github_repo_id: github_repo_id || null,
        codebuild_project_name: codebuildProjectName,
        build_image: "aws/codebuild/standard:7.0",
        compute_type: "BUILD_GENERAL1_SMALL",
        build_timeout: 60,
        codebuild_status: "pending",
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating project:", createError);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
