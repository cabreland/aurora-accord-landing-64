import React from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['deal-analytics'],
    queryFn: async () => {
      const { data: deals, error } = await supabase
        .from('deals')
        .select('id, revenue, ebitda, status, asking_price')
        .eq('is_test_data', false);

      if (error) throw error;

      const activeDeals = (deals || []).filter(d => d.status === 'active');
      
      const parseNum = (val: string | null): number => {
        if (!val) return 0;
        const cleaned = val.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
      };

      const totalRevenue = activeDeals.reduce((sum, d) => sum + parseNum(d.revenue), 0);
      const avgDealSize = activeDeals.length > 0 
        ? activeDeals.reduce((sum, d) => sum + parseNum(d.asking_price), 0) / activeDeals.length 
        : 0;

      return {
        totalDeals: deals?.length || 0,
        activeDeals: activeDeals.length,
        totalRevenue,
        avgDealSize,
      };
    },
  });

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <AdminDashboardLayout activeTab="analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Deal Analytics</h1>
          <p className="text-muted-foreground">Performance metrics based on your deal data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '—' : formatCurrency(metrics?.totalRevenue || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Pipeline Revenue</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '—' : formatCurrency(metrics?.avgDealSize || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Deal Size</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '—' : metrics?.totalDeals || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Deals</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '—' : metrics?.activeDeals || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Deals</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Coming Soon</p>
              <p className="text-sm">Charts, ROI projections, and market trend analysis are being finalized.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default Analytics;
