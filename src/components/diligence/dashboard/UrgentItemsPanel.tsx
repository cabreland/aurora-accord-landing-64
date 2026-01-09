import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

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

interface UrgentItemsPanelProps {
  items: UrgentItem[];
  totalCount: number;
}

const UrgentItemsPanel: React.FC<UrgentItemsPanelProps> = ({ items, totalCount }) => {
  const navigate = useNavigate();
  
  const getUrgencyLevel = (dueDate: string) => {
    const due = new Date(dueDate);
    const daysUntil = differenceInDays(due, new Date());
    
    if (isPast(due) && !isToday(due)) {
      return { level: 'overdue', color: 'text-red-600 bg-red-50', icon: AlertTriangle, days: Math.abs(daysUntil) };
    }
    if (isToday(due)) {
      return { level: 'today', color: 'text-amber-600 bg-amber-50', icon: AlertCircle, days: 0 };
    }
    if (daysUntil <= 2) {
      return { level: 'urgent', color: 'text-amber-600 bg-amber-50', icon: Clock, days: daysUntil };
    }
    return { level: 'upcoming', color: 'text-blue-600 bg-blue-50', icon: Clock, days: daysUntil };
  };

  // Return null when there are no urgent items - let parent component handle empty state
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50/50 rounded-xl border border-red-200 overflow-hidden">
      <div className="px-6 py-4 bg-red-100/50 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Urgent Attention Required</h3>
            <p className="text-sm text-red-700">{totalCount} items need your attention</p>
          </div>
        </div>
        {totalCount > items.length && (
          <Button variant="ghost" size="sm" className="text-red-700 hover:text-red-900 hover:bg-red-100">
            View All ({totalCount})
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
      
      <div className="divide-y divide-red-100">
        {items.slice(0, 5).map((item) => {
          const urgency = getUrgencyLevel(item.due_date);
          const Icon = urgency.icon;
          
          return (
            <div 
              key={item.id}
              className="px-6 py-3 hover:bg-red-100/30 cursor-pointer transition-colors flex items-center justify-between"
              onClick={() => navigate(`/dashboard/diligence-tracker/${item.deal_id}`)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-1.5 rounded-md ${urgency.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{item.company_name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 text-sm">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.category_name}</span>
                    {item.priority === 'high' && (
                      <Badge variant="outline" className="text-xs py-0 px-1 border-red-300 text-red-600 bg-red-50">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant={urgency.level === 'overdue' ? 'destructive' : 'outline'}
                  className={urgency.level === 'overdue' ? '' : 'border-amber-300 text-amber-700 bg-amber-50'}
                >
                  {urgency.level === 'overdue' && `${urgency.days} days overdue`}
                  {urgency.level === 'today' && 'Due Today'}
                  {urgency.level === 'urgent' && `Due in ${urgency.days} day${urgency.days > 1 ? 's' : ''}`}
                  {urgency.level === 'upcoming' && `Due ${format(new Date(item.due_date), 'MMM d')}`}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UrgentItemsPanel;
