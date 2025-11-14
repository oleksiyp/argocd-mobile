# Setup Guide: Connect to Real ArgoCD Server

This guide explains how to connect the ArgoCD Mobile UI to a real ArgoCD server.

## Prerequisites

- Access to an ArgoCD server
- ArgoCD CLI installed (optional, for token generation)
- Node.js 18+ and npm

## Step 1: Get Your ArgoCD Server URL

Find your ArgoCD server URL. This is typically:
- `https://argocd.example.com` (production)
- `http://localhost:8080` (local development with port forwarding)

To port-forward a local ArgoCD instance:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

## Step 2: Generate an Authentication Token

You have two options:

### Option A: Using ArgoCD CLI

```bash
# Login to ArgoCD
argocd login argocd.example.com

# Generate a token
argocd account generate-token
```

### Option B: Using ArgoCD UI

1. Open ArgoCD UI in your browser
2. Go to **Settings** (gear icon) > **Accounts**
3. Click on your account (usually `admin`)
4. Click **Generate New Token**
5. Set a name and expiration, then click **Create**
6. Copy the generated token

### Option C: Using kubectl (for admin account)

```bash
# Get the admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Login to ArgoCD UI with admin/<password>
# Then use Option B above
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and set your values:
   ```bash
   # Your ArgoCD server URL
   NEXT_PUBLIC_ARGOCD_SERVER=https://argocd.example.com

   # Your authentication token
   NEXT_PUBLIC_ARGOCD_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Disable mock data to use real API
   NEXT_PUBLIC_USE_MOCK_DATA=false

   # Use proxy to avoid CORS issues (recommended)
   NEXT_PUBLIC_USE_PROXY=true
   ```

## Step 4: Start the Application

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Configuration Options

### Mock Data Mode

For development and testing without a real ArgoCD server:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

This uses sample applications and resources defined in `lib/mock-data.ts`.

### Proxy vs Direct Connection

#### Proxy Mode (Recommended)

```bash
NEXT_PUBLIC_USE_PROXY=true
```

**Pros:**
- No CORS issues
- Token stays server-side (more secure)
- Works with any ArgoCD configuration

**Cons:**
- Requires Next.js server (cannot use static export)

#### Direct Mode

```bash
NEXT_PUBLIC_USE_PROXY=false
```

**Pros:**
- Can use static export
- Slightly lower latency

**Cons:**
- Requires CORS to be enabled on ArgoCD server
- Token is exposed in browser (less secure)

**To enable CORS on ArgoCD server:**
```yaml
# argocd-server ConfigMap or deployment
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  server.enable.cors: "true"
  server.cors.allowed.origins: "http://localhost:3000,https://your-domain.com"
```

### Self-Signed Certificates

For development with self-signed certificates:

```bash
NEXT_PUBLIC_INSECURE=true
```

**Warning:** Never use this in production!

## Troubleshooting

### Error: "ArgoCD API error (401): Unauthorized"

**Cause:** Invalid or expired authentication token.

**Solution:**
1. Generate a new token (see Step 2)
2. Update `NEXT_PUBLIC_ARGOCD_TOKEN` in `.env.local`
3. Restart the dev server

### Error: "CORS policy" or "Failed to fetch"

**Cause:** CORS issues when using direct mode.

**Solution:**
- Set `NEXT_PUBLIC_USE_PROXY=true` in `.env.local`, or
- Enable CORS on your ArgoCD server (see Proxy vs Direct Connection above)

### Error: "ArgoCD server not configured"

**Cause:** Missing `NEXT_PUBLIC_ARGOCD_SERVER` environment variable.

**Solution:**
1. Create `.env.local` from `.env.local.example`
2. Set `NEXT_PUBLIC_ARGOCD_SERVER`
3. Restart the dev server

### Applications Not Loading

**Causes:**
- Network issues
- Wrong server URL
- Invalid token
- ArgoCD server down

**Debug steps:**
1. Check browser console for errors
2. Verify server URL: `curl https://argocd.example.com/api/version`
3. Test token:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://argocd.example.com/api/v1/applications
   ```
4. Check Next.js server logs

### No Resources Showing for Application

**Cause:** Application might have no resources or they're not synced.

**Solution:**
1. Check the application in ArgoCD UI
2. Verify the application is synced
3. Check browser console for errors

## Security Considerations

### Production Deployment

1. **Use HTTPS:** Always use HTTPS for production deployments
2. **Secure Tokens:**
   - Never commit tokens to git
   - Use short-lived tokens
   - Rotate tokens regularly
3. **Network Security:**
   - Use VPN or private network for internal ArgoCD servers
   - Implement IP whitelisting if possible
4. **Token Storage:**
   - When using proxy mode, tokens stay server-side
   - Consider using server-side session management instead of tokens in env vars

### Token Permissions

Create a dedicated read-only account for the mobile UI:

```bash
# ArgoCD RBAC policy (argocd-rbac-cm ConfigMap)
policy.csv: |
  p, role:mobile-viewer, applications, get, */*, allow
  p, role:mobile-viewer, applications, list, */*, allow
  g, mobile-user, role:mobile-viewer

