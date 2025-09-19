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

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
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
    fetchDocuments();
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
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Document Completion Overview</CardTitle>
            <Badge variant="outline" className={
              stats.percentage === 100 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : stats.percentage >= 75 
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }>
              {stats.percentage}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={stats.percentage} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stats.completed}
              </div>
              <div className="text-sm text-muted-foreground">Required Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {stats.total - stats.completed}
              </div>
              <div className="text-sm text-muted-foreground">Required Missing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {documents.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid gap-6">
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