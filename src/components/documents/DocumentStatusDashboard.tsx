import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Upload,
  Download,
  Eye,
  Trash2,
  FileText,
  Shield,
  DollarSign,
  Scale,
  Users,
  Plus
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import EnhancedUploadDialog from './EnhancedUploadDialog';

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

interface DocumentStatusDashboardProps {
  dealId: string;
  onRefresh?: () => void;
}

const DOCUMENT_CATEGORIES = {
  cim: {
    label: 'Confidential Information Memorandum',
    icon: Shield,
    required: true,
    description: 'Comprehensive business overview for qualified buyers',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  financials: {
    label: 'Financial Statements',
    icon: DollarSign,
    required: true,
    description: 'Last 3 years P&L, balance sheets, cash flow statements',
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  legal: {
    label: 'Legal Documentation',
    icon: Scale,
    required: true,
    description: 'Articles of incorporation, key contracts, IP documentation',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  due_diligence: {
    label: 'Due Diligence Package',
    icon: FileText,
    required: true,
    description: 'Customer lists, vendor agreements, operational details',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  nda: {
    label: 'Non-Disclosure Agreement',
    icon: Shield,
    required: false,
    description: 'Mutual NDA templates and signed agreements',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  buyer_notes: {
    label: 'Buyer Information',
    icon: Users,
    required: false,
    description: 'Buyer profiles, LOIs, and communication records',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  other: {
    label: 'Additional Documents',
    icon: FileText,
    required: false,
    description: 'Supporting materials and miscellaneous files',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
};

const DocumentStatusDashboard = ({ dealId, onRefresh }: DocumentStatusDashboardProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (dealId && dealId !== 'all') {
      fetchDocuments();
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

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      fetchDocuments();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = () => {
    fetchDocuments();
    onRefresh?.();
    setShowUploadDialog(false);
    setSelectedCategory('');
  };

  const getCategoryDocuments = (category: string) => {
    return documents.filter(doc => doc.tag === category);
  };

  const getCategoryStatus = (category: string, isRequired: boolean) => {
    const docs = getCategoryDocuments(category);
    if (docs.length === 0) {
      return isRequired ? 'missing' : 'optional';
    }
    return 'complete';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'optional':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCompletionPercentage = () => {
    const requiredCategories = Object.entries(DOCUMENT_CATEGORIES).filter(([_, config]) => config.required);
    const completedRequired = requiredCategories.filter(([category]) => 
      getCategoryStatus(category, true) === 'complete'
    ).length;
    return Math.round((completedRequired / requiredCategories.length) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading document status...</p>
      </div>
    );
  }

  if (dealId === 'all') {
    return null; // This dashboard is only for specific deals
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <>
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Document Completion Status</CardTitle>
              <Badge variant="outline" className={
                completionPercentage === 100 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : completionPercentage >= 75 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }>
                {completionPercentage}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="h-3 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {Object.entries(DOCUMENT_CATEGORIES).filter(([category, config]) => 
                    config.required && getCategoryStatus(category, true) === 'complete'
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">Required Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {Object.entries(DOCUMENT_CATEGORIES).filter(([category, config]) => 
                    config.required && getCategoryStatus(category, true) === 'missing'
                  ).length}
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
        <div className="grid gap-4">
          {Object.entries(DOCUMENT_CATEGORIES).map(([category, config]) => {
            const categoryDocs = getCategoryDocuments(category);
            const status = getCategoryStatus(category, config.required);
            const Icon = config.icon;

            return (
              <Card key={category} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <CardTitle className="text-base text-foreground">
                          {config.label}
                          {config.required && (
                            <Badge variant="outline" className="ml-2 text-xs bg-red-500/20 text-red-400 border-red-500/30">
                              Required
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowUploadDialog(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {categoryDocs.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {config.required ? 'Required documents missing' : 'No documents uploaded'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categoryDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-primary" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">{doc.name}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}</span>
                                <span>v{doc.version}</span>
                                <span>{formatDate(doc.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <EnhancedUploadDialog
        isOpen={showUploadDialog}
        onClose={() => {
          setShowUploadDialog(false);
          setSelectedCategory('');
        }}
        onUploadComplete={handleUploadComplete}
        selectedDealId={dealId}
        selectedCategory={selectedCategory}
      />
    </>
  );
};

export default DocumentStatusDashboard;