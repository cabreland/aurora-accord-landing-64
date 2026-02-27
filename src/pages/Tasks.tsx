import React, { useMemo, useState } from 'react';
import { Search, CalendarDays, RotateCcw, CheckCircle2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { AddTaskDialog } from '@/components/dashboard/widgets/AddTaskDialog';
import { TaskDetailDialog } from '@/components/dashboard/widgets/TaskDetailDialog';

type TaskPriority = Database['public']['Enums']['task_priority'];
type TaskStatus = Database['public']['Enums']['task_status'];

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  updated_at: string;
  created_at: string;
  deal: { id: string; company_name: string } | null;
}

const priorityClasses: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusLabels: Record<TaskStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const TasksPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-page', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as TaskRow[];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          due_date,
          updated_at,
          created_at,
          deal:deals(id, company_name)
        `)
        .eq('assigned_to', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as TaskRow[];
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
      queryClient.invalidateQueries({ queryKey: ['tasks-page'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-action-stats'] });
      toast.success(newStatus === 'completed' ? 'Task completed' : 'Task reopened');
    },
  });

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      const q = search.trim().toLowerCase();
      const text = `${task.title} ${task.description || ''} ${task.deal?.company_name || ''}`.toLowerCase();
      if (q && !text.includes(q)) return false;

      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      if (dateFilter !== 'all') {
        const ref = new Date(task.updated_at);
        if (dateFilter === 'today') {
          if (format(ref, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')) return false;
        }
        if (dateFilter === 'week') {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (ref < sevenDaysAgo) return false;
        }
        if (dateFilter === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          if (ref < monthAgo) return false;
        }
      }

      return true;
    });
  }, [tasks, search, statusFilter, dateFilter]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Map TaskRow to the shape TaskDetailDialog expects
  const mapToDetailTask = (task: TaskRow) => {
    let dueDateFormatted = 'No date';
    if (task.due_date) {
      const d = new Date(task.due_date);
      const now = new Date();
      if (task.status !== 'completed' && d < now) {
        dueDateFormatted = 'Overdue';
      } else {
        dueDateFormatted = format(d, 'MMM d, yyyy');
      }
    }
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dealId: task.deal?.id || null,
      dealName: task.deal?.company_name || null,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date,
      dueDateFormatted,
    };
  };

  const handleAddDialogChange = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      // Refetch tasks-page list after dialog closes (creation invalidates dashboard-tasks already)
      queryClient.invalidateQueries({ queryKey: ['tasks-page'] });
    }
  };

  return (
    <AdminDashboardLayout
      activeTab="dashboard"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Tasks' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Task Manager</h1>
            <p className="text-sm text-muted-foreground">
              Manage tasks, track progress, and search completed work.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{completedCount} completed</Badge>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Task
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task, deal, or notes"
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | TaskStatus)}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as 'all' | 'today' | 'week' | 'month')}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <CalendarDays className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              {tasks.length === 0
                ? 'No tasks yet. Click "New Task" to get started.'
                : 'No tasks match your filters.'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTasks.map((task) => {
                const completed = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {task.deal?.company_name ? `${task.deal.company_name} • ` : ''}
                        {completed
                          ? `Completed ${format(new Date(task.updated_at), 'MMM d, yyyy')}`
                          : `Updated ${format(new Date(task.updated_at), 'MMM d, yyyy')}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-xs ${priorityClasses[task.priority]}`}>
                        {task.priority}
                      </Badge>

                      <Badge variant="secondary" className="text-xs">
                        {statusLabels[task.status]}
                      </Badge>

                      {completed ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskMutation.mutate({ taskId: task.id, currentStatus: task.status });
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reopen
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskMutation.mutate({ taskId: task.id, currentStatus: task.status });
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddTaskDialog open={showAddDialog} onOpenChange={handleAddDialogChange} />

      <TaskDetailDialog
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ['tasks-page'] });
          }
        }}
        task={selectedTask ? mapToDetailTask(selectedTask) : null}
      />
    </AdminDashboardLayout>
  );
};

export default TasksPage;
