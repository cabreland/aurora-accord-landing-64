import React from 'react';
import { useParams } from 'react-router-dom';
import { InvestorDealDetailPage } from '@/components/deals/InvestorDealDetailPage';

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use the new investor-focused deal detail page for all deals
  return <InvestorDealDetailPage dealId={id} />;
};

export default DealDetail;