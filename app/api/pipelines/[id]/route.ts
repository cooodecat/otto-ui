import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('📄 Fetching pipeline:', id);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: 인증 헤더 추가 필요
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Failed to fetch pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline' },
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
    
    console.log('💾 Updating pipeline:', id, body);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // TODO: 인증 헤더 추가 필요
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Failed to update pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to update pipeline' },
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
    
    console.log('🗑️ Deleting pipeline:', id);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/pipelines/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // TODO: 인증 헤더 추가 필요
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Otto-server responded with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Failed to delete pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to delete pipeline' },
      { status: 500 }
    );
  }
}