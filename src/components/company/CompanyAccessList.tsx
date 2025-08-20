
import React from 'react';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import CompanyAccessCard from './CompanyAccessCard';
import { Skeleton } from '@/components/ui/skeleton';

const CompanyAccessList: React.FC = () => {
  const { companies, isLoadingCompanies, companiesError } = useCompanyAccess();

  if (companiesError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading companies: {companiesError.message}</p>
      </div>
    );
  }

  if (isLoadingCompanies) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No companies available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyAccessCard
          key={company.company_id}
          company={company}
        />
      ))}
    </div>
  );
};

export default CompanyAccessList;
