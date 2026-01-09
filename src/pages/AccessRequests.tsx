import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, User, Building2, Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';

interface AccessRequest {
  id: string;
  user_id: string;
  company_id: string;
  current_level: string;
  requested_level: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  user_email?: string;
  user_name?: string;
  company_name?: string;
}

const AccessRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'denied'>('pending');
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request?: AccessRequest; action?: 'approve' | 'deny' }>({ open: false });
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['access-requests', selectedStatus],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select(`
          *,
          profiles!access_requests_user_id_fkey(email, first_name, last_name),
          companies(name)
        `)
        .eq('status', selectedStatus)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((req: any) => ({
        id: req.id,
        user_id: req.user_id,
        company_id: req.company_id,
        current_level: req.current_level,
        requested_level: req.requested_level,
        reason: req.reason,
        status: req.status,
        requested_at: req.requested_at,
        reviewed_at: req.reviewed_at,
        reviewed_by: req.reviewed_by,
        review_notes: req.review_notes,
        user_email: req.profiles?.email,
        user_name: `${req.profiles?.first_name || ''} ${req.profiles?.last_name || ''}`.trim() || req.profiles?.email,
        company_name: req.companies?.name,
      }));
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, action, notes }: { requestId: string; action: 'approve' | 'deny'; notes?: string }) => {
      if (action === 'approve') {
        const request = requests.find(r => r.id === requestId);
        if (!request) throw new Error('Request not found');

        // Update the access request status
        const { error: updateError } = await supabase
          .from('access_requests')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            review_notes: notes,
          })
          .eq('id', requestId);

        if (updateError) throw updateError;

        // Grant the access level
        const { error: accessError } = await supabase
          .from('user_company_access')
          .upsert({
            user_id: request.user_id,
            company_id: request.company_id,
            access_level: request.requested_level,
            notes: notes || `Approved access request on ${new Date().toLocaleDateString()}`,
          }, {
            onConflict: 'user_id,company_id'
          });

        if (accessError) throw accessError;
      } else {
        const { error } = await supabase
          .from('access_requests')
          .update({
            status: 'denied',
            reviewed_at: new Date().toISOString(),
            review_notes: notes,
          })
          .eq('id', requestId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'approve' ? 'Request Approved' : 'Request Denied',
        description: variables.action === 'approve' 
          ? 'Access has been granted to the investor.'
          : 'The access request has been denied.',
      });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      setReviewDialog({ open: false });
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process request',
        variant: 'destructive',
      });
    },
  });

  const handleReview = (request: AccessRequest, action: 'approve' | 'deny') => {
    setReviewDialog({ open: true, request, action });
    setReviewNotes('');
  };

  const confirmReview = () => {
    if (reviewDialog.request && reviewDialog.action) {
      reviewMutation.mutate({
        requestId: reviewDialog.request.id,
        action: reviewDialog.action,
        notes: reviewNotes,
      });
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-gray-500';
      case 'teaser': return 'bg-blue-500';
      case 'cim': return 'bg-purple-500';
      case 'financials': return 'bg-orange-500';
      case 'full': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <AdminDashboardLayout activeTab="access-requests">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Requests</h1>
          <p className="text-muted-foreground">Review and manage investor data room access requests</p>
        </div>

        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="denied" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Denied
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4 mt-6">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading requests...</p>
                </CardContent>
              </Card>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No {selectedStatus} requests</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-lg">{request.user_name}</CardTitle>
                          <Badge variant="outline">{request.user_email}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{request.company_name}</span>
                        </div>
                      </div>
                      <Badge variant={selectedStatus === 'pending' ? 'default' : selectedStatus === 'approved' ? 'secondary' : 'destructive'}>
                        {getStatusIcon(selectedStatus)}
                        <span className="ml-1 capitalize">{selectedStatus}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Current:</span>
                        <Badge className={getLevelBadgeColor(request.current_level)}>
                          {request.current_level}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Requested:</span>
                        <Badge className={getLevelBadgeColor(request.requested_level)}>
                          {request.requested_level}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Reason:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {request.reason}
                      </p>
                    </div>

                    {request.review_notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Review Notes:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {request.review_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(request.requested_at).toLocaleDateString()} at{' '}
                        {new Date(request.requested_at).toLocaleTimeString()}
                        {request.reviewed_at && (
                          <> • Reviewed {new Date(request.reviewed_at).toLocaleDateString()}</>
                        )}
                      </p>

                      {selectedStatus === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(request, 'deny')}
                            disabled={reviewMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReview(request, 'approve')}
                            disabled={reviewMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approve' ? 'Approve' : 'Deny'} Access Request
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.action === 'approve'
                  ? `Grant ${reviewDialog.request?.user_name} ${reviewDialog.request?.requested_level} access to ${reviewDialog.request?.company_name}?`
                  : `Deny ${reviewDialog.request?.user_name}'s request for ${reviewDialog.request?.requested_level} access?`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Notes (Optional)
                </label>
                <Textarea
                  placeholder="Add any notes about this decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialog({ open: false })}>
                Cancel
              </Button>
              <Button
                onClick={confirmReview}
                disabled={reviewMutation.isPending}
                variant={reviewDialog.action === 'approve' ? 'default' : 'destructive'}
              >
                {reviewMutation.isPending ? 'Processing...' : reviewDialog.action === 'approve' ? 'Approve' : 'Deny'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
};

export default AccessRequests;
