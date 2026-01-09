import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Building2, 
  AlertTriangle,
  Plus,
  GripVertical,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  onStageChange?: (dealId: string, newStage: string) => void;
}

const stages = [
  { key: 'early', label: 'Early Stage', color: 'border-blue-300 bg-blue-50/80', headerBg: 'bg-blue-100', textColor: 'text-blue-700' },
  { key: 'due_diligence', label: 'Due Diligence', color: 'border-amber-300 bg-amber-50/80', headerBg: 'bg-amber-100', textColor: 'text-amber-700' },
  { key: 'final_review', label: 'Final Review', color: 'border-purple-300 bg-purple-50/80', headerBg: 'bg-purple-100', textColor: 'text-purple-700' },
  { key: 'closed', label: 'Closed', color: 'border-green-300 bg-green-50/80', headerBg: 'bg-green-100', textColor: 'text-green-700' },
];

const getDealStage = (deal: DealWithDiligence) => {
  if (deal.stage) return deal.stage;
  if (deal.progress_percentage === 100) return 'closed';
  if (deal.progress_percentage >= 75) return 'final_review';
  if (deal.progress_percentage >= 25) return 'due_diligence';
  return 'early';
};

const getRiskColor = (deal: DealWithDiligence) => {
  const overdue = deal.overdueCount || 0;
  if (overdue >= 3) return 'border-l-red-500';
  if (overdue >= 1) return 'border-l-amber-500';
  return 'border-l-green-500';
};

const getStatusIndicator = (deal: DealWithDiligence) => {
  const overdue = deal.overdueCount || 0;
  if (overdue >= 1) {
    return { icon: AlertTriangle, color: 'text-red-500', label: `${overdue} overdue` };
  }
  return { icon: CheckCircle2, color: 'text-green-500', label: 'On track' };
};

