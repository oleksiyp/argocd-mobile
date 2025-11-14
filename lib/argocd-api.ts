import { Application, ResourceTreeNode } from '@/types/argocd';
import { mockApplications, mockResourceTree } from './mock-data';
import { config, getApiUrl, getAuthHeaders } from './config';

// ArgoCD API Response types
interface ArgoCDApplicationList {
  items: Application[];
}

interface ArgoCDResourceTreeResponse {
  nodes: Array<{
    kind: string;
    name: string;
    namespace?: string;
    group: string;
    version: string;
    uid: string;
    parentRefs?: Array<{
      kind: string;
      name: string;
      namespace?: string;
      group: string;
    }>;
    health?: {
      status: string;
      message?: string;
    };
    networkingInfo?: {
      labels?: Record<string, string>;
    };
    images?: string[];
    resourceVersion?: string;
    createdAt?: string;
  }>;
}

interface ArgoCDManifestResponse {
  manifests: string[];
}

// API client for ArgoCD
export class ArgoCDAPI {
  private useMockData: boolean;

  constructor(useMockData: boolean = config.useMockData) {
    this.useMockData = useMockData;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ArgoCD API error (${response.status}): ${errorText}`);
    }

    return response;
  }

  async getApplications(): Promise<Application[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockApplications;
    }

    try {
      const url = getApiUrl('/applications');
      const response = await this.fetchWithAuth(url);
      const data: ArgoCDApplicationList = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  async getApplication(name: string): Promise<Application | null> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockApplications.find(app => app.metadata.name === name) || null;
    }

    try {
      const url = getApiUrl(`/applications/${encodeURIComponent(name)}`);
      const response = await this.fetchWithAuth(url);
      const data: Application = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching application ${name}:`, error);
      return null;
    }
  }

  async getResourceTree(appName: string): Promise<ResourceTreeNode[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In mock mode, appName might be a UID, so we need to find by name or UID
      const app = mockApplications.find(
        a => a.metadata.name === appName || a.metadata.uid === appName
      );
      return mockResourceTree[app?.metadata.uid || appName] || [];
    }

    try {
      const url = getApiUrl(`/applications/${encodeURIComponent(appName)}/resource-tree`);
      const response = await this.fetchWithAuth(url);
      const data: ArgoCDResourceTreeResponse = await response.json();

      // Build tree structure with parent-child relationships
      const nodes = data.nodes || [];
      const treeNodes: ResourceTreeNode[] = nodes.map((node, index) => {
        // Calculate depth based on parent references
        let depth = 0;
        let parentUid: string | undefined;

        if (node.parentRefs && node.parentRefs.length > 0) {
          // Find the parent in the nodes array
          const parentRef = node.parentRefs[0];
          const parent = nodes.find(
            n =>
              n.kind === parentRef.kind &&
              n.name === parentRef.name &&
              n.namespace === parentRef.namespace &&
              n.group === parentRef.group
          );

          if (parent) {
            parentUid = parent.uid;
            // Calculate depth recursively
            depth = this.calculateDepth(parent, nodes);
          }
        }

        return {
          uid: node.uid,
          group: node.group || '',
          kind: node.kind,
          name: node.name,
          namespace: node.namespace,
          version: node.version,
          depth,
          parentUid,
          health: node.health
            ? {
                status: node.health.status as any,
                message: node.health.message,
              }
            : undefined,
          status: undefined, // ArgoCD doesn't provide sync status per resource in tree
          children: [],
        };
      });

      return treeNodes;
    } catch (error) {
      console.error(`Error fetching resource tree for ${appName}:`, error);
      return [];
    }
  }

  private calculateDepth(
    node: ArgoCDResourceTreeResponse['nodes'][0],
    allNodes: ArgoCDResourceTreeResponse['nodes']
  ): number {
    if (!node.parentRefs || node.parentRefs.length === 0) {
      return 0;
    }

    const parentRef = node.parentRefs[0];
    const parent = allNodes.find(
      n =>
        n.kind === parentRef.kind &&
        n.name === parentRef.name &&
        n.namespace === parentRef.namespace &&
        n.group === parentRef.group
    );

    if (!parent) {
      return 0;
    }

    return 1 + this.calculateDepth(parent, allNodes);
  }

  async getResourceManifest(
    appName: string,
    namespace: string,
    kind: string,
    name: string,
    group?: string
  ): Promise<string> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const allResources = Object.values(mockResourceTree).flat();
      const resource = allResources.find(
        r => r.kind === kind && r.name === name && r.namespace === namespace
      );
      return resource?.manifest || '';
    }

    try {
      // Build query parameters
      const params = new URLSearchParams({
        name,
        kind,
      });

      if (namespace) {
        params.append('namespace', namespace);
      }

      if (group) {
        params.append('group', group);
      }

      const url = getApiUrl(`/applications/${encodeURIComponent(appName)}/manifests?${params}`);
      const response = await this.fetchWithAuth(url);
      const data: ArgoCDManifestResponse = await response.json();

      // ArgoCD returns an array of manifests, we want the first one
      if (data.manifests && data.manifests.length > 0) {
        return data.manifests[0];
      }

      return '';
    } catch (error) {
      console.error(`Error fetching manifest for ${kind}/${name}:`, error);
      return '';
    }
  }
}

// Export singleton instance
export const argoCDAPI = new ArgoCDAPI();
