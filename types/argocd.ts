// Core ArgoCD types based on ArgoCD API

export type HealthStatus = 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
export type SyncStatus = 'Synced' | 'OutOfSync' | 'Unknown';

export interface ResourceRef {
  group: string;
  kind: string;
  name: string;
  namespace?: string;
  version?: string;
}

export interface ApplicationSource {
  repoURL: string;
  path?: string;
  targetRevision?: string;
  helm?: {
    values?: string;
  };
  kustomize?: Record<string, unknown>;
}

export interface ApplicationDestination {
  server: string;
  namespace: string;
}

export interface ApplicationSpec {
  source: ApplicationSource;
  destination: ApplicationDestination;
  project: string;
  syncPolicy?: {
    automated?: {
      prune?: boolean;
      selfHeal?: boolean;
    };
  };
}

export interface HealthStatusInfo {
  status: HealthStatus;
  message?: string;
}

export interface SyncStatusInfo {
  status: SyncStatus;
  revision?: string;
}

export interface ApplicationStatus {
  health: HealthStatusInfo;
  sync: SyncStatusInfo;
  resources?: ResourceNode[];
  operationState?: {
    phase: string;
    message?: string;
    finishedAt?: string;
  };
}

export interface ApplicationMetadata {
  name: string;
  namespace: string;
  uid?: string;
  creationTimestamp?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface Application {
  metadata: ApplicationMetadata;
  spec: ApplicationSpec;
  status: ApplicationStatus;
}

export interface ResourceNode {
  group: string;
  kind: string;
  name: string;
  namespace?: string;
  version: string;
  health?: HealthStatusInfo;
  status?: SyncStatus;
  parentRefs?: ResourceRef[];
  children?: ResourceNode[];
  info?: Array<{
    name: string;
    value: string;
  }>;
  // Full resource manifest
  manifest?: string;
}

export interface ResourceTreeNode extends ResourceNode {
  uid: string;
  createdAt?: string;
  // Navigation depth for tree view
  depth: number;
  // Parent node UID
  parentUid?: string;
}

// Filter types
export interface ResourceFilters {
  kind?: string[];
  apiGroup?: string[];
  search?: string;
}

// UI State types
export interface NavigationState {
  path: (Application | ResourceTreeNode)[];
  currentView: 'applications' | 'resources';
}

export interface ViewState {
  filters: ResourceFilters;
  search: string;
  selectedItem?: Application | ResourceTreeNode;
  showYamlViewer: boolean;
  yamlContent?: string;
}
