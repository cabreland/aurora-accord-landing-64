import React from 'react';
import { useParams } from 'react-router-dom';
import { ActivityFeedTab } from '@/components/deal-workspace/ActivityFeedTab';

export const DealActivityTab = () => {
  const { dealId } = useParams();

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  return <ActivityFeedTab dealId={dealId} />;
};

export default DealActivityTab;
