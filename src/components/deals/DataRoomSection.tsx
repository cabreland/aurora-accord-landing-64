import React from 'react';
import { DataRoomView } from '@/components/dataroom/DataRoomView';
import { AccessLevel } from '@/hooks/useCompanyNDA';

interface DataRoomSectionProps {
  dealId: string;
  companyId?: string;
  hasSignedNDA: boolean;
  accessLevel: AccessLevel;
  onOpenNDA: () => void;
  onRequestAccess: () => void;
}

export const DataRoomSection: React.FC<DataRoomSectionProps> = (props) => {
  return <DataRoomView {...props} />;
};
