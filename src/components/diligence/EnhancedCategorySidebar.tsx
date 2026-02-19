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
    if (total === 0) return 'bg-muted';
    const pct = (completed / total) * 100;
    if (pct >= 70) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getCategoryProgressIndicator = (categoryId: string) => {
    const count = categoryCounts[categoryId] || { total: 0, completed: 0 };
    if (count.total === 0) return null;
    
    const pct = (count.completed / count.total) * 100;
    
    if (pct === 100) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    } else if (pct > 0) {
      return <div className="w-2 h-2 rounded-full bg-warning" />;
    } else {
      return <div className="w-2 h-2 rounded-full bg-destructive" />;
    }
  };

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
              ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm'
              : 'text-foreground hover:bg-muted'
          )}
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            <span className="font-medium">All Requests</span>
          </div>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {totalRequests}
          </Badge>
        </button>

        <div className="h-px bg-border my-3" />

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
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : 'hover:bg-muted border border-transparent'
                  )}
                >
                  <div className="flex items-center">
                    {hasSubcategories && (
                      <button
                        onClick={() => onToggleCategory(category.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
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
                        style={{ color: category.color || undefined }}
                      />
                      <span className={cn(
                        'flex-1 text-sm font-semibold truncate',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {category.name}
                      </span>
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  {count.total > 0 && (
                    <div className="px-3 pb-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
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
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {count.completed}/{count.total}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && hasSubcategories && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-border pl-3">
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
                              ? 'bg-primary/10 text-primary border-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-border'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span className="truncate">{subcategory.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs tabular-nums',
                              isSubSelected ? 'text-primary' : 'text-muted-foreground'
                            )}>
                              {subCount.completed}/{subCount.total}
                            </span>
                            {subComplete && subCount.total > 0 && (
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
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
