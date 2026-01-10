import React from 'react';
import { useParams } from 'react-router-dom';
import DealDiligenceTracker from '@/components/diligence/DealDiligenceTracker';

export const DealRequestsTab = () => {
  const { dealId } = useParams();

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  return <DealDiligenceTracker />;
};

export default DealRequestsTab;
