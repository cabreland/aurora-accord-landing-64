import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Eye, Download } from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string;
}

const SecurityDashboard = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching security events:', error);
      toast({
        title: "Error loading security events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityEvents();
  };

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('unauthorized') || eventType.includes('malicious')) {
      return 'destructive';
    }
    if (eventType.includes('success') || eventType.includes('validation_success')) {
      return 'default';
    }
    return 'secondary';
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('unauthorized') || eventType.includes('malicious')) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    if (eventType.includes('success')) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <Shield className="w-4 h-4 text-[#D4AF37]" />;
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const exportSecurityLog = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = [
        'ID,User ID,Event Type,Event Data,IP Address,User Agent,Created At',
        ...data.map(event => [
          event.id,
          event.user_id || 'N/A',
          event.event_type,
          JSON.stringify(event.event_data || {}),
          event.ip_address || 'N/A',
          event.user_agent || 'N/A',
          event.created_at
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Security audit log exported to CSV file.",
      });
    } catch (error: any) {
      console.error('Error exporting security log:', error);
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                Security Monitoring Dashboard
              </CardTitle>
              <CardDescription className="text-[#F4E4BC]">
                Real-time security events and audit trail
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportSecurityLog}
                className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center text-[#F4E4BC]/70 py-8">
                  No security events recorded yet.
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-[#D4AF37]/20 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.event_type)}
                        <Badge variant={getEventBadgeVariant(event.event_type)}>
                          {formatEventType(event.event_type)}
                        </Badge>
                      </div>
                      <span className="text-sm text-[#F4E4BC]/70">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {event.user_id && (
                        <div className="text-[#F4E4BC]">
                          <strong>User ID:</strong> {event.user_id.substring(0, 8)}...
                        </div>
                      )}
                      {event.ip_address && (
                        <div className="text-[#F4E4BC]">
                          <strong>IP:</strong> {String(event.ip_address)}
                        </div>
                      )}
                    </div>

                    {event.event_data && Object.keys(event.event_data).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-[#D4AF37] text-sm flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-[#1A1F2E] rounded text-xs text-[#F4E4BC] overflow-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;