import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useTeamMembers, getTeamMemberInitials, getTeamMemberName } from '@/hooks/useTeamMembers';
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

// Color palette for user avatars
const avatarColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
];

const getAvatarColor = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

const getRoleDisplayName = (role: string) => {
  const roleNames: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return roleNames[role] || role;
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
  const [assigneeId, setAssigneeId] = useState<string>('');
  
  const createRequest = useCreateDiligenceRequest();
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeamMembers();
  
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
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        assignee_id: assigneeId || null
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId(defaultCategoryId || '');
      setSubcategoryId(defaultSubcategoryId || '');
      setPriority('medium');
      setDueDate(undefined);
      setAssigneeId('');
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
          
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-gray-700">Assign To</Label>
            <Select value={assigneeId || 'unassigned'} onValueChange={(v) => setAssigneeId(v === 'unassigned' ? '' : v)}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Select team member...">
                  {assigneeId ? (
                    (() => {
                      const member = teamMembers.find(m => m.user_id === assigneeId);
                      if (!member) return 'Select team member...';
                      const color = getAvatarColor(member.user_id);
                      return (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            {member.profile_picture_url ? (
                              <AvatarImage src={member.profile_picture_url} alt={getTeamMemberName(member)} />
                            ) : null}
                            <AvatarFallback className={`${color.bg} ${color.text} text-[10px] font-medium`}>
                              {getTeamMemberInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getTeamMemberName(member)}</span>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span>Select team member...</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 max-h-60">
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span>Unassigned</span>
                  </div>
                </SelectItem>
                {teamMembers.map((member) => {
                  const color = getAvatarColor(member.user_id);
                  return (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          {member.profile_picture_url ? (
                            <AvatarImage src={member.profile_picture_url} alt={getTeamMemberName(member)} />
                          ) : null}
                          <AvatarFallback className={`${color.bg} ${color.text} text-[10px] font-medium`}>
                            {getTeamMemberInitials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-gray-900">{getTeamMemberName(member)}</span>
                          <span className="text-xs text-gray-500">{getRoleDisplayName(member.role)}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
