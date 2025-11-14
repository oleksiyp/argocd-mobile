# Quick Start Guide

## Run the Application

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 on your mobile device or browser.

## User Flow

### 1. Applications View (Home)
- See all ArgoCD applications as cards
- Each card shows:
  - Application name
  - Namespace
  - Health status (Healthy, Degraded, Progressing, etc.)
  - Sync status (Synced, OutOfSync)
  - Any health messages

### 2. Search & Filter
- Use the search bar to find applications by name
- Click "Filters" to:
  - Filter by Kind (Application, Deployment, Pod, etc.)
  - Filter by API Group (core, apps, argoproj.io, etc.)
  - Filters persist across sessions

### 3. Drill Down (Norton Commander Style)
- Click the `>` button next to an application to view its resources
- See the resource tree (Services, Deployments, Pods, ConfigMaps, etc.)
- Click `>` on any resource to drill deeper into its children
- Use the back button (top left) to go up one level
- Use breadcrumbs to see your navigation path

### 4. View YAML
- Click on the resource name, kind, or API group badge to open YAML viewer
- Full-screen, distraction-free view
- Features:
  - Syntax highlighting
  - Line numbers
  - Smart formatting (metadata first, status second, then rest)
  - Vertical and horizontal scrolling
- Click `X` (top right) to close

## Navigation Pattern

```
Applications List
    ↓ (click > on "guestbook")
Resources in "guestbook"
    - Service: guestbook-ui
    - Deployment: guestbook-ui
    - ConfigMap: guestbook-config
    ↓ (click > on "Deployment: guestbook-ui")
Children of Deployment
    - Pod: guestbook-ui-abc123
    - Pod: guestbook-ui-def456
    ↓ (click on "Pod: guestbook-ui-abc123")
YAML Viewer (full screen)
    ↓ (click X)
Back to Children of Deployment
```

## Tips

1. **Filters are Persistent**: Your filter choices are saved automatically
2. **Search is Debounced**: Wait 300ms after typing for results
3. **Combine Search & Filters**: Use both together for precise filtering
4. **Quick Back Navigation**: Use the back button or breadcrumbs
5. **Touch Friendly**: All buttons are sized for easy tapping

## Mock Data

The app currently uses mock data with 4 sample applications:
- `guestbook` - Healthy, Synced
- `helm-guestbook` - Progressing, OutOfSync
- `kustomize-app` - Degraded, Synced
- `prometheus` - Healthy, Synced

## Connecting to Real ArgoCD

Edit `lib/argocd-api.ts`:

```typescript
// Change this line:
export const argoCDAPI = new ArgoCDAPI(undefined, true);

// To:
export const argoCDAPI = new ArgoCDAPI('https://your-argocd-server/api/v1', false);
```

You'll also need to handle authentication (tokens, cookies, etc.).

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clean build
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types
npx tsc --noEmit
```

## Development

### File Structure
- `app/` - Next.js pages and layouts
- `components/` - React components
- `lib/` - API client and utilities
- `types/` - TypeScript definitions
- `hooks/` - Custom React hooks

### Adding Mock Data

Edit `lib/mock-data.ts` to add more applications or resources.

### Customizing Styles

All styles use Tailwind CSS. Edit classes directly in components or extend `tailwind.config.ts`.
