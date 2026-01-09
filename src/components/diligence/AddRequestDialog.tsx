import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  useCreateDiligenceRequest, 
  DiligenceCategory, 
  DiligenceSubcategory 
} from '@/hooks/useDiligenceTracker';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
}

const priorityConfig = {
  high: { label: 'High', dot: 'bg-red-500' },
  medium: { label: 'Medium', dot: 'bg-amber-500' },
  low: { label: 'Low', dot: 'bg-gray-400' },
};

const AddRequestDialog: React.FC<AddRequestDialogProps> = ({
  open,
  onOpenChange,
  dealId,
  categories,
  subcategories,
  defaultCategoryId,
  defaultSubcategoryId
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId || '');
  const [subcategoryId, setSubcategoryId] = useState<string>(defaultSubcategoryId || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
  const createRequest = useCreateDiligenceRequest();
  
  useEffect(() => {
    if (open) {
      setCategoryId(defaultCategoryId || '');
      setSubcategoryId(defaultSubcategoryId || '');
    }
  }, [open, defaultCategoryId, defaultSubcategoryId]);
  
  const handleSubmit = async () => {
    if (!title.trim() || !categoryId) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      await createRequest.mutateAsync({
        deal_id: dealId,
        category_id: categoryId,
        subcategory_id: subcategoryId || null,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId(defaultCategoryId || '');
      setSubcategoryId(defaultSubcategoryId || '');
      setPriority('medium');
      setDueDate(undefined);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId('');
  };
  
  const filteredSubcategories = subcategories.filter(s => s.category_id === categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Add New Request</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a new diligence request for this deal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Audited Financial Statements"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              placeholder="Provide additional details about this request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700">Subcategory</Label>
              <Select 
                value={subcategoryId} 
                onValueChange={setSubcategoryId}
                disabled={!categoryId || filteredSubcategories.length === 0}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {filteredSubcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="bg-white border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priorityConfig[priority].dot}`} />
                    <span>{priorityConfig[priority].label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-white border-gray-300",
                      !dueDate && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || !categoryId || createRequest.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createRequest.isPending ? 'Creating...' : 'Create Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRequestDialog;
