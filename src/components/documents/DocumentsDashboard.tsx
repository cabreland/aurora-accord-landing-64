import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface DocumentsDashboardProps {
  selectedCompanyId: string | null;
  onCompanySelect: (companyId: string | null) => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: any) => void;
}

const DocumentsDashboard = ({ 
  selectedCompanyId, 
  onCompanySelect,
  onSearchChange,
  onFilterChange 
}: DocumentsDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real data from hooks
  const dashboardMetrics = {
    totalDeals: 47,
    pendingDocuments: 23,
    completionRate: 78,
    storageUsed: '2.4 GB'
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Deals
              </CardTitle>
              <Building2 className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Documents
              </CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.pendingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              8 urgent items
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +5% this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Storage Used
              </CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              of 10 GB plan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Action Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies, documents, or metadata..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 bg-background border-border"
                />
              </div>
              
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tags */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Active filters:</span>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Status: Active
          <button className="ml-1 hover:text-foreground">×</button>
        </Badge>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Completion: &lt;100%
          <button className="ml-1 hover:text-foreground">×</button>
        </Badge>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default DocumentsDashboard;