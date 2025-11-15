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
      <div className="relative">
        {/* Main clickable area - drills down into resource */}
        <button
          onClick={onDrillDown}
          disabled={!onDrillDown}
          className={`w-full p-4 text-left ${
            onDrillDown ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
          } transition-colors rounded-lg`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
            </div>
            {/* Drill-down indicator */}
            {onDrillDown && (
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
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
            {namespace && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-300">
                {namespace}
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

        {/* YAML button - positioned in bottom-right corner */}
        {onShowYaml && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowYaml();
            }}
            className="absolute bottom-3 right-3 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
            aria-label="View YAML"
          >
            YAML
          </button>
        )}
      </div>
    </div>
  );
}
