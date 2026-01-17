import React from 'react';
import { CheckSquare, Clock, ChevronRight, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, isPast, isToday, isTomorrow, addDays } from 'date-fns';

interface Task {
  id: string;
  title: string;
  dealName: string;
  dealId: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const formatDueDate = (date: string | null): string => {
  if (!date) return 'No due date';
  const dueDate = new Date(date);
  if (isPast(dueDate) && !isToday(dueDate)) return 'Overdue';
  if (isToday(dueDate)) return 'Due Today';
  if (isTomorrow(dueDate)) return 'Due Tomorrow';
  return `Due ${formatDistanceToNow(dueDate, { addSuffix: false })}`;
};

export const MyTasksWidget = () => {
  const navigate = useNavigate();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      // Fetch diligence requests that are open/in-progress from real deals
      const { data: requests, error } = await supabase
        .from('diligence_requests')
        .select(`
          id,
          title,
          priority,
          due_date,
          deal:deals!inner(
            id,
            company_name,
            is_test_data,
            status
          )
        `)
        .in('status', ['open', 'in_progress'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(6);

      if (error) throw error;

      // Filter to only real deals
      const realTasks = (requests || [])
        .filter((r: any) => r.deal && r.deal.is_test_data === false)
        .map((r: any): Task => ({
          id: r.id,
          title: r.title,
          dealName: r.deal.company_name,
          dealId: r.deal.id,
          priority: r.priority as 'high' | 'medium' | 'low',
          dueDate: formatDueDate(r.due_date),
        }));

      return realTasks;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-3.5">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            <p className="text-xs text-muted-foreground">{tasks.length} pending items</p>
          </div>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No pending tasks</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map((task) => (
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
      )}
    </div>
  );
};
