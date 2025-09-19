
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDocumentExport } from '@/hooks/useDocumentExport';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw,
  Building2,
  FileArchive,
  Eye,
  Package
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company_name: string;
}

interface DocumentsToolbarProps {
  onDealSelect: (dealId: string) => void;
  selectedDealId: string;
}

interface PreviewDocument {
  id: string;
  name: string;
  file_type: string;
  created_at: string;
  tag: string;
}

const DocumentsToolbar = ({ onDealSelect, selectedDealId }: DocumentsToolbarProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocuments, setPreviewDocuments] = useState<PreviewDocument[]>([]);
  const { toast } = useToast();
  
  const { 
    isExporting, 
    progress, 
    exportAllDocuments, 
    previewAllDocuments, 
    downloadZip 
  } = useDocumentExport({ 
    dealId: selectedDealId !== 'all' ? selectedDealId : undefined 
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, company_name')
        .order('title');

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDeals();
    window.location.reload();
  };

  const handlePreviewAll = async () => {
    const documents = await previewAllDocuments();
    setPreviewDocuments(documents);
    setShowPreview(true);
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedDealId} onValueChange={onDealSelect}>
              <SelectTrigger className="w-full sm:w-64 bg-background border-border">
                <SelectValue placeholder="Filter by deal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deals</SelectItem>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{deal.title}</span>
                      <span className="text-xs text-muted-foreground">{deal.company_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedDealId && selectedDealId !== 'all' && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Filter className="w-3 h-3 mr-1" />
                Filtered
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllDocuments}
              disabled={isExporting}
              className="border-border hover:bg-muted"
            >
              <Download className="w-4 h-4 mr-1" />
              Export All
            </Button>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewAll}
                  className="border-border hover:bg-muted"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Document Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {previewDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.tag} • {doc.file_type} • {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">{doc.tag}</Badge>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadZip}
              disabled={isExporting}
              className="border-border hover:bg-muted"
            >
              <FileArchive className="w-4 h-4 mr-1" />
              Download ZIP
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-border hover:bg-muted"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Export Progress */}
        {progress && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progress.current}/{progress.total}</span>
            </div>
            <Progress 
              value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsToolbar;
