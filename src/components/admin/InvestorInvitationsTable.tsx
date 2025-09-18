import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Send, Ban, Clock, CheckCircle, Users, Package, Globe, Building } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvestorInvitation {
  id: string;
  deal_id: string;
  email: string;
  invitation_code: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  investor_name?: string;
  company_name?: string;
  notes?: string;
  access_type: 'single' | 'multiple' | 'portfolio' | 'custom';
  deal_ids?: any; // JSON data from Supabase
  portfolio_access: boolean;
  master_nda_signed: boolean;
  deals?: {
    title: string;
    company_name: string;
  };
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

interface InvestorInvitationsTableProps {
  onRefresh?: () => void;
}

const InvestorInvitationsTable: React.FC<InvestorInvitationsTableProps> = ({ onRefresh }) => {
  const [invitations, setInvitations] = useState<InvestorInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean;
    invitation: InvestorInvitation | null;
  }>({ open: false, invitation: null });
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('investor_invitations')
        .select(`
          *,
          deals:deal_id (
            title,
            company_name
          ),
          profiles:invited_by (
            first_name,
            last_name,
            email
          )
        `)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'accepted') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
    } else if (status === 'revoked') {
      return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Revoked</Badge>;
    } else if (isExpired || status === 'expired') {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
    } else {
      return <Badge variant="outline"><Send className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getAccessTypeBadge = (accessType: string, portfolioAccess: boolean) => {
    switch (accessType) {
      case 'single':
        return <Badge variant="outline"><Users className="w-3 h-3 mr-1" />Single Deal</Badge>;
      case 'multiple':
        return <Badge variant="outline"><Package className="w-3 h-3 mr-1" />Multiple Deals</Badge>;
      case 'portfolio':
        return <Badge variant="default"><Globe className="w-3 h-3 mr-1" />Portfolio</Badge>;
      case 'custom':
        return <Badge variant="outline"><Building className="w-3 h-3 mr-1" />Custom</Badge>;
      default:
        return <Badge variant="outline">Single Deal</Badge>;
    }
  };

  const getDealDisplay = (invitation: InvestorInvitation) => {
    if (invitation.access_type === 'portfolio') {
      return <div className="text-sm text-muted-foreground">All deals (Portfolio)</div>;
    }
    
    if (invitation.access_type === 'multiple' || invitation.access_type === 'custom') {
      try {
        const dealIds = Array.isArray(invitation.deal_ids) 
          ? invitation.deal_ids 
          : JSON.parse(invitation.deal_ids || '[]');
        return (
          <div className="text-sm">
            <div className="font-medium">{dealIds.length} deals selected</div>
            <div className="text-muted-foreground">Multiple access</div>
          </div>
        );
      } catch {
        return <div className="text-sm text-muted-foreground">Invalid deal data</div>;
      }
    }

    // Single deal
    return (
      <div>
        <div className="font-medium">{invitation.deals?.title}</div>
        <div className="text-sm text-muted-foreground">{invitation.deals?.company_name}</div>
      </div>
    );
  };

  const handleResendInvitation = async (invitation: InvestorInvitation) => {
    setActionLoading(invitation.id);
    try {
      const dealIds = Array.isArray(invitation.deal_ids) 
        ? invitation.deal_ids 
        : (invitation.deal_ids ? JSON.parse(invitation.deal_ids) : []);
      
      const { error } = await supabase.functions.invoke('send-investor-invitation', {
        body: {
          invitationId: invitation.id,
          email: invitation.email,
          investorName: invitation.investor_name,
          invitationCode: invitation.invitation_code,
          accessType: invitation.access_type,
          dealId: invitation.deal_id,
          dealIds: dealIds,
          portfolioAccess: invitation.portfolio_access,
          masterNda: invitation.master_nda_signed,
          expiresAt: invitation.expires_at,
          isResend: true,
        },
      });

      if (error) throw error;

      toast({
        title: 'Invitation Resent',
        description: `Invitation resent to ${invitation.email}`,
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvitation = async (invitation: InvestorInvitation) => {
    setActionLoading(invitation.id);
    try {
      const { error } = await supabase
        .from('investor_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: 'Invitation Revoked',
        description: `Invitation for ${invitation.email} has been revoked`,
      });

      fetchInvitations();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error revoking invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke invitation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setRevokeDialog({ open: false, invitation: null });
    }
  };

  const handleExtendInvitation = async (invitation: InvestorInvitation) => {
    setActionLoading(invitation.id);
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30); // Extend by 30 days

      const { error } = await supabase
        .from('investor_invitations')
        .update({ 
          expires_at: newExpiryDate.toISOString(),
          status: 'pending'
        })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: 'Invitation Extended',
        description: `Invitation extended until ${format(newExpiryDate, 'PP')}`,
      });

      fetchInvitations();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error extending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend invitation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading invitations...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead>Access Type</TableHead>
              <TableHead>Deal(s)</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No invitations found
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.investor_name}</div>
                      {invitation.company_name && (
                        <div className="text-sm text-muted-foreground">{invitation.company_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getAccessTypeBadge(invitation.access_type, invitation.portfolio_access)}</TableCell>
                  <TableCell>{getDealDisplay(invitation)}</TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status, invitation.expires_at)}</TableCell>
                  <TableCell>{format(new Date(invitation.invited_at), 'PP')}</TableCell>
                  <TableCell>
                    <div className={new Date(invitation.expires_at) < new Date() ? 'text-red-600' : ''}>
                      {format(new Date(invitation.expires_at), 'PP')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invitation.profiles?.first_name && invitation.profiles?.last_name
                      ? `${invitation.profiles.first_name} ${invitation.profiles.last_name}`
                      : invitation.profiles?.email}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          disabled={actionLoading === invitation.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invitation.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleResendInvitation(invitation)}
                              disabled={actionLoading === invitation.id}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExtendInvitation(invitation)}
                              disabled={actionLoading === invitation.id}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Extend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRevokeDialog({ open: true, invitation })}
                              disabled={actionLoading === invitation.id}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Revoke
                            </DropdownMenuItem>
                          </>
                        )}
                        {invitation.status === 'expired' && (
                          <DropdownMenuItem
                            onClick={() => handleExtendInvitation(invitation)}
                            disabled={actionLoading === invitation.id}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Extend & Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ open, invitation: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation for {revokeDialog.invitation?.email}? 
              This action cannot be undone and they will no longer be able to use their invitation link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeDialog.invitation && handleRevokeInvitation(revokeDialog.invitation)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvestorInvitationsTable;