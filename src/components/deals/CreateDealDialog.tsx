import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface CreateDealDialogProps {
  onDealCreated: () => void;
}

const CreateDealDialog = ({ onDealCreated }: CreateDealDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    industry: '',
    revenue: '',
    ebitda: '',
    location: '',
    status: 'draft' as const
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('deals')
        .insert([{ ...formData, created_by: user.id }]);

      if (error) throw error;

      toast({
        title: "Deal created successfully",
        description: "The deal has been added to your portfolio.",
      });

      setFormData({
        title: '',
        description: '',
        company_name: '',
        industry: '',
        revenue: '',
        ebitda: '',
        location: '',
        status: 'draft'
      });
      
      setOpen(false);
      onDealCreated();
    } catch (error: any) {
      toast({
        title: "Error creating deal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Create Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0A0F0F] border-[#D4AF37]/30 text-[#FAFAFA] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">Create New Deal</DialogTitle>
          <DialogDescription className="text-[#F4E4BC]">
            Add a new investment opportunity to your portfolio.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#F4E4BC]">Deal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-[#F4E4BC]">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                required
                className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-[#F4E4BC]">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[#F4E4BC]">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue" className="text-[#F4E4BC]">Revenue</Label>
              <Input
                id="revenue"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
                placeholder="e.g., $8.5M"
                className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebitda" className="text-[#F4E4BC]">EBITDA</Label>
              <Input
                id="ebitda"
                value={formData.ebitda}
                onChange={(e) => handleInputChange('ebitda', e.target.value)}
                placeholder="e.g., $2.1M"
                className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-[#F4E4BC]">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-[#D4AF37]/30">
                <SelectItem value="draft" className="text-[#FAFAFA] focus:bg-[#D4AF37] focus:text-[#0A0F0F]">Draft</SelectItem>
                <SelectItem value="active" className="text-[#FAFAFA] focus:bg-[#D4AF37] focus:text-[#0A0F0F]">Active</SelectItem>
                <SelectItem value="archived" className="text-[#FAFAFA] focus:bg-[#D4AF37] focus:text-[#0A0F0F]">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#F4E4BC]">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA] focus:border-[#D4AF37] min-h-[80px]"
              placeholder="Describe the investment opportunity..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealDialog;