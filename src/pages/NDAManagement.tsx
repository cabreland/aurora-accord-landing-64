import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { Eye, XCircle, Search, Calendar, FileText, Mail, Send } from 'lucide-react';
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
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  deals?: {
    company_name: string;
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
          profiles:user_id(first_name, last_name, email),
          deals:company_id(company_name)
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

  const extendNDA = async (id: string, days = 60) => {
    const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const { error } = await supabase
      .from('company_nda_acceptances')
      .update({ expires_at: newExpiry.toISOString(), status: 'active' })
      .eq('id', id);

    if (!error) {
      toast.success(`Extended by ${days} days`);
      loadNDAs();
    } else {
      toast.error('Failed to extend NDA');
    }
  };

  const revokeNDA = async (id: string) => {
    const { error } = await supabase
      .from('company_nda_acceptances')
      .update({ status: 'revoked' })
      .eq('id', id);

    if (!error) {
      toast.success('NDA revoked');
      loadNDAs();
    } else {
      toast.error('Failed to revoke NDA');
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
      nda.deals?.company_name?.toLowerCase().includes(search)
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
                      <TableCell>{nda.deals?.company_name || 'N/A'}</TableCell>
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedNDA(nda);
                              setShowContent(true);
                            }}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {nda.status === 'active' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => extendNDA(nda.id)}
                                title="Extend by 60 days"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => revokeNDA(nda.id)}
                                title="Revoke NDA"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
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
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>NDA Details</DialogTitle>
            </DialogHeader>
            {selectedNDA && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded">
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
                    <p className="font-medium">{format(new Date(selectedNDA.accepted_at), 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expires At</p>
                    <p className="font-medium">
                      {selectedNDA.expires_at ? format(new Date(selectedNDA.expires_at), 'PPpp') : 'No expiry'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedNDA.status === 'active' ? 'default' : 'destructive'}>
                      {selectedNDA.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded p-4 max-h-[400px] overflow-y-auto">
                  <h4 className="font-semibold mb-2">NDA Content</h4>
                  <pre className="whitespace-pre-wrap text-sm">{selectedNDA.nda_content || 'No content available'}</pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NDAManagement;
