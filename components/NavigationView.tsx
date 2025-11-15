'use client';

import { useState, useEffect, useCallback } from 'react';
import { Application, ResourceTreeNode } from '@/types/argocd';
import { argoCDAPI } from '@/lib/argocd-api';
import ResourceCard from './ResourceCard';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import YamlViewer from './YamlViewer';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type NavigationItem = Application | ResourceTreeNode;

function isApplication(item: NavigationItem): item is Application {
  return 'spec' in item;
}

function isResource(item: NavigationItem): item is ResourceTreeNode {
  return 'uid' in item && 'kind' in item;
}

export default function NavigationView() {
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);
  const [currentItems, setCurrentItems] = useState<NavigationItem[]>([]);
  const [allResources, setAllResources] = useState<ResourceTreeNode[]>([]); // Store all resources for tree navigation
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filters with localStorage persistence
  const [selectedKinds, setSelectedKinds] = useLocalStorage<string[]>('argocd-filter-kinds', []);
  const [selectedApiGroups, setSelectedApiGroups] = useLocalStorage<string[]>('argocd-filter-apigroups', []);

  // YAML viewer state
  const [showYamlViewer, setShowYamlViewer] = useState(false);
  const [yamlContent, setYamlContent] = useState('');

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Load initial applications
  useEffect(() => {
    loadApplications();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh current view
      if (navigationStack.length === 0) {
        // Refresh applications list
        loadApplications();
      } else if (navigationStack.length === 1 && isApplication(navigationStack[0])) {
        // Refresh resource tree
        loadResourceTree(navigationStack[0], true);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, navigationStack]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await argoCDAPI.getApplications();
      setCurrentItems(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResourceTree = async (app: Application, isRefresh: boolean = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const resources = await argoCDAPI.getResourceTree(app.metadata.name);

      // Store all resources for children lookup
      setAllResources(resources);

      // Build tree structure - show only root resources
      const rootResources = resources.filter(r => !r.parentUid);
      setCurrentItems(rootResources);

      if (!isRefresh) {
        setNavigationStack([app]);
      }
    } catch (error) {
      console.error('Error loading resource tree:', error);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const loadChildResources = async (resource: ResourceTreeNode) => {
    setLoading(true);
    try {
      // Use stored resources or fetch if needed
      let resources = allResources;
      if (resources.length === 0) {
        const app = navigationStack[0];
        if (isApplication(app)) {
          resources = await argoCDAPI.getResourceTree(app.metadata.name);
          setAllResources(resources);
        }
      }

      // Find children of this resource
      const children = resources.filter(r => r.parentUid === resource.uid);

      if (children.length > 0) {
        setCurrentItems(children);
        setNavigationStack([...navigationStack, resource]);
      } else {
        // No children, just show YAML
        await showYaml(resource);
      }
    } catch (error) {
      console.error('Error loading child resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a resource has children
  const hasChildren = (item: NavigationItem): boolean => {
    if (isApplication(item)) {
      // Applications always have resources (we'll check on drill-down)
      return true;
    }
    if (isResource(item)) {
      // Check if any resource has this as parent
      return allResources.some(r => r.parentUid === item.uid);
    }
    return false;
  };

  const getCurrentTitle = (): string => {
    if (navigationStack.length === 0) return 'Applications';
    if (navigationStack.length === 1) {
      const item = navigationStack[0];
      return isApplication(item) ? item.metadata.name : 'Resources';
    }
    const item = navigationStack[navigationStack.length - 1];
    return isResource(item) ? item.name : 'Resources';
  };

  const navigateBack = () => {
    if (navigationStack.length === 0) return;

    if (navigationStack.length === 1) {
      // Go back to applications list
      setNavigationStack([]);
      setAllResources([]); // Clear resource cache
      loadApplications();
    } else {
      // Go back one level in resource tree
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);

      // Use cached resources
      if (newStack.length === 1) {
        // Back to root resources
        const rootResources = allResources.filter(r => !r.parentUid);
        setCurrentItems(rootResources);
      } else {
        // Back to parent's children
        const parent = newStack[newStack.length - 1];
        if (isResource(parent)) {
          const children = allResources.filter(r => r.parentUid === parent.uid);
          setCurrentItems(children);
        }
      }
    }
  };

  const showYaml = async (item: NavigationItem) => {
    try {
      let content = '';

      if (isApplication(item)) {
        // For applications, show the full spec
        content = JSON.stringify(item, null, 2); // Convert to YAML-like format
        // Better: convert to actual YAML
        const yaml = require('js-yaml');
        content = yaml.dump(item);
      } else if (isResource(item)) {
        // For resources, use the manifest if available
        if (item.manifest) {
          content = item.manifest;
        } else {
          // Fetch from API
          const app = navigationStack[0];
          if (isApplication(app)) {
            content = await argoCDAPI.getResourceManifest(
              app.metadata.name,
              item.namespace || '',
              item.kind,
              item.name,
              item.group
            );
          }
        }
      }

      setYamlContent(content);
      setShowYamlViewer(true);
    } catch (error) {
      console.error('Error loading YAML:', error);
    }
  };

  // Filter and search logic
  const filteredItems = currentItems.filter(item => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const name = isApplication(item) ? item.metadata.name : item.name;
      if (!name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Kind filter
    if (selectedKinds.length > 0) {
      const kind = isApplication(item) ? 'Application' : item.kind;
      if (!selectedKinds.includes(kind)) {
        return false;
      }
    }

    // API Group filter
    if (selectedApiGroups.length > 0) {
      const group = isApplication(item) ? 'argoproj.io' : item.group;
      if (!selectedApiGroups.includes(group)) {
        return false;
      }
    }

    return true;
  });

  // Extract available kinds and API groups from current items
  const availableKinds = Array.from(
    new Set(currentItems.map(item => isApplication(item) ? 'Application' : item.kind))
  ).sort();

  const availableApiGroups = Array.from(
    new Set(currentItems.map(item => isApplication(item) ? 'argoproj.io' : item.group))
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            {navigationStack.length > 0 && (
              <button
                onClick={navigateBack}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-900 flex-1">
              {getCurrentTitle()}
            </h1>

            {/* Auto-refresh toggle and manual refresh button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigationStack.length === 0) {
                    loadApplications();
                  } else if (navigationStack.length === 1 && isApplication(navigationStack[0])) {
                    loadResourceTree(navigationStack[0]);
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Refresh"
                title="Manual refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-full transition-colors ${
                  autoRefresh
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Toggle auto-refresh"
                title={autoRefresh ? 'Auto-refresh ON (30s)' : 'Auto-refresh OFF'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          {navigationStack.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => {
                  setNavigationStack([]);
                  setAllResources([]);
                  loadApplications();
                }}
                className="hover:text-blue-600 whitespace-nowrap"
              >
                Apps
              </button>
              {navigationStack.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="whitespace-nowrap">
                    {isApplication(item) ? item.metadata.name : item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search resources..."
          className="px-4 pb-3"
        />

        <FilterPanel
          kinds={availableKinds}
          apiGroups={availableApiGroups}
          selectedKinds={selectedKinds}
          selectedApiGroups={selectedApiGroups}
          onKindsChange={setSelectedKinds}
          onApiGroupsChange={setSelectedApiGroups}
        />
      </div>

      {/* Resource list */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No items found</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <ResourceCard
              key={index}
              item={item}
              type={isApplication(item) ? 'application' : 'resource'}
              onDrillDown={
                hasChildren(item)
                  ? isApplication(item)
                    ? () => loadResourceTree(item)
                    : isResource(item)
                    ? () => loadChildResources(item)
                    : undefined
                  : undefined
              }
              onShowYaml={() => showYaml(item)}
            />
          ))
        )}
      </div>

      {/* YAML Viewer */}
      {showYamlViewer && (
        <YamlViewer
          yamlContent={yamlContent}
          onClose={() => setShowYamlViewer(false)}
        />
      )}
    </div>
  );
}
