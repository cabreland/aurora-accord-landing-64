import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';
import { Company } from '@/hooks/useCompany';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyListProps {
  companies: Company[];
  loading: boolean;
  selectedCompanyId: string | null;
  onCompanySelect: (companyId: string) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  loading,
  selectedCompanyId,
  onCompanySelect
}) => {
  const getStatusBadge = (company: Company) => {
    if (company.is_draft) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>;
    }
    
    if (!company.is_published) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>;
    }
    
    if (company.publish_at && new Date(company.publish_at) > new Date()) {
      return <Badge variant="default" className="bg-amber-500/20 text-amber-400 text-xs">Scheduled</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500/20 text-green-400 text-xs">Live</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-2">No Companies</h3>
          <p className="text-sm text-muted-foreground">
            Add your first company to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <Card
          key={company.id}
          className={`bg-card border-border cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedCompanyId === company.id ? 'ring-2 ring-primary border-primary' : ''
          }`}
          onClick={() => onCompanySelect(company.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-foreground truncate pr-2">{company.name}</h3>
              {getStatusBadge(company)}
            </div>
            
            {company.industry && (
              <p className="text-sm text-muted-foreground mb-3 truncate">{company.industry}</p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {company.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{company.location}</span>
                </div>
              )}
              {company.stage && (
                <Badge variant="outline" className="text-xs capitalize">
                  {company.stage}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompanyList;