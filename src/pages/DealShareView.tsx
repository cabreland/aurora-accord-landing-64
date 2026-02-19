import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, TrendingUp, DollarSign, Users, AlertCircle, Mail } from 'lucide-react';

interface ShareDeal {
  company_name: string;
  industry: string | null;
  location: string | null;
  revenue: string | null;
  ebitda: string | null;
  asking_price: string | null;
  team_size: string | null;
  description: string | null;
  growth_rate: string | null;
}

const MetricCard = ({ label, value, icon: Icon }: { label: string; value: string | null; icon: React.ElementType }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-semibold text-foreground">{value || '—'}</p>
  </div>
);

const DealShareView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [deal, setDeal] = useState<ShareDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) { setError('Invalid link'); setLoading(false); return; }

      // Look up token in deal_share_tokens
      const { data: tokenRow, error: tokenErr } = await supabase
        .from('deal_share_tokens')
        .select('deal_id, is_active, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (tokenErr || !tokenRow) { setError('This link is invalid or has expired.'); setLoading(false); return; }
      if (!tokenRow.is_active) { setError('This link has been deactivated.'); setLoading(false); return; }
      if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
        setError('This link has expired.'); setLoading(false); return;
      }

      const { data: dealData, error: dealErr } = await supabase
        .from('deals')
        .select('company_name, industry, location, revenue, ebitda, asking_price, team_size, description, growth_rate')
        .eq('id', tokenRow.deal_id)
        .single();

      if (dealErr || !dealData) { setError('Deal not found.'); setLoading(false); return; }
      setDeal(dealData as ShareDeal);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold">Link Unavailable</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Deal Summary</span>
          </div>
          <Badge variant="secondary">Confidential</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Company Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{deal?.company_name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            {deal?.industry && (
              <span className="flex items-center gap-1 text-sm">
                <Building2 className="h-3.5 w-3.5" />
                {deal.industry}
              </span>
            )}
            {deal?.location && (
              <span className="flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {deal.location}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {deal?.description && (
          <div className="bg-muted/50 rounded-xl p-5 border border-border">
            <p className="text-sm leading-relaxed text-foreground">{deal.description}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetricCard label="Revenue" value={deal?.revenue} icon={DollarSign} />
            <MetricCard label="EBITDA" value={deal?.ebitda} icon={TrendingUp} />
            <MetricCard label="Asking Price" value={deal?.asking_price} icon={DollarSign} />
            <MetricCard label="Team Size" value={deal?.team_size} icon={Users} />
            {deal?.growth_rate && <MetricCard label="Growth Rate" value={deal.growth_rate} icon={TrendingUp} />}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
          <h3 className="font-semibold text-foreground">Interested in learning more?</h3>
          <p className="text-sm text-muted-foreground">
            Contact us to request full access to the data room and financial details.
          </p>
          <Button asChild>
            <a href="mailto:deals@example.com">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </a>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          This document contains confidential information. Do not distribute without permission.
        </p>
      </main>
    </div>
  );
};

export default DealShareView;
