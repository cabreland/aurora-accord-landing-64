
import React from 'react';
import { InvestorDeal } from '@/hooks/useInvestorDeals';
import { InvestorDealCard } from './InvestorDealCard';

interface DealCardProps {
  deal: InvestorDeal;
  onClick: () => void;
  isSelected: boolean;
}

const DealCard = ({ deal, onClick, isSelected }: DealCardProps) => {
  return (
    <InvestorDealCard
      deal={{
        id: deal.id,
        companyName: deal.companyName,
        industry: deal.industry,
        description: deal.description,
        revenue: deal.revenue,
        ebitda: deal.ebitda,
        asking_price: deal.revenue, // Use revenue as fallback for asking price
      }}
      onClick={onClick}
      isSelected={isSelected}
    />
  );
};

export default DealCard;
