import React from 'react';
import { FileText, Folder, HardDrive, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';
import { formatDistanceToNow } from 'date-fns';

interface DataRoomStatsBarProps {
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const DataRoomStatsBar: React.FC<DataRoomStatsBarProps> = ({
  folders,
  documents,
}) => {
  const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const pendingCount = documents.filter(d => d.status === 'pending_review').length;
  
  const latestDoc = documents.length > 0 
    ? documents.reduce((latest, doc) => 
        new Date(doc.created_at) > new Date(latest.created_at) ? doc : latest
      )
    : null;

  const stats = [
    {
      icon: FileText,
      value: documents.length,
      label: 'Documents',
      color: 'text-muted-foreground',
    },
    {
      icon: Folder,
      value: folders.length,
      label: 'Folders',
      color: 'text-muted-foreground',
    },
    {
      icon: HardDrive,
      value: formatBytes(totalSize),
      label: 'Total Size',
      color: 'text-muted-foreground',
    },
    {
      icon: CheckCircle,
      value: approvedCount,
      label: 'Approved',
      color: 'text-success',
    },
    {
      icon: AlertCircle,
      value: pendingCount,
      label: 'Pending',
      color: 'text-warning',
    },
  ];

  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center gap-6 text-sm">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <div className="flex items-center gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="font-semibold text-foreground">{stat.value}</span>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
            {index < stats.length - 1 && (
              <div className="h-4 w-px bg-border" />
            )}
          </React.Fragment>
        ))}
        
        {latestDoc && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-semibold text-foreground">
                {formatDistanceToNow(new Date(latestDoc.created_at), { addSuffix: true })}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
