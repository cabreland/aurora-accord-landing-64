
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  FileText,
  Download,
  Lock,
  Unlock,
  Phone,
  FolderOpen,
  Building,
  Target,
  Star,
  Clock,
  Shield
} from 'lucide-react';
import { InvestorDeal } from '@/hooks/useInvestorDeals';

interface DealDetailViewProps {
  deal: InvestorDeal;
  onBack: () => void;
}

const DealDetailView = ({ deal, onBack }: DealDetailViewProps) => {
  const ndaSigned = deal.stage === "NDA Signed" || deal.stage === "Due Diligence";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#FAFAFA]">{deal.companyName}</h1>
            <p className="text-[#F4E4BC]/80">{deal.industry} • {deal.location}</p>
          </div>
        </div>
        <Badge className={`${deal.priority === 'High' ? 'bg-[#F28C38]' : 'bg-[#D4AF37]'} text-[#0A0F0F] font-bold px-4 py-2`}>
          {deal.priority} Priority
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Overview */}
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center">
                <Building className="w-5 h-5 mr-2 text-[#D4AF37]" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#F4E4BC] leading-relaxed">{deal.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Founded</div>
                  <div className="text-[#FAFAFA] font-bold">{deal.foundedYear}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Team Size</div>
                  <div className="text-[#FAFAFA] font-bold">{deal.teamSize}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Reason for Sale</div>
                  <div className="text-[#FAFAFA] font-bold text-sm">{deal.reasonForSale}</div>
                </div>
              </div>

              {deal.growthOpportunities.length > 0 && (
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Growth Opportunities</h4>
                  <ul className="text-[#F4E4BC] space-y-1">
                    {deal.growthOpportunities.map((opportunity, index) => (
                      <li key={index}>• {opportunity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Commentary */}
          {deal.foundersMessage && (
            <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#0A0F0F]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#D4AF37] font-semibold mb-2">Founder's Message</h4>
                    <blockquote className="text-[#F4E4BC] italic border-l-2 border-[#D4AF37] pl-4">
                      "{deal.foundersMessage}"
                    </blockquote>
                    <p className="text-[#F4E4BC]/60 text-sm mt-2">— {deal.founderName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strategic Fit */}
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center">
                <Target className="w-5 h-5 mr-2 text-[#D4AF37]" />
                Strategic Fit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.idealBuyerProfile && (
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Ideal Buyer Profile</h4>
                  <p className="text-[#F4E4BC]">{deal.idealBuyerProfile}</p>
                </div>
              )}
              
              {deal.rollupPotential && (
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Roll-up Potential</h4>
                  <p className="text-[#F4E4BC]">{deal.rollupPotential}</p>
                </div>
              )}

              {deal.marketTrends && (
                <div>
                  <h4 className="text-[#D4AF37] font-semibold mb-2">Market Trends Alignment</h4>
                  <p className="text-[#F4E4BC]">{deal.marketTrends}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deal Documents */}
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#D4AF37]" />
                  Deal Documents
                </div>
                {ndaSigned ? (
                  <Badge className="bg-[#22C55E] text-[#0A0F0F]">
                    <Unlock className="w-3 h-3 mr-1" />
                    Access Granted
                  </Badge>
                ) : (
                  <Badge className="bg-[#F28C38] text-[#0A0F0F]">
                    <Lock className="w-3 h-3 mr-1" />
                    NDA Required
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ndaSigned && deal.documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {deal.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0A0F0F]/50 rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-[#D4AF37]" />
                        <div>
                          <div className="text-[#FAFAFA] font-medium">{doc.name}</div>
                          <div className="text-[#F4E4BC]/60 text-sm">{doc.type} • {doc.size} • Updated {doc.lastUpdated}</div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-[#F4E4BC]/40 mx-auto mb-4" />
                  <p className="text-[#F4E4BC] mb-4">Financial documents and detailed information are protected</p>
                  <Button className="bg-[#F28C38] hover:bg-[#F28C38]/80 text-[#0A0F0F] font-bold">
                    Sign NDA to Unlock Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Metrics Summary */}
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#D4AF37]" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Annual Revenue</div>
                  <div className="text-[#FAFAFA] font-bold text-xl">{deal.revenue}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">EBITDA</div>
                  <div className="text-[#FAFAFA] font-bold text-xl">{deal.ebitda}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Net Profit Margin</div>
                  <div className="text-[#22C55E] font-bold text-xl">{deal.profitMargin}%</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Customer Count</div>
                  <div className="text-[#FAFAFA] font-bold text-xl">{deal.customerCount}</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">Recurring Revenue</div>
                  <div className="text-[#22C55E] font-bold text-xl">{deal.recurringRevenue}%</div>
                </div>
                <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="text-[#F4E4BC]/60 text-sm">CAC / LTV Ratio</div>
                  <div className="text-[#22C55E] font-bold text-xl">{deal.cacLtvRatio}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deal Progress */}
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#D4AF37]" />
                Deal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#F4E4BC] font-medium">{deal.stage}</span>
                  <span className="text-[#F4E4BC]/60 text-sm">{deal.progress}%</span>
                </div>
                <Progress value={deal.progress} className="h-3" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-[#F28C38]" />
                  <span className="text-[#F4E4BC] text-sm">Fit Score</span>
                </div>
                <Badge className="bg-[#22C55E] text-[#0A0F0F] font-bold">
                  {deal.fitScore}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/20">
            <CardContent className="p-6 space-y-3">
              <Button className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold">
                <Phone className="w-4 h-4 mr-2" />
                Schedule Buyer-Seller Call
              </Button>
              <Button className="w-full bg-[#F28C38] hover:bg-[#F28C38]/80 text-[#0A0F0F] font-bold">
                <Download className="w-4 h-4 mr-2" />
                Download Full Packet
              </Button>
              <Button className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]" variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Deal Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealDetailView;
