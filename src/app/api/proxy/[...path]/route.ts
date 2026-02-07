/**
 * API Proxy Route
 *
 * Proxies requests from HTTPS frontend to HTTP backend to avoid mixed content issues.
 * All requests to /api/proxy/* are forwarded to the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://52.64.234.56:3000/api';

/**
 * Handle all HTTP methods
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join('/');
  const targetUrl = `${BACKEND_URL}/${targetPath}`;

  // Get request body for non-GET requests
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch {
      // No body
    }
  }

  // Forward headers (excluding host and other hop-by-hop headers)
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== 'host' &&
      lowerKey !== 'connection' &&
      lowerKey !== 'keep-alive' &&
      lowerKey !== 'transfer-encoding' &&
      lowerKey !== 'upgrade'
    ) {
      headers.set(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    // Get response body
    const responseBody = await response.text();

    // Forward response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'transfer-encoding' &&
        lowerKey !== 'connection' &&
        lowerKey !== 'keep-alive'
      ) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to connect to backend API',
        },
      },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
