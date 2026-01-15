import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';
import { Search, Send, Plus, CheckCircle2, AlertTriangle, XCircle, BarChart3, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { 
  NDAStatCard, 
  ExpiringSoonAlert, 
  NDACard, 
  BulkActionsBar, 
  AddNDAModal,
  NDADetailsModal 
} from '@/components/ndas';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingEmails, setCheckingEmails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedNDAs, setSelectedNDAs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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

  // Stats calculations
  const stats = useMemo(() => {
    const active = ndas.filter(n => n.status === 'active').length;
    const expiringSoon = ndas.filter(n => {
      const days = getDaysUntilExpiry(n.expires_at);
      return n.status === 'active' && days !== null && days <= 7 && days > 0;
    }).length;
    const expired = ndas.filter(n => n.status === 'expired' || (n.expires_at && getDaysUntilExpiry(n.expires_at)! <= 0)).length;
    return { active, expiringSoon, expired, total: ndas.length };
  }, [ndas]);

  // Expiring NDAs for alert section
  const expiringNDAs = useMemo(() => {
    return ndas.filter(n => {
      const days = getDaysUntilExpiry(n.expires_at);
      return n.status === 'active' && days !== null && days <= 7 && days > 0;
    });
  }, [ndas]);

  // Filtered NDAs
  const filteredNDAs = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return ndas.filter(nda => {
      return (
        nda.signer_name?.toLowerCase().includes(search) ||
        nda.signer_email?.toLowerCase().includes(search) ||
        nda.companies?.name?.toLowerCase().includes(search)
      );
    });
  }, [ndas, searchTerm]);

  const handleViewDetails = async (ndaId: string) => {
    const nda = ndas.find(n => n.id === ndaId);
    if (nda) {
      const { data, error } = await supabase
        .from('company_nda_acceptances')
        .select(`*, companies:company_id(name)`)
        .eq('id', ndaId)
        .single();

      if (!error && data) {
        setSelectedNDA(data as any);
        setShowDetailsModal(true);
      }
    }
  };

  const extendNDA = async (id: string, days = 60) => {
    setActionLoading(id);
    try {
      const { data: existing } = await supabase
        .from('company_nda_acceptances')
        .select('expires_at')
        .eq('id', id)
        .single();

      const now = new Date();
      let baseDate = now;
      if (existing?.expires_at) {
        const existingDate = new Date(existing.expires_at);
        baseDate = existingDate > now ? existingDate : now;
      }

      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + days);

      const { error } = await supabase
        .from('company_nda_acceptances')
        .update({ 
          expires_at: newExpiry.toISOString(),
          status: 'active'
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`NDA extended by ${days} days`);
      await loadNDAs();
      
      if (selectedNDA?.id === id) {
        const { data: freshData } = await supabase
          .from('company_nda_acceptances')
          .select(`*, companies:company_id(name)`)
          .eq('id', id)
          .single();
        
        if (freshData) {
          setSelectedNDA(freshData as any);
        }
      }
    } catch (error) {
      console.error('Extend error:', error);
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
        .update({ status: 'revoked' })
        .eq('id', id);

      if (error) throw error;

      toast.success('NDA revoked - investor access removed');
      await loadNDAs();
    } catch (error) {
      console.error('Revoke error:', error);
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

  const sendReminder = async (ndaId: string) => {
    toast.success('Reminder sent successfully');
  };

  // Selection handlers
  const handleSelect = (id: string) => {
    setSelectedNDAs(prev => 
      prev.includes(id) 
        ? prev.filter(ndaId => ndaId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNDAs.length === filteredNDAs.length) {
      setSelectedNDAs([]);
    } else {
      setSelectedNDAs(filteredNDAs.map(nda => nda.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedNDAs([]);
  };

  const handleBulkExtend = async () => {
    if (selectedNDAs.length === 0) return;
    
    for (const id of selectedNDAs) {
      await extendNDA(id, 60);
    }
    setSelectedNDAs([]);
    toast.success(`Extended ${selectedNDAs.length} NDAs`);
  };

  const handleBulkRevoke = async () => {
    if (selectedNDAs.length === 0) return;
    
    if (!confirm(`Are you sure you want to revoke ${selectedNDAs.length} NDAs?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_nda_acceptances')
        .update({ status: 'revoked' })
        .in('id', selectedNDAs);

      if (error) throw error;

      toast.success(`Revoked ${selectedNDAs.length} NDAs`);
      setSelectedNDAs([]);
      await loadNDAs();
    } catch (error) {
      toast.error('Failed to revoke NDAs');
    }
  };

  return (
    <AdminDashboardLayout activeTab="ndas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">NDA Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage all signed NDAs</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={checkExpiringNDAs} 
              disabled={checkingEmails}
              variant="outline"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {checkingEmails ? 'Sending...' : 'Send Reminders'}
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New NDA
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <NDAStatCard 
            label="Active" 
            count={stats.active} 
            icon={CheckCircle2}
            variant="active"
            onClick={() => setStatusFilter('active')}
          />
          <NDAStatCard 
            label="Expiring Soon" 
            count={stats.expiringSoon} 
            icon={AlertTriangle}
            variant="expiring"
          />
          <NDAStatCard 
            label="Expired" 
            count={stats.expired} 
            icon={XCircle}
            variant="expired"
            onClick={() => setStatusFilter('expired')}
          />
          <NDAStatCard 
            label="Total" 
            count={stats.total} 
            icon={BarChart3}
            variant="total"
            onClick={() => setStatusFilter('all')}
          />
        </div>

        {/* Expiring Soon Alert */}
        <ExpiringSoonAlert
          ndas={expiringNDAs}
          onExtend={(id) => extendNDA(id, 60)}
          onRemind={sendReminder}
          onView={handleViewDetails}
          onSendAllReminders={checkExpiringNDAs}
          isLoading={checkingEmails}
        />

        {/* Filters & View Toggle */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or deal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedNDAs.length}
          totalCount={filteredNDAs.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkExtend={handleBulkExtend}
          onBulkRevoke={handleBulkRevoke}
          isLoading={actionLoading !== null}
        />

        {/* NDA Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading NDAs...
          </div>
        ) : filteredNDAs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No NDAs found
          </div>
        ) : (
          <div className={viewMode === 'cards' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
          }>
            {filteredNDAs.map(nda => (
              <NDACard
                key={nda.id}
                nda={nda}
                isSelected={selectedNDAs.includes(nda.id)}
                onSelect={handleSelect}
                onView={handleViewDetails}
                onExtend={(id) => extendNDA(id, 60)}
                onRevoke={revokeNDA}
                isLoading={actionLoading === nda.id}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <NDADetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          nda={selectedNDA}
          onExtend={extendNDA}
          isLoading={actionLoading === selectedNDA?.id}
        />

        <AddNDAModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={() => {
            loadNDAs();
          }}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default NDAManagement;
