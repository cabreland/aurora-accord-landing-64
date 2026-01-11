import React from 'react';
import { ChevronDown, ChevronRight, Folder, CheckCircle, BarChart3, Scale, Users, Settings, Cpu, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DiligenceCategory, DiligenceSubcategory } from '@/hooks/useDiligenceTracker';

interface CategoryCounts {
  [key: string]: { total: number; completed: number };
}

interface EnhancedCategorySidebarProps {
  categories: DiligenceCategory[];
  subcategories: DiligenceSubcategory[];
  categoryCounts: CategoryCounts;
  subcategoryCounts: CategoryCounts;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  expandedCategories: Set<string>;
  totalRequests: number;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSubcategory: (subcategoryId: string) => void;
  onToggleCategory: (categoryId: string) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'bar-chart-3': BarChart3,
  'scale': Scale,
  'users': Users,
  'settings': Settings,
  'cpu': Cpu,
  'leaf': Leaf,
  'folder': Folder,
};

const EnhancedCategorySidebar: React.FC<EnhancedCategorySidebarProps> = ({
  categories,
  subcategories,
  categoryCounts,
  subcategoryCounts,
  selectedCategoryId,
  selectedSubcategoryId,
  expandedCategories,
  totalRequests,
  onSelectCategory,
  onSelectSubcategory,
  onToggleCategory,
}) => {
  const getProgressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-gray-200';
    const pct = (completed / total) * 100;
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getCategoryProgressIndicator = (categoryId: string) => {
    const count = categoryCounts[categoryId] || { total: 0, completed: 0 };
    if (count.total === 0) return null;
    
    const pct = (count.completed / count.total) * 100;
    
    if (pct === 100) {
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    } else if (pct > 0) {
      return <div className="w-2 h-2 rounded-full bg-amber-500" />;
    } else {
      return <div className="w-2 h-2 rounded-full bg-red-500" />;
    }
  };

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Categories
        </h2>
      </div>

      {/* Category Tree - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* All Requests - Always visible */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-150 mb-2',
            selectedCategoryId === null && !selectedSubcategoryId
              ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200 shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            <span className="font-medium">All Requests</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700 tabular-nums">
            {totalRequests}
          </Badge>
        </button>

        <div className="h-px bg-gray-200 my-3" />

        {/* Main Categories */}
        <div className="space-y-1">
          {categories.map((category) => {
            const count = categoryCounts[category.id] || { total: 0, completed: 0 };
            const Icon = iconMap[category.icon || 'folder'] || Folder;
            const isExpanded = expandedCategories.has(category.id);
            const catSubs = subcategories.filter(s => s.category_id === category.id);
            const hasSubcategories = catSubs.length > 0;
            const isSelected = selectedCategoryId === category.id && !selectedSubcategoryId;
            const progressPct = count.total > 0 ? Math.round((count.completed / count.total) * 100) : 0;

            return (
              <div key={category.id} className="group">
                {/* Main Category Header */}
                <div
                  className={cn(
                    'rounded-lg transition-all duration-150',
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-100 border border-transparent'
                  )}
                >
                  <div className="flex items-center">
                    {hasSubcategories && (
                      <button
                        onClick={() => onToggleCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <div className={cn(
                          "transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectCategory(category.id)}
                      className={cn(
                        'flex-1 flex items-center gap-2 py-2.5 pr-3 text-left',
                        !hasSubcategories && 'pl-3'
                      )}
                    >
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: category.color || '#6B7280' }}
                      />
                      <span className={cn(
                        'flex-1 text-sm font-semibold truncate',
                        isSelected ? 'text-blue-700' : 'text-gray-800'
                      )}>
                        {category.name}
                      </span>
                    </button>
                  </div>
                  
                  {/* Progress Bar - Inside card */}
                  {count.total > 0 && (
                    <div className="px-3 pb-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            getProgressColor(count.completed, count.total)
                          )}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className={cn(
                        'text-xs font-medium tabular-nums min-w-[40px] text-right',
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      )}>
                        {count.completed}/{count.total}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && hasSubcategories && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                    {catSubs.map((subcategory) => {
                      const subCount = subcategoryCounts[subcategory.id] || { total: 0, completed: 0 };
                      const isSubSelected = selectedSubcategoryId === subcategory.id;
                      const subComplete = subCount.total > 0 && subCount.completed === subCount.total;

                      return (
                        <button
                          key={subcategory.id}
                          onClick={() => onSelectSubcategory(subcategory.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150 border-l-2 -ml-[2px]',
                            isSubSelected
                              ? 'bg-blue-50 text-blue-700 border-blue-500 font-medium'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-300'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="truncate">{subcategory.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs tabular-nums',
                              isSubSelected ? 'text-blue-600' : 'text-gray-400'
                            )}>
                              {subCount.completed}/{subCount.total}
                            </span>
                            {subComplete && subCount.total > 0 && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCategorySidebar;
