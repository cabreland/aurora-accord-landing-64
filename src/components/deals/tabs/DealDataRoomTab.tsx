import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';
import DataRoom from '@/pages/DataRoom';

export const DealDataRoomTab = () => {
  const { dealId } = useParams();

  if (!dealId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No deal selected</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For now, redirect to the existing data room with deal context
  // This can be enhanced later to be fully embedded
  return <Navigate to={`/data-room?dealId=${dealId}`} replace />;
};

export default DealDataRoomTab;
