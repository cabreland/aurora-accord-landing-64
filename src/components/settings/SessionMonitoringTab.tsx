import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActivityMonitoring } from '@/hooks/useActivityMonitoring';
import { Activity, LogOut, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

const SessionMonitoringTab: React.FC = () => {
  const { sessions, loading, fetchActiveSessions, forceLogoutSession } = useActivityMonitoring();

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const handleForceLogout = async (sessionId: string) => {
    await forceLogoutSession(sessionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Session Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor active user sessions and manage access
          </p>
        </div>
        <Button onClick={fetchActiveSessions} variant="outline">
          Refresh Sessions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading sessions...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="font-medium">
                            {session.profiles?.email || 'Unknown User'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(session.last_activity), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {Math.round((new Date().getTime() - new Date(session.created_at).getTime()) / (1000 * 60 * 60))}h
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-mono">
                            {session.ip_address || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {session.user_agent ? session.user_agent.split(' ')[0] : 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleForceLogout(session.id)}
                          className="flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Force Logout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No active sessions found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionMonitoringTab;