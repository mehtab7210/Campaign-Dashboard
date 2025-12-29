const API_BASE = 'https://mixo-fe-backend-task.vercel.app';

export interface Campaign {
  id: string;
  name: string;
  brand_id: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  daily_budget: number;
  platforms: string[];
  created_at: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

export interface CampaignInsights {
  campaign_id: string;
  timestamp: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversion_rate: number;
}

export interface AggregateInsights {
  timestamp: string;
  total_campaigns: number;
  active_campaigns: number;
  paused_campaigns: number;
  completed_campaigns: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_conversion_rate: number;
}

export async function fetchCampaigns(): Promise<CampaignsResponse> {
  const response = await fetch(`${API_BASE}/campaigns`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  return response.json();
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`${API_BASE}/campaigns/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }
  return response.json();
}

export async function fetchAggregateInsights(): Promise<{ insights: AggregateInsights }> {
  const response = await fetch(`${API_BASE}/campaigns/insights`);
  if (!response.ok) {
    throw new Error('Failed to fetch aggregate insights');
  }
  return response.json();
}

export async function fetchCampaignInsights(id: string): Promise<{ insights: CampaignInsights }> {
  const response = await fetch(`${API_BASE}/campaigns/${id}/insights`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaign insights');
  }
  return response.json();
}

export function streamCampaignInsights(
  id: string,
  onMessage: (data: CampaignInsights) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/campaigns/${id}/insights/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Failed to parse SSE message:', e);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    onError?.(new Error('Stream connection failed'));
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
