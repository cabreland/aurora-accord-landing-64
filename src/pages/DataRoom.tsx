import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus,
  LayoutGrid,
  List
} from 'lucide-react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { StatPill } from '@/components/data-room/StatPill';
import { SellSideDataRoomCard } from '@/components/data-room/SellSideDataRoomCard';
import { BuySideDataRoomCard } from '@/components/data-room/BuySideDataRoomCard';
import { DataRoomEmptySection } from '@/components/data-room/DataRoomEmptySection';
import { CreateDataRoomModal } from '@/components/data-room/CreateDataRoomModal';

interface DealWithMetrics {
  id: string;
  title: string;
  company_name: string;
  industry: string | null;
  status: string;
  location: string | null;
  asking_price: string | null;
  document_count: number;
  folder_count: number;
  folders_with_docs: number;
  created_by: string;
  completion_percent: number;
  updated_at?: string;
  // Buyer metrics (for buy-side)
  active_buyers_count?: number;
  ndas_signed_count?: number;
  lois_submitted_count?: number;
}

const DataRoom = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch deals with document and folder counts
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, company_name, industry, status, location, asking_price, created_by, updated_at')
        .order('updated_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Fetch document counts per deal
      const { data: docCounts, error: docError } = await supabase
        .from('data_room_documents')
        .select('deal_id');

      if (docError) throw docError;

      // Fetch folder counts per deal
      const { data: folderCounts, error: folderError } = await supabase
        .from('data_room_folders')
        .select('deal_id');

      if (folderError) throw folderError;

      // Fetch NDA counts per deal (for buy-side metrics)
      const { data: ndaCounts, error: ndaError } = await supabase
        .from('company_nda_acceptances')
        .select('company_id');

      // Calculate counts per deal
      const docCountMap = docCounts?.reduce((acc, doc) => {
        if (doc.deal_id) {
          acc[doc.deal_id] = (acc[doc.deal_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const folderCountMap = folderCounts?.reduce((acc, folder) => {
        if (folder.deal_id) {
          acc[folder.deal_id] = (acc[folder.deal_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Get folders with documents (for completion tracking)
      const foldersWithDocsMap = folderCounts?.reduce((acc, folder) => {
        if (folder.deal_id) {
          const hasDoc = docCounts?.some(doc => doc.deal_id === folder.deal_id);
          if (hasDoc) {
            acc[folder.deal_id] = (acc[folder.deal_id] || 0) + 1;
          }
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Merge counts with deals
      const dealsWithMetrics: DealWithMetrics[] = (dealsData || []).map(deal => {
        const folderCount = folderCountMap[deal.id] || 0;
        const foldersWithDocs = Math.min(foldersWithDocsMap[deal.id] || 0, folderCount);
        const completionPercent = folderCount > 0 
          ? Math.round((foldersWithDocs / folderCount) * 100) 
          : 0;
        
        return {
          ...deal,
          document_count: docCountMap[deal.id] || 0,
          folder_count: folderCount,
          folders_with_docs: foldersWithDocs,
          completion_percent: completionPercent,
          // Real metrics would come from investor_invitations/nda_signatures tables
          active_buyers_count: 0,
          ndas_signed_count: 0,
          lois_submitted_count: 0,
        };
      });

      setDeals(dealsWithMetrics);
    } catch (error) {
      console.error('Error fetching data room data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate deals into sell-side and buy-side
  const { sellSideDataRooms, buySideDataRooms } = useMemo(() => {
    const filtered = deals.filter(deal => {
      if (!searchQuery) return true;
      return (
        deal.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    });

    // Sell-side: draft, under_review, needs_revision, approved (not yet live)
    const sellSide = filtered.filter(d => 
      ['draft', 'under_review', 'needs_revision', 'approved'].includes(d.status)
    );

    // Buy-side: active or closed (live for buyers)
    const buySide = filtered.filter(d => 
      ['active', 'closed'].includes(d.status)
    );

    return { sellSideDataRooms: sellSide, buySideDataRooms: buySide };
  }, [deals, searchQuery]);

  // Calculate stats
  const inProgressCount = sellSideDataRooms.filter(d => d.status === 'draft').length;
  const pendingApprovalCount = sellSideDataRooms.filter(d => d.status === 'under_review').length;
  const needsRevisionCount = sellSideDataRooms.filter(d => d.status === 'needs_revision').length;
  const activeCount = buySideDataRooms.filter(d => d.status === 'active').length;
  const totalBuyers = buySideDataRooms.reduce((sum, d) => sum + (d.active_buyers_count || 0), 0);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Room', href: '/data-room' },
  ];

  if (loading) {
    return (
      <AdminDashboardLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Room</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Access secure document repositories for your active deals
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Data Room
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals, companies, or industries..."
                  className="pl-10 bg-secondary/50 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-card shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list' 
                    ? 'bg-card shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* SECTION 1: SELL-SIDE DATA ROOMS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">📋 Sell-Side Data Rooms</h2>
              <span className="text-sm text-muted-foreground">
                Building & Review Phase
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              <StatPill 
                label="In Progress" 
                value={inProgressCount} 
                color="yellow" 
              />
              <StatPill 
                label="Pending Approval" 
                value={pendingApprovalCount} 
                color="blue" 
              />
              <StatPill 
                label="Needs Revision" 
                value={needsRevisionCount} 
                color="orange" 
              />
            </div>
          </div>
          
          {sellSideDataRooms.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'flex flex-col gap-4'
            )}>
              {sellSideDataRooms.map(dataRoom => (
                <SellSideDataRoomCard 
                  key={dataRoom.id} 
                  dataRoom={dataRoom} 
                  isBroker={true}
                  isAdmin={true}
                />
              ))}
            </div>
          ) : (
            <DataRoomEmptySection
              icon="📋"
              title="No Data Rooms In Progress"
              description="Create your first sell-side data room to start preparing documents for buyer access."
              action={
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Data Room
                </Button>
              }
            />
          )}
        </section>
        
        {/* SECTION 2: BUY-SIDE DATA ROOMS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">✅ Buy-Side Data Rooms</h2>
              <span className="text-sm text-muted-foreground">
                Live & Active with Buyers
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              <StatPill 
                label="Active" 
                value={activeCount} 
                color="green" 
              />
              <StatPill 
                label="Active Buyers" 
                value={totalBuyers} 
                color="blue" 
              />
            </div>
          </div>
          
          {buySideDataRooms.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'flex flex-col gap-4'
            )}>
              {buySideDataRooms.map(dataRoom => (
                <BuySideDataRoomCard 
                  key={dataRoom.id} 
                  dataRoom={dataRoom} 
                />
              ))}
            </div>
          ) : (
            <DataRoomEmptySection
              icon="✅"
              title="No Active Data Rooms"
              description="Once your sell-side data rooms are approved, they'll appear here for buyer access management."
            />
          )}
        </section>
        
        {/* Create Data Room Modal */}
        <CreateDataRoomModal 
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default DataRoom;
