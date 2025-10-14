import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Deal Analytics</h1>
          <p className="text-muted-foreground">Performance metrics and investment insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">$45.2M</div>
              <div className="text-sm text-muted-foreground">Total Deal Value</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">$8.5M</div>
              <div className="text-sm text-muted-foreground">Avg Deal Size</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-primary" />
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">87%</div>
              <div className="text-sm text-muted-foreground">Avg Fit Score</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-primary" />
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">Active Deals</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Advanced analytics features coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">Track deal progress, ROI projections, and market trends</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
