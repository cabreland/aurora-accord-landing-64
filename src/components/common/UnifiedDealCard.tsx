import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  Star,
  FileText,
  Eye,
  Edit,
  Building2,
  DollarSign,
  Users,
  MoreVertical
} from 'lucide-react';
import { getIndustryCategory } from '@/lib/industry-categories';
import { cn } from '@/lib/utils';

export interface UnifiedDealData {
  id: string;
  title: string;
  company_name?: string;
  companyName?: string; // Support both naming conventions
  industry?: string;
  revenue?: string;
  ebitda?: string;
  asking_price?: string;
  location?: string;
  status?: 'draft' | 'active' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High';
  stage?: string;
  progress?: number;
  fitScore?: number;
  description?: string;
  lastUpdated?: string;
  updated_at?: string;
  created_at?: string;
  // Digital business metrics
  mrr?: string;
  arr?: string;
  traffic?: string;
  customers?: string;
  growth_rate?: string;
}

export interface UnifiedDealCardProps {
  deal: UnifiedDealData;
  variant?: 'investor' | 'management' | 'dashboard';
  isSelected?: boolean;
  showActions?: boolean;
  onClick?: () => void;
  onEdit?: (dealId: string) => void;
  onViewDocuments?: (dealId: string) => void;
  className?: string;
}

export const UnifiedDealCard: React.FC<UnifiedDealCardProps> = ({
  deal,
  variant = 'management',
  isSelected = false,
  showActions = true,
  onClick,
  onEdit,
  onViewDocuments,
  className
}) => {
  const industryCategory = getIndustryCategory(deal.industry);
  const companyName = deal.companyName || deal.company_name;
  const lastUpdated = deal.lastUpdated || 
    (deal.updated_at ? new Date(deal.updated_at).toLocaleDateString() : undefined);

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-muted text-muted-foreground';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'draft': return 'bg-warning/10 text-warning border-warning/20';
      case 'archived': return 'bg-muted/10 text-muted-foreground border-muted/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStageColor = (stage?: string) => {
    if (!stage) return 'text-muted-foreground';
    
    switch (stage.toLowerCase()) {
      case 'nda signed': return 'text-success';
      case 'due diligence': return 'text-warning';
      case 'discovery call': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deal.id);
  };

  const handleViewDocuments = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDocuments?.(deal.id);
  };

  const handleClick = () => {
    onClick?.();
  };

  // Investor variant - premium design
  if (variant === 'investor') {
    return (
      <div 
        className={cn(
          "bg-gradient-to-br from-card/95 to-card/80 rounded-xl p-6 border transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 group backdrop-blur-sm",
          isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/50',
          className
        )}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors truncate">
              {companyName || deal.title}
            </h3>
            <Badge 
              className="font-medium border"
              style={{
                color: industryCategory.color,
                backgroundColor: industryCategory.bgColor,
                borderColor: industryCategory.borderColor
              }}
            >
              {industryCategory.label}
            </Badge>
          </div>
          {deal.priority && (
            <Badge className={getPriorityColor(deal.priority)}>
              {deal.priority}
            </Badge>
          )}
        </div>

        {/* Description */}
        {deal.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {deal.description}
          </p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(deal.revenue || deal.mrr) && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="text-muted-foreground text-xs mb-1">
                {deal.mrr ? 'MRR' : 'Revenue'}
              </div>
              <div className="text-foreground font-semibold text-sm">
                {deal.mrr || deal.revenue}
              </div>
            </div>
          )}
          {(deal.ebitda || deal.arr) && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="text-muted-foreground text-xs mb-1">
                {deal.arr ? 'ARR' : 'EBITDA'}
              </div>
              <div className="text-foreground font-semibold text-sm">
                {deal.arr || deal.ebitda}
              </div>
            </div>
          )}
        </div>

        {/* Stage Progress */}
        {deal.stage && deal.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", getStageColor(deal.stage))}>
                {deal.stage}
              </span>
              <span className="text-muted-foreground text-xs">{deal.progress}% Complete</span>
            </div>
            <Progress value={deal.progress} className="h-1.5" />
          </div>
        )}

        {/* Fit Score */}
        {deal.fitScore !== undefined && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-foreground text-sm">Fit Score</span>
            </div>
            <Badge className={cn(
              "font-semibold",
              deal.fitScore >= 90 ? 'bg-success text-success-foreground' :
              deal.fitScore >= 80 ? 'bg-warning text-warning-foreground' :
              'bg-primary text-primary-foreground'
            )}>
              {deal.fitScore}%
            </Badge>
          </div>
        )}

        {/* Location & Last Updated */}
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-4">
          {deal.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{deal.location}</span>
            </div>
          )}
          {lastUpdated && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{lastUpdated}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2">
            <Button 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onViewDocuments && (
              <Button variant="outline" onClick={handleViewDocuments}>
                <FileText className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Dashboard variant - compact design
  if (variant === 'dashboard') {
    return (
      <div className={cn(
        "bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors",
        isSelected ? 'border-primary' : '',
        onClick ? 'cursor-pointer' : '',
        className
      )}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-foreground truncate text-sm">{deal.title}</h4>
          {deal.status && (
            <Badge variant="outline" className={cn("text-xs", getStatusColor(deal.status))}>
              {deal.status}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{companyName}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <Badge 
            className="text-xs font-medium border-0"
            style={{
              color: industryCategory.color,
              backgroundColor: industryCategory.bgColor
            }}
          >
            {industryCategory.label}
          </Badge>
          {deal.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {deal.location}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-primary">
            {deal.revenue || deal.mrr || 'Revenue TBD'}
          </span>
          {onClick && (
            <button 
              onClick={handleClick}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              View Details →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Management variant - standard design
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg transition-all hover:shadow-md",
        isSelected ? 'ring-2 ring-primary border-primary' : '',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate" title={deal.title}>
              {deal.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {companyName}
              </span>
            </div>
          </div>
          {showActions && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          {deal.status && (
            <Badge variant="outline" className={getStatusColor(deal.status)}>
              {deal.status}
            </Badge>
          )}
          {deal.priority && (
            <Badge variant="outline" className={getPriorityColor(deal.priority)}>
              {deal.priority}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <Badge 
            className="font-medium border-0"
            style={{
              color: industryCategory.color,
              backgroundColor: industryCategory.bgColor
            }}
          >
            {industryCategory.label}
          </Badge>
          
          {deal.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{deal.location}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            {(deal.revenue || deal.mrr) && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground truncate" title={`Revenue: ${deal.revenue || deal.mrr}`}>
                  {deal.revenue || deal.mrr}
                </span>
              </div>
            )}
            {deal.ebitda && (
              <div className="text-xs text-muted-foreground truncate" title={`EBITDA: ${deal.ebitda}`}>
                EBITDA: {deal.ebitda}
              </div>
            )}
          </div>
        </div>

        {lastUpdated && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Updated {lastUpdated}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};