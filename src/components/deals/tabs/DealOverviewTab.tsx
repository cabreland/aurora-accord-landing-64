import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Clock, 
  Users, 
  TrendingUp, 
  Upload, 
  Plus,
  Building2,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import { useDealMetrics, useDealById } from "@/hooks/useDeals";

export const DealOverviewTab = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { data: metrics, isLoading: metricsLoading } = useDealMetrics(dealId!);
  const { data: deal, isLoading: dealLoading } = useDealById(dealId!);

  if (metricsLoading || dealLoading) {
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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Deal Overview</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/deals/${dealId}/data-room`)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button size="sm" onClick={() => navigate(`/deals/${dealId}/requests`)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Request
          </Button>
        </div>
      </div>

      {/* Metrics Grid - Clickable Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate(`/deals/${dealId}/data-room`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.documents || 0}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
            <p className="text-xs text-primary mt-2">→ Data Room</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate(`/deals/${dealId}/requests`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.openRequests || 0}</p>
                <p className="text-sm text-muted-foreground">Open Requests</p>
              </div>
            </div>
            <p className="text-xs text-primary mt-2">→ Requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.completion || 0}%</p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
            <Progress value={metrics?.completion || 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate(`/deals/${dealId}/team`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.teamMembers || 0}</p>
                <p className="text-sm text-muted-foreground">Team</p>
              </div>
            </div>
            <p className="text-xs text-primary mt-2">→ Team</p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Info */}
      {deal && (
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
      )}

      {/* Financial Summary */}
      {deal && (deal.revenue || deal.ebitda || deal.asking_price) && (
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
      {deal?.description && (
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
