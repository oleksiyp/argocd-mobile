import { HealthStatus, SyncStatus } from '@/types/argocd';

interface StatusBadgeProps {
  status: HealthStatus | SyncStatus;
  type: 'health' | 'sync';
  className?: string;
}

const healthColors: Record<HealthStatus, string> = {
  Healthy: 'bg-green-100 text-green-800 border-green-300',
  Progressing: 'bg-blue-100 text-blue-800 border-blue-300',
  Degraded: 'bg-orange-100 text-orange-800 border-orange-300',
  Suspended: 'bg-gray-100 text-gray-800 border-gray-300',
  Missing: 'bg-red-100 text-red-800 border-red-300',
  Unknown: 'bg-gray-100 text-gray-600 border-gray-300',
};

const syncColors: Record<SyncStatus, string> = {
  Synced: 'bg-green-100 text-green-800 border-green-300',
  OutOfSync: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Unknown: 'bg-gray-100 text-gray-600 border-gray-300',
};

export default function StatusBadge({ status, type, className = '' }: StatusBadgeProps) {
  const colors = type === 'health' ? healthColors : syncColors;
  const color = colors[status as keyof typeof colors] || colors.Unknown;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${color} ${className}`}
    >
      {status}
    </span>
  );
}
