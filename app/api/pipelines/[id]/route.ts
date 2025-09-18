import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("📄 Fetching pipeline:", id);

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

    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Failed to fetch pipeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log("💾 Updating pipeline:", id, body);

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

    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Failed to update pipeline:", error);
    return NextResponse.json(
      { error: "Failed to update pipeline" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log("💾 Patching pipeline:", id, body);

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

    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Failed to patch pipeline:", error);
    return NextResponse.json(
      { error: "Failed to patch pipeline" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("🗑️ Deleting pipeline:", id);

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

    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to delete pipeline:", error);
    return NextResponse.json(
      { error: "Failed to delete pipeline" },
      { status: 500 }
    );
  }
}
