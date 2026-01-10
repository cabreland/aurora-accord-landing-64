import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  ClipboardList, 
  CheckCircle, 
  Users,
  Building2,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useDiligenceRequests } from '@/hooks/useDiligenceTracker';
import { useDealTeam } from '@/hooks/useDealTeam';

export const DealOverviewTab = () => {
  const { dealId } = useParams();

  // Fetch deal details
  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ['deal-detail', dealId],
    queryFn: async () => {
      if (!dealId) return null;
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!dealId
  });

  // Fetch related data
  const { data: requests } = useDiligenceRequests(dealId);
  const { data: teamMembers } = useDealTeam(dealId);

  // Fetch documents count
  const { data: documentsCount } = useQuery({
    queryKey: ['deal-documents-count', dealId],
    queryFn: async () => {
      if (!dealId) return 0;
      const { count, error } = await supabase
        .from('data_room_documents')
        .select('*', { count: 'exact', head: true })
        .eq('deal_id', dealId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!dealId
  });

  // Calculate metrics
  const totalRequests = requests?.length || 0;
  const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
  const completionPercentage = totalRequests > 0 
    ? Math.round((completedRequests / totalRequests) * 100) 
    : 0;
  const totalDocuments = documentsCount || 0;
  const totalTeamMembers = teamMembers?.length || 0;

  if (dealLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Deal not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDocuments}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRequests}</p>
                <p className="text-sm text-muted-foreground">Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionPercentage}%</p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTeamMembers}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Deal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{deal.company_name}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Deal Title</p>
              <p className="font-medium">{deal.title}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="capitalize">
                {deal.status}
              </Badge>
            </div>
            
            {deal.industry && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{deal.industry}</p>
              </div>
            )}
            
            {deal.location && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </p>
                <p className="font-medium">{deal.location}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created
              </p>
              <p className="font-medium">
                {new Date(deal.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      {(deal.revenue || deal.ebitda || deal.asking_price) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {deal.revenue && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl font-semibold text-foreground">{deal.revenue}</p>
                </div>
              )}
              
              {deal.ebitda && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">EBITDA</p>
                  <p className="text-xl font-semibold text-foreground">{deal.ebitda}</p>
                </div>
              )}
              
              {deal.asking_price && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Asking Price</p>
                  <p className="text-xl font-semibold text-foreground">{deal.asking_price}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {deal.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DealOverviewTab;
