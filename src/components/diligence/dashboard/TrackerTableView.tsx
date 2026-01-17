import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Archive,
  Trash2,
  Download,
  Users,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

interface DealWithDiligence {
  id: string;
  company_name: string;
  title: string;
  total_requests: number;
  completed_requests: number;
  progress_percentage: number;
  updated_at?: string;
  overdueCount?: number;
  stage?: string;
}

type SortField = 'company_name' | 'stage' | 'progress_percentage' | 'overdueCount' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface TrackerTableViewProps {
  deals: DealWithDiligence[];
  selectedDeals: string[];
  onSelectDeal: (dealId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

const TrackerTableView: React.FC<TrackerTableViewProps> = ({ 
  deals, 
  selectedDeals, 
  onSelectDeal,
  onSelectAll 
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Sort deals
  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'company_name':
          comparison = a.company_name.localeCompare(b.company_name);
          break;
        case 'stage':
          comparison = (a.stage || '').localeCompare(b.stage || '');
          break;
        case 'progress_percentage':
          comparison = a.progress_percentage - b.progress_percentage;
          break;
        case 'overdueCount':
          comparison = (a.overdueCount || 0) - (b.overdueCount || 0);
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [deals, sortField, sortDirection]);

  // Paginate deals
  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedDeals.slice(startIndex, startIndex + pageSize);
  }, [sortedDeals, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedDeals.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };
  
  const getStageInfo = (deal: DealWithDiligence) => {
    const stage = deal.stage || (deal.progress_percentage < 25 ? 'early' : deal.progress_percentage < 75 ? 'due_diligence' : 'final_review');
    switch (stage) {
      case 'early':
        return { label: 'Early', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'due_diligence':
        return { label: 'Due Dil.', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'final_review':
        return { label: 'Review', className: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'closed':
        return { label: 'Closed', className: 'bg-green-50 text-green-700 border-green-200' };
      default:
        return { label: 'Active', className: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-gray-300';
  };

  const allSelected = paginatedDeals.length > 0 && paginatedDeals.every(d => selectedDeals.includes(d.id));
  const someSelected = selectedDeals.length > 0 && !allSelected;

  // Real owner data would come from deal_team_members joined with profiles
  const getOwnerData = (dealId: string) => {
    // Returns placeholder until real team data is implemented
    return { name: 'Unassigned', initials: '--', isOnline: false };
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Bulk Actions Bar */}
        {selectedDeals.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-700 font-medium">
                {selectedDeals.length} tracker{selectedDeals.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-7 px-2"
                onClick={() => onSelectAll(false)}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100 h-8">
                <Users className="w-4 h-4 mr-1.5" />
                Assign Team
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100 h-8">
                <Download className="w-4 h-4 mr-1.5" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100 h-8">
                <Archive className="w-4 h-4 mr-1.5" />
                Archive
              </Button>
              <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 h-8">
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Table - Responsive wrapper */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                      }
                    }}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectAll(true);
                      } else {
                        onSelectAll(false);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('company_name')}
                  >
                    Company
                    {getSortIcon('company_name')}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('stage')}
                  >
                    Stage
                    {getSortIcon('stage')}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('progress_percentage')}
                  >
                    Progress
                    {getSortIcon('progress_percentage')}
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button 
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors mx-auto"
                    onClick={() => handleSort('overdueCount')}
                  >
                    Overdue
                    {getSortIcon('overdueCount')}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Owner</TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('updated_at')}
                  >
                    Updated
                    {getSortIcon('updated_at')}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeals.map((deal) => {
                const stageInfo = getStageInfo(deal);
                const overdue = deal.overdueCount || 0;
                const isSelected = selectedDeals.includes(deal.id);
                const owner = getOwnerData(deal.id);
                
                return (
                  <TableRow 
                    key={deal.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                    onClick={() => navigate(`/dashboard/diligence-tracker/${deal.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectDeal(deal.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600">{deal.company_name}</div>
                          <div className="text-xs text-gray-500">{deal.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${stageInfo.className}`}>
                        {stageInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(deal.progress_percentage)}`}
                            style={{ width: `${deal.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-10 text-right">{deal.progress_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {overdue > 0 ? (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {overdue}
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-green-50 text-green-600 hover:bg-green-50 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          OK
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="relative group/avatar">
                            <Avatar className="w-8 h-8 border-2 border-white shadow-sm hover:ring-2 hover:ring-blue-300 transition-all">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{owner.initials}</AvatarFallback>
                            </Avatar>
                            {owner.isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-900 text-white">
                          <div className="text-center">
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-xs text-gray-400">{owner.isOnline ? '🟢 Online' : '⚪ Offline'}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {deal.updated_at ? formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true }) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Show</span>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20 h-8 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 mr-4">
                {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedDeals.length)} of {sortedDeals.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TrackerTableView;