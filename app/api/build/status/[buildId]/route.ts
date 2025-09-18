import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { buildId } = await params;

    console.log("📊 Fetching build status:", buildId);

    // Get Supabase session for authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get build status from otto-server
    const response = await fetch(`${API_BASE_URL}/api/v1/codebuild/status/${buildId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Build not found" },
          { status: 404 }
        );
      }
      throw new Error(`Otto-server responded with status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Failed to fetch build status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch build status" },
      { status: 500 }
    );
  }
}