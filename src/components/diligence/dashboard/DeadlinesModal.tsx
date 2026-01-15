import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, AlertTriangle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DeadlineItem {
  id: string;
  deal_id: string;
  title: string;
  company_name: string;
  category_name: string;
  due_date: string;
  status: string;
}

interface DeadlinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DeadlineItem[];
}

const DeadlinesModal: React.FC<DeadlinesModalProps> = ({ open, onOpenChange, items }) => {
  const navigate = useNavigate();

  const getUrgencyInfo = (dueDate: string) => {
    const due = new Date(dueDate);
    const daysUntil = differenceInDays(due, new Date());
    
    if (isPast(due) && !isToday(due)) {
      return { 
        label: `${Math.abs(daysUntil)} days overdue`, 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      };
    }
    if (isToday(due)) {
      return { 
        label: 'Due Today', 
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: AlertCircle,
        iconColor: 'text-amber-600'
      };
    }
    if (isTomorrow(due)) {
      return { 
        label: 'Due Tomorrow', 
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
        iconColor: 'text-amber-500'
      };
    }
    if (daysUntil <= 7) {
      return { 
        label: `Due in ${daysUntil} days`, 
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Clock,
        iconColor: 'text-blue-500'
      };
    }
    return { 
      label: format(due, 'MMM d'), 
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: Calendar,
      iconColor: 'text-gray-400'
    };
  };

  // Group items by urgency
  const overdueItems = items.filter(i => isPast(new Date(i.due_date)) && !isToday(new Date(i.due_date)));
  const todayItems = items.filter(i => isToday(new Date(i.due_date)));
  const upcomingItems = items.filter(i => {
    const due = new Date(i.due_date);
    return !isPast(due) && !isToday(due);
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const handleItemClick = (dealId: string) => {
    navigate(`/dashboard/diligence-tracker/${dealId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Deadlines ({items.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Overdue Section */}
            {overdueItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Overdue ({overdueItems.length})
                </h4>
                <div className="space-y-2">
                  {overdueItems.map((item) => {
                    const urgency = getUrgencyInfo(item.due_date);
                    const Icon = urgency.icon;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/50 hover:bg-red-100/50 cursor-pointer transition-colors group"
                        onClick={() => handleItemClick(item.deal_id)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-md bg-red-100`}>
                            <Icon className={`w-4 h-4 ${urgency.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{item.company_name}</div>
                            <div className="text-sm text-gray-600 truncate">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.category_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Due Today Section */}
            {todayItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Due Today ({todayItems.length})
                </h4>
                <div className="space-y-2">
                  {todayItems.map((item) => {
                    const urgency = getUrgencyInfo(item.due_date);
                    const Icon = urgency.icon;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-amber-50/50 hover:bg-amber-100/50 cursor-pointer transition-colors group"
                        onClick={() => handleItemClick(item.deal_id)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-md bg-amber-100`}>
                            <Icon className={`w-4 h-4 ${urgency.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{item.company_name}</div>
                            <div className="text-sm text-gray-600 truncate">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.category_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Upcoming ({upcomingItems.length})
                </h4>
                <div className="space-y-2">
                  {upcomingItems.slice(0, 10).map((item) => {
                    const urgency = getUrgencyInfo(item.due_date);
                    const Icon = urgency.icon;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => handleItemClick(item.deal_id)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-md bg-gray-100`}>
                            <Icon className={`w-4 h-4 ${urgency.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{item.company_name}</div>
                            <div className="text-sm text-gray-600 truncate">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.category_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeadlinesModal;
