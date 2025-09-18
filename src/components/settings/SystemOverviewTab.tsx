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
  CheckCircle
} from 'lucide-react';

const SystemOverviewTab: React.FC = () => {
  // Mock data - in real implementation, fetch from API
  const stats = {
    totalUsers: 147,
    activeUsers: 23,
    totalDeals: 89,
    totalDocuments: 342,
    storageUsed: 2.3, // GB
    storageLimit: 10, // GB
    securityAlerts: 2,
    systemHealth: 98.5
  };

  const recentActivity = [
    { action: 'New user registered', user: 'john.doe@example.com', time: '2 minutes ago', type: 'user' },
    { action: 'Document uploaded', user: 'admin', time: '15 minutes ago', type: 'document' },
    { action: 'Settings updated', user: 'admin', time: '1 hour ago', type: 'system' },
    { action: 'Access granted', user: 'jane.smith@example.com', time: '2 hours ago', type: 'access' },
  ];

  const systemAlerts = [
    { type: 'warning', message: 'Storage usage is at 73% capacity', time: '1 hour ago' },
    { type: 'info', message: 'Scheduled maintenance tonight at 2 AM EST', time: '3 hours ago' },
  ];

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
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
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
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Total uploaded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Health</span>
                <span className="text-sm text-muted-foreground">{stats.systemHealth}%</span>
              </div>
              <Progress value={stats.systemHealth} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-muted-foreground">
                  {stats.storageUsed}GB / {stats.storageLimit}GB
                </span>
              </div>
              <Progress value={(stats.storageUsed / stats.storageLimit) * 100} className="h-2" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">All systems operational</span>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Security Alerts</span>
              <Badge variant={stats.securityAlerts > 0 ? "destructive" : "secondary"}>
                {stats.securityAlerts}
              </Badge>
            </div>

            <div className="space-y-2">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                <div className={`h-2 w-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'document' ? 'bg-green-500' :
                  activity.type === 'system' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">by {activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverviewTab;