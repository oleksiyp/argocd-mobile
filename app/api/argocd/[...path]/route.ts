import { NextRequest, NextResponse } from 'next/server';

// Proxy route to handle CORS issues with ArgoCD API
// Usage: /api/argocd/applications -> proxies to ArgoCD server /api/v1/applications

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const argocdServer = process.env.NEXT_PUBLIC_ARGOCD_SERVER;
  const argocdToken = process.env.NEXT_PUBLIC_ARGOCD_TOKEN;

  if (!argocdServer) {
    return NextResponse.json(
      { error: 'ArgoCD server not configured' },
      { status: 500 }
    );
  }

  try {
    // Await params (Next.js 15 requirement)
    const { path: pathSegments } = await params;

    // Build the target URL
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${argocdServer}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log('Proxying request to:', targetUrl);

    // Make the request to ArgoCD
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (argocdToken) {
      headers['Authorization'] = `Bearer ${argocdToken}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ArgoCD API error:', response.status, errorText);
      return NextResponse.json(
        { error: `ArgoCD API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to ArgoCD', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const argocdServer = process.env.NEXT_PUBLIC_ARGOCD_SERVER;
  const argocdToken = process.env.NEXT_PUBLIC_ARGOCD_TOKEN;

  if (!argocdServer) {
    return NextResponse.json(
      { error: 'ArgoCD server not configured' },
      { status: 500 }
    );
  }

  try {
    // Await params (Next.js 15 requirement)
    const { path: pathSegments } = await params;

    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${argocdServer}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

    const body = await request.text();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (argocdToken) {
      headers['Authorization'] = `Bearer ${argocdToken}`;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ArgoCD API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to proxy request to ArgoCD', details: String(error) },
      { status: 500 }
    );
  }
}
