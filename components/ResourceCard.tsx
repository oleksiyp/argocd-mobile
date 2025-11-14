'use client';

import { Application, ResourceTreeNode } from '@/types/argocd';
import StatusBadge from './StatusBadge';

interface ResourceCardProps {
  item: Application | ResourceTreeNode;
  type: 'application' | 'resource';
  onDrillDown?: () => void;
  onShowYaml?: () => void;
  depth?: number;
}

function isApplication(item: Application | ResourceTreeNode): item is Application {
  return 'spec' in item;
}

export default function ResourceCard({
  item,
  type,
  onDrillDown,
  onShowYaml,
  depth = 0,
}: ResourceCardProps) {
  const isApp = isApplication(item);

  const name = isApp ? item.metadata.name : item.name;
  const namespace = isApp ? item.spec.destination.namespace : item.namespace;
  const kind = isApp ? 'Application' : item.kind;
  const apiGroup = isApp ? 'argoproj.io' : item.group;
  const healthStatus = isApp ? item.status.health.status : item.health?.status;
  const syncStatus = isApp ? item.status.sync.status : item.status;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        depth > 0 ? `ml-${Math.min(depth * 4, 16)}` : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Drill-down button */}
          {onDrillDown && (
            <button
              onClick={onDrillDown}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              aria-label="Drill down"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Resource info - clickable to show YAML */}
          <button
            onClick={onShowYaml}
            className="flex-1 text-left hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
                {namespace && (
                  <p className="text-xs text-gray-500 truncate">namespace: {namespace}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                {kind}
              </span>
              {apiGroup && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300">
                  {apiGroup}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {healthStatus && <StatusBadge status={healthStatus} type="health" />}
              {syncStatus && <StatusBadge status={syncStatus} type="sync" />}
            </div>

            {isApp && item.status.health.message && (
              <p className="mt-2 text-xs text-gray-600">{item.status.health.message}</p>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
