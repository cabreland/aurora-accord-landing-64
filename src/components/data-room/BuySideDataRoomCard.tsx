import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Users, FileCheck, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuySideDataRoomCardProps {
  dataRoom: {
    id: string;
    status: string;
    company_name: string;
    industry: string | null;
    location: string | null;
    asking_price: string | null;
    // Buyer metrics
    active_buyers_count?: number;
    ndas_signed_count?: number;
    lois_submitted_count?: number;
    document_count?: number;
  };
}

export function BuySideDataRoomCard({ dataRoom }: BuySideDataRoomCardProps) {
  const navigate = useNavigate();

  const handleManageAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${dataRoom.id}?tab=team`);
  };

  const handleViewDataRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${dataRoom.id}?tab=data-room`);
  };

  const handleViewActivity = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${dataRoom.id}?tab=activity`);
  };

  return (
    <div 
      onClick={() => navigate(`/deals/${dataRoom.id}?tab=data-room`)}
      className="border border-border rounded-lg p-5 bg-card hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span className="text-green-700 dark:text-green-400 font-bold text-sm">
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
        
        <Badge className={cn(
          "border font-semibold text-xs flex-shrink-0",
          dataRoom.status === 'active' 
            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
            : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
        )}>
          {dataRoom.status === 'active' ? '✅ Active' : '⚪ Closed'}
        </Badge>
      </div>
      
      {/* Deal Info */}
      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
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
      </div>
      
      {/* Buyer Activity Metrics */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-900 dark:text-blue-300">
              <Users className="w-4 h-4" />
              {dataRoom.active_buyers_count || 0}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">
              Buyers Viewing
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-900 dark:text-blue-300">
              <FileCheck className="w-4 h-4" />
              {dataRoom.ndas_signed_count || 0}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">
              NDAs Signed
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-900 dark:text-blue-300">
              <FileText className="w-4 h-4" />
              {dataRoom.lois_submitted_count || 0}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">
              LOI Submitted
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <Button 
          variant="default" 
          className="flex-1"
          onClick={handleManageAccess}
        >
          Manage Access
        </Button>
        <Button 
          variant="outline"
          onClick={handleViewDataRoom}
        >
          View
        </Button>
        <Button 
          variant="outline"
          onClick={handleViewActivity}
        >
          Activity
        </Button>
      </div>
    </div>
  );
}
