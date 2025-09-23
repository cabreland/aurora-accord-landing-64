
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestorDeal } from '@/hooks/useInvestorDeals';
import { createDealFromCompany, getDealByCompanyId } from '@/lib/data/deals';
import { toast } from 'sonner';
import { UnifiedDealCard, UnifiedDealData } from '@/components/common/UnifiedDealCard';

interface DealCardProps {
  deal: InvestorDeal;
  onClick: () => void;
  isSelected: boolean;
}

const DealCard = ({ deal, onClick, isSelected }: DealCardProps) => {
  const navigate = useNavigate();

  const handleEditDeal = async (dealId: string) => {
    try {
      // Check if there's already a deal for this company
      let existingDeal = await getDealByCompanyId(dealId);
      
      if (!existingDeal) {
        // Create a new deal linked to this company
        const newDealId = await createDealFromCompany(dealId, `${deal.companyName} - Investment Opportunity`);
        toast.success('Deal created successfully');
      }
      
      // Navigate to company wizard for editing (this gives full access to all fields)
      navigate(`/deals/${dealId}/edit`);
    } catch (error) {
      console.error('Error handling edit deal:', error);
      toast.error('Failed to edit deal');
    }
  };

  const handleViewDocuments = (dealId: string) => {
    // Handle documents viewing logic
    console.log('View documents for deal:', dealId);
  };

  // Convert InvestorDeal to UnifiedDealData
  const unifiedDeal: UnifiedDealData = {
    id: deal.id,
    title: deal.companyName,
    companyName: deal.companyName,
    industry: deal.industry,
    revenue: deal.revenue,
    ebitda: deal.ebitda,
    asking_price: '', // Not available in InvestorDeal interface
    location: deal.location,
    priority: deal.priority as any,
    stage: deal.stage,
    progress: deal.progress,
    fitScore: deal.fitScore,
    description: deal.description,
    lastUpdated: deal.lastUpdated,
    // Digital business metrics - these may not exist on InvestorDeal yet
    mrr: (deal as any).mrr,
    arr: (deal as any).arr,
    traffic: (deal as any).traffic,
    customers: (deal as any).customers,
    growth_rate: (deal as any).growthRate
  };

  return (
    <UnifiedDealCard
      deal={unifiedDeal}
      variant="investor"
      isSelected={isSelected}
      onClick={onClick}
      onEdit={handleEditDeal}
      onViewDocuments={handleViewDocuments}
      showActions={true}
    />
  );
};

export default DealCard;
