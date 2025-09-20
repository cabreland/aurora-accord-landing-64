import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Upload, 
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  DollarSign,
  Scale,
  Users,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CategoryUploadSection from './CategoryUploadSection';

interface Document {
  id: string;
  name: string;
  tag: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  uploaded_by: string;
  version: number;
}

interface DocumentStatusPanelProps {
  companyId: string;
  companyName: string;
}

const DOCUMENT_CATEGORIES = {
  cim: {
    key: 'cim',
    label: 'CIM',
    description: 'Confidential Information Memorandum',
    icon: Shield,
    required: true,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    maxFiles: 1
  },
  financials: {
    key: 'financials',
    label: 'Financials',
    description: 'Financial Statements & Reports',
    icon: DollarSign,
    required: true,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    maxFiles: 10
  },
  legal: {
    key: 'legal',
    label: 'Legal',
    description: 'Legal Documentation',
    icon: Scale,
    required: true,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    maxFiles: 20
  },
  due_diligence: {
    key: 'due_diligence',
    label: 'Due Diligence',
    description: 'DD Package & Operational Details',
    icon: FileText,
    required: true,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    maxFiles: 15
  },
  nda: {
    key: 'nda',
    label: 'NDA',
    description: 'Non-Disclosure Agreements',
    icon: Shield,
    required: false,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    maxFiles: 5
  },
  buyer_notes: {
    key: 'buyer_notes',
    label: 'Buyer Info',
    description: 'Buyer Profiles & Communications',
    icon: Users,
    required: false,
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    maxFiles: 10
  }
};

const DocumentStatusPanel = ({ companyId, companyName }: DocumentStatusPanelProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      fetchDocuments();
      
      // Subscribe to real-time document changes
      const channel = supabase
        .channel('document-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `deal_id=eq.${companyId}`
          },
          (payload) => {
            console.log('Document changed:', payload);
            // Refresh documents when any change occurs
            fetchDocuments(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [companyId]);

  const fetchDocuments = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('deal_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      
      console.log(`Fetched ${data?.length || 0} documents for company ${companyId}`);
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
    // Force refresh after document changes
    fetchDocuments(true);
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`;
  };

  const handleExportAll = async () => {
    // TODO: Implement export functionality
    toast({
      title: "Export Started",
      description: "Preparing documents for download...",
    });
  };

  const handleDownloadZip = async () => {
    // TODO: Implement ZIP download functionality
    toast({
      title: "Download Started",
      description: "Creating ZIP file...",
    });
  };

  const stats = getCompletionStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-card border-border animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Company Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {companyName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Document Management Overview
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border"
                onClick={handleExportAll}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Completion Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.completed}/{stats.total} Categories
                </span>
              </div>
              <Progress value={stats.percentage} className="h-2" />
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {stats.percentage}%
              </div>
              <div className="text-xs text-muted-foreground">
                Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid gap-3">
        {Object.values(DOCUMENT_CATEGORIES).map((category) => {
          const categoryDocs = getCategoryDocuments(category.key);
          const hasDocuments = categoryDocs.length > 0;
          const IconComponent = category.icon;
          const isExpanded = expandedCategory === category.key;
          
          return (
            <Card key={category.key} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">
                            {category.label}
                          </h3>
                          {category.required && (
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-red-500/20 text-red-400 border-red-500/30">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                        
                        {categoryDocs.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {categoryDocs.slice(0, 2).map((doc) => (
                              <div key={doc.id} className="flex items-center gap-2 text-xs">
                                <FileText className="w-3 h-3 text-muted-foreground" />
                                <span className="text-foreground truncate max-w-[200px]">
                                  {doc.name}
                                </span>
                                <span className="text-muted-foreground">
                                  ({formatFileSize(doc.file_size)})
                                </span>
                              </div>
                            ))}
                            {categoryDocs.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{categoryDocs.length - 2} more files
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {hasDocuments ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            {categoryDocs.length} file{categoryDocs.length !== 1 ? 's' : ''}
                          </Badge>
                        </>
                      ) : (
                        <>
                          {category.required ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                          <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
                            {category.required ? 'Missing' : 'Optional'}
                          </Badge>
                        </>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
                      >
                        <Plus className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  {/* Upload Section */}
                  {isExpanded && (
                    <div className="border-t border-border pt-3">
                      <CategoryUploadSection
                        category={category}
                        documents={categoryDocs}
                        dealId={companyId}
                        onUploadComplete={() => handleDocumentChange()}
                        onDocumentDeleted={(_id) => handleDocumentChange()}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Quick Actions</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Eye className="w-4 h-4 mr-2" />
                Preview All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border"
                onClick={handleDownloadZip}
              >
                <Download className="w-4 h-4 mr-2" />
                Download ZIP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentStatusPanel;