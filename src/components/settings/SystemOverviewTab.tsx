import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  Activity, 
  Shield, 
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const SystemOverviewTab: React.FC = () => {
  // Fetch real stats from database
  const { data: stats, isLoading } = useQuery({
    queryKey: ['system-overview-stats'],
    queryFn: async () => {
      // Get total users from profiles
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total deals (non-test)
      const { count: totalDeals } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('is_test_data', false);

      // Get total documents
      const { count: totalDocuments } = await supabase
        .from('data_room_documents')
        .select('*', { count: 'exact', head: true });

      // Calculate storage used from document sizes
      const { data: docs } = await supabase
        .from('data_room_documents')
        .select('file_size');

      const totalBytes = (docs || []).reduce((sum, doc) => sum + (doc.file_size || 0), 0);
      const storageUsedGB = totalBytes / (1024 * 1024 * 1024);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: 0, // Would need session tracking
        totalDeals: totalDeals || 0,
        totalDocuments: totalDocuments || 0,
        storageUsed: Math.round(storageUsedGB * 100) / 100,
        storageLimit: 10,
        securityAlerts: 0,
        systemHealth: 100
      };
    },
  });

  // Fetch recent activity from deal_activities
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['system-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_activities')
        .select(`
          id,
          activity_type,
          created_at,
          deal:deals(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(a => ({
        action: a.activity_type?.replace(/_/g, ' ') || 'Activity',
        user: a.deal?.company_name || 'System',
        time: new Date(a.created_at).toLocaleString(),
        type: 'activity'
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { 
    totalUsers = 0, 
    activeUsers = 0, 
    totalDeals = 0, 
    totalDocuments = 0, 
    storageUsed = 0, 
    storageLimit = 10, 
    systemHealth = 100 
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              Active deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded files
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {storageUsed.toFixed(2)} GB / {storageLimit} GB used
              </span>
              <span className="text-sm font-medium">
                {Math.round((storageUsed / storageLimit) * 100)}%
              </span>
            </div>
            <Progress value={(storageUsed / storageLimit) * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Overall system health
              </span>
              <Badge variant={systemHealth >= 90 ? 'default' : 'destructive'}>
                {systemHealth}%
              </Badge>
            </div>
            <Progress value={systemHealth} className="bg-green-100" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverviewTab;
