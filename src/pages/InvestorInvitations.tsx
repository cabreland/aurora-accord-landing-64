import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestorInviteDialog from '@/components/admin/InvestorInviteDialog';
import InvestorInvitationsTable from '@/components/admin/InvestorInvitationsTable';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  status: string;
}

const InvestorInvitations = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, company_name, status')
        .eq('status', 'active')
        .order('title');

      if (error) throw error;
      setDeals(data || []);
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="investor-invitations">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading deals...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="investor-invitations">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investor Invitations</h1>
            <p className="text-muted-foreground">
              Manage investor invitations and access to your deals
            </p>
          </div>
          <InvestorInviteDialog 
            deals={deals} 
            onInviteSuccess={handleInviteSuccess} 
          />
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Invitations</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Invitations</CardTitle>
                <CardDescription>
                  View and manage all investor invitations across all deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvestorInvitationsTable 
                  key={`all-${refreshKey}`}
                  onRefresh={handleRefresh} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Invitations that have been sent but not yet accepted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvestorInvitationsTable 
                  key={`pending-${refreshKey}`}
                  onRefresh={handleRefresh} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Invitations</CardTitle>
                <CardDescription>
                  Invitations that have been accepted by investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvestorInvitationsTable 
                  key={`accepted-${refreshKey}`}
                  onRefresh={handleRefresh} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expired Invitations</CardTitle>
                <CardDescription>
                  Invitations that have passed their expiry date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvestorInvitationsTable 
                  key={`expired-${refreshKey}`}
                  onRefresh={handleRefresh} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InvestorInvitations;