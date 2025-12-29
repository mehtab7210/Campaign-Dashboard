import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'paused' | 'completed';
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'status-active',
    dot: 'bg-[hsl(var(--status-active))]',
  },
  paused: {
    label: 'Paused',
    className: 'status-paused',
    dot: 'bg-[hsl(var(--status-paused))]',
  },
  completed: {
    label: 'Completed',
    className: 'status-completed',
    dot: 'bg-[hsl(var(--status-completed))]',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('status-badge', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
