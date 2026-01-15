import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Building2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CategoryCount {
  tag: string;
  count: number;
}

interface DealDocumentCardProps {
  deal: {
    id: string;
    company_name: string;
    industry: string | null;
    location: string | null;
    title: string;
  };
  documentCount: number;
  categories: CategoryCount[];
  lastUpdated: string | null;
}

function getCategoryLabel(tag: string): string {
  const labels: Record<string, string> = {
    'cim': 'CIM',
    'financials': 'Financials',
    'legal': 'Legal',
    'pitch': 'Pitch',
    'operations': 'Operations',
    'other': 'Other'
  };
  return labels[tag] || tag;
}

export function DealDocumentCard({ deal, documentCount, categories, lastUpdated }: DealDocumentCardProps) {
  const navigate = useNavigate();
  
  const handleViewAll = () => {
    navigate(`/documents?deal=${deal.id}`);
  };

  const handleCategoryClick = (tag: string) => {
    navigate(`/documents?deal=${deal.id}&category=${tag}`);
  };

  return (
    <Card className="p-5 bg-card border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{deal.company_name}</h3>
            <p className="text-sm text-muted-foreground">
              {deal.industry || 'No industry'} • {deal.location || 'No location'}
            </p>
          </div>
        </div>
        
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <FileText className="w-3 h-3 mr-1" />
          {documentCount} docs
        </Badge>
      </div>
      
      {lastUpdated && (
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Last updated: {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
        </div>
      )}
      
      {/* Quick Access Categories */}
      {categories.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Quick Access:</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 4).map((cat) => (
              <Button
                key={cat.tag}
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => handleCategoryClick(cat.tag)}
              >
                {getCategoryLabel(cat.tag)} ({cat.count})
              </Button>
            ))}
            {categories.length > 4 && (
              <span className="text-xs text-muted-foreground self-center">
                +{categories.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <Button
        className="w-full"
        variant="default"
        onClick={handleViewAll}
      >
        View All Documents
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
}
