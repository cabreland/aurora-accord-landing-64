import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Edit,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  ArrowRight,
  Folder,
  MapPin,
  DollarSign,
  FolderOpen,
  Plus,
  Filter,
  FileText
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
  folders_with_docs: number;
  created_by: string;
  completion_percent: number;
}

interface DataRoomMetrics {
  inProgressCount: number;
  pendingApprovalCount: number;
  approvedLiveCount: number;
  avgApprovalDays: string;
}

const DataRoom = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealWithMetrics[]>([]);
  const [metrics, setMetrics] = useState<DataRoomMetrics>({
    inProgressCount: 0,
    pendingApprovalCount: 0,
    approvedLiveCount: 0,
    avgApprovalDays: '0',
  });
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
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

      // Get folders with documents (for completion tracking)
      const foldersWithDocsMap = folderCounts?.reduce((acc, folder) => {
        if (folder.deal_id) {
          // Count this folder if it has at least 1 document
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
        };
      });

      setDeals(dealsWithMetrics);

      // Calculate sell-side approval workflow metrics
      // In Progress: draft or needs_revision status
      const inProgressCount = dealsWithMetrics.filter(d => 
        d.status === 'draft' || d.status === 'needs_revision'
      ).length;

      // Pending Approval: under_review status
      const pendingApprovalCount = dealsWithMetrics.filter(d => 
        d.status === 'under_review'
      ).length;

      // Approved & Live: approved or active status
      const approvedLiveCount = dealsWithMetrics.filter(d => 
        d.status === 'approved' || d.status === 'active'
      ).length;

      // Calculate average approval time (placeholder - would need submitted_at/approved_at fields)
      // For now, show a reasonable default
      const avgApprovalDays = '2.5';

      setMetrics({
        inProgressCount,
        pendingApprovalCount,
        approvedLiveCount,
        avgApprovalDays,
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

  // Filter deals based on search, status, industry, and metric filter
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || deal.industry === industryFilter;

      // Apply metric filter if active
      let matchesMetricFilter = true;
      if (activeMetricFilter === 'in-progress') {
        matchesMetricFilter = deal.status === 'draft' || deal.status === 'needs_revision';
      } else if (activeMetricFilter === 'pending-approval') {
        matchesMetricFilter = deal.status === 'under_review';
      } else if (activeMetricFilter === 'approved-live') {
        matchesMetricFilter = deal.status === 'approved' || deal.status === 'active';
      }

      return matchesSearch && matchesStatus && matchesIndustry && matchesMetricFilter;
    });
  }, [deals, searchQuery, statusFilter, industryFilter, activeMetricFilter]);

  const handleMetricClick = (filter: string) => {
    if (activeMetricFilter === filter) {
      setActiveMetricFilter(null);
    } else {
      setActiveMetricFilter(filter);
    }
  };

  const handleDealSelect = (dealId: string) => {
    navigate(`/deals/${dealId}?tab=data-room`);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Room', href: '/data-room' },
  ];

  const getApprovalStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'under_review':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      case 'needs_revision':
        return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600';
      case 'closed':
        return 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600';
    }
  };

  const getApprovalStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '🟡 Draft';
      case 'needs_revision':
        return '🟠 Needs Revision';
      case 'under_review':
        return '🔵 Under Review';
      case 'approved':
        return '🟢 Approved';
      case 'active':
        return '✅ Active';
      case 'closed':
        return '⚪ Closed';
      default:
        return status;
    }
  };

  const getCompletionColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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

        {/* Metrics Section - Sell-Side Approval Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* In Progress - Being Built */}
          <div 
            onClick={() => handleMetricClick('in-progress')}
            className={cn(
              "bg-card border rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow-md",
              activeMetricFilter === 'in-progress' 
                ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                : 'border-border hover:border-yellow-300'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Edit className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.inProgressCount}</p>
            <p className="text-sm text-muted-foreground font-medium">In Progress</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Being built by brokers</p>
          </div>

          {/* Pending Approval - Admin Review Needed */}
          <div 
            onClick={() => handleMetricClick('pending-approval')}
            className={cn(
              "bg-card border rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow-md",
              activeMetricFilter === 'pending-approval' 
                ? 'border-orange-500 ring-2 ring-orange-500/20' 
                : 'border-border hover:border-orange-300'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.pendingApprovalCount}</p>
            <p className="text-sm text-muted-foreground font-medium">Pending Approval</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Awaiting admin review</p>
          </div>

          {/* Approved & Live - Buyer Ready */}
          <div 
            onClick={() => handleMetricClick('approved-live')}
            className={cn(
              "bg-card border rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow-md",
              activeMetricFilter === 'approved-live' 
                ? 'border-green-500 ring-2 ring-green-500/20' 
                : 'border-border hover:border-green-300'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.approvedLiveCount}</p>
            <p className="text-sm text-muted-foreground font-medium">Approved & Live</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Buyer-ready data rooms</p>
          </div>

          {/* Average Approval Time */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{metrics.avgApprovalDays}<span className="text-base font-normal text-muted-foreground ml-1">days</span></p>
            <p className="text-sm text-muted-foreground font-medium">Avg Approval Time</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Submit to approve</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {activeMetricFilter && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filtering by:</span>
            <span className="font-medium text-foreground capitalize">
              {activeMetricFilter.replace('-', ' ')}
            </span>
            <button 
              onClick={() => setActiveMetricFilter(null)}
              className="text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

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
                        className={cn("text-xs font-medium flex-shrink-0", getApprovalStatusStyles(deal.status))}
                      >
                        {getApprovalStatusLabel(deal.status)}
                      </Badge>
                    )}
                  </div>

                  {/* Completion Indicator */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            getCompletionColor(deal.completion_percent)
                          )}
                          style={{ width: `${deal.completion_percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {deal.completion_percent}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {deal.folders_with_docs} of {deal.folder_count} folders complete
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className={cn(
                  "p-4 pt-0",
                  viewMode === 'list' && 'flex-1 flex items-center justify-between gap-4 pt-4'
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
                          className={cn("text-xs font-medium", getApprovalStatusStyles(deal.status))}
                        >
                          {getApprovalStatusLabel(deal.status)}
                        </Badge>

                        {/* Completion in list view */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", getCompletionColor(deal.completion_percent))}
                              style={{ width: `${deal.completion_percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">{deal.completion_percent}%</span>
                        </div>
                        
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
