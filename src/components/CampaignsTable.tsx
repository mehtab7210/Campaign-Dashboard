import { useState } from 'react';
import { Campaign, CampaignInsights, formatCurrency, formatNumber, formatPercentage } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { PlatformBadge } from './PlatformBadge';
import { CampaignDetailPanel } from './CampaignDetailPanel';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface CampaignsTableProps {
  campaigns: Campaign[];
  insights: Map<string, CampaignInsights>;
  isLoading?: boolean;
}

export function CampaignsTable({ campaigns, insights, isLoading }: CampaignsTableProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-[hsl(var(--table-header))]" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Platforms</th>
                <th className="text-right">Budget</th>
                <th className="text-right">Spend</th>
                <th className="text-right">Impressions</th>
                <th className="text-right">Clicks</th>
                <th className="text-right">CTR</th>
                <th className="text-right">Conv.</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const insight = insights.get(campaign.id);
                return (
                  <tr
                    key={campaign.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{campaign.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{campaign.id}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {campaign.platforms.map((platform) => (
                          <PlatformBadge key={platform} platform={platform} />
                        ))}
                      </div>
                    </td>
                    <td className="text-right font-mono text-muted-foreground">
                      {formatCurrency(campaign.budget)}
                    </td>
                    <td className="text-right font-mono">
                      {insight ? formatCurrency(insight.spend) : '—'}
                    </td>
                    <td className="text-right font-mono">
                      {insight ? formatNumber(insight.impressions) : '—'}
                    </td>
                    <td className="text-right font-mono">
                      {insight ? formatNumber(insight.clicks) : '—'}
                    </td>
                    <td className="text-right font-mono">
                      {insight ? formatPercentage(insight.ctr) : '—'}
                    </td>
                    <td className="text-right font-mono">
                      {insight ? formatNumber(insight.conversions) : '—'}
                    </td>
                    <td>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CampaignDetailPanel
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </>
  );
}
