import { RefreshCw, Download, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkExtend: () => void;
  onBulkRevoke: () => void;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkExtend,
  onBulkRevoke,
  isLoading
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={selectedCount === totalCount}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selected
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={onBulkExtend}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Extend Selected
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={onBulkRevoke}
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Revoke Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
