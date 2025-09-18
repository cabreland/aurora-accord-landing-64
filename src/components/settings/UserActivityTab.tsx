import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActivityMonitoring } from '@/hooks/useActivityMonitoring';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  FileText,
  Settings,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

const UserActivityTab: React.FC = () => {
  const { activities, loading, fetchActivities, exportActivityData } = useActivityMonitoring();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  useEffect(() => {
    fetchActivities(100);
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('logout')) return User;
    if (action.includes('document') || action.includes('file')) return FileText;
    if (action.includes('setting')) return Settings;
    if (action.includes('security') || action.includes('permission')) return Shield;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'bg-green-100 text-green-800';
    if (action.includes('logout')) return 'bg-gray-100 text-gray-800';
    if (action.includes('failed') || action.includes('error')) return 'bg-red-100 text-red-800';
    if (action.includes('create') || action.includes('upload')) return 'bg-blue-100 text-blue-800';
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredActivities = activities.filter(activity => {
    const userEmail = (activity.profiles as any)?.email || '';
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = actionFilter === 'all' || activity.action.includes(actionFilter);
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90));
    
    const data = await exportActivityData(startDate.toISOString(), new Date().toISOString());
    
    // Create CSV content
    const csvContent = [
      ['Date', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'User Agent'].join(','),
      ...data.map(activity => [
        format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss'),
        (activity.profiles as any)?.email || 'System',
        activity.action,
        activity.resource_type || '',
        activity.resource_id || '',
        activity.ip_address || '',
        activity.user_agent || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Activity Logs</h2>
          <p className="text-muted-foreground">
            Monitor and track all user actions across the platform
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Activity
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by action or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login/Logout</SelectItem>
                  <SelectItem value="document">Document Actions</SelectItem>
                  <SelectItem value="setting">Settings Changes</SelectItem>
                  <SelectItem value="security">Security Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log ({filteredActivities.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading activity data...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const ActionIcon = getActionIcon(activity.action);
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(activity.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {(activity.profiles as any)?.email || 'System'}
            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ActionIcon className="w-4 h-4" />
                            <Badge 
                              variant="secondary" 
                              className={getActionColor(activity.action)}
                            >
                              {activity.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {activity.resource_type && (
                            <span className="text-sm text-muted-foreground">
                              {activity.resource_type}
                              {activity.resource_id && ` (${activity.resource_id.slice(0, 8)}...)`}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {activity.ip_address || '-'}
                        </TableCell>
                        <TableCell>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {Object.keys(activity.metadata).length} fields
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No activity records found for the current filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityTab;