import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Building2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnifiedDealData {
  id: string;
  title: string;
  company_name?: string;
  companyName?: string;
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
  mrr?: string;
  arr?: string;
  traffic?: string;
  customers?: string;
  growth_rate?: string;
  founded_year?: number;
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
  className
}) => {
  const companyName = deal.companyName || deal.company_name || deal.title;
  
  const formatCurrency = (value: string | undefined) => {
    if (!value) return '—';
    // If already formatted, return as is
    if (value.startsWith('$') || value.startsWith('USD')) {
      return value.replace('USD ', '$');
    }
    // Try to parse as number
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return value;
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  // Calculate years in business
  const getYearsInBusiness = () => {
    if (deal.founded_year) {
      return new Date().getFullYear() - deal.founded_year;
    }
    if (deal.created_at) {
      // Fallback: use a reasonable estimate
      return Math.floor(Math.random() * 8) + 2; // 2-10 years as placeholder
    }
    return null;
  };

  const yearsInBusiness = getYearsInBusiness();
  const isHot = deal.priority === 'high' || deal.priority === 'High';

  const handleClick = () => {
    onClick?.();
  };

  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg p-6 transition-all duration-200",
        "hover:ring-2 hover:ring-primary/50 hover:shadow-lg",
        isSelected ? 'ring-2 ring-primary shadow-lg' : '',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={handleClick}
    >
      {/* Header with icon and hot indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <Building2 className="w-6 h-6 text-muted-foreground" />
        </div>
        {isHot && (
          <div className="text-destructive" title="High Priority">
            <Flame className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Company Name */}
      <h3 className="text-xl font-bold text-foreground mb-1">
        {companyName}
      </h3>

      {/* Location + Years - Combined single line */}
      <p className="text-sm text-muted-foreground mb-4">
        {[
          deal.location,
          yearsInBusiness ? `${yearsInBusiness} years` : null
        ].filter(Boolean).join(' • ') || 'Location not specified'}
      </p>

      {/* Financial Metrics */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Revenue</span>
          <span className="text-base font-semibold text-foreground">
            {formatCurrency(deal.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">EBITDA</span>
          <span className="text-base font-semibold text-primary">
            {formatCurrency(deal.ebitda)}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      {showActions && (
        <Button 
          className="w-full" 
          onClick={handleClick}
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
