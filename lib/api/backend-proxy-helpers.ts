/**
 * Backend Proxy Helpers
 * 
 * Shared utilities for API routes that proxy to backend
 */

/**
 * Forward backend error response preserving error structure
 * This ensures TOKEN_EXPIRED and other error codes are properly forwarded to client
 */
export async function forwardBackendError(
  backendResponse: Response,
  routeName: string
): Promise<Response> {
  // Parse backend error response
  const errorData = await backendResponse.json().catch(() => ({}));
  
  console.error(`[${routeName}] Backend request failed:`, errorData);
  
  // Return Response object with same status and body structure
  return new Response(
    JSON.stringify(errorData),
    {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}