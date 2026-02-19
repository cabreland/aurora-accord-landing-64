import React, { useState } from 'react';
import { Users, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamGroups, useAddGroupToDeal } from '@/hooks/useTeamGroups';
import { cn } from '@/lib/utils';

interface AddGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({ open, onOpenChange, dealId }) => {
  const { data: groups = [], isLoading } = useTeamGroups();
  const addGroup = useAddGroupToDeal();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!selectedGroupId) return;
    addGroup.mutate(
      { groupId: selectedGroupId, dealId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedGroupId(null);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Team Group
          </DialogTitle>
          <DialogDescription>
            Select a group to bulk-add all its members to this deal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto py-1">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No team groups created yet. Create groups in Settings → Team Groups.
            </p>
          ) : (
            groups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selectedGroupId === group.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedGroupId || addGroup.isPending}
          >
            {addGroup.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
