import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
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
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute } from '@/lib/auth-utils';
import { supabase } from '@/integrations/supabase/client';
import { MyDeal } from '@/hooks/useMyDeals';
import { useToast } from '@/hooks/use-toast';
import { ExpandedDealEditModal } from './ExpandedDealEditModal';

interface DynamicDealDetailPageProps {
  dealId?: string;
}

export const DynamicDealDetailPage = ({ dealId }: DynamicDealDetailPageProps) => {
  // ALL HOOKS MUST BE AT THE TOP LEVEL - React Rules of Hooks
  const navigate = useNavigate();
  const { profile, isAdmin, isEditor, getDisplayName, getRoleDisplayName, loading: profileLoading } = useUserProfile();
  const [deal, setDeal] = useState<MyDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  // Effects after all hook declarations
  useEffect(() => {
    if (dealId) {
      fetchDeal();
      loadDealDocuments();
    }
  }, [dealId]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      
      if (!dealId) {
        throw new Error('Deal ID is required');
      }
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
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

  const loadDealDocuments = async () => {
    try {
      if (!dealId) return;
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      // Fallback to empty array for new deals
      setDocuments([]);
    }
  };

  const handleBack = () => {
    const dest = (isAdmin() || isEditor()) ? '/deals' : '/investor-portal';
    navigate(dest);
  };

  const handleEditSaved = () => {
    fetchDeal(); // Refresh deal data
  };

  const canEdit = isAdmin() || isEditor();

  // Calculate progress based on deal status and data completeness
  const calculateProgress = () => {
    if (!deal) return 0;
    let progress = 0;
    
    // Basic info (20%)
    if (deal.title && deal.company_name) progress += 20;
    
    // Financial info (30%)
    if (deal.revenue && deal.ebitda) progress += 30;
    
    // Additional details (30%)
    if (deal.industry && deal.location) progress += 30;
    
    // Status (20%)
    if (deal.status === 'active') progress += 20;
    else if (deal.status === 'draft') progress += 10;
    
    return Math.min(progress, 100);
  };

  const calculateFitScore = () => {
    if (!deal) return 50;
    // Simple fit score calculation based on available data
    let score = 50;
    if (deal.revenue) score += 10;
    if (deal.ebitda) score += 10;
    if (deal.industry) score += 10;
    if (deal.location) score += 10;
    if (deal.status === 'active') score += 10;
    return Math.min(score, 100);
  };

  // Parse growth opportunities from deal data
  const growthOpportunities = deal?.growth_opportunities 
    ? (Array.isArray(deal.growth_opportunities) ? deal.growth_opportunities : [])
    : [
      'Market expansion opportunities',
      'Product development initiatives',
      'Strategic partnerships',
      'Operational efficiency improvements'
    ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0F]">
        {/* Loading Skeleton */}
        <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 z-10">
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="ml-64 p-6">
          <Skeleton className="h-10 w-96 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-[#0A0F0F] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-4">Deal not found</h2>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const fitScore = calculateFitScore();

  return (
    <div className="min-h-screen bg-[#0A0F0F]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-[#0A0F0F] to-[#1A1F2E] border-r border-[#D4AF37]/30 z-10">
        <div className="p-6">
          {/* Back to Dashboard Button */}
          <Button 
            onClick={() => navigate(profile?.role ? getDashboardRoute(profile.role) : '/dashboard')}
            className="w-full mb-6 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Logo Area */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">M&A Portal</h2>
            <p className="text-sm text-[#F4E4BC]/60">Exclusive Business Brokers</p>
          </div>

          {/* User Info */}
          <div className="bg-[#2A2F3A]/60 rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#0A0F0F]" />
              </div>
              <div>
                <div className="text-[#FAFAFA] font-medium">{profileLoading ? 'Loading…' : getDisplayName()}</div>
                <div className="text-[#F4E4BC]/60 text-sm">{profileLoading ? '' : getRoleDisplayName()}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all duration-300 cursor-pointer"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Deals</span>
            </div>
            <div className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              <Building className="w-5 h-5" />
              <span className="font-medium">Deal Details</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-[#FAFAFA] mb-2">{deal.company_name}</h1>
              <p className="text-lg text-[#F4E4BC]">{deal.industry || 'Business'} • {deal.location || 'Location TBD'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <Button 
                onClick={() => setShowEditModal(true)}
                className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Deal
              </Button>
            )}
            <Badge className="bg-[#F28C38] text-[#0A0F0F] px-6 py-3 text-base font-bold">
              {deal.priority || 'Medium'} Priority
            </Badge>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Overview */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <Building className="w-6 h-6 text-[#D4AF37]" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#F4E4BC] leading-relaxed">
                  {(deal as any).description || deal.title}
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0A0F0F]/50 rounded-lg p-4 text-center">
                    <div className="text-[#F4E4BC]/60 text-sm mb-1">Founded</div>
                    <div className="text-[#FAFAFA] font-bold">{(deal as any).founded_year || 'N/A'}</div>
                  </div>
                  <div className="bg-[#0A0F0F]/50 rounded-lg p-4 text-center">
                    <div className="text-[#F4E4BC]/60 text-sm mb-1">Team Size</div>
                    <div className="text-[#FAFAFA] font-bold">{(deal as any).team_size || 'N/A'}</div>
                  </div>
                  <div className="bg-[#0A0F0F]/50 rounded-lg p-4 text-center">
                    <div className="text-[#F4E4BC]/60 text-sm mb-1">Status</div>
                    <div className="text-[#FAFAFA] font-bold capitalize">{deal.status}</div>
                  </div>
                </div>

                {growthOpportunities.length > 0 && (
                  <div>
                    <h4 className="text-[#D4AF37] font-semibold mb-3">Growth Opportunities</h4>
                    <ul className="space-y-2">
                      {growthOpportunities.slice(0, 4).map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-3 text-[#F4E4BC]">
                          <span className="text-[#D4AF37] mt-1">•</span>
                          {typeof opportunity === 'string' ? opportunity : JSON.stringify(opportunity)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Founder's Message */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0A0F0F]" />
                  </div>
                  Founder's Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-[#F4E4BC] italic mb-4 text-lg leading-relaxed">
                  {(deal as any).founders_message || 
                   `"We've built a strong, profitable business and are now seeking the right strategic partner to accelerate our growth and reach new markets."`}
                </blockquote>
                <cite className="text-[#D4AF37] font-medium">
                  — {(deal as any).founder_name || 'Founder'}, {(deal as any).founder_title || 'CEO'}
                </cite>
              </CardContent>
            </Card>

            {/* Strategic Fit Analysis */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <Target className="w-6 h-6 text-[#D4AF37]" />
                  Strategic Fit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Ideal Buyer Profile</h4>
                  <p className="text-[#F4E4BC]">
                    {(deal as any).ideal_buyer_profile || 
                     `Strategic acquirers or private equity firms looking for profitable, scalable businesses in the ${deal.industry || 'target'} sector.`}
                  </p>
                </div>
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Roll-up Potential</h4>
                  <p className="text-[#F4E4BC]">
                    {(deal as any).rollup_potential || 
                     'Strong potential for market consolidation and operational synergies with similar businesses.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Market Trends Alignment</h4>
                  <p className="text-[#F4E4BC]">
                    {(deal as any).market_trends_alignment || 
                     'Well-positioned to benefit from current market trends and growth opportunities.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Deal Documents */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-[#FAFAFA]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#D4AF37]" />
                    Deal Documents
                  </div>
                  <Badge className={`${ndaAccepted ? 'bg-[#22C55E]' : 'bg-[#F28C38]'} text-[#0A0F0F] flex items-center gap-2`}>
                    {ndaAccepted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {ndaAccepted ? 'Access Granted' : 'NDA Required'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ndaAccepted ? (
                  <div className="space-y-3">
                    {documents.length > 0 ? (
                      documents.map((doc, index) => (
                        <div key={doc.id || index} className="flex items-center justify-between bg-[#0A0F0F]/50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#D4AF37]" />
                            <div>
                              <div className="text-[#FAFAFA] font-medium">{doc.name}</div>
                              <div className="text-[#F4E4BC]/60 text-sm">
                                {doc.file_type || 'Document'} • {doc.file_size ? `${Math.round(doc.file_size / 1024)}KB` : 'Unknown size'} • 
                                {doc.created_at ? ` Uploaded ${new Date(doc.created_at).toLocaleDateString()}` : ' Recently uploaded'}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FolderOpen className="w-12 h-12 text-[#F28C38]/50 mx-auto mb-3" />
                        <p className="text-[#F4E4BC]/60">No documents uploaded yet</p>
                        <p className="text-[#F4E4BC]/40 text-sm mt-1">Documents will appear here once uploaded</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 text-[#F28C38] mx-auto mb-4" />
                    <p className="text-[#F4E4BC] mb-6">Sign NDA to unlock documents</p>
                    <Button 
                      className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]"
                      onClick={() => setNdaAccepted(true)}
                    >
                      Sign NDA & Access Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Financial Metrics */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
                  Financial Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-2">Annual Revenue</div>
                  <div className="text-2xl font-bold text-[#FAFAFA]">
                    {deal.revenue || 'Confidential'}
                  </div>
                </div>

                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-2">EBITDA</div>
                  <div className="text-2xl font-bold text-[#FAFAFA]">
                    {deal.ebitda || 'Confidential'}
                  </div>
                </div>

                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-2">Asking Price</div>
                  <div className="text-2xl font-bold text-[#D4AF37]">
                    {(deal as any).asking_price || 'Contact for Pricing'}
                  </div>
                </div>

                {/* Financial Highlights */}
                <div className="mt-6">
                  <h4 className="text-[#D4AF37] font-semibold mb-3">Financial Highlights</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#F4E4BC]/80">Growth Rate</span>
                      <span className="text-[#FAFAFA] font-medium">{(deal as any).growth_rate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#F4E4BC]/80">Profit Margin</span>
                      <span className="text-[#FAFAFA] font-medium">{(deal as any).profit_margin || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#F4E4BC]/80">Customer Count</span>
                      <span className="text-[#FAFAFA] font-medium">{(deal as any).customer_count || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#F4E4BC]/80">Recurring Revenue</span>
                      <span className="text-[#FAFAFA] font-medium">{(deal as any).recurring_revenue || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deal Progress */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <Clock className="w-6 h-6 text-[#D4AF37]" />
                  Deal Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#F4E4BC]/80">Completion</span>
                    <span className="text-[#FAFAFA] font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#F4E4BC]/80">Investment Fit Score</span>
                    <span className="text-[#FAFAFA] font-medium">{fitScore}%</span>
                  </div>
                  <Progress value={fitScore} className="h-2" />
                </div>

                <div className="bg-[#0A0F0F]/50 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] font-medium">Deal Status</span>
                  </div>
                  <span className="text-[#FAFAFA] capitalize">{deal.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Actions */}
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <Phone className="w-6 h-6 text-[#D4AF37]" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-semibold"
                  onClick={() => {
                    // Handle express interest
                  }}
                >
                  Express Interest
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
                  onClick={() => {
                    // Handle schedule call
                  }}
                >
                  Schedule Call
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                  onClick={() => {
                    // Handle request more info
                  }}
                >
                  <FolderOpen className="w-5 h-5 mr-3" />
                  Request Additional Information
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && deal && (
        <ExpandedDealEditModal
          deal={deal}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
};