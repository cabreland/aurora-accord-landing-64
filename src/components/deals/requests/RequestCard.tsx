import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, FileText, Calendar, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { DealRequest } from '@/hooks/useDealRequests';

interface RequestCardProps {
  request: DealRequest;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const statusColors: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Answered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

const categoryColors: Record<string, string> = {
  Financial: 'border-emerald-500',
  Legal: 'border-purple-500',
  Operations: 'border-blue-500',
  Technical: 'border-cyan-500',
  Customer: 'border-pink-500',
  HR: 'border-orange-500',
  Other: 'border-slate-500'
};

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const isOverdue = request.due_date && isPast(new Date(request.due_date)) && request.status !== 'Closed';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50 border-l-4',
        categoryColors[request.category] || 'border-l-slate-500',
        isOverdue && 'border-l-red-500'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{request.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {request.category}
              </Badge>
              <Badge className={cn('text-xs', priorityColors[request.priority])}>
                {request.priority}
              </Badge>
            </div>
          </div>
          <Badge className={cn('shrink-0', statusColors[request.status])}>
            {request.status}
          </Badge>
        </div>

        {/* Description excerpt */}
        {request.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {request.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="tabular-nums">{request.response_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="tabular-nums">{request.document_count || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {request.due_date && (
              <div className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-600'
              )}>
                {isOverdue && <AlertCircle className="h-4 w-4" />}
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(request.due_date), 'MMM d')}</span>
              </div>
            )}
            {request.assigned_to && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {request.assigned_to_profile?.first_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
