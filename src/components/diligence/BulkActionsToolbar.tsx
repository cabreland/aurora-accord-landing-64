import React from 'react';
import { X, CheckCircle, UserPlus, Send, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onMarkResolved: () => void;
  onMarkInProgress: () => void;
  onAssignTo: (userId: string) => void;
  onSendToCustomer: () => void;
  onDelete: () => void;
  isProcessing?: boolean;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onMarkResolved,
  onMarkInProgress,
  onAssignTo,
  onSendToCustomer,
  onDelete,
  isProcessing = false,
}) => {
  const { data: teamMembers = [] } = useTeamMembers();
  
  if (selectedCount === 0) return null;
  
  const allSelected = selectedCount === totalCount;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <button
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Mark Resolved */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkResolved}
            disabled={isProcessing}
            className="text-white hover:bg-gray-800 hover:text-green-400 gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Mark Resolved</span>
          </Button>
          
          {/* Mark In Progress */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkInProgress}
            disabled={isProcessing}
            className="text-white hover:bg-gray-800 hover:text-amber-400 gap-2"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">In Progress</span>
          </Button>
          
          {/* Assign To */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                className="text-white hover:bg-gray-800 hover:text-blue-400 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Assign</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="bg-white border-gray-200 max-h-64 overflow-y-auto">
              {teamMembers.map((member) => (
                <DropdownMenuItem 
                  key={member.user_id}
                  onClick={() => onAssignTo(member.user_id)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.profile_picture_url || undefined} />
                    <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.first_name} {member.last_name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Send to Customer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSendToCustomer}
            disabled={isProcessing}
            className="text-white hover:bg-gray-800 hover:text-purple-400 gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
          
          {/* Divider */}
          <div className="w-px h-6 bg-gray-700 mx-1" />
          
          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isProcessing}
            className="text-white hover:bg-red-600 hover:text-white gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Close button */}
        <div className="pl-2 border-l border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
