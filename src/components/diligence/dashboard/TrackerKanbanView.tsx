import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DealWithDiligence {
  id: string;
  company_name: string;
  title: string;
  total_requests: number;
  completed_requests: number;
  progress_percentage: number;
  overdueCount?: number;
  stage?: string;
}

interface TrackerKanbanViewProps {
  deals: DealWithDiligence[];
  onCreateTracker: () => void;
}

const TrackerKanbanView: React.FC<TrackerKanbanViewProps> = ({ deals, onCreateTracker }) => {
  const navigate = useNavigate();
  
  const stages = [
    { key: 'early', label: 'Early Stage', color: 'border-blue-200 bg-blue-50/50' },
    { key: 'due_diligence', label: 'Due Diligence', color: 'border-amber-200 bg-amber-50/50' },
    { key: 'final_review', label: 'Final Review', color: 'border-purple-200 bg-purple-50/50' },
    { key: 'closed', label: 'Closed', color: 'border-green-200 bg-green-50/50' },
  ];

  const getDealStage = (deal: DealWithDiligence) => {
    if (deal.stage) return deal.stage;
    if (deal.progress_percentage === 100) return 'closed';
    if (deal.progress_percentage >= 75) return 'final_review';
    if (deal.progress_percentage >= 25) return 'due_diligence';
    return 'early';
  };

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.key] = deals.filter(deal => getDealStage(deal) === stage.key);
    return acc;
  }, {} as Record<string, DealWithDiligence[]>);

  return (
    <div className="grid grid-cols-4 gap-4 min-h-[500px]">
      {stages.map((stage) => (
        <div key={stage.key} className={`rounded-xl border ${stage.color} flex flex-col`}>
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">{stage.label}</h3>
              <Badge variant="outline" className="bg-white text-gray-600">
                {dealsByStage[stage.key]?.length || 0}
              </Badge>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {dealsByStage[stage.key]?.map((deal) => {
                const overdue = deal.overdueCount || 0;
                
                return (
                  <div 
                    key={deal.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => navigate(`/dashboard/diligence-tracker/${deal.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{deal.company_name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={deal.progress_percentage} className="h-1.5 flex-1 bg-gray-100" />
                      <span className="text-xs font-medium text-gray-600">{deal.progress_percentage}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{deal.completed_requests}/{deal.total_requests}</span>
                      {overdue > 0 && (
                        <Badge variant="destructive" className="text-xs py-0 px-1 h-5">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                          {overdue}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {stage.key === 'early' && (
                <Button 
                  variant="ghost" 
                  className="w-full h-12 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTracker();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Tracker
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};

export default TrackerKanbanView;
