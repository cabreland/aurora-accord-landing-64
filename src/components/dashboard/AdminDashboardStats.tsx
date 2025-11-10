import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, FileCheck, MessageSquare, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  activeDeals: number;
  totalInvestors: number;
  pendingAccessRequests: number;
  recentNDAs: number;
  activeConversations: number;
  dealsViewed: number;
}

interface AccessRequest {
  id: string;
  requested_at: string;
  requested_level: string;
  profiles: { first_name: string; last_name: string } | null;
  companies: { name: string } | null;
}

interface NDAAcceptance {
  id: string;
  accepted_at: string;
  signer_name: string;
  companies: { name: string } | null;
}

export const AdminDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeDeals: 0,
    totalInvestors: 0,
    pendingAccessRequests: 0,
    recentNDAs: 0,
    activeConversations: 0,
    dealsViewed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Active deals
      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total investors (viewers)
      const { count: investorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'viewer');

      // Pending access requests
      const { count: pendingRequests } = await supabase
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Recent NDAs (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { count: recentNDAs } = await supabase
        .from('company_nda_acceptances')
        .select('*', { count: 'exact', head: true })
        .gte('accepted_at', sevenDaysAgo.toISOString());

      // Active conversations (status = 'active')
      const { count: activeConvos } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        activeDeals: dealsCount || 0,
        totalInvestors: investorsCount || 0,
        pendingAccessRequests: pendingRequests || 0,
        recentNDAs: recentNDAs || 0,
        activeConversations: activeConvos || 0,
        dealsViewed: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your M&A platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/deals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeDeals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently available to investors
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInvestors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered investor accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/access-requests">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-500/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {stats.pendingAccessRequests}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting access approval
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/ndas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent NDAs</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recentNDAs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Signed in last 7 days
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/conversations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeConversations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Open investor inquiries
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Room Activity</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dealsViewed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Document views this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAccessRequests />
        <RecentNDASignatures />
      </div>
    </div>
  );
};

const RecentAccessRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data: requestsData } = await supabase
      .from('access_requests')
      .select('id, requested_at, requested_level, user_id, company_id')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(5);

    if (!requestsData) {
      setRequests([]);
      return;
    }

    // Fetch user profiles
    const userIds = requestsData.map(r => r.user_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds);

    // Fetch companies
    const companyIds = requestsData.map(r => r.company_id);
    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', companyIds);

    // Combine data
    const enrichedRequests = requestsData.map(req => ({
      id: req.id,
      requested_at: req.requested_at,
      requested_level: req.requested_level,
      profiles: profilesData?.find(p => p.user_id === req.user_id) || null,
      companies: companiesData?.find(c => c.id === req.company_id) || null
    }));

    setRequests(enrichedRequests);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Access Requests</CardTitle>
          <Link to="/dashboard/access-requests" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending requests
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {req.profiles?.first_name} {req.profiles?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.companies?.name} • {req.requested_level}
                  </p>
                </div>
                <Link to="/dashboard/access-requests">
                  <Button size="sm">Review</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RecentNDASignatures = () => {
  const [ndas, setNdas] = useState<NDAAcceptance[]>([]);

  useEffect(() => {
    loadNDAs();
  }, []);

  const loadNDAs = async () => {
    const { data } = await supabase
      .from('company_nda_acceptances')
      .select(`
        id,
        accepted_at,
        signer_name,
        companies:company_id(name)
      `)
      .order('accepted_at', { ascending: false })
      .limit(5);

    setNdas((data as NDAAcceptance[]) || []);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent NDA Signatures</CardTitle>
          <Link to="/dashboard/ndas" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {ndas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent signatures
          </p>
        ) : (
          <div className="space-y-3">
            {ndas.map(nda => (
              <div key={nda.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{nda.signer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {nda.companies?.name} • {formatDistanceToNow(new Date(nda.accepted_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="outline">Signed</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
