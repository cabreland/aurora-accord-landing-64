import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MyDeal } from '@/hooks/useMyDeals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';

interface DealEditModalProps {
  deal: MyDeal;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const DealEditModal: React.FC<DealEditModalProps> = ({
  deal,
  open,
  onClose,
  onSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    description: '',
    industry: '',
    revenue: '',
    ebitda: '',
    location: '',
    status: 'draft' as 'draft' | 'active' | 'archived',
    priority: 'medium',
    asking_price: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (deal && open) {
      setFormData({
        title: deal.title || '',
        company_name: deal.company_name || '',
        description: (deal as any).description || '',
        industry: deal.industry || '',
        revenue: deal.revenue || '',
        ebitda: deal.ebitda || '',
        location: deal.location || '',
        status: deal.status || 'draft',
        priority: deal.priority || 'medium',
        asking_price: (deal as any).asking_price || ''
      });
    }
  }, [deal, open]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('deals')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error updating deal:', error);
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span>Edit Deal</span>
              <Badge className={getStatusColor(formData.status)}>
                {formData.status}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Column - Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Deal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter deal title"
                />
              </div>

              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Austin, TX"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief company description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Financial & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  placeholder="e.g., $5M, $500K"
                />
              </div>

              <div>
                <Label htmlFor="ebitda">EBITDA</Label>
                <Input
                  id="ebitda"
                  value={formData.ebitda}
                  onChange={(e) => handleInputChange('ebitda', e.target.value)}
                  placeholder="e.g., $1.2M, $200K"
                />
              </div>

              <div>
                <Label htmlFor="asking_price">Asking Price</Label>
                <Input
                  id="asking_price"
                  value={formData.asking_price}
                  onChange={(e) => handleInputChange('asking_price', e.target.value)}
                  placeholder="e.g., $10M, $2.5M"
                />
              </div>

              <div className="pt-4">
                <div className="text-sm text-muted-foreground mb-2">Status Information:</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>Draft:</strong> Not visible to investors</div>
                  <div><strong>Active:</strong> Available based on permissions</div>
                  <div><strong>Archived:</strong> Read-only historical access</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};