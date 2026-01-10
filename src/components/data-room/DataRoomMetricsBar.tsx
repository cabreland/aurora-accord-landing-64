import React from 'react';
import { FolderOpen, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  loading?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  loading,
  onClick,
  isActive,
}) => (
  <Card
    className={cn(
      'transition-all duration-200 cursor-pointer hover:shadow-md',
      isActive && 'ring-2 ring-primary',
      onClick && 'hover:border-primary/50'
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-lg', iconBgColor)}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          {loading ? (
            <>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground">{title}</div>
            </>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface DataRoomMetricsBarProps {
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  loading?: boolean;
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export const DataRoomMetricsBar: React.FC<DataRoomMetricsBarProps> = ({
  folders,
  documents,
  loading = false,
  activeFilter,
  onFilterChange,
}) => {
  // Calculate metrics
  const totalFolders = folders.length;
  const totalDocuments = documents.length;
  const approvedDocs = documents.filter((doc) => doc.status === 'approved').length;
  const pendingDocs = documents.filter((doc) => doc.status === 'pending_review').length;
  
  // Count required folders with 0 documents
  const missingRequired = folders.filter((folder) => {
    if (!folder.is_required) return false;
    const folderDocs = documents.filter((doc) => doc.folder_id === folder.id);
    return folderDocs.length === 0;
  }).length;

  const metrics = [
    {
      id: 'folders',
      title: 'Total Folders',
      value: totalFolders,
      icon: <FolderOpen className="h-5 w-5" />,
      iconBgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      id: 'documents',
      title: 'Documents',
      value: totalDocuments,
      icon: <FileText className="h-5 w-5" />,
      iconBgColor: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    {
      id: 'approved',
      title: 'Approved',
      value: approvedDocs,
      icon: <CheckCircle className="h-5 w-5" />,
      iconBgColor: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      id: 'pending',
      title: 'Pending Review',
      value: pendingDocs,
      icon: <Clock className="h-5 w-5" />,
      iconBgColor: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    {
      id: 'missing',
      title: 'Missing Required',
      value: missingRequired,
      icon: <AlertCircle className="h-5 w-5" />,
      iconBgColor: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          iconBgColor={metric.iconBgColor}
          iconColor={metric.iconColor}
          loading={loading}
          isActive={activeFilter === metric.id}
          onClick={() => onFilterChange?.(activeFilter === metric.id ? null : metric.id)}
        />
      ))}
    </div>
  );
};
