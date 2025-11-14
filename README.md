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

### Mock Data

By default, the application uses mock data. To connect to a real ArgoCD instance:

1. Update `lib/argocd-api.ts`:
   ```typescript
   export const argoCDAPI = new ArgoCDAPI('https://your-argocd-server/api/v1', false);
   ```

2. Handle authentication (add token/cookie handling as needed)

### Adding New Resource Types

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
