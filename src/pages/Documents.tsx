
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { FileText } from 'lucide-react';
import DocumentsDashboard from '@/components/documents/DocumentsDashboard';
import CompanyGrid from '@/components/documents/CompanyGrid';
import DocumentStatusPanel from '@/components/documents/DocumentStatusPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DocumentsPage = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Fetch company name when company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyName();
    }
  }, [selectedCompanyId]);

  const fetchCompanyName = async () => {
    if (!selectedCompanyId) return;
    
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('company_name')
        .eq('id', selectedCompanyId)
        .single();

      if (error) throw error;
      setSelectedCompanyName(data?.company_name || 'Unknown Company');
    } catch (error) {
      console.error('Error fetching company name:', error);
      setSelectedCompanyName('Unknown Company');
    }
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  const handleBackToGrid = () => {
    setSelectedCompanyId(null);
    setSelectedCompanyName('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <DashboardLayout activeTab="documents">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCompanyId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToGrid}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                {selectedCompanyId ? `${selectedCompanyName} Documents` : 'Document Management'}
              </h1>
            </div>
          </div>
        </div>

        {!selectedCompanyId ? (
          <>
            {/* Dashboard Overview */}
            <DocumentsDashboard
              selectedCompanyId={selectedCompanyId}
              onCompanySelect={handleCompanySelect}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
            />

            {/* Company Grid */}
            <CompanyGrid
              searchQuery={searchQuery}
              selectedCompanyId={selectedCompanyId}
              onCompanySelect={handleCompanySelect}
            />
          </>
        ) : (
          /* Document Status Panel for Selected Company */
          <DocumentStatusPanel 
            companyId={selectedCompanyId}
            companyName={selectedCompanyName}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;
