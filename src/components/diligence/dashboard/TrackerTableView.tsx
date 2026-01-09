import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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

  const getProgressIcon = (progress: number, overdue: number = 0) => {
    if (overdue > 0) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (progress === 100) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (progress > 0) return <Clock className="w-4 h-4 text-amber-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const allSelected = deals.length > 0 && selectedDeals.length === deals.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-12">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700">Company</TableHead>
            <TableHead className="font-semibold text-gray-700">Stage</TableHead>
            <TableHead className="font-semibold text-gray-700">Progress</TableHead>
            <TableHead className="font-semibold text-gray-700 text-center">Overdue</TableHead>
            <TableHead className="font-semibold text-gray-700">Owner</TableHead>
            <TableHead className="font-semibold text-gray-700">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const stageInfo = getStageInfo(deal);
            const overdue = deal.overdueCount || 0;
            const isSelected = selectedDeals.includes(deal.id);
            
            return (
              <TableRow 
                key={deal.id}
                className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{deal.company_name}</div>
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
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={deal.progress_percentage} className="h-1.5 flex-1 bg-gray-100" />
                    <span className="text-sm font-medium text-gray-700 w-10">{deal.progress_percentage}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {overdue > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {overdue}
                    </Badge>
                  ) : (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                </TableCell>
                <TableCell>
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600">SA</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {deal.updated_at ? formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true }) : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TrackerTableView;
