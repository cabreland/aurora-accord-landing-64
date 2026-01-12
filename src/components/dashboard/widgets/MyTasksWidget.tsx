import React from 'react';
import { CheckSquare, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  dealName: string;
  dealId: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

const mockTasks: Task[] = [
  { id: '1', title: 'Review financials', dealName: 'TechStartup Inc', dealId: 'deal-1', priority: 'high', dueDate: 'Due Today' },
  { id: '2', title: 'Send CIM to buyer', dealName: 'Green Energy Co', dealId: 'deal-2', priority: 'high', dueDate: 'Due Today' },
  { id: '3', title: 'Complete legal review', dealName: 'HealthTech Solutions', dealId: 'deal-3', priority: 'medium', dueDate: 'Due Tomorrow' },
  { id: '4', title: 'Prepare management presentation', dealName: 'DataFlow Systems', dealId: 'deal-4', priority: 'medium', dueDate: 'Due in 2 days' },
  { id: '5', title: 'Update deal memo', dealName: 'CloudServe Pro', dealId: 'deal-5', priority: 'low', dueDate: 'Due in 3 days' },
  { id: '6', title: 'Buyer call follow-up', dealName: 'SecureNet Inc', dealId: 'deal-6', priority: 'low', dueDate: 'Due in 5 days' },
];

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export const MyTasksWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">My Tasks</h3>
            <p className="text-xs text-muted-foreground">{mockTasks.length} pending items</p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-border">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => navigate(`/deals/${task.dealId}?tab=diligence`)}
            className="px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground group-hover:text-[#D4AF37] transition-colors truncate">
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {task.dealName}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-medium", priorityConfig[task.priority].className)}
                >
                  {priorityConfig[task.priority].label}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{task.dueDate}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
