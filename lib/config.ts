// Configuration for ArgoCD API

export const config = {
  // ArgoCD server base URL
  argocdServer: process.env.NEXT_PUBLIC_ARGOCD_SERVER || 'http://localhost:8080',

  // Authentication token
  argocdToken: process.env.NEXT_PUBLIC_ARGOCD_TOKEN || '',

  // Use mock data (for development)
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',

  // Use proxy API route (recommended to avoid CORS issues)
  useProxy: process.env.NEXT_PUBLIC_USE_PROXY !== 'false', // true by default

  // Insecure mode (for self-signed certs in dev)
  insecure: process.env.NEXT_PUBLIC_INSECURE === 'true',
};

// Helper to build API URL
export function getApiUrl(path: string): string {
  // If using proxy, use the Next.js API route
  if (config.useProxy) {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `/api/argocd/${cleanPath}`;
  }

  // Otherwise, call ArgoCD server directly
  const baseUrl = config.argocdServer.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api/v1${cleanPath}`;
}

// Helper to get auth headers
export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Only add auth header if NOT using proxy (proxy adds it server-side)
  if (!config.useProxy && config.argocdToken) {
    headers['Authorization'] = `Bearer ${config.argocdToken}`;
  }

  return headers;
}
