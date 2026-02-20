import React, { useState } from 'react';
import { CheckSquare, Clock, ChevronRight, Inbox, Plus, Check, Filter, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AddTaskDialog } from './AddTaskDialog';
import { TaskDetailDialog } from './TaskDetailDialog';
import { Database } from '@/integrations/supabase/types';

type TaskPriority = Database['public']['Enums']['task_priority'];
type TaskStatus = Database['public']['Enums']['task_status'];

interface Task {
  id: string;
  title: string;
  description: string | null;
  dealId: string | null;
  dealName: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  dueDateFormatted: string;
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

const formatDueDate = (date: string | null): string => {
  if (!date) return 'No due date';
  const dueDate = new Date(date);
  if (isPast(dueDate) && !isToday(dueDate)) return 'Overdue';
  if (isToday(dueDate)) return 'Due Today';
  if (isTomorrow(dueDate)) return 'Due Tomorrow';
  return `Due ${format(dueDate, 'MMM d')}`;
};

export const MyTasksWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCompleted, setShowCompleted] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['dashboard-tasks', showCompleted, showTodayOnly],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          deal_id,
          priority,
          status,
          due_date,
          deal:deals(id, company_name)
        `)
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (!showCompleted) {
        query = query.neq('status', 'completed');
      }

      if (showTodayOnly) {
        const today = format(new Date(), 'yyyy-MM-dd');
        query = query.eq('due_date', today);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;

      // Sort by priority then due date
      const sortedTasks = (data || [])
        .map((t: any): Task => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dealId: t.deal?.id || null,
          dealName: t.deal?.company_name || null,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          dueDateFormatted: formatDueDate(t.due_date),
        }))
        .sort((a, b) => {
          // First sort by priority
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          // Then by due date
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

      return sortedTasks;
    },
    enabled: !!user?.id,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, currentStatus }: { taskId: string; currentStatus: TaskStatus }) => {
      const newStatus: TaskStatus = currentStatus === 'completed' ? 'open' : 'completed';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-action-stats'] });
      toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const handleToggleTask = (e: React.MouseEvent, taskId: string, currentStatus: TaskStatus) => {
    e.stopPropagation();
    toggleTaskMutation.mutate({ taskId, currentStatus });
  };

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

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
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">My Tasks</h3>
              <p className="text-xs text-muted-foreground">
                {pendingCount} pending{showCompleted && completedCount > 0 ? `, ${completedCount} completed` : ''}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0A0F0F]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="px-5 py-2.5 border-b border-border flex items-center gap-2">
          <button
            onClick={() => setShowTodayOnly(!showTodayOnly)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              showTodayOnly
                ? "bg-[#D4AF37] text-[#0A0F0F]"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Calendar className="w-3 h-3" />
            Today
          </button>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              showCompleted
                ? "bg-[#D4AF37] text-[#0A0F0F]"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Filter className="w-3 h-3" />
            {showCompleted ? 'Showing completed' : 'Show completed'}
          </button>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {showTodayOnly ? 'No tasks due today' : 'No tasks yet'}
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="text-[#D4AF37] mt-2"
            >
              Create your first task
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="px-5 py-3.5 transition-colors group hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => handleToggleTask(e, task.id, task.status)}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        isCompleted
                          ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F0F]"
                          : "border-muted-foreground/40 hover:border-[#D4AF37]"
                      )}
                    >
                      {isCompleted && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm transition-colors truncate",
                        isCompleted 
                          ? "text-muted-foreground line-through" 
                          : "text-foreground group-hover:text-[#D4AF37]"
                      )}>
                        {task.title}
                      </p>
                      {task.dealName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/deals?deal=${task.dealId}`);
                          }}
                          className={cn(
                            "text-xs mt-0.5 truncate block hover:underline",
                            isCompleted ? "text-muted-foreground/60" : "text-primary/80 hover:text-primary"
                          )}
                        >
                          → {task.dealName}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isCompleted && (
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs font-medium", priorityConfig[task.priority].className)}
                        >
                          {priorityConfig[task.priority].label}
                        </Badge>
                      )}
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        isCompleted 
                          ? "text-muted-foreground/60" 
                          : task.dueDateFormatted === 'Overdue' 
                            ? "text-red-500" 
                            : "text-muted-foreground"
                      )}>
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDateFormatted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />

      <TaskDetailDialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={selectedTask}
      />
    </>
  );
};
