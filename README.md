# ArgoCD Mobile UI

A mobile-optimized UI for ArgoCD built with Next.js, featuring Norton Commander-style navigation for drilling down into Kubernetes resources.

## Features

### 🎯 Core Functionality

- **Application List View**: Browse all ArgoCD applications as cards with health and sync status
- **Norton Commander Navigation**: Drill down into resources using an intuitive left-to-right navigation pattern
- **Resource Tree**: Navigate through Kubernetes resources in a hierarchical tree structure
- **YAML Viewer**: Full-screen, distraction-free YAML viewer with:
  - Syntax highlighting
  - Smart formatting (metadata and status at top)
  - Noise reduction (removes unnecessary technical details)
  - Horizontal and vertical scrolling
  - Line numbers

### 🔍 Search & Filters

- **Real-time Search**: Search across all resources with debounced input
- **Kind Filtering**: Filter resources by Kubernetes kind (Pod, Deployment, Service, etc.)
- **API Group Filtering**: Filter by API group (core, apps, etc.)
- **Persistent Filters**: Filters are saved to local storage per view

### 📱 Mobile-First Design

- Optimized for touch interfaces
- Responsive card-based layout
- Smooth transitions and animations
- No horizontal overflow
- Fast tap targets (minimum 44x44px)

## Architecture

```
argocd-mobile/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with global styles
│   ├── page.tsx           # Main page (entry point)
│   └── globals.css        # Global CSS and Tailwind imports
├── components/            # React components
│   ├── NavigationView.tsx # Main navigation component
│   ├── ResourceCard.tsx   # Card component for apps/resources
│   ├── YamlViewer.tsx     # Full-screen YAML viewer
│   ├── SearchBar.tsx      # Debounced search input
│   ├── FilterPanel.tsx    # Collapsible filter panel
│   └── StatusBadge.tsx    # Health/sync status badges
├── lib/                   # Utilities and API
│   ├── argocd-api.ts      # ArgoCD API client
│   └── mock-data.ts       # Mock data for development
├── types/                 # TypeScript types
│   └── argocd.ts          # ArgoCD data models
└── hooks/                 # Custom React hooks
    └── useLocalStorage.ts # localStorage persistence hook
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your mobile browser or mobile emulator.

### Connecting to Real ArgoCD Server

By default, the application uses mock data. To connect to a real ArgoCD server:

1. **Copy the environment template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure your ArgoCD server:**
   ```bash
   # Edit .env.local
   NEXT_PUBLIC_ARGOCD_SERVER=https://argocd.example.com
   NEXT_PUBLIC_ARGOCD_TOKEN=your-token-here
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_USE_PROXY=true
   ```

3. **Get your authentication token:**
   ```bash
   # Using ArgoCD CLI
   argocd account generate-token

   # Or from ArgoCD UI: Settings > Accounts > Generate Token
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [SETUP.md](SETUP.md).

**Quick Setup for Kubernetes Port-Forward:**
```bash
# Port-forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Configure .env.local
NEXT_PUBLIC_ARGOCD_SERVER=http://localhost:8080
NEXT_PUBLIC_ARGOCD_TOKEN=<your-token>
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Usage

### Navigation Flow

1. **Applications View**: Start by viewing all applications
2. **Drill Down**: Click the `>` button to view an application's resources
3. **Resource Tree**: Navigate through the resource hierarchy
4. **YAML View**: Click on resource name/kind/apiGroup to view its YAML
5. **Back Navigation**: Use the back button or breadcrumbs to navigate up

### Filters

- Click "Filters" to expand the filter panel
- Select one or more kinds or API groups
- Filters are automatically saved to localStorage
- Click "Clear all filters" to reset

### Search

- Type in the search bar to filter resources by name
- Search is debounced (300ms) for performance
- Works in combination with filters

## Development

### Working with Real ArgoCD API

The application supports both mock data (for development) and real ArgoCD servers:

**Mock Mode** (default):
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

**Real API Mode:**
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ARGOCD_SERVER=https://your-argocd-server
NEXT_PUBLIC_ARGOCD_TOKEN=your-token
```

**Key Features:**
- ✅ Supports any Kubernetes resource types and CRDs
- ✅ Dynamic resource tree building from API response
- ✅ Automatic parent-child relationship detection
- ✅ Built-in CORS proxy (enabled by default)
- ✅ Bearer token authentication
- ✅ Error handling and logging

See [SETUP.md](SETUP.md) for complete configuration options.

### Adding New Mock Resource Types

If you want to extend the mock data:

1. Update mock data in `lib/mock-data.ts`
2. Ensure types in `types/argocd.ts` cover the new resources
3. Test filtering and navigation

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **React Syntax Highlighter**: YAML syntax highlighting
- **js-yaml**: YAML parsing and formatting

## Design Decisions

### Why Norton Commander Style?

Norton Commander's dual-pane navigation is perfect for mobile because:
- Linear flow matches mobile browsing patterns
- No need for complex tree visualizations
- Easy one-handed operation
- Clear navigation hierarchy

### YAML Viewer Smart Formatting

The YAML viewer automatically:
- Places `metadata` and `status` at the top
- Minimizes metadata to essential fields (name, namespace)
- Removes noisy annotations (kubectl artifacts)
- Maintains logical ordering of remaining fields
- Provides syntax highlighting for readability

### Filter Persistence

Filters are saved per view to localStorage, allowing users to:
- Maintain context when switching between apps
- Quickly filter common resource types
- Reduce cognitive load across sessions

## Future Enhancements

- [ ] Real ArgoCD API integration
- [ ] Authentication support
- [ ] Refresh/polling for live updates
- [ ] Resource actions (sync, delete, etc.)
- [ ] Diff viewer for OutOfSync resources
- [ ] Dark mode
- [ ] Offline support with service workers
- [ ] Push notifications for health changes

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
