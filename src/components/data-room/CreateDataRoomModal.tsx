import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateDataRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDataRoomModal({ open, onClose }: CreateDataRoomModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Fetch deals that don't have data rooms yet (deals without folders)
  const { data: availableDeals, isLoading: isLoadingDeals } = useQuery({
    queryKey: ['deals-without-data-rooms'],
    queryFn: async () => {
      // Get all deals
      const { data: allDeals, error: dealsError } = await supabase
        .from('deals')
        .select('id, company_name, industry')
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Get deals that have folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('data_room_folders')
        .select('deal_id');

      if (foldersError) throw foldersError;

      // Filter out deals that already have folders
      const dealsWithFolders = new Set(foldersData?.map(f => f.deal_id).filter(Boolean));
      return allDeals?.filter(deal => !dealsWithFolders.has(deal.id)) || [];
    },
    enabled: open
  });
  
  const handleCreate = async () => {
    if (!selectedDealId) {
      toast.error('Please select a deal');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create default folder structure for the deal
      const defaultFolders = [
        { name: 'Corporate & Legal', index_number: '1.0', is_required: true },
        { name: 'Financials', index_number: '2.0', is_required: true },
        { name: 'Operations', index_number: '3.0', is_required: true },
        { name: 'Client Base & Contracts', index_number: '4.0', is_required: true },
        { name: 'Services & Deliverables', index_number: '5.0', is_required: false },
        { name: 'Marketing & Sales', index_number: '6.0', is_required: false },
        { name: 'Revenue & Performance', index_number: '7.0', is_required: true },
        { name: 'Technology & Integrations', index_number: '8.0', is_required: false },
        { name: 'Debt Documents', index_number: '9.0', is_required: false },
        { name: 'Miscellaneous', index_number: '10.0', is_required: false },
        { name: 'LOI-Restricted Access', index_number: '11.0', is_required: false }
      ];

      const folderInserts = defaultFolders.map((folder, index) => ({
        deal_id: selectedDealId,
        name: folder.name,
        index_number: folder.index_number,
        sort_order: index + 1,
        is_required: folder.is_required
      }));

      const { error: folderError } = await supabase
        .from('data_room_folders')
        .insert(folderInserts);

      if (folderError) throw folderError;

      // Update deal status to draft if needed
      await supabase
        .from('deals')
        .update({ 
          status: 'draft',
          approval_status: 'draft'
        })
        .eq('id', selectedDealId);

      toast.success('Data room created successfully!');
      queryClient.invalidateQueries({ queryKey: ['data-room-deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-without-data-rooms'] });
      
      // Navigate to build page
      navigate(`/deals/${selectedDealId}?tab=data-room`);
      
      onClose();
      setSelectedDealId('');
    } catch (error) {
      console.error('Error creating data room:', error);
      toast.error('Failed to create data room');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Data Room</DialogTitle>
          <DialogDescription>
            Set up a sell-side data room for document organization and buyer access
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Select Deal
            </label>
            <Select 
              value={selectedDealId}
              onValueChange={setSelectedDealId}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDeals ? "Loading deals..." : "Choose from existing deals"} />
              </SelectTrigger>
              <SelectContent>
                {availableDeals?.map(deal => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.company_name} {deal.industry ? `- ${deal.industry}` : ''}
                  </SelectItem>
                ))}
                {availableDeals?.length === 0 && (
                  <SelectItem value="none" disabled>
                    No deals available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Button 
              variant="link" 
              className="mt-2 p-0 h-auto"
              onClick={() => {
                onClose();
                navigate('/deals/new');
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create New Deal First
            </Button>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-300">What happens next:</h4>
            <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>11 standard folders created from SOP 03-1</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Upload documents to each folder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Submit for admin approval when ready</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Goes live for buyers after approval</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!selectedDealId || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Data Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
