import React from 'react';
import { useParams } from 'react-router-dom';
import { TeamTab } from '@/components/deal-workspace/TeamTab';

export const DealTeamTab = () => {
  const { dealId } = useParams();

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  return <TeamTab dealId={dealId} />;
};

export default DealTeamTab;
