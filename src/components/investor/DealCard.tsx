
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  Star,
  FileText,
  Eye,
  Edit
} from 'lucide-react';
import { InvestorDeal } from '@/hooks/useInvestorDeals';
import { createDealFromCompany, getDealByCompanyId } from '@/lib/data/deals';
import { toast } from 'sonner';

interface DealCardProps {
  deal: InvestorDeal;
  onClick: () => void;
  isSelected: boolean;
}

const DealCard = ({ deal, onClick, isSelected }: DealCardProps) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-[#F28C38] text-[#0A0F0F]';
      case 'Medium': return 'bg-[#D4AF37] text-[#0A0F0F]';
      default: return 'bg-[#F4E4BC]/20 text-[#F4E4BC]';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'NDA Signed': return 'text-[#22C55E]';
      case 'Due Diligence': return 'text-[#F28C38]';
      case 'Discovery Call': return 'text-[#D4AF37]';
      default: return 'text-[#F4E4BC]';
    }
  };

  const handleEditDeal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Check if there's already a deal for this company
      let existingDeal = await getDealByCompanyId(deal.id);
      
      if (!existingDeal) {
        // Create a new deal linked to this company
        const dealId = await createDealFromCompany(deal.id, `${deal.companyName} - Investment Opportunity`);
        toast.success('Deal created successfully');
      }
      
      // Navigate to company wizard for editing (this gives full access to all fields)
      navigate(`/deals/${deal.id}/edit`);
    } catch (error) {
      console.error('Error handling edit deal:', error);
      toast.error('Failed to edit deal');
    }
  };

  return (
    <div 
      className={`bg-gradient-to-br from-[#2A2F3A] to-[#1A1F2E] rounded-2xl p-6 border transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-[#D4AF37]/20 hover:border-[#D4AF37]/50 group ${
        isSelected ? 'border-[#D4AF37] shadow-xl shadow-[#D4AF37]/30' : 'border-[#D4AF37]/20'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#FAFAFA] mb-1 group-hover:text-[#D4AF37] transition-colors">
            {deal.companyName}
          </h3>
          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
            {deal.industry}
          </Badge>
        </div>
        <Badge className={`${getPriorityColor(deal.priority)} font-bold`}>
          {deal.priority}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-[#F4E4BC]/80 text-sm mb-4 line-clamp-2">
        {deal.description}
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
          <div className="text-[#F4E4BC]/60 text-xs mb-1">Revenue</div>
          <div className="text-[#FAFAFA] font-bold text-lg">{deal.revenue}</div>
        </div>
        <div className="bg-[#0A0F0F]/50 rounded-lg p-3 border border-[#D4AF37]/10">
          <div className="text-[#F4E4BC]/60 text-xs mb-1">EBITDA</div>
          <div className="text-[#FAFAFA] font-bold text-lg">{deal.ebitda}</div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${getStageColor(deal.stage)}`}>
            {deal.stage}
          </span>
          <span className="text-[#F4E4BC]/60 text-xs">{deal.progress}% Complete</span>
        </div>
        <Progress 
          value={deal.progress} 
          className="h-2"
          style={{
            '--progress-background': '#D4AF37',
            '--progress-foreground': '#F28C38'
          } as React.CSSProperties}
        />
      </div>

      {/* Fit Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-[#F28C38]" />
          <span className="text-[#F4E4BC] text-sm">Fit Score</span>
        </div>
        <Badge className={`${deal.fitScore >= 90 ? 'bg-[#22C55E]' : deal.fitScore >= 80 ? 'bg-[#F28C38]' : 'bg-[#D4AF37]'} text-[#0A0F0F] font-bold`}>
          {deal.fitScore}%
        </Badge>
      </div>

      {/* Location & Last Updated */}
      <div className="flex items-center justify-between text-[#F4E4BC]/60 text-xs mb-4">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{deal.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{deal.lastUpdated}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button 
          className="flex-1 bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#D4AF37]/30"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        <Button 
          variant="outline"
          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F] transition-all duration-300"
          onClick={handleEditDeal}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline"
          className="border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38] hover:text-[#0A0F0F] transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            // Handle documents
          }}
        >
          <FileText className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DealCard;
