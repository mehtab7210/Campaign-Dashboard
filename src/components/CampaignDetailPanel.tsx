import { useEffect, useState, useRef } from 'react';
import { Campaign, CampaignInsights, streamCampaignInsights, fetchCampaignInsights, formatCurrency, formatNumber, formatPercentage } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { PlatformBadge } from './PlatformBadge';
import { MetricCard } from './MetricCard';
import { X, Radio, TrendingUp, MousePointerClick, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignDetailPanelProps {
  campaign: Campaign | null;
  onClose: () => void;
}

export function CampaignDetailPanel({ campaign, onClose }: CampaignDetailPanelProps) {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const closeStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!campaign) {
      setInsights(null);
      setIsStreaming(false);
      setStreamError(null);
      return;
    }

    // First fetch initial insights
    fetchCampaignInsights(campaign.id)
      .then(({ insights }) => setInsights(insights))
      .catch(console.error);

    // Then start streaming
    setIsStreaming(true);
    setStreamError(null);

    closeStreamRef.current = streamCampaignInsights(
      campaign.id,
      (data) => {
        setInsights(data);
        setStreamError(null);
      },
      (error) => {
        setStreamError(error.message);
        setIsStreaming(false);
      }
    );

    return () => {
      closeStreamRef.current?.();
    };
  }, [campaign]);

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-card border-l border-border animate-slide-up overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <span className="live-indicator" />
                <span>Live</span>
              </div>
            )}
            <h2 className="font-semibold text-foreground">Campaign Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Campaign Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={campaign.status} />
              {campaign.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-mono">ID: {campaign.id}</p>
          </div>

          {/* Budget Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card">
              <span className="metric-label">Total Budget</span>
              <p className="metric-value text-lg mt-1">{formatCurrency(campaign.budget)}</p>
            </div>
            <div className="metric-card">
              <span className="metric-label">Daily Budget</span>
              <p className="metric-value text-lg mt-1">{formatCurrency(campaign.daily_budget)}</p>
            </div>
          </div>

          {streamError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              Stream disconnected: {streamError}
            </div>
          )}

          {/* Real-time Metrics */}
          {insights && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Performance Metrics
                </h4>
                {isStreaming && (
                  <span className="text-xs text-muted-foreground">(updating live)</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Impressions"
                  value={formatNumber(insights.impressions)}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <MetricCard
                  label="Clicks"
                  value={formatNumber(insights.clicks)}
                  icon={<MousePointerClick className="h-4 w-4" />}
                />
                <MetricCard
                  label="Conversions"
                  value={formatNumber(insights.conversions)}
                  icon={<Target className="h-4 w-4" />}
                />
                <MetricCard
                  label="Spend"
                  value={formatCurrency(insights.spend)}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="metric-card text-center">
                  <span className="metric-label">CTR</span>
                  <p className="metric-value text-lg mt-1">{formatPercentage(insights.ctr)}</p>
                </div>
                <div className="metric-card text-center">
                  <span className="metric-label">CPC</span>
                  <p className="metric-value text-lg mt-1">${insights.cpc.toFixed(2)}</p>
                </div>
                <div className="metric-card text-center">
                  <span className="metric-label">Conv. Rate</span>
                  <p className="metric-value text-lg mt-1">{formatPercentage(insights.conversion_rate)}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-right">
                Last updated: {new Date(insights.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Created: {new Date(campaign.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