// Draggable Card Component
const DraggableCard: React.FC<{
  deal: DealWithDiligence;
  isDragging?: boolean;
}> = ({ deal, isDragging }) => {
  const navigate = useNavigate();
  const status = getStatusIndicator(deal);
  const StatusIcon = status.icon;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Mock team members
  const teamMembers = [
    { initials: 'SA', name: 'Sarah Adams', online: true },
    { initials: 'MK', name: 'Mike Kim', online: false },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border-l-4 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200",
        getRiskColor(deal),
        isSortableDragging || isDragging ? "opacity-50 shadow-lg scale-105" : "hover:shadow-md"
      )}
      onClick={(e) => {
        if (!isSortableDragging) {
          e.stopPropagation();
          navigate(`/dashboard/diligence-tracker/${deal.id}`);
        }
      }}
    >
      <div className="p-3" {...attributes} {...listeners}>
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{deal.company_name}</div>
            <div className="text-xs text-gray-500 truncate">{deal.title}</div>
          </div>
          <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          <Progress 
            value={deal.progress_percentage} 
            className="h-1.5 flex-1 bg-gray-100" 
          />
          <span className="text-xs font-semibold text-gray-600 w-8 text-right">
            {deal.progress_percentage}%
          </span>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StatusIcon className={cn("w-3.5 h-3.5", status.color)} />
            <span className={cn("text-xs", status.color)}>{status.label}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {deal.completed_requests}/{deal.total_requests}
          </div>
        </div>
        
        {/* Team Avatars */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
          <TooltipProvider>
            {teamMembers.slice(0, 2).map((member, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="w-6 h-6 border border-white shadow-sm">
                      <AvatarFallback className="text-[10px] bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    {member.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {member.name}
                </TooltipContent>
              </Tooltip>
            ))}
            {teamMembers.length > 2 && (
              <span className="text-xs text-gray-400 ml-1">+{teamMembers.length - 2}</span>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

// Overlay Card for Drag Preview
const DragOverlayCard: React.FC<{ deal: DealWithDiligence }> = ({ deal }) => {
  const status = getStatusIndicator(deal);
  const StatusIcon = status.icon;

  return (
    <div className={cn(
      "bg-white rounded-lg border-l-4 shadow-2xl cursor-grabbing w-64",
      getRiskColor(deal)
    )}>
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{deal.company_name}</div>
            <div className="text-xs text-gray-500 truncate">{deal.title}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Progress value={deal.progress_percentage} className="h-1.5 flex-1 bg-gray-100" />
          <span className="text-xs font-semibold text-gray-600">{deal.progress_percentage}%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <StatusIcon className={cn("w-3.5 h-3.5", status.color)} />
          <span className={cn("text-xs", status.color)}>{status.label}</span>
        </div>
      </div>
    </div>
  );
};

// Droppable Column Component
const KanbanColumn: React.FC<{
  stage: typeof stages[0];
  deals: DealWithDiligence[];
  onCreateTracker: () => void;
  isOver?: boolean;
}> = ({ stage, deals, onCreateTracker, isOver }) => {
  return (
    <div className={cn(
      "rounded-xl border-2 flex flex-col h-full min-h-[500px] transition-all duration-200",
      stage.color,
      isOver && "ring-2 ring-blue-400 ring-offset-2 border-blue-400"
    )}>
      {/* Column Header */}
      <div className={cn("p-4 border-b border-gray-200/50 rounded-t-xl", stage.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold", stage.textColor)}>{stage.label}</h3>
            <Badge variant="secondary" className="bg-white/80 text-gray-600 text-xs px-2 py-0.5">
              {deals.length}
            </Badge>
          </div>
          {stage.key === 'early' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-white/50"
              onClick={(e) => {
                e.stopPropagation();
                onCreateTracker();
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Cards Container */}
      <ScrollArea className="flex-1 p-3">
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {deals.map((deal) => (
              <DraggableCard key={deal.id} deal={deal} />
            ))}
            
            {deals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No trackers in this stage</p>
                <p className="text-xs text-gray-400 mt-1">Drag cards here or create new</p>
              </div>
            )}
            
            {/* Add Button in Early Stage column */}
            {stage.key === 'early' && (
              <Button 
                variant="ghost" 
                className="w-full h-12 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600 transition-colors"
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
        </SortableContext>
      </ScrollArea>
    </div>
  );
};

const TrackerKanbanView: React.FC<TrackerKanbanViewProps> = ({ 
  deals, 
  onCreateTracker,
  onStageChange 
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.key] = deals.filter(deal => getDealStage(deal) === stage.key);
    return acc;
  }, {} as Record<string, DealWithDiligence[]>);

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      // Check if over a column or a card
      const overId = over.id as string;
      // Find which stage this card/column belongs to
      for (const stage of stages) {
        if (dealsByStage[stage.key]?.some(d => d.id === overId)) {
          setOverId(stage.key);
          return;
        }
      }
    }
    setOverId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedDeal = deals.find(d => d.id === active.id);
    if (!draggedDeal) return;

    // Determine target stage
    let targetStage: string | null = null;
    
    // Check if dropped on a card - find its stage
    for (const stage of stages) {
      if (dealsByStage[stage.key]?.some(d => d.id === over.id)) {
        targetStage = stage.key;
        break;
      }
    }

    // If dropped on the column itself
    if (!targetStage && stages.some(s => s.key === over.id)) {
      targetStage = over.id as string;
    }

    if (targetStage && targetStage !== getDealStage(draggedDeal)) {
      const stageName = stages.find(s => s.key === targetStage)?.label || targetStage;
      
      // Call the stage change handler
      onStageChange?.(draggedDeal.id, targetStage);
      
      // Show success toast
      toast.success(`${draggedDeal.company_name} moved to ${stageName}`, {
        description: "Stage updated successfully",
        duration: 3000,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4 min-h-[600px]">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.key}
            stage={stage}
            deals={dealsByStage[stage.key] || []}
            onCreateTracker={onCreateTracker}
            isOver={overId === stage.key}
          />
        ))}
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeDeal && <DragOverlayCard deal={activeDeal} />}
      </DragOverlay>
    </DndContext>
  );
};

export default TrackerKanbanView;
