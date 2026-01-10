import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  X, 
  Mail, 
  Clock, 
  User,
  Shield,
  Activity,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  DealTeamMember, 
  TeamMemberPermissions,
  useUpdateTeamMember,
  useRemoveTeamMember
} from '@/hooks/useDealTeam';
import { RoleBadge } from './RoleBadge';
import { PermissionEditor } from './PermissionEditor';
import { cn } from '@/lib/utils';

interface MemberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: DealTeamMember | null;
  dealId: string;
  isCurrentUser?: boolean;
}

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-violet-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

const getUserInitials = (user: DealTeamMember['user']): string => {
  if (!user) return '?';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || '?';
};

const getUserName = (user: DealTeamMember['user']): string => {
  if (!user) return 'Unknown User';
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email?.split('@')[0] || 'Unknown';
};

const permissionLabels: Record<keyof TeamMemberPermissions, string> = {
  can_view_all_folders: 'View All Folders',
  can_upload_documents: 'Upload Documents',
  can_delete_documents: 'Delete Documents',
  can_create_requests: 'Create Requests',
  can_edit_requests: 'Edit Requests',
  can_approve_documents: 'Approve Documents',
  restricted_folders: 'Folder Restrictions',
};

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  open,
  onOpenChange,
  member,
  dealId,
  isCurrentUser = false,
}) => {
  const updateMember = useUpdateTeamMember();
  const removeMember = useRemoveTeamMember();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<TeamMemberPermissions | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  if (!member) return null;

  const handleSavePermissions = () => {
    if (!editedPermissions) return;
    
    updateMember.mutate(
      { memberId: member.id, dealId, permissions: editedPermissions },
      {
        onSuccess: () => {
          setIsEditing(false);
          setEditedPermissions(null);
        },
      }
    );
  };

  const handleRemove = () => {
    removeMember.mutate(
      { memberId: member.id, dealId },
      {
        onSuccess: () => {
          setShowRemoveDialog(false);
          onOpenChange(false);
        },
      }
    );
  };

  const startEditing = () => {
    setEditedPermissions(member.permissions);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditedPermissions(null);
    setIsEditing(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-white shadow-lg',
                getAvatarColor(member.user_id)
              )}>
                {getUserInitials(member.user)}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl flex items-center gap-2">
                  {getUserName(member.user)}
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {member.user?.email}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <RoleBadge role={member.role} />
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="shrink-0 grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="flex-1 overflow-auto mt-4 space-y-4">
              {/* Member Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    Joined
                  </div>
                  <p className="font-medium">
                    {format(new Date(member.added_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(member.added_at), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Activity className="h-3.5 w-3.5" />
                    Last Active
                  </div>
                  <p className="font-medium">
                    {member.last_active 
                      ? format(new Date(member.last_active), 'MMM d, yyyy')
                      : 'Never'
                    }
                  </p>
                  {member.last_active && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>

              {/* Added By */}
              {member.added_by_user && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <User className="h-3.5 w-3.5" />
                    Added By
                  </div>
                  <p className="font-medium">
                    {member.added_by_user.first_name || member.added_by_user.last_name
                      ? `${member.added_by_user.first_name || ''} ${member.added_by_user.last_name || ''}`.trim()
                      : 'Unknown'
                    }
                  </p>
                </div>
              )}

              {/* Permission Summary */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Active Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(member.permissions)
                    .filter(([key, value]) => typeof value === 'boolean' && value)
                    .map(([key]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {permissionLabels[key as keyof TeamMemberPermissions] || key}
                      </Badge>
                    ))}
                  {Object.entries(member.permissions).filter(([_, v]) => v === true).length === 0 && (
                    <span className="text-sm text-muted-foreground">No special permissions</span>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="flex-1 overflow-auto mt-4">
              <ScrollArea className="h-full pr-4">
                {isEditing ? (
                  <PermissionEditor
                    permissions={editedPermissions!}
                    onChange={setEditedPermissions}
                    role={member.role}
                  />
                ) : (
                  <div className="space-y-3">
                    {Object.entries(member.permissions)
                      .filter(([key]) => key !== 'restricted_folders')
                      .map(([key, value]) => (
                        <div 
                          key={key}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border',
                            value ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 'bg-muted/50'
                          )}
                        >
                          <span className="text-sm font-medium">
                            {permissionLabels[key as keyof TeamMemberPermissions] || key}
                          </span>
                          <Badge variant={value ? 'default' : 'secondary'}>
                            {value ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="shrink-0 border-t pt-4 mt-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePermissions}
                  disabled={updateMember.isPending}
                >
                  {updateMember.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isCurrentUser}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={startEditing}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Permissions
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {getUserName(member.user)} from this deal?
              They will lose access to all deal materials and conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMember.isPending ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
