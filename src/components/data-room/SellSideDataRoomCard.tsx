import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Clock, FileText, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SellSideDataRoomCardProps {
  dataRoom: {
    id: string;
    status: string;
    company_name: string;
    industry: string | null;
    location: string | null;
    asking_price: string | null;
    folder_count: number;
    folders_with_docs: number;
    document_count: number;
    completion_percent: number;
    updated_at?: string;
  };
  isAdmin?: boolean;
  isBroker?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  draft: {
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    icon: '📝'
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    icon: '🔍'
  },
  needs_revision: {
    label: 'Needs Revision',
    color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
    icon: '🟠'
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    icon: '🟢'
  }
};

export function SellSideDataRoomCard({ dataRoom, isAdmin = false, isBroker = true }: SellSideDataRoomCardProps) {
  const navigate = useNavigate();
  const currentStatus = statusConfig[dataRoom.status] || statusConfig.draft;

  const getCompletionColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleContinueBuilding = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${dataRoom.id}?tab=data-room`);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${dataRoom.id}?tab=data-room&preview=true`);
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${dataRoom.id}?tab=data-room&review=true`);
  };

  const handleGoLive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to deal workspace for go-live action
    navigate(`/deals/${dataRoom.id}?tab=data-room&action=go-live`);
  };

  return (
    <div 
      onClick={() => navigate(`/deals/${dataRoom.id}?tab=data-room`)}
      className="border border-border rounded-lg p-5 bg-card hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {dataRoom.company_name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {dataRoom.company_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {dataRoom.industry || 'No industry'}
            </p>
          </div>
        </div>
        
        <Badge className={cn("border font-semibold text-xs flex-shrink-0", currentStatus.color)}>
          {currentStatus.icon} {currentStatus.label}
        </Badge>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {dataRoom.folders_with_docs}/{dataRoom.folder_count} folders complete
          </span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {dataRoom.completion_percent}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className={cn("h-2 rounded-full transition-all", getCompletionColor(dataRoom.completion_percent))}
            style={{ width: `${dataRoom.completion_percent}%` }}
          />
        </div>
      </div>
      
      {/* Metadata */}
      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{dataRoom.document_count} docs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Folder className="w-4 h-4" />
            <span>{dataRoom.folder_count} folders</span>
          </div>
        </div>
        {dataRoom.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{dataRoom.location}</span>
          </div>
        )}
        {dataRoom.asking_price && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium text-foreground">{dataRoom.asking_price}</span>
          </div>
        )}
        {dataRoom.updated_at && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Updated {formatDistanceToNow(new Date(dataRoom.updated_at), { addSuffix: true })}</span>
          </div>
        )}
      </div>
      
      {/* Action Buttons - Context-Aware */}
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        {dataRoom.status === 'draft' && isBroker && (
          <>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={handleContinueBuilding}
            >
              Continue Building
            </Button>
            <Button 
              variant="outline"
              onClick={handlePreview}
            >
              Preview
            </Button>
          </>
        )}
        
        {dataRoom.status === 'under_review' && isAdmin && (
          <>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={handleReview}
            >
              Review & Approve
            </Button>
            <Button 
              variant="outline"
              onClick={handlePreview}
            >
              Preview
            </Button>
          </>
        )}
        
        {dataRoom.status === 'needs_revision' && isBroker && (
          <>
            <Button 
              variant="default" 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={handleContinueBuilding}
            >
              Fix & Resubmit
            </Button>
            <Button 
              variant="outline"
              onClick={handlePreview}
            >
              View Feedback
            </Button>
          </>
        )}
        
        {dataRoom.status === 'approved' && isAdmin && (
          <>
            <Button 
              variant="default" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleGoLive}
            >
              Go Live
            </Button>
            <Button 
              variant="outline"
              onClick={handlePreview}
            >
              Preview
            </Button>
          </>
        )}

        {/* Default for other states */}
        {!['draft', 'under_review', 'needs_revision', 'approved'].includes(dataRoom.status) && (
          <Button 
            variant="default" 
            className="flex-1"
            onClick={handleContinueBuilding}
          >
            Open Data Room
          </Button>
        )}
      </div>
    </div>
  );
}
