import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Eye,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { useUpdateDiligenceRequest } from '@/hooks/useDiligenceTracker';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface UrgentItem {
  id: string;
  deal_id: string;
  title: string;
  company_name: string;
  category_name: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
}

interface PriorityActionsPanelProps {
  items: UrgentItem[];
  totalCount: number;
}

const PriorityActionsPanel: React.FC<PriorityActionsPanelProps> = ({ items, totalCount }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateRequest = useUpdateDiligenceRequest();
  const [dismissedItems, setDismissedItems] = useState<string[]>([]);
  const [minimized, setMinimized] = useState(false);

  const formatDueDate = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (isToday(due)) return 'Due TODAY';
    if (diffDays === 1) return 'Due Yesterday';
    if (diffDays > 0) return `${diffDays} days overdue`;
    return `Due in ${Math.abs(diffDays)} days`;
  };

  const getUrgencyColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const daysUntil = differenceInDays(due, new Date());
    
    if (isPast(due) && !isToday(due)) return 'bg-red-100 text-red-800 border-red-200';
    if (isToday(due)) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const handleMarkComplete = async (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    updateRequest.mutate(
      { id: requestId, status: 'completed' },
      {
        onSuccess: () => {
          toast.success('Request marked as complete');
          queryClient.invalidateQueries({ queryKey: ['diligence-requests'] });
        },
        onError: () => {
          toast.error('Failed to update request');
        }
      }
    );
  };

  const handleSnooze = async (requestId: string, hours: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newDueDate = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    
    updateRequest.mutate(
      { id: requestId, due_date: newDueDate },
      {
        onSuccess: () => {
          toast.success(`Snoozed for ${hours} hours`);
          queryClient.invalidateQueries({ queryKey: ['diligence-requests'] });
        },
        onError: () => {
          toast.error('Failed to snooze request');
        }
      }
    );
  };

  const handleDismiss = (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedItems([...dismissedItems, requestId]);
  };

  const handleDismissAll = () => {
    setDismissedItems(items.map(i => i.id));
  };

  const visibleItems = items.filter(item => !dismissedItems.includes(item.id));

  // Don't render if no visible items
  if (visibleItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-red-100/60 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-700" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Priority Actions ({visibleItems.length})</h3>
            <p className="text-sm text-red-700">Items requiring immediate attention</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-700 hover:text-red-900 hover:bg-red-100"
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? (
              <>
                Expand
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Minimize
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-700 hover:text-red-900 hover:bg-red-100"
            onClick={handleDismissAll}
          >
            Dismiss All
          </Button>
        </div>
      </div>

      {/* Items List */}
      {!minimized && (
        <div className="divide-y divide-red-100">
          {visibleItems.slice(0, 5).map((item) => (
            <div 
              key={item.id}
              className="px-6 py-4 hover:bg-red-100/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Info */}
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => navigate(`/dashboard/diligence-tracker/${item.deal_id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{item.company_name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700 truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{item.category_name}</span>
                      {item.priority === 'high' && (
                        <Badge variant="outline" className="text-xs py-0 px-1 border-red-300 text-red-600 bg-red-50">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getUrgencyColor(item.due_date)} text-xs font-semibold px-3 py-1`}>
                    {formatDueDate(item.due_date)}
                  </Badge>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 px-3 text-xs border-gray-300 hover:bg-gray-50"
                    onClick={() => navigate(`/dashboard/diligence-tracker/${item.deal_id}`)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50"
                    onClick={(e) => handleMarkComplete(item.id, e)}
                    disabled={updateRequest.isPending}
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 px-3 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={(e) => handleSnooze(item.id, 24, e)}
                    disabled={updateRequest.isPending}
                  >
                    <Bell className="w-3.5 h-3.5 mr-1.5" />
                    Snooze 24h
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={(e) => handleDismiss(item.id, e)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* View All Link */}
          {totalCount > 5 && (
            <div className="px-6 py-3 bg-red-50">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-700 hover:text-red-900 hover:bg-red-100 w-full"
                onClick={() => navigate('/dashboard/diligence-tracker?filter=overdue')}
              >
                View All {totalCount} Items
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriorityActionsPanel;
