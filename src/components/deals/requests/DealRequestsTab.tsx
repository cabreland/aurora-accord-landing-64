import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDealRequests, REQUEST_CATEGORIES, REQUEST_PRIORITIES, REQUEST_STATUSES } from '@/hooks/useDealRequests';
import { RequestMetricsBar } from './RequestMetricsBar';
import { RequestCard } from './RequestCard';
import { NewRequestModal } from './NewRequestModal';
import { RequestDetailModal } from './RequestDetailModal';

export const DealRequestsTab = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const {
    requests,
    isLoading,
    metrics,
    createRequest,
    updateRequest,
    addResponse,
    useRequestDetail
  } = useDealRequests(dealId);

  const { data: requestDetail, isLoading: isDetailLoading } = useRequestDetail(selectedRequestId);

  // Filter requests
  const filteredRequests = useMemo(() => {
    let result = requests;

    // Apply metric filter
    if (activeMetricFilter) {
      switch (activeMetricFilter) {
        case 'open':
          result = result.filter(r => r.status === 'Open');
          break;
        case 'inProgress':
          result = result.filter(r => r.status === 'In Progress');
          break;
        case 'answered':
          result = result.filter(r => r.status === 'Answered');
          break;
        case 'overdue':
          result = result.filter(r => 
            r.due_date && new Date(r.due_date) < new Date() && r.status !== 'Closed'
          );
          break;
      }
    }

    // Apply dropdown filters
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(r => r.category === categoryFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter(r => r.priority === priorityFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [requests, activeMetricFilter, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  const handleCreateRequest = async (data: Parameters<typeof createRequest.mutateAsync>[0]) => {
    await createRequest.mutateAsync(data);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequestId) return;
    await updateRequest.mutateAsync({ requestId: selectedRequestId, updates: { status } });
  };

  const handleAddResponse = async (text: string) => {
    if (!selectedRequestId) return;
    await addResponse.mutateAsync({ requestId: selectedRequestId, responseText: text });
  };

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Requests & Q&A</h2>
          <p className="text-muted-foreground text-sm">
            Manage buyer questions and due diligence requests
          </p>
        </div>
        <Button onClick={() => setIsNewRequestOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Metrics Bar */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RequestMetricsBar
            metrics={metrics}
            activeFilter={activeMetricFilter}
            onFilterChange={setActiveMetricFilter}
          />
        </motion.div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {REQUEST_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {REQUEST_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {REQUEST_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(activeMetricFilter || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveMetricFilter(null);
              setStatusFilter('all');
              setCategoryFilter('all');
              setPriorityFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Badge */}
      {activeMetricFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing:</span>
          <Badge variant="secondary" className="capitalize">
            {activeMetricFilter === 'inProgress' ? 'In Progress' : activeMetricFilter}
          </Badge>
        </div>
      )}

      {/* Request List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No requests found</h3>
          <p className="text-muted-foreground mb-4">
            {requests.length === 0
              ? 'Create your first request to get started'
              : 'Try adjusting your filters'}
          </p>
          {requests.length === 0 && (
            <Button onClick={() => setIsNewRequestOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4"
        >
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={() => setSelectedRequestId(request.id)}
            />
          ))}
        </motion.div>
      )}

      {/* New Request Modal */}
      <NewRequestModal
        open={isNewRequestOpen}
        onOpenChange={setIsNewRequestOpen}
        onSubmit={handleCreateRequest}
        isLoading={createRequest.isPending}
      />

      {/* Request Detail Modal */}
      <RequestDetailModal
        open={!!selectedRequestId}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        request={requestDetail?.request || null}
        responses={requestDetail?.responses || []}
        documents={requestDetail?.documents || []}
        onAddResponse={handleAddResponse}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isDetailLoading}
      />
    </div>
  );
};

export default DealRequestsTab;
