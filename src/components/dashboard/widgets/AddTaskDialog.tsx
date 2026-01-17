import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  deal_id: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  due_date: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTaskDialog = ({ open, onOpenChange }: AddTaskDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      deal_id: undefined,
      priority: 'medium',
      due_date: new Date(),
    },
  });

  // Fetch active deals for the dropdown
  const { data: deals = [] } = useQuery({
    queryKey: ['active-deals-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, company_name')
        .eq('is_test_data', false)
        .or('status.eq.active,current_stage.not.in.(archived,closed)')
        .order('company_name');

      if (error) throw error;
      return data || [];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase.from('tasks').insert({
        title: values.title,
        description: values.description || null,
        deal_id: values.deal_id || null,
        priority: values.priority,
        due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
        assigned_to: user.id,
        status: 'open',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-action-stats'] });
      toast.success('Task created successfully');
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    },
  });

  const onSubmit = (values: FormValues) => {
    createTaskMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Deal (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a deal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick a date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details about this task"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0A0F0F]"
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
