'use client';

import { useState } from 'react';

interface FilterPanelProps {
  kinds: string[];
  apiGroups: string[];
  selectedKinds: string[];
  selectedApiGroups: string[];
  onKindsChange: (kinds: string[]) => void;
  onApiGroupsChange: (groups: string[]) => void;
  className?: string;
}

export default function FilterPanel({
  kinds,
  apiGroups,
  selectedKinds,
  selectedApiGroups,
  onKindsChange,
  onApiGroupsChange,
  className = '',
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleKind = (kind: string) => {
    if (selectedKinds.includes(kind)) {
      onKindsChange(selectedKinds.filter(k => k !== kind));
    } else {
      onKindsChange([...selectedKinds, kind]);
    }
  };

  const toggleApiGroup = (group: string) => {
    if (selectedApiGroups.includes(group)) {
      onApiGroupsChange(selectedApiGroups.filter(g => g !== group));
    } else {
      onApiGroupsChange([...selectedApiGroups, group]);
    }
  };

  const clearAll = () => {
    onKindsChange([]);
    onApiGroupsChange([]);
  };

  const hasActiveFilters = selectedKinds.length > 0 || selectedApiGroups.length > 0;

  return (
    <div className={`bg-white border-b ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              {selectedKinds.length + selectedApiGroups.length}
            </span>
          )}
        </span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}

          {kinds.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Kind</h4>
              <div className="flex flex-wrap gap-2">
                {kinds.map(kind => (
                  <button
                    key={kind}
                    onClick={() => toggleKind(kind)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedKinds.includes(kind)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {apiGroups.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">API Group</h4>
              <div className="flex flex-wrap gap-2">
                {apiGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => toggleApiGroup(group)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedApiGroups.includes(group)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {group || '<core>'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
