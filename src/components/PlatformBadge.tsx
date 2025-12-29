import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: string;
}

const platformConfig: Record<string, { label: string; className: string }> = {
  meta: {
    label: 'Meta',
    className: 'bg-blue-500/10 text-blue-400',
  },
  google: {
    label: 'Google',
    className: 'bg-red-500/10 text-red-400',
  },
  linkedin: {
    label: 'LinkedIn',
    className: 'bg-sky-500/10 text-sky-400',
  },
  other: {
    label: 'Other',
    className: 'bg-secondary text-secondary-foreground',
  },
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = platformConfig[platform] || platformConfig.other;

  return (
    <span className={cn('platform-badge', config.className)}>
      {config.label}
    </span>
  );
}
