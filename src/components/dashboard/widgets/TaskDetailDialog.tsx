import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CalendarIcon, Trash2, Check, RotateCcw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

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

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export const TaskDetailDialog = ({ open, onOpenChange, task }: TaskDetailDialogProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dealId, setDealId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDealId(task.dealId);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  const { data: deals = [] } = useQuery({
    queryKey: ['active-deals-for-task'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, company_name')
        .eq('is_test_data', false)
        .in('status', ['active', 'draft'])
        .order('company_name');
      if (error) throw error;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!task) return;
      const { error } = await supabase
        .from('tasks')
        .update({
          title,
          description: description || null,
          priority,
          deal_id: dealId || null,
          due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        })
        .eq('id', task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      toast.success('Task updated');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (!task) return;
      const newStatus: TaskStatus = task.status === 'completed' ? 'open' : 'completed';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-action-stats'] });
      toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update task status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!task) return;
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-action-stats'] });
      toast.success('Task deleted');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  if (!task) return null;

  const isCompleted = task.status === 'completed';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <span>Dashboard</span>
              <span>›</span>
              <span>My Tasks</span>
              <span>›</span>
              <span className="text-foreground truncate max-w-[200px]">{task.title}</span>
            </div>
            <DialogTitle className="flex items-center gap-2">
              {isCompleted && <span className="text-muted-foreground line-through">{task.title}</span>}
              {!isCompleted && task.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v: TaskPriority) => setPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Related Deal (optional)</Label>
                  <Select value={dealId || 'none'} onValueChange={(v) => setDealId(v === 'none' ? null : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No deal selected" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No deal</SelectItem>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => updateMutation.mutate()}
                    disabled={!title.trim() || updateMutation.isPending}
                    className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0A0F0F]"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            ) : (
              <>
                {task.description && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className={cn(
                      "text-sm",
                      isCompleted && "text-muted-foreground"
                    )}>
                      {task.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Priority</Label>
                    <p className="text-sm capitalize">{task.priority}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Due Date</Label>
                    <p className={cn(
                      "text-sm",
                      task.dueDateFormatted === 'Overdue' && !isCompleted && "text-destructive"
                    )}>
                      {task.dueDateFormatted}
                    </p>
                  </div>
                </div>

                {task.dealName && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Related Deal</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{task.dealName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/deals?deal=${task.dealId}`);
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Go to Deal
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate()}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reopen
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Complete
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0A0F0F]"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this task and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
