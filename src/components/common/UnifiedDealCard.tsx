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
  const askingPrice = deal.asking_price || deal.revenue || deal.mrr;
  
  const formatPrice = (price: string | undefined) => {
    if (!price) return 'Price TBD';
    if (price.startsWith('USD') || price.startsWith('$')) return price;
    return `USD ${price}`;
  };

  const getBusinessType = (industry?: string) => {
    const category = getIndustryCategory(industry);
    return category.label;
  };

  const handleClick = () => {
    onClick?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deal.id);
  };

  const handleViewDocuments = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDocuments?.(deal.id);
  };

  // Marketplace-style card design based on reference
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-md",
        isSelected ? 'border-primary shadow-md' : 'border-border',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={handleClick}
    >
      {/* Header with business type and hot badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-foreground">
              {getBusinessType(deal.industry)}
            </h3>
            {deal.priority === 'high' && (
              <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5">
                Hot
              </Badge>
            )}
          </div>
          
          {/* Industry badge */}
          <Badge 
            className="text-xs px-2 py-1 font-medium border-0"
            style={{
              color: industryCategory.color,
              backgroundColor: industryCategory.bgColor
            }}
          >
            {industryCategory.label}
          </Badge>
        </div>
        
        {/* Asking price */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Asking price</div>
          <div className="text-lg font-bold text-foreground">
            {formatPrice(askingPrice)}
          </div>
        </div>
      </div>

      {/* Bottom metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-4">
          {deal.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{deal.location}</span>
            </div>
          )}
          {deal.stage && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{deal.stage}</span>
            </div>
          )}
        </div>
        
        {deal.created_at && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(deal.created_at).getFullYear() - new Date().getFullYear() + 5} years</span>
          </div>
        )}
      </div>

      {/* Action buttons for management variant */}
      {variant === 'management' && showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button size="sm" variant="outline" className="flex-1" onClick={handleClick}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {onEdit && (
            <Button size="sm" variant="outline" onClick={handleEdit}>
              <Edit className="w-3 h-3" />
            </Button>
          )}
          {onViewDocuments && (
            <Button size="sm" variant="outline" onClick={handleViewDocuments}>
              <FileText className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};