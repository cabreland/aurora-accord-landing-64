import React from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const Compliance = () => {
  const { user } = useAuth();

  const { data: ndas, isLoading } = useQuery({
    queryKey: ['my-ndas', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_nda_acceptances')
        .select('id, accepted_at, company_id, status, companies:company_id(name)')
        .eq('user_id', user!.id)
        .order('accepted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const signedCount = ndas?.filter(n => n.status === 'active' || !n.status).length || 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Compliance & Legal</h1>
          <p className="text-muted-foreground">Your NDA status and document access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-green-500" />
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-8 w-8" /> : signedCount}
              </div>
              <div className="text-sm text-muted-foreground">NDAs Signed</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-8 w-8" /> : ndas?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Agreements</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>NDA Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : !ndas || ndas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No NDAs signed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ndas.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">
                          {(item as any).companies?.name || 'Unknown Company'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Signed on {format(new Date(item.accepted_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-600">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
