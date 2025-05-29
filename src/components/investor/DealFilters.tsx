
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  Search,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DealFiltersProps {
  onFilterChange: (filters: any) => void;
}

const DealFilters = ({ onFilterChange }: DealFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({
    industry: 'all',
    stage: 'all',
    priority: 'all',
    minRevenue: 0
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      industry: 'all',
      stage: 'all',
      priority: 'all',
      minRevenue: 0
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== 'all' && value !== 0).length;
  };

  return (
    <div className="bg-gradient-to-r from-[#2A2F3A] to-[#1A1F2E] rounded-2xl p-6 border border-[#D4AF37]/30">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-lg font-bold text-[#FAFAFA]">Filter Deals</h3>
          {getActiveFilterCount() > 0 && (
            <Badge className="bg-[#F28C38] text-[#0A0F0F] font-bold">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-[#0A0F0F]"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeFilters.priority === 'High' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('priority', activeFilters.priority === 'High' ? 'all' : 'High')}
          className={activeFilters.priority === 'High' 
            ? 'bg-[#F28C38] text-[#0A0F0F]' 
            : 'border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38] hover:text-[#0A0F0F]'
          }
        >
          High Priority
        </Button>
        <Button
          variant={activeFilters.stage === 'NDA Signed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('stage', activeFilters.stage === 'NDA Signed' ? 'all' : 'NDA Signed')}
          className={activeFilters.stage === 'NDA Signed' 
            ? 'bg-[#22C55E] text-[#0A0F0F]' 
            : 'border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-[#0A0F0F]'
          }
        >
          NDA Signed
        </Button>
        <Button
          variant={activeFilters.minRevenue === 10 ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('minRevenue', activeFilters.minRevenue === 10 ? 0 : 10)}
          className={activeFilters.minRevenue === 10 
            ? 'bg-[#D4AF37] text-[#0A0F0F]' 
            : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F0F]'
          }
        >
          $10M+ Revenue
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#D4AF37]/20">
          <div>
            <label className="block text-[#F4E4BC] text-sm font-medium mb-2">Industry</label>
            <Select value={activeFilters.industry} onValueChange={(value) => handleFilterChange('industry', value)}>
              <SelectTrigger className="bg-[#0A0F0F] border-[#D4AF37]/30 text-[#FAFAFA]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3A] border-[#D4AF37]/30">
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="clean tech">Clean Tech</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[#F4E4BC] text-sm font-medium mb-2">Deal Stage</label>
            <Select value={activeFilters.stage} onValueChange={(value) => handleFilterChange('stage', value)}>
              <SelectTrigger className="bg-[#0A0F0F] border-[#D4AF37]/30 text-[#FAFAFA]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3A] border-[#D4AF37]/30">
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Qualified Lead">Qualified Lead</SelectItem>
                <SelectItem value="Discovery Call">Discovery Call</SelectItem>
                <SelectItem value="NDA Signed">NDA Signed</SelectItem>
                <SelectItem value="Due Diligence">Due Diligence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[#F4E4BC] text-sm font-medium mb-2">Priority</label>
            <Select value={activeFilters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger className="bg-[#0A0F0F] border-[#D4AF37]/30 text-[#FAFAFA]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3A] border-[#D4AF37]/30">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[#F4E4BC] text-sm font-medium mb-2">Min Revenue</label>
            <Select value={activeFilters.minRevenue.toString()} onValueChange={(value) => handleFilterChange('minRevenue', parseInt(value))}>
              <SelectTrigger className="bg-[#0A0F0F] border-[#D4AF37]/30 text-[#FAFAFA]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3A] border-[#D4AF37]/30">
                <SelectItem value="0">Any Revenue</SelectItem>
                <SelectItem value="1">$1M+</SelectItem>
                <SelectItem value="5">$5M+</SelectItem>
                <SelectItem value="10">$10M+</SelectItem>
                <SelectItem value="20">$20M+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealFilters;
