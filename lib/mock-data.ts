import { Application, ResourceTreeNode, HealthStatus, SyncStatus } from '@/types/argocd';

// Mock data generator for development
export const mockApplications: Application[] = [
  {
    metadata: {
      name: 'guestbook',
      namespace: 'argocd',
      uid: 'app-1',
      creationTimestamp: '2024-01-15T10:30:00Z',
      labels: {
        'app.kubernetes.io/name': 'guestbook',
      },
    },
    spec: {
      source: {
        repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
        path: 'guestbook',
        targetRevision: 'HEAD',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'default',
      },
      project: 'default',
      syncPolicy: {
        automated: {
          prune: true,
          selfHeal: true,
        },
      },
    },
    status: {
      health: {
        status: 'Healthy',
      },
      sync: {
        status: 'Synced',
        revision: 'abc123def',
      },
    },
  },
  {
    metadata: {
      name: 'helm-guestbook',
      namespace: 'argocd',
      uid: 'app-2',
      creationTimestamp: '2024-01-16T14:20:00Z',
    },
    spec: {
      source: {
        repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
        path: 'helm-guestbook',
        targetRevision: 'HEAD',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'helm-guestbook',
      },
      project: 'default',
    },
    status: {
      health: {
        status: 'Progressing',
        message: 'Waiting for rollout to finish',
      },
      sync: {
        status: 'OutOfSync',
      },
    },
  },
  {
    metadata: {
      name: 'kustomize-app',
      namespace: 'argocd',
      uid: 'app-3',
      creationTimestamp: '2024-01-17T09:15:00Z',
    },
    spec: {
      source: {
        repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
        path: 'kustomize-guestbook',
        targetRevision: 'HEAD',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'kustomize',
      },
      project: 'production',
    },
    status: {
      health: {
        status: 'Degraded',
        message: 'Service has no endpoints',
      },
      sync: {
        status: 'Synced',
        revision: 'xyz789ghi',
      },
    },
  },
  {
    metadata: {
      name: 'prometheus',
      namespace: 'argocd',
      uid: 'app-4',
      creationTimestamp: '2024-01-18T11:45:00Z',
    },
    spec: {
      source: {
        repoURL: 'https://prometheus-community.github.io/helm-charts',
        path: '',
        targetRevision: '15.0.0',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'monitoring',
      },
      project: 'infrastructure',
    },
    status: {
      health: {
        status: 'Healthy',
      },
      sync: {
        status: 'Synced',
        revision: 'pqr456stu',
      },
    },
  },
];

export const mockResourceTree: Record<string, ResourceTreeNode[]> = {
  'app-1': [
    {
      uid: 'res-1',
      group: '',
      kind: 'Service',
      name: 'guestbook-ui',
      namespace: 'default',
      version: 'v1',
      depth: 0,
      health: { status: 'Healthy' },
      status: 'Synced',
      children: [],
      manifest: `apiVersion: v1
kind: Service
metadata:
  name: guestbook-ui
  namespace: default
  labels:
    app: guestbook
    tier: frontend
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: guestbook
    tier: frontend`,
    },
    {
      uid: 'res-2',
      group: 'apps',
      kind: 'Deployment',
      name: 'guestbook-ui',
      namespace: 'default',
      version: 'v1',
      depth: 0,
      health: { status: 'Healthy' },
      status: 'Synced',
      parentUid: 'res-1',
      children: [],
      manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: guestbook-ui
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: guestbook
      tier: frontend
  template:
    metadata:
      labels:
        app: guestbook
        tier: frontend
    spec:
      containers:
      - name: guestbook
        image: gcr.io/heptio-images/ks-guestbook-demo:0.2
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"`,
    },
    {
      uid: 'res-3',
      group: '',
      kind: 'Pod',
      name: 'guestbook-ui-7d8c9f-abc12',
      namespace: 'default',
      version: 'v1',
      depth: 1,
      parentUid: 'res-2',
      health: { status: 'Healthy' },
      status: 'Synced',
      children: [],
      manifest: `apiVersion: v1
kind: Pod
metadata:
  name: guestbook-ui-7d8c9f-abc12
  namespace: default
  labels:
    app: guestbook
    tier: frontend
    pod-template-hash: 7d8c9f
spec:
  containers:
  - name: guestbook
    image: gcr.io/heptio-images/ks-guestbook-demo:0.2
    ports:
    - containerPort: 80
status:
  phase: Running
  conditions:
  - type: Ready
    status: "True"`,
    },
    {
      uid: 'res-4',
      group: '',
      kind: 'Pod',
      name: 'guestbook-ui-7d8c9f-def34',
      namespace: 'default',
      version: 'v1',
      depth: 1,
      parentUid: 'res-2',
      health: { status: 'Healthy' },
      status: 'Synced',
      children: [],
      manifest: `apiVersion: v1
kind: Pod
metadata:
  name: guestbook-ui-7d8c9f-def34
  namespace: default
status:
  phase: Running`,
    },
    {
      uid: 'res-5',
      group: '',
      kind: 'ConfigMap',
      name: 'guestbook-config',
      namespace: 'default',
      version: 'v1',
      depth: 0,
      health: { status: 'Healthy' },
      status: 'Synced',
      children: [],
      manifest: `apiVersion: v1
kind: ConfigMap
metadata:
  name: guestbook-config
  namespace: default
data:
  app.properties: |
    name=Guestbook
    version=1.0
  log.level: info`,
    },
  ],
};
