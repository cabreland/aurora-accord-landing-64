import React from 'react';
import { useParams } from 'react-router-dom';
import { DynamicDealDetailPage } from '@/components/deals/DynamicDealDetailPage';

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // For existing static deal (Green Energy Corp), preserve the original template
  if (id === 'green-energy-corp' || id === '2') {
    // Lazy load the original static page for reference
    const DealDetailPage = React.lazy(() => import('@/components/investor/DealDetailPage'));
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-[#0A0F0F] flex items-center justify-center"><div className="text-[#FAFAFA]">Loading...</div></div>}>
        <DealDetailPage dealId={id} />
      </React.Suspense>
    );
  }
  
  // For all new dynamic deals, use the new dynamic page
  return <DynamicDealDetailPage dealId={id} />;
};

export default DealDetail;