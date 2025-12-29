import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchCampaigns, 
  fetchAggregateInsights, 
  fetchCampaignInsights,
  Campaign,
  CampaignInsights,
  formatCurrency,
  formatNumber,
  formatPercentage 
} from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';
import { CampaignsTable } from '@/components/CampaignsTable';
import { StatusFilter } from '@/components/StatusFilter';
import { Header } from '@/components/Header';
import { 
  TrendingUp, 
  MousePointerClick, 
  Target, 
  DollarSign,
  BarChart3,
  Percent
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'paused' | 'completed';

export default function Index() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [campaignInsights, setCampaignInsights] = useState<Map<string, CampaignInsights>>(new Map());

  const { 
    data: campaignsData, 
    isLoading: campaignsLoading,
    refetch: refetchCampaigns,
    isFetching: campaignsFetching
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    staleTime: 30000,
  });

  const { 
    data: aggregateData, 
    isLoading: aggregateLoading,
    refetch: refetchAggregate,
    isFetching: aggregateFetching
  } = useQuery({
    queryKey: ['aggregate-insights'],
    queryFn: fetchAggregateInsights,
    staleTime: 30000,
  });

  // Fetch individual campaign insights
  useEffect(() => {
    if (!campaignsData?.campaigns) return;

    const fetchAllInsights = async () => {
      const insightsMap = new Map<string, CampaignInsights>();
      
      await Promise.all(
        campaignsData.campaigns.map(async (campaign) => {
          try {
            const { insights } = await fetchCampaignInsights(campaign.id);
            insightsMap.set(campaign.id, insights);
          } catch (error) {
            console.error(`Failed to fetch insights for ${campaign.id}:`, error);
          }
        })
      );

      setCampaignInsights(insightsMap);
    };

    fetchAllInsights();
  }, [campaignsData?.campaigns]);

  const handleRefresh = useCallback(() => {
    refetchCampaigns();
    refetchAggregate();
  }, [refetchCampaigns, refetchAggregate]);

  const isRefreshing = campaignsFetching || aggregateFetching;
  const isLoading = campaignsLoading || aggregateLoading;

  const campaigns = campaignsData?.campaigns || [];
  const insights = aggregateData?.insights;

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (statusFilter === 'all') return true;
    return campaign.status === statusFilter;
  });

  const statusCounts = {
    all: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    paused: campaigns.filter((c) => c.status === 'paused').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* Aggregate Metrics */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Overview
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="metric-card animate-pulse">
                  <div className="h-3 w-20 bg-secondary rounded mb-2" />
                  <div className="h-7 w-16 bg-secondary rounded" />
                </div>
              ))}
            </div>
          ) : insights ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                label="Total Impressions"
                value={formatNumber(insights.total_impressions)}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <MetricCard
                label="Total Clicks"
                value={formatNumber(insights.total_clicks)}
                icon={<MousePointerClick className="h-4 w-4" />}
              />
              <MetricCard
                label="Conversions"
                value={formatNumber(insights.total_conversions)}
                icon={<Target className="h-4 w-4" />}
              />
              <MetricCard
                label="Total Spend"
                value={formatCurrency(insights.total_spend)}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <MetricCard
                label="Avg CTR"
                value={formatPercentage(insights.avg_ctr)}
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                label="Avg Conv. Rate"
                value={formatPercentage(insights.avg_conversion_rate)}
                icon={<Percent className="h-4 w-4" />}
              />
            </div>
          ) : null}
        </section>

        {/* Campaign Status Summary */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="metric-card text-center">
              <span className="text-2xl font-bold text-[hsl(var(--status-active))]">
                {statusCounts.active}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </div>
            <div className="metric-card text-center">
              <span className="text-2xl font-bold text-[hsl(var(--status-paused))]">
                {statusCounts.paused}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Paused</p>
            </div>
            <div className="metric-card text-center">
              <span className="text-2xl font-bold text-[hsl(var(--status-completed))]">
                {statusCounts.completed}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
          </div>
        </section>

        {/* Campaigns Table */}
        <section className="pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Campaigns ({filteredCampaigns.length})
            </h2>
            <StatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
              counts={statusCounts}
            />
          </div>
          <CampaignsTable
            campaigns={filteredCampaigns}
            insights={campaignInsights}
            isLoading={campaignsLoading}
          />
        </section>
      </div>
    </div>
  );
}
