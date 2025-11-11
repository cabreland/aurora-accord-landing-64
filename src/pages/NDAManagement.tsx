import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { Eye, XCircle, Search, Calendar, Send, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/investor/DashboardLayout';

interface NDARecord {
  id: string;
  user_id: string;
  company_id: string;
  signature: string;
  signer_name: string;
  signer_email: string;
  signer_company: string | null;
  accepted_at: string;
  expires_at: string | null;
  status: string;
  nda_content: string;
  companies?: {
    name: string;
  };
}

const NDAManagement = () => {
  const [ndas, setNdas] = useState<NDARecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNDA, setSelectedNDA] = useState<NDARecord | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingEmails, setCheckingEmails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadNDAs();
  }, [statusFilter]);

  const loadNDAs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('company_nda_acceptances')
        .select(`
          *,
          companies:company_id(name)
        `)
        .order('accepted_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setNdas(data as any);
    } catch (error) {
      console.error('Error loading NDAs:', error);
      toast.error('Failed to load NDAs');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    return differenceInDays(new Date(expiresAt), new Date());
  };

  const handleViewDetails = async (nda: NDARecord) => {
    console.log('👁️ [NDA] Viewing details for:', nda.id);
    
    // Fetch fresh data from database
    const { data, error } = await supabase
      .from('company_nda_acceptances')
      .select(`
        *,
        companies:company_id(name)
      `)
      .eq('id', nda.id)
      .single();

    if (error) {
      console.error('❌ [NDA] Failed to load details:', error);
      toast.error('Failed to load NDA details');
      return;
    }

    console.log('✅ [NDA] Details loaded:', data);
    setSelectedNDA(data as any);
    setShowContent(true);
  };

  const extendNDA = async (id: string, days = 60) => {
    setActionLoading(id);
    try {
      // Calculate new expiry from NOW (not from old expiry)
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + days);

      console.log('📅 [NDA] Extending NDA:', {
        ndaId: id,
        days,
        newExpiry: newExpiry.toISOString()
      });

      const { data, error } = await supabase
        .from('company_nda_acceptances')
        .update({ 
          expires_at: newExpiry.toISOString(),
          status: 'active' // Reactivate if it was expired
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      console.log('✅ [NDA] Extended successfully:', data);
      toast.success(`NDA extended by ${days} days`);
      
      // Refresh the list to show new date
      await loadNDAs();
      
      // If viewing details, update the selected NDA
      if (selectedNDA?.id === id && data) {
        setSelectedNDA(data[0] as any);
      }
    } catch (error) {
      console.error('❌ [NDA] Extend error:', error);
      toast.error('Failed to extend NDA');
    } finally {
      setActionLoading(null);
    }
  };

  const revokeNDA = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this NDA? The investor will lose data room access.')) {
      return;
    }

    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('company_nda_acceptances')
        .update({ 
          status: 'revoked'
        })
        .eq('id', id);

      if (error) throw error;

      console.log('✅ [NDA] Revoked successfully');
      toast.success('NDA revoked - investor access removed');
      
      // Refresh the list immediately
      await loadNDAs();
      
    } catch (error) {
      console.error('❌ [NDA] Revoke error:', error);
      toast.error('Failed to revoke NDA');
    } finally {
      setActionLoading(null);
    }
  };

  const checkExpiringNDAs = async () => {
    setCheckingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-expiring-ndas');
      
      if (error) throw error;
      
      if (data) {
        toast.success(`Sent ${data.success_count || 0} expiration reminder emails`);
      }
    } catch (error: any) {
      console.error('Error checking expiring NDAs:', error);
      toast.error(error.message || 'Failed to send expiration reminders');
    } finally {
      setCheckingEmails(false);
    }
  };

  const filteredNDAs = ndas.filter(nda => {
    const search = searchTerm.toLowerCase();
    return (
      nda.signer_name?.toLowerCase().includes(search) ||
      nda.signer_email?.toLowerCase().includes(search) ||
      nda.companies?.name?.toLowerCase().includes(search)
    );
  });

  const activeCount = ndas.filter(n => n.status === 'active').length;
  const expiringSoonCount = ndas.filter(n => {
    const days = getDaysUntilExpiry(n.expires_at);
    return days !== null && days <= 7 && days > 0;
  }).length;
  const expiredCount = ndas.filter(n => n.status === 'expired').length;

  return (
    <DashboardLayout activeTab="ndas">
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">NDA Management</h1>
            <p className="text-muted-foreground">Track and manage all signed NDAs</p>
          </div>
          <Button 
            onClick={checkExpiringNDAs} 
            disabled={checkingEmails}
            variant="outline"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {checkingEmails ? 'Sending...' : 'Send Expiration Reminders'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{activeCount}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-500">
                {expiringSoonCount}
              </div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-500">
                {expiredCount}
              </div>
              <p className="text-sm text-muted-foreground">Expired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{ndas.length}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or deal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Signer</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading NDAs...
                  </TableCell>
                </TableRow>
              ) : filteredNDAs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No NDAs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredNDAs.map(nda => {
                  const daysUntilExpiry = getDaysUntilExpiry(nda.expires_at);
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                  
                  return (
                    <TableRow key={nda.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{nda.signer_name}</p>
                          <p className="text-sm text-muted-foreground">{nda.signer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{nda.companies?.name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(nda.accepted_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{nda.expires_at ? format(new Date(nda.expires_at), 'MMM d, yyyy') : 'No expiry'}</span>
                          {isExpiringSoon && (
                            <span className="text-xs text-orange-500">Expires in {daysUntilExpiry} days</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={nda.status === 'active' ? 'default' : 'destructive'}>
                          {nda.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* View Button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewDetails(nda)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View NDA Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Extend Button - Only show if active */}
                          {nda.status === 'active' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => extendNDA(nda.id, 60)}
                                    disabled={actionLoading === nda.id}
                                  >
                                    {actionLoading === nda.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Calendar className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Extend by 60 days</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {/* Revoke Button - Only show if active */}
                          {nda.status === 'active' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => revokeNDA(nda.id)}
                                    disabled={actionLoading === nda.id}
                                  >
                                    {actionLoading === nda.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Revoke NDA Access</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {/* Reactivate Button - Only show if expired/revoked */}
                          {(nda.status === 'expired' || nda.status === 'revoked') && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => extendNDA(nda.id, 60)}
                                    disabled={actionLoading === nda.id}
                                  >
                                    {actionLoading === nda.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reactivate (60 days)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* View NDA Content Dialog */}
        <Dialog open={showContent} onOpenChange={setShowContent}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>NDA Details</DialogTitle>
              <DialogDescription>
                Full NDA information and actions
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-6">
                {selectedNDA && (
                  <>
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Signer</p>
                        <p className="font-medium">{selectedNDA.signer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedNDA.signer_email}</p>
                      </div>
                      {selectedNDA.signer_company && (
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{selectedNDA.signer_company}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Signature</p>
                        <p className="font-serif text-lg">{selectedNDA.signature}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Signed At</p>
                        <p className="font-medium">
                          {format(new Date(selectedNDA.accepted_at), 'PPpp')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expires At</p>
                        <p className="font-medium">
                          {selectedNDA.expires_at ? format(new Date(selectedNDA.expires_at), 'PPpp') : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={selectedNDA.status === 'active' ? 'default' : 'destructive'}>
                          {selectedNDA.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions in Dialog */}
                    {selectedNDA.status === 'active' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => extendNDA(selectedNDA.id, 30)}
                          disabled={actionLoading === selectedNDA.id}
                        >
                          {actionLoading === selectedNDA.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Extend 30 days
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => extendNDA(selectedNDA.id, 60)}
                          disabled={actionLoading === selectedNDA.id}
                        >
                          {actionLoading === selectedNDA.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Extend 60 days
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => extendNDA(selectedNDA.id, 90)}
                          disabled={actionLoading === selectedNDA.id}
                        >
                          {actionLoading === selectedNDA.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Extend 90 days
                        </Button>
                      </div>
                    )}

                    {/* NDA Content */}
                    <div>
                      <h3 className="font-semibold mb-2">NDA Content</h3>
                      <div className="border rounded-lg p-4 bg-muted/50 max-h-[400px] overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {selectedNDA.nda_content || 'No content available'}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NDAManagement;
