import React, { useState } from 'react';
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
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getDashboardRoute } from '@/lib/auth-utils';

interface DealDetailPageProps {
  dealId?: string;
}

const DealDetailPage = ({ dealId }: DealDetailPageProps) => {
  const navigate = useNavigate();
  const { profile, isAdmin, isEditor, getDisplayName, getRoleDisplayName, loading } = useUserProfile();
  const [ndaAccepted, setNdaAccepted] = useState(true); // For demo, set to true to show documents

  // Sample data - this would come from props or API call in real implementation
  const dealData = {
    id: dealId || '2',
    name: 'Green Energy Corp',
    industry: 'Renewable Energy',
    location: 'Austin, TX',
    description: 'B2B renewable energy solutions platform with 500+ commercial clients specializing in solar installations and energy efficiency consulting',
    priority: 'High Priority',
    founded: '2015',
    teamSize: '78 Employees',
    reasonForSale: 'Expansion Capital',
    revenue: '$8.5M',
    ebitda: '$2.1M',
    netProfitMargin: '24.7%',
    customerCount: '500+',
    recurringRevenue: '85%',
    cacLtvRatio: '1:8.2',
    progress: 75,
    fitScore: 92,
    stage: 'NDA Signed'
  };

  const growthOpportunities = [
    'Expand into new geographic markets',
    'Develop additional service lines',
    'Strategic partnerships with utility companies',
    'Technology integration initiatives'
  ];

  const documents = [
    { name: 'Confidential Information Memorandum', type: 'PDF', size: '2.4 MB', updated: '2 days ago' },
    { name: 'Financial Statements (3 Years)', type: 'XLSX', size: '1.2 MB', updated: '1 week ago' },
    { name: 'Asset List & Inventory', type: 'PDF', size: '856 KB', updated: '3 days ago' },
    { name: 'Customer Contracts', type: 'ZIP', size: '4.1 MB', updated: '1 week ago' },
    { name: 'Legal Documentation', type: 'PDF', size: '3.2 MB', updated: '5 days ago' }
  ];

  const handleBack = () => {
    const dest = (isAdmin() || isEditor()) ? '/dashboard' : '/investor-portal';
    navigate(dest);
  };

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
                <div className="text-[#FAFAFA] font-medium">{loading ? 'Loading…' : getDisplayName()}</div>
                <div className="text-[#F4E4BC]/60 text-sm">{loading ? '' : getRoleDisplayName()}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#F4E4BC] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all duration-300 cursor-pointer"
              onClick={() => navigate((isAdmin() || isEditor()) ? '/dashboard' : '/investor-portal')}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
            <div className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#F4E4BC]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              <Building className="w-5 h-5" />
              <span className="font-medium">Active Deals</span>
              <Badge className="ml-auto bg-[#F28C38] text-[#0A0F0F] text-xs">4</Badge>
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
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-[#FAFAFA] mb-2">{dealData.name}</h1>
              <p className="text-lg text-[#F4E4BC]">{dealData.industry} • {dealData.location}</p>
            </div>
          </div>
          <Badge className="bg-[#F28C38] text-[#0A0F0F] px-6 py-3 text-base font-bold">
            {dealData.priority}
          </Badge>
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
                  {dealData.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0A0F0F]/50 rounded-lg p-4 text-center">
                    <div className="text-[#F4E4BC]/60 text-sm mb-1">Founded</div>
                    <div className="text-[#FAFAFA] font-bold">{dealData.founded}</div>
                  </div>
                  <div className="bg-[#0A0F0F]/50 rounded-lg p-4 text-center">
                    <div className="text-[#F4E4BC]/60 text-sm mb-1">Team Size</div>
                    <div className="text-[#FAFAFA] font-bold">{dealData.teamSize}</div>
                  </div>
                  <div className="bg-[#0A0F0F]/50 rounded-lg p-4 text-center">
                    <div className="text-[#F4E4BC]/60 text-sm mb-1">Reason for Sale</div>
                    <div className="text-[#FAFAFA] font-bold">{dealData.reasonForSale}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-3">Growth Opportunities</h4>
                  <ul className="space-y-2">
                    {growthOpportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-3 text-[#F4E4BC]">
                        <span className="text-[#D4AF37] mt-1">•</span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
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
                  "After 8 years of sustainable growth, we're seeking the right strategic partner to accelerate our mission of making renewable energy accessible to every business. This company has tremendous potential for nationwide expansion."
                </blockquote>
                <cite className="text-[#D4AF37] font-medium">— Michael Chen, Founder & CEO</cite>
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
                    Private equity firms or strategic acquirers with experience in renewable energy/sustainability sector, looking for profitable, scalable businesses with strong ESG focus.
                  </p>
                </div>
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Roll-up Potential</h4>
                  <p className="text-[#F4E4BC]">
                    High potential for horizontal integration with similar energy service platforms or vertical expansion into residential markets.
                  </p>
                </div>
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Market Trends Alignment</h4>
                  <p className="text-[#F4E4BC]">
                    Strong alignment with ESG investment trends, carbon neutrality initiatives, and government renewable energy incentives.
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
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#0A0F0F]/50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#D4AF37]" />
                          <div>
                            <div className="text-[#FAFAFA] font-medium">{doc.name}</div>
                            <div className="text-[#F4E4BC]/60 text-sm">
                              {doc.type} • {doc.size} • Updated {doc.updated}
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
                    ))}
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
                  <div className="text-[#F4E4BC]/60 text-sm mb-1">Annual Revenue</div>
                  <div className="text-2xl font-bold text-[#FAFAFA]">{dealData.revenue}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-1">EBITDA</div>
                  <div className="text-2xl font-bold text-[#FAFAFA]">{dealData.ebitda}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-1">Net Profit Margin</div>
                  <div className="text-2xl font-bold text-[#22C55E]">{dealData.netProfitMargin}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-1">Customer Count</div>
                  <div className="text-2xl font-bold text-[#FAFAFA]">{dealData.customerCount}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-1">Recurring Revenue</div>
                  <div className="text-2xl font-bold text-[#22C55E]">{dealData.recurringRevenue}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-4">
                  <div className="text-[#F4E4BC]/60 text-sm mb-1">CAC/LTV Ratio</div>
                  <div className="text-2xl font-bold text-[#22C55E]">{dealData.cacLtvRatio}</div>
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
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#F4E4BC]/60 text-sm">{dealData.stage}</span>
                    <span className="text-[#FAFAFA] font-bold">{dealData.progress}%</span>
                  </div>
                  <div className="w-full bg-[#1A1F2E] rounded-full h-3">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full transition-all duration-300"
                      style={{ width: `${dealData.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-[#F4E4BC] font-medium">Fit Score</span>
                  </div>
                  <Badge className="bg-[#22C55E] text-[#0A0F0F] font-bold">
                    {dealData.fitScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold py-4 text-lg">
                <Phone className="w-5 h-5 mr-3" />
                Schedule Buyer-Seller Call
              </Button>
              <Button className="w-full bg-[#F28C38] hover:bg-[#F28C38]/80 text-[#0A0F0F] font-bold py-4 text-lg">
                <Download className="w-5 h-5 mr-3" />
                Download Full Packet
              </Button>
              <Button 
                variant="outline"
                className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] font-bold py-4 text-lg"
              >
                <FolderOpen className="w-5 h-5 mr-3" />
                Open Deal Room
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;