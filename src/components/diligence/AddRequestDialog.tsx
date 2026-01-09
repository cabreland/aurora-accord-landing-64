import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DiligenceCategory, 
  DiligenceSubcategory,
  useCreateDiligenceRequest 
} from '@/hooks/useDiligenceTracker';

interface AddRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
}

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
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(defaultSubcategoryId || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  
  const createRequest = useCreateDiligenceRequest();
  
  const filteredSubcategories = subcategories.filter(s => s.category_id === categoryId);
  
  const handleSubmit = async () => {
    if (!title.trim() || !categoryId) return;
    
    await createRequest.mutateAsync({
      deal_id: dealId,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status: 'open',
      due_date: dueDate || null
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategoryId(defaultCategoryId || '');
    setSubcategoryId(defaultSubcategoryId || '');
    setPriority('medium');
    setDueDate('');
    onOpenChange(false);
  };
  
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId(''); // Reset subcategory when category changes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1F2E] border-[#2A2F3A] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Diligence Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-gray-300">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Audited Financial Statements (Last 3 Years)"
              className="mt-1.5 bg-[#0A0F0F] border-[#2A2F3A] text-white"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what's required..."
              className="mt-1.5 bg-[#0A0F0F] border-[#2A2F3A] text-white resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Category *</Label>
              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-1.5 bg-[#0A0F0F] border-[#2A2F3A]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Subcategory</Label>
              <Select 
                value={subcategoryId} 
                onValueChange={setSubcategoryId}
                disabled={!categoryId}
              >
                <SelectTrigger className="mt-1.5 bg-[#0A0F0F] border-[#2A2F3A]">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
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
            <div>
              <Label className="text-gray-300">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="mt-1.5 bg-[#0A0F0F] border-[#2A2F3A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 bg-[#0A0F0F] border-[#2A2F3A] text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2A2F3A] text-gray-300 hover:bg-[#2A2F3A]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !categoryId || createRequest.isPending}
            className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRequestDialog;
