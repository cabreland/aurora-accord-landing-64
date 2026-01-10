import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileUp, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ClipboardList, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  Shield, 
  FileCheck, 
  Target, 
  Briefcase,
  Activity,
  Download,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DealActivity, 
  getActivityDescription, 
  getActivityColor 
} from '@/hooks/useDealActivities';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: DealActivity;
  onNavigate?: (entityType: string, entityId: string | null) => void;
  isNew?: boolean;
}

const getIcon = (activityType: string): React.ElementType => {
  switch (activityType) {
    case 'document_uploaded':
      return FileUp;
    case 'document_downloaded':
      return Download;
    case 'document_deleted':
      return Trash2;
    case 'document_approved':
      return CheckCircle;
    case 'document_rejected':
      return XCircle;
    case 'request_created':
    case 'request_updated':
      return ClipboardList;
    case 'request_status_changed':
    case 'request_completed':
      return CheckSquare;
    case 'comment_added':
      return MessageSquare;
    case 'team_member_added':
    case 'team_member_removed':
      return Users;
    case 'permission_changed':
      return Shield;
    case 'nda_signed':
      return FileCheck;
    case 'deal_stage_changed':
      return Target;
    case 'deal_created':
    case 'deal_updated':
      return Briefcase;
    default:
      return Activity;
  }
};

const getCategoryColor = (activityType: string): string => {
  if (activityType.startsWith('document_')) return 'border-l-blue-500';
  if (activityType.startsWith('request_')) return 'border-l-purple-500';
  if (activityType.startsWith('team_')) return 'border-l-green-500';
  if (activityType.startsWith('deal_')) return 'border-l-amber-500';
  return 'border-l-muted-foreground';
};

const getUserInitials = (user: DealActivity['user']): string => {
  if (!user) return '?';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

const getUserName = (user: DealActivity['user']): string => {
  if (!user) return 'Unknown User';
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email?.split('@')[0] || 'Unknown';
};

const getAvatarColor = (userId: string | null): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  if (!userId) return colors[0];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  onNavigate,
  isNew = false 
}) => {
  const Icon = getIcon(activity.activity_type);
  const colorClass = getActivityColor(activity.activity_type);
  const categoryColor = getCategoryColor(activity.activity_type);
  const metadata = activity.metadata || {};

  const canNavigate = activity.entity_id && onNavigate;

  return (
    <div 
      className={cn(
        'group relative flex items-start gap-3 p-4 border-l-4 rounded-lg transition-all duration-300',
        'bg-card/50 hover:bg-card hover:shadow-sm',
        categoryColor,
        isNew && 'animate-in slide-in-from-top-2 fade-in duration-500 bg-primary/5'
      )}
    >
      {/* Timeline connector dot */}
      <div className="absolute -left-[7px] top-5 w-2.5 h-2.5 rounded-full bg-background border-2 border-current" 
        style={{ borderColor: categoryColor.replace('border-l-', 'var(--') + ')' }}
      />

      {/* User Avatar */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0 shadow-sm',
        getAvatarColor(activity.user_id)
      )}>
        {getUserInitials(activity.user)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">
              {getUserName(activity.user)}
            </span>
            <span className="text-muted-foreground">
              {getActivityDescription(activity)}
            </span>
          </div>
          
          {/* Icon with color */}
          <div className={cn('shrink-0 p-1.5 rounded-full bg-muted/50', colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        {/* Metadata preview */}
        <div className="flex items-center gap-2 flex-wrap">
          {metadata.file_name && (
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <FileUp className="h-3 w-3" />
              {String(metadata.file_name)}
            </Badge>
          )}
          {metadata.title && (
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <ClipboardList className="h-3 w-3" />
              {String(metadata.title)}
            </Badge>
          )}
          {metadata.member_name && (
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <Users className="h-3 w-3" />
              {String(metadata.member_name)}
            </Badge>
          )}
          {metadata.new_status && (
            <Badge variant="outline" className="text-xs font-normal">
              → {String(metadata.new_status)}
            </Badge>
          )}
          {metadata.file_size && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(Number(metadata.file_size))}
            </span>
          )}
        </div>
        
        {/* Footer: Timestamp & Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </span>
          
          {canNavigate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onNavigate(activity.entity_type, activity.entity_id)}
            >
              View <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
