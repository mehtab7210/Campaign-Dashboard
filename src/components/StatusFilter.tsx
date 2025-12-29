import { cn } from '@/lib/utils';

type Status = 'all' | 'active' | 'paused' | 'completed';

interface StatusFilterProps {
  value: Status;
  onChange: (status: Status) => void;
  counts: {
    all: number;
    active: number;
    paused: number;
    completed: number;
  };
}

const filters: { value: Status; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            value === filter.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {filter.label}
          <span className="ml-1.5 text-xs opacity-60">
            {counts[filter.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
