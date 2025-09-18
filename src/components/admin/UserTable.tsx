import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserEditDialog from './UserEditDialog';
import UserDeleteDialog from './UserDeleteDialog';
import { getRoleBadgeColor, getRoleDisplayName } from './userUtils';
import { UserProfile } from '@/hooks/useUserProfile';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserTableProps {
  users: UserProfile[];
  onRoleUpdate: (userId: string, newRole: UserRole) => void;
  onUserUpdated: () => void;
}

const UserTable = ({ users, onRoleUpdate, onUserUpdated }: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.first_name || user.last_name || 'No name set'
              }
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge className={getRoleBadgeColor(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <UserEditDialog user={user} onEditSuccess={onUserUpdated} />
                
                <Select
                  value={user.role}
                  onValueChange={(value) => onRoleUpdate(user.id, value as UserRole)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Manager</SelectItem>
                    <SelectItem value="viewer">Investor</SelectItem>
                  </SelectContent>
                </Select>
                
                <UserDeleteDialog user={user} onDeleteSuccess={onUserUpdated} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;