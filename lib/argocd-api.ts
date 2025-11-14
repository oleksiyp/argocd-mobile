import { Application, ResourceTreeNode } from '@/types/argocd';
import { mockApplications, mockResourceTree } from './mock-data';

// API client for ArgoCD
// For now, using mock data. Can be replaced with real API calls later.

export class ArgoCDAPI {
  private baseUrl: string;
  private useMockData: boolean;

  constructor(baseUrl?: string, useMockData: boolean = true) {
    this.baseUrl = baseUrl || 'http://localhost:8080/api/v1';
    this.useMockData = useMockData;
  }

  async getApplications(): Promise<Application[]> {
    if (this.useMockData) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockApplications;
    }

    // Real API call would go here
    const response = await fetch(`${this.baseUrl}/applications`);
    const data = await response.json();
    return data.items;
  }

  async getApplication(name: string): Promise<Application | null> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockApplications.find(app => app.metadata.name === name) || null;
    }

    const response = await fetch(`${this.baseUrl}/applications/${name}`);
    return await response.json();
  }

  async getResourceTree(appUid: string): Promise<ResourceTreeNode[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockResourceTree[appUid] || [];
    }

    // Real API call would go here
    const response = await fetch(`${this.baseUrl}/applications/${appUid}/resource-tree`);
    const data = await response.json();
    return data.nodes || [];
  }

  async getResourceManifest(
    appName: string,
    namespace: string,
    kind: string,
    name: string
  ): Promise<string> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      // Find resource in mock tree and return its manifest
      const allResources = Object.values(mockResourceTree).flat();
      const resource = allResources.find(
        r => r.kind === kind && r.name === name && r.namespace === namespace
      );
      return resource?.manifest || '';
    }

    const response = await fetch(
      `${this.baseUrl}/applications/${appName}/resource?namespace=${namespace}&kind=${kind}&name=${name}`
    );
    const data = await response.json();
    return data.manifest;
  }
}

// Export singleton instance
export const argoCDAPI = new ArgoCDAPI(undefined, true);
