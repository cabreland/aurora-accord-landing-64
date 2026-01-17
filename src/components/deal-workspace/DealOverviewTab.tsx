import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useWorkflowPhase } from '@/hooks/useWorkflowPhase';
import { useDataRoomHealth } from '@/hooks/useDataRoomHealth';
import { DealTab } from './DealWorkspaceTabs';
import { ProgressCard } from './overview/ProgressCard';
import { differenceInDays } from 'date-fns';

interface DealOverviewTabProps {
  deal: {
    id: string;
    title: string;
    company_name: string;
    industry?: string | null;
    location?: string | null;
    revenue?: string | null;
    ebitda?: string | null;
    asking_price?: string | null;
    team_size?: string | null;
    founded_year?: number | null;
    status: string;
    priority: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    growth_rate?: string | null;
    listing_received_at?: string | null;
    listing_approved_at?: string | null;
    data_room_complete_at?: string | null;
    first_nda_signed_at?: string | null;
    loi_submitted_at?: string | null;
    loi_accepted_at?: string | null;
    purchase_agreement_signed_at?: string | null;
    closed_at?: string | null;
  };
  onTabChange: (tab: DealTab) => void;
}

export const DealOverviewTab: React.FC<DealOverviewTabProps> = ({ deal, onTabChange }) => {
  const { folders, documents, loading: dataRoomLoading } = useDataRoom({ dealId: deal.id });
  const { isLoading: phaseLoading } = useWorkflowPhase(deal.id);
  const dataRoomHealth = useDataRoomHealth(deal.id);

  // Calculate folder stats
  const folderStats = useMemo(() => {
    const foldersWithCounts = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      is_required: folder.is_required || false,
      documentCount: documents.filter(d => d.folder_id === folder.id).length,
    }));

    const foldersWithDocs = foldersWithCounts.filter(f => f.documentCount > 0).length;
    const pendingReview = documents.filter(d => d.status === 'pending_review').length;

    return {
      folders: foldersWithCounts,
      foldersWithDocuments: foldersWithDocs,
      totalDocuments: documents.length,
      pendingReview,
    };
  }, [folders, documents]);

  // Calculate days active
  const daysActive = useMemo(() => {
    return differenceInDays(new Date(), new Date(deal.created_at));
  }, [deal.created_at]);

  const isLoading = dataRoomLoading || phaseLoading || dataRoomHealth.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Skeleton className="h-48 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ProgressCard
        healthPercentage={dataRoomHealth.healthPercentage}
        totalFolders={folders.length}
        foldersWithDocuments={folderStats.foldersWithDocuments}
        totalDocuments={folderStats.totalDocuments}
        pendingReview={folderStats.pendingReview}
        folders={folderStats.folders}
        dealTitle={deal.title}
        companyName={deal.company_name}
        daysActive={daysActive}
        onGoToDataRoom={() => onTabChange('data-room')}
        onUploadToFolder={() => onTabChange('data-room')}
      />
    </div>
  );
};
