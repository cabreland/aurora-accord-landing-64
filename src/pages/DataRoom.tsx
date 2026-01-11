import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  FileText, 
  Activity, 
  UserCheck,
  LayoutGrid,
  List,
  ArrowRight,
  Folder,
  MapPin,
  DollarSign,
  FolderOpen,
  Plus,
  Filter
} from 'lucide-react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
  created_by: string;
}

interface DataRoomMetrics {
  totalDataRooms: number;
  totalDocuments: number;
  recentUploads: number;
  pendingAccess: number;
}

const DataRoom = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealWithMetrics[]>([]);
  const [metrics, setMetrics] = useState<DataRoomMetrics>({
    totalDataRooms: 0,
    totalDocuments: 0,
    recentUploads: 0,
    pendingAccess: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch deals with document and folder counts
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, company_name, industry, status, location, asking_price, created_by')
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

      // Merge counts with deals
      const dealsWithMetrics: DealWithMetrics[] = (dealsData || []).map(deal => ({
        ...deal,
        document_count: docCountMap[deal.id] || 0,
        folder_count: folderCountMap[deal.id] || 0,
      }));

      setDeals(dealsWithMetrics);

      // Calculate global metrics
      const totalDocs = docCounts?.length || 0;

      // Get recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentCount } = await supabase
        .from('data_room_documents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get pending access requests
      const { count: pendingCount } = await supabase
        .from('access_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      setMetrics({
        totalDataRooms: dealsWithMetrics.filter(d => d.folder_count > 0).length,
        totalDocuments: totalDocs,
        recentUploads: recentCount || 0,
        pendingAccess: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching data room data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(deals.map(d => d.industry).filter(Boolean))];
    return uniqueIndustries.sort();
  }, [deals]);

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || deal.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [deals, searchQuery, statusFilter, industryFilter]);

  const handleDealSelect = (dealId: string) => {
    navigate(`/deals/${dealId}?tab=data-room`);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Room', href: '/data-room' },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'closed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          {/* Metrics skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>

          {/* Search bar skeleton */}
          <Skeleton className="h-16 rounded-lg" />

          {/* Cards skeleton */}
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Room</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Access secure document repositories for your active deals
            </p>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Data Rooms */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.totalDataRooms}</p>
            <p className="text-sm text-muted-foreground">Active Data Rooms</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Companies in DD</p>
          </div>

          {/* Total Documents */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.totalDocuments}</p>
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Across all deals</p>
          </div>

          {/* Recent Uploads */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.recentUploads}</p>
            <p className="text-sm text-muted-foreground">Recent Uploads</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Last 7 days</p>
          </div>

          {/* Pending Access */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.pendingAccess}</p>
            <p className="text-sm text-muted-foreground">Pending Access</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Awaiting approval</p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
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

            {/* Filters and View Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry!}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border hidden lg:block" />

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
        </div>

        {/* Deal Cards Grid */}
        {filteredDeals.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'flex flex-col gap-4'
          )}>
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleDealSelect(deal.id)}
                className={cn(
                  "group cursor-pointer bg-card border border-border rounded-lg overflow-hidden shadow-sm",
                  "hover:shadow-md hover:border-primary/50 transition-all duration-200",
                  viewMode === 'list' && 'flex items-center'
                )}
              >
                {/* Card Header */}
                <div className={cn(
                  "p-4 border-b border-border/50 bg-gradient-to-br from-secondary/30 to-card",
                  viewMode === 'list' && 'border-b-0 border-r flex-shrink-0 w-64'
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Company Icon */}
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-primary-foreground font-bold text-sm">
                          {deal.company_name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {deal.company_name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {deal.industry || 'No industry'}
                        </p>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs font-medium flex-shrink-0", getStatusStyles(deal.status))}
                      >
                        {deal.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className={cn(
                  "p-4",
                  viewMode === 'list' && 'flex-1 flex items-center justify-between gap-4'
                )}>
                  {viewMode === 'grid' ? (
                    <>
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-secondary/50 rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground mb-0.5">Documents</p>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                              {deal.document_count}
                            </p>
                          </div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground mb-0.5">Folders</p>
                          <div className="flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                              {deal.folder_count}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location & Value */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                        {deal.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{deal.location}</span>
                          </div>
                        )}
                        {deal.asking_price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-semibold text-foreground">{deal.asking_price}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List view content */}
                      <div className="flex items-center gap-6">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs font-medium", getStatusStyles(deal.status))}
                        >
                          {deal.status}
                        </Badge>
                        
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span className="tabular-nums">{deal.document_count} docs</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Folder className="w-4 h-4" />
                          <span className="tabular-nums">{deal.folder_count} folders</span>
                        </div>
                        
                        {deal.location && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{deal.location}</span>
                          </div>
                        )}
                        
                        {deal.asking_price && (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>{deal.asking_price}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Card Footer */}
                <div className={cn(
                  "px-4 py-3 bg-secondary/30 border-t border-border/50 flex items-center justify-between",
                  viewMode === 'list' && 'border-t-0 border-l flex-shrink-0 w-32'
                )}>
                  {viewMode === 'grid' && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-background">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          BR
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Broker</span>
                    </div>
                  )}
                  <span className={cn(
                    "text-primary text-xs font-medium flex items-center gap-1",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    viewMode === 'list' && 'opacity-100'
                  )}>
                    View Room
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' || industryFilter !== 'all' 
                ? 'No Matching Data Rooms' 
                : 'No Data Rooms Yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || industryFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Create your first data room to start organizing and sharing deal documents securely.'}
            </p>
            {!(searchQuery || statusFilter !== 'all' || industryFilter !== 'all') && (
              <Button onClick={() => navigate('/deals/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Data Room
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default DataRoom;