# Create account
argocd account create mobile-user
argocd account generate-token --account mobile-user
```

## Advanced Configuration

### Namespace Filtering

To limit which applications are visible, modify `lib/argocd-api.ts`:

```typescript
async getApplications(): Promise<Application[]> {
  // ... existing code ...
  const apps = data.items || [];

  // Filter to specific namespaces
  return apps.filter(app =>
    ['production', 'staging'].includes(app.spec.destination.namespace)
  );
}
```

### Custom Polling/Refresh

Add auto-refresh in `components/NavigationView.tsx`:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (navigationStack.length === 0) {
      loadApplications();
    }
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, [navigationStack]);
```

### Multi-Cluster Support

If you have multiple ArgoCD instances, create a cluster selector:

```typescript
// lib/config.ts
export const clusters = [
  { name: 'Production', url: 'https://argocd-prod.example.com', token: '...' },
  { name: 'Staging', url: 'https://argocd-staging.example.com', token: '...' },
];
```

## Production Deployment

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t argocd-mobile .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_ARGOCD_SERVER=https://argocd.example.com \
  -e NEXT_PUBLIC_ARGOCD_TOKEN=your-token \
  -e NEXT_PUBLIC_USE_MOCK_DATA=false \
  argocd-mobile
```

### Option 3: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-mobile
spec:
  replicas: 2
  selector:
    matchLabels:
      app: argocd-mobile
  template:
    metadata:
      labels:
        app: argocd-mobile
    spec:
      containers:
      - name: argocd-mobile
        image: your-registry/argocd-mobile:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_ARGOCD_SERVER
          value: "https://argocd-server.argocd.svc.cluster.local"
        - name: NEXT_PUBLIC_ARGOCD_TOKEN
          valueFrom:
            secretKeyRef:
              name: argocd-mobile-token
              key: token
        - name: NEXT_PUBLIC_USE_MOCK_DATA
          value: "false"
---
apiVersion: v1
kind: Service
metadata:
  name: argocd-mobile
spec:
  selector:
    app: argocd-mobile
  ports:
  - port: 80
    targetPort: 3000
```

## Testing

### Test with Mock Data

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev
```

### Test Direct Connection

```bash
NEXT_PUBLIC_USE_PROXY=false npm run dev
```

### Test Proxy Connection

```bash
NEXT_PUBLIC_USE_PROXY=true npm run dev
```

## Support

For issues:
1. Check browser console for errors
2. Check Next.js server logs
3. Verify ArgoCD server accessibility
4. Test API endpoints with curl
5. Open an issue on GitHub

## Next Steps

Once connected, explore these features:
- Browse applications by health status
- Drill down into resource trees
- View YAML manifests
- Use filters to find specific resources
- Search across all resources

For more information, see [README.md](README.md) and [QUICKSTART.md](QUICKSTART.md).
