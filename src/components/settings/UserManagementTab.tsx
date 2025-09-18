import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users } from 'lucide-react';
import UserInviteDialog from '@/components/admin/UserInviteDialog';
import UserTable from '@/components/admin/UserTable';
import UserForceRemoveDialog from '@/components/admin/UserForceRemoveDialog';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

const UserManagementTab: React.FC = () => {
  const { isAdmin, loading: profileLoading, profile } = useUserProfile();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const ready = !profileLoading && (profile?.role === 'admin' || profile?.role === 'super_admin');

  useEffect(() => {
    if (!ready) return;
    
    fetchUsers();
  }, [ready]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
        setUsers([]);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update user role',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to manage users.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage user roles and permissions
              </p>
            </div>
            <div className="flex gap-2">
              <UserForceRemoveDialog onRemoveSuccess={fetchUsers} />
              <UserInviteDialog onInviteSuccess={fetchUsers} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users} 
            onRoleUpdate={handleUpdateRole} 
            onUserUpdated={fetchUsers} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementTab;