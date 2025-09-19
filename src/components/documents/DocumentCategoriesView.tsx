import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CategoryUploadSection from './CategoryUploadSection';
import DocumentList from './DocumentList';
import { 
  Shield,
  DollarSign,
  Scale,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  tag: string;
  created_at: string;
  uploaded_by: string;
  version: number;
}

interface DocumentCategoriesViewProps {
  dealId: string;
  onRefresh?: () => void;
}

const DOCUMENT_CATEGORIES = {
  cim: {
    key: 'cim',
    label: 'Confidential Information Memorandum',
    description: 'Comprehensive business overview for qualified buyers',
    icon: Shield,
    required: true,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    maxFiles: 1
  },
  financials: {
    key: 'financials',
    label: 'Financial Statements',
    description: 'Last 3 years P&L, balance sheets, cash flow statements',
    icon: DollarSign,
    required: true,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    maxFiles: 10
  },
  legal: {
    key: 'legal',
    label: 'Legal Documentation',
    description: 'Articles of incorporation, key contracts, IP documentation',
    icon: Scale,
    required: true,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    maxFiles: 20
  },
  due_diligence: {
    key: 'due_diligence',
    label: 'Due Diligence Package',
    description: 'Customer lists, vendor agreements, operational details',
    icon: FileText,
    required: true,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    maxFiles: 15
  },
  nda: {
    key: 'nda',
    label: 'Non-Disclosure Agreement',
    description: 'Mutual NDA templates and signed agreements',
    icon: Shield,
    required: false,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    maxFiles: 5
  },
  buyer_notes: {
    key: 'buyer_notes',
    label: 'Buyer Information',
    description: 'Buyer profiles, LOIs, and communication records',
    icon: Users,
    required: false,
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    maxFiles: 10
  },
  other: {
    key: 'other',
    label: 'Additional Documents',
    description: 'Supporting materials and miscellaneous files',
    icon: FileText,
    required: false,
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    maxFiles: 20
  }
};

const DocumentCategoriesView = ({ dealId, onRefresh }: DocumentCategoriesViewProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (dealId && dealId !== 'all') {
      fetchDocuments();
    } else {
      setDocuments([]);
      setIsLoading(false);
    }
  }, [dealId]);

  const fetchDocuments = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      // Force refresh by adding timestamp to bypass any caching
      let query = supabase
        .from('documents')
        .select('*')
        .eq('deal_id', dealId);
        
      if (forceRefresh) {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
      
      console.log(`Fetched ${data?.length || 0} documents for deal ${dealId}`);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentChange = () => {
    fetchDocuments(true); // Force refresh after changes
    onRefresh?.();
  };

  const getCategoryDocuments = (categoryKey: string) => {
    return documents.filter(doc => doc.tag === categoryKey);
  };

  const getCompletionStats = () => {
    const requiredCategories = Object.values(DOCUMENT_CATEGORIES).filter(cat => cat.required);
    const completedRequired = requiredCategories.filter(cat => 
      getCategoryDocuments(cat.key).length > 0
    ).length;
    
    return {
      completed: completedRequired,
      total: requiredCategories.length,
      percentage: Math.round((completedRequired / requiredCategories.length) * 100)
    };
  };

  if (dealId === 'all') {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Documents Across Companies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DocumentList
            dealId="all"
            canDownload={true}
            canDelete={true}
            refreshTrigger={0}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading document categories...</p>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="space-y-4">
      {/* Simplified Progress Overview */}
      <div className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {stats.total - stats.completed > 0 
              ? `${stats.total - stats.completed} documents required`
              : 'All required documents complete'
            }
          </span>
        </div>
        <div className="flex-1 max-w-xs">
          <Progress value={stats.percentage} className="h-2" />
        </div>
        {stats.percentage < 100 && (
          <span className="text-sm text-muted-foreground">{stats.completed}/{stats.total}</span>
        )}
      </div>

      {/* Compact Document Categories */}
      <div className="grid gap-3">
        {Object.values(DOCUMENT_CATEGORIES).map((category) => {
          const categoryDocs = getCategoryDocuments(category.key);
          
          return (
            <CategoryUploadSection
              key={category.key}
              category={category}
              documents={categoryDocs}
              dealId={dealId}
              onUploadComplete={handleDocumentChange}
              onDocumentDeleted={handleDocumentChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DocumentCategoriesView;