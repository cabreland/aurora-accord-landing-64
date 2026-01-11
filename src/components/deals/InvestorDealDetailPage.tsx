import React, { useState, useEffect } from 'react';
import { 
  Building,
  User,
  Target,
  FileText,
  TrendingUp,
  Clock,
  Star,
  Phone,
  Download,
  FolderOpen,
  Lock,
  Unlock,
  DollarSign,
  Users,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { MyDeal } from '@/hooks/useMyDeals';
import { useToast } from '@/hooks/use-toast';
import { resolveDealRoute } from '@/lib/data/dealRouting';
import { useCompanyNDA } from '@/hooks/useCompanyNDA';
import { useCompanyAccessLevel } from '@/hooks/useCompanyAccessLevel';
import { InvestorDataRoomSection } from './InvestorDataRoomSection';
import { NDADialog } from './NDADialog';
import { AccessRequestDialog } from './AccessRequestDialog';
import { InvestorDealTeamSection } from './InvestorDealTeamSection';
import InvestorPortalLayout from '@/layouts/InvestorPortalLayout';
import { BreadcrumbItem } from '@/components/navigation/Breadcrumbs';

interface InvestorDealDetailPageProps {
  dealId?: string;
}

export const InvestorDealDetailPage = ({ dealId }: InvestorDealDetailPageProps) => {
  const navigate = useNavigate();
  const { profile, isAdmin, isEditor, loading: profileLoading } = useUserProfile();
  const [deal, setDeal] = useState<MyDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Data room hooks
  const { hasAcceptedNDA, loading: ndaLoading, refetch: refetchNDA } = useCompanyNDA(deal?.company_id);
  const { accessLevel, loading: accessLoading, refetch: refetchAccess } = useCompanyAccessLevel(deal?.company_id);

  useEffect(() => {
    if (dealId) {
      resolveDealRoute(dealId).then(info => {
        if (info.dealId) {
          fetchDeal(info.dealId);
        } else {
          fetchDeal();
        }
      });
    }
  }, [dealId]);

  const fetchDeal = async (resolvedDealId?: string) => {
    try {
      setLoading(true);
      const idToUse = resolvedDealId || dealId;
      if (!idToUse) throw new Error('Deal ID is required');
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', idToUse)
        .maybeSingle();

      if (error) throw error;
      setDeal(data as MyDeal);
    } catch (error: any) {
      console.error('Error fetching deal:', error);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!deal) return 0;
    let progress = 0;
    if (deal.title && deal.company_name) progress += 20;
    if (deal.revenue && deal.ebitda) progress += 30;
    if (deal.industry && deal.location) progress += 30;
    if (deal.status === 'active') progress += 20;
    else if (deal.status === 'draft') progress += 10;
    return Math.min(progress, 100);
  };

  const calculateFitScore = () => {
    if (!deal) return 50;
    let score = 50;
    if (deal.revenue) score += 10;
    if (deal.ebitda) score += 10;
    if (deal.industry) score += 10;
    if (deal.location) score += 10;
    if (deal.status === 'active') score += 10;
    return Math.min(score, 100);
  };

  const growthOpportunities = deal?.growth_opportunities 
    ? (Array.isArray(deal.growth_opportunities) ? deal.growth_opportunities : [])
    : [
      'Market expansion opportunities',
      'Product development initiatives',
      'Strategic partnerships',
      'Operational efficiency improvements'
    ];

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Browse Deals', path: '/investor-portal' },
    { label: deal?.company_name || 'Deal Details' }
  ];

  if (loading) {
    return (
      <InvestorPortalLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </InvestorPortalLayout>
    );
  }

  if (!deal) {
    return (
      <InvestorPortalLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Deal not found</h2>
          <Button onClick={() => navigate('/investor-portal')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deals
          </Button>
        </div>
      </InvestorPortalLayout>
    );
  }

  const progress = calculateProgress();
  const fitScore = calculateFitScore();

  return (
    <InvestorPortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{deal.company_name}</h1>
            <p className="text-lg text-muted-foreground">{deal.industry || 'Business'} • {deal.location || 'Location TBD'}</p>
          </div>
          <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold w-fit">
            {deal.priority || 'Medium'} Priority
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-card border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="dataroom" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <FileText className="w-4 h-4" />
              Data Room
              {!hasAcceptedNDA && <Lock className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <DollarSign className="w-4 h-4" />
              Financials
              {accessLevel !== 'financials' && accessLevel !== 'full' && <Lock className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Company Overview */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <Building className="w-6 h-6 text-primary" />
                      Company Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {(deal as any).description || deal.title}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-muted-foreground text-sm mb-1">Founded</div>
                        <div className="text-foreground font-bold">{(deal as any).founded_year || 'N/A'}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-muted-foreground text-sm mb-1">Team Size</div>
                        <div className="text-foreground font-bold">{(deal as any).team_size || 'N/A'}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-muted-foreground text-sm mb-1">Status</div>
                        <div className="text-foreground font-bold capitalize">{deal.status}</div>
                      </div>
                    </div>

                    {growthOpportunities.length > 0 && (
                      <div>
                        <h4 className="text-primary font-semibold mb-3">Growth Opportunities</h4>
                        <ul className="space-y-2">
                          {growthOpportunities.slice(0, 4).map((opportunity, index) => (
                            <li key={index} className="flex items-start gap-3 text-muted-foreground">
                              <span className="text-primary mt-1">•</span>
                              {typeof opportunity === 'string' ? opportunity : JSON.stringify(opportunity)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Founder's Message */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      Founder's Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-muted-foreground italic mb-4 text-lg leading-relaxed">
                      {(deal as any).founders_message || 
                       `"We've built a strong, profitable business and are now seeking the right strategic partner to accelerate our growth and reach new markets."`}
                    </blockquote>
                    <cite className="text-primary font-medium">
                      — {(deal as any).founder_name || 'Founder'}, {(deal as any).founder_title || 'CEO'}
                    </cite>
                  </CardContent>
                </Card>

                {/* Strategic Fit Analysis */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <Target className="w-6 h-6 text-primary" />
                      Strategic Fit Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-primary font-semibold mb-2">Ideal Buyer Profile</h4>
                      <p className="text-muted-foreground">
                        {(deal as any).ideal_buyer_profile || 
                         `Strategic acquirers or private equity firms looking for profitable, scalable businesses in the ${deal.industry || 'target'} sector.`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-primary font-semibold mb-2">Roll-up Potential</h4>
                      <p className="text-muted-foreground">
                        {(deal as any).rollup_potential || 
                         'Strong potential for market consolidation and operational synergies with similar businesses.'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-primary font-semibold mb-2">Market Trends Alignment</h4>
                      <p className="text-muted-foreground">
                        {(deal as any).market_trends_alignment || 
                         'Well-positioned to benefit from current market trends and growth opportunities.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Financial Metrics */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Financial Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-2">Annual Revenue</div>
                      <div className="text-2xl font-bold text-foreground">
                        {deal.revenue || 'Confidential'}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-2">EBITDA</div>
                      <div className="text-2xl font-bold text-foreground">
                        {deal.ebitda || 'Confidential'}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-2">Asking Price</div>
                      <div className="text-2xl font-bold text-primary">
                        {(deal as any).asking_price || 'Contact for Pricing'}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-primary font-semibold mb-3">Financial Highlights</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Growth Rate</span>
                          <span className="text-foreground font-medium">{(deal as any).growth_rate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Profit Margin</span>
                          <span className="text-foreground font-medium">{(deal as any).profit_margin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Customer Count</span>
                          <span className="text-foreground font-medium">{(deal as any).customer_count || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Recurring Revenue</span>
                          <span className="text-foreground font-medium">{(deal as any).recurring_revenue || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Deal Progress */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <Clock className="w-6 h-6 text-primary" />
                      Deal Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="text-foreground font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Investment Fit Score</span>
                        <span className="text-foreground font-medium">{fitScore}%</span>
                      </div>
                      <Progress value={fitScore} className="h-2" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">Deal Status</span>
                      </div>
                      <span className="text-foreground capitalize">{deal.status}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact & Actions */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <Phone className="w-6 h-6 text-primary" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">
                      Express Interest
                    </Button>
                    <Button variant="outline" className="w-full">
                      Schedule Call
                    </Button>
                    {!hasAcceptedNDA && (
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2"
                        onClick={() => setShowNDAModal(true)}
                      >
                        <Lock className="w-4 h-4" />
                        Sign NDA for Full Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Data Room Tab */}
          <TabsContent value="dataroom" className="mt-6">
            <InvestorDataRoomSection
              dealId={dealId || ''}
              companyId={deal?.company_id}
              hasSignedNDA={hasAcceptedNDA}
              accessLevel={accessLevel}
              onOpenNDA={() => setShowNDAModal(true)}
              onRequestAccess={() => setShowAccessRequest(true)}
            />
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accessLevel === 'financials' || accessLevel === 'full' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-muted-foreground text-sm mb-2">Annual Revenue</div>
                        <div className="text-2xl font-bold text-foreground">
                          {deal?.revenue || 'Confidential'}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-muted-foreground text-sm mb-2">EBITDA</div>
                        <div className="text-2xl font-bold text-foreground">
                          {deal?.ebitda || 'Confidential'}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-muted-foreground text-sm mb-2">Asking Price</div>
                        <div className="text-2xl font-bold text-primary">
                          {(deal as any)?.asking_price || 'Contact for Pricing'}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-muted-foreground text-sm mb-2">Growth Rate</div>
                        <div className="text-2xl font-bold text-foreground">
                          {(deal as any)?.growth_rate || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detailed financial statements and analysis are available in the Data Room
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground mb-2">Financial Access Required</p>
                    <p className="text-muted-foreground text-sm mb-6">
                      Request access to view detailed financial information
                    </p>
                    <Button onClick={() => setShowAccessRequest(true)}>
                      Request Financial Access
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-6">
            <InvestorDealTeamSection dealId={dealId || ''} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NDADialog
        open={showNDAModal}
        onOpenChange={setShowNDAModal}
        companyId={deal?.company_id || ''}
        companyName={deal?.company_name}
        onSuccess={() => {
          refetchNDA();
          refetchAccess();
        }}
      />

      <AccessRequestDialog
        open={showAccessRequest}
        onOpenChange={setShowAccessRequest}
        companyId={deal?.company_id || ''}
        currentLevel={accessLevel}
        onSuccess={() => {
          refetchAccess();
        }}
      />
    </InvestorPortalLayout>
  );
};
