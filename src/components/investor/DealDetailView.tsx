
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Star,
  Target,
  Briefcase
} from 'lucide-react';
import { InvestorDeal } from '@/hooks/useInvestorDeals';

interface DealDetailViewProps {
  deal: InvestorDeal;
  onBack: () => void;
}

const DealDetailView = ({ deal, onBack }: DealDetailViewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'NDA Signed': return 'text-green-600';
      case 'Due Diligence': return 'text-orange-600';
      case 'Discovery Call': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">{deal.companyName}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              {deal.industry}
            </Badge>
            <Badge className={getPriorityColor(deal.priority)}>
              {deal.priority} Priority
            </Badge>
            <div className="flex items-center gap-2 text-[#F4E4BC]/80">
              <MapPin className="w-4 h-4" />
              <span>{deal.location}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-[#F28C38]" />
            <span className="text-2xl font-bold text-[#FAFAFA]">{deal.fitScore}%</span>
          </div>
          <p className="text-sm text-[#F4E4BC]/60">Fit Score</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#FAFAFA]">Deal Progress</h3>
            <span className={`text-sm font-medium ${getStageColor(deal.stage)}`}>
              {deal.stage}
            </span>
          </div>
          <Progress value={deal.progress} className="h-3 mb-2" />
          <p className="text-sm text-[#F4E4BC]/60">{deal.progress}% Complete</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#F4E4BC]">{deal.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#F4E4BC]/60 mb-1">Founded</p>
                  <p className="text-[#FAFAFA] font-medium">{deal.foundedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-[#F4E4BC]/60 mb-1">Team Size</p>
                  <p className="text-[#FAFAFA] font-medium">{deal.teamSize}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#F4E4BC]/60 mb-1">Reason for Sale</p>
                <p className="text-[#FAFAFA]">{deal.reasonForSale}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FAFAFA] mb-1">{deal.revenue}</p>
                  <p className="text-sm text-[#F4E4BC]/60">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FAFAFA] mb-1">{deal.ebitda}</p>
                  <p className="text-sm text-[#F4E4BC]/60">EBITDA</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FAFAFA] mb-1">{deal.profitMargin}</p>
                  <p className="text-sm text-[#F4E4BC]/60">Profit Margin</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FAFAFA] mb-1">{deal.customerCount}</p>
                  <p className="text-sm text-[#F4E4BC]/60">Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deal.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#F4E4BC]">
                      <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deal.risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#F4E4BC]">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Founder's Message */}
          {deal.foundersMessage && (
            <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Message from {deal.founderName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#F4E4BC] italic">"{deal.foundersMessage}"</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]">
                Request Access
              </Button>
              <Button variant="outline" className="w-full border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10">
                Download Teaser
              </Button>
              <Button variant="outline" className="w-full border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10">
                Schedule Call
              </Button>
            </CardContent>
          </Card>

          {/* Deal Documents */}
          <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.documents && deal.documents.length > 0 ? (
                <div className="space-y-3">
                  {deal.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1A1F2E] rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                        <div>
                          <p className="text-sm font-medium text-[#FAFAFA]">{doc.name}</p>
                          <p className="text-xs text-[#F4E4BC]/60">{doc.size}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-[#D4AF37] hover:bg-[#D4AF37]/10">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#F4E4BC]/60 text-center py-4">No documents available</p>
              )}
            </CardContent>
          </Card>

          {/* Strategic Fit */}
          {deal.idealBuyerProfile && (
            <Card className="bg-[#2A2F3A] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Strategic Fit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#F4E4BC]/60 mb-1">Ideal Buyer Profile</p>
                  <p className="text-[#F4E4BC]">{deal.idealBuyerProfile}</p>
                </div>
                {deal.rollupPotential && (
                  <div>
                    <p className="text-sm text-[#F4E4BC]/60 mb-1">Roll-up Potential</p>
                    <p className="text-[#F4E4BC]">{deal.rollupPotential}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailView;
