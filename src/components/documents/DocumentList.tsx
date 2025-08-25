import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DocumentPreview from './DocumentPreview';
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image, 
  File,
  SortAsc,
  SortDesc,
  Building2
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

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
  deal_id: string;
  // Join fields for global view
  deal?: {
    id: string;
    title: string;
    company_name: string;
  };
}

interface DocumentListProps {
  dealId: string; // Can be 'all' for global view
  canDownload?: boolean;
  canDelete?: boolean;
  refreshTrigger?: number;
}

const documentTags = [
  { value: 'all', label: 'All Documents' },
  { value: 'cim', label: 'CIM' },
  { value: 'nda', label: 'NDA' },
  { value: 'financials', label: 'Financials' },
  { value: 'buyer_notes', label: 'Buyer Notes' },
  { value: 'legal', label: 'Legal' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'other', label: 'Other' }
];

const DocumentList = ({ dealId, canDownload = true, canDelete = false, refreshTrigger = 0 }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const isGlobalView = dealId === 'all' || !dealId;

  useEffect(() => {
    fetchDocuments();
  }, [dealId, refreshTrigger]);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, debouncedSearchTerm, selectedTag, sortBy, sortOrder]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('documents')
        .select(`
          id, name, file_path, file_size, file_type, tag, created_at, uploaded_by, version, deal_id,
          deal:deals(id, title, company_name)
        `);

      // Apply deal filter if not global view
      if (!isGlobalView) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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

  const filterAndSortDocuments = () => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (isGlobalView && doc.deal?.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (isGlobalView && doc.deal?.company_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      const matchesTag = selectedTag === 'all' || doc.tag === selectedTag;
      return matchesSearch && matchesTag;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'size':
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
  };

  const handleDelete = async (documentId: string) => {
    if (!canDelete) return;

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
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: Document) => {
    if (!canDownload) return;

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

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="w-4 h-4" />;
    
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 text-green-400" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-400" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-4 h-4 text-blue-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'cim': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'nda': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'financials': 'bg-green-500/20 text-green-400 border-green-500/30',
      'buyer_notes': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'legal': 'bg-red-500/20 text-red-400 border-red-500/30',
      'due_diligence': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'other': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[tag] || colors.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleSort = (field: 'name' | 'date' | 'size') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'date' | 'size') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isGlobalView ? "Search documents, deals, companies..." : "Search documents..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-48 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTags.map((tag) => (
                <SelectItem key={tag.value} value={tag.value}>
                  {tag.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSort('name')}
                      className="font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Name {getSortIcon('name')}
                    </Button>
                  </th>
                  {isGlobalView && (
                    <th className="p-4 hidden lg:table-cell">
                      <span className="font-semibold text-muted-foreground">Deal</span>
                    </th>
                  )}
                  <th className="p-4 hidden sm:table-cell">
                    <span className="font-semibold text-muted-foreground">Type</span>
                  </th>
                  <th className="p-4 hidden md:table-cell">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSort('size')}
                      className="font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Size {getSortIcon('size')}
                    </Button>
                  </th>
                  <th className="p-4 hidden lg:table-cell">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSort('date')}
                      className="font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Date {getSortIcon('date')}
                    </Button>
                  </th>
                  <th className="p-4">
                    <span className="font-semibold text-muted-foreground">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="border-b border-border hover:bg-muted/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(document.file_type)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {document.name}
                          </p>
                          <div className="text-sm text-muted-foreground sm:hidden">
                            v{document.version} • {formatDate(document.created_at)}
                            {isGlobalView && document.deal && (
                              <div className="text-xs">{document.deal.title}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {isGlobalView && (
                      <td className="p-4 hidden lg:table-cell">
                        {document.deal && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-foreground text-sm">{document.deal.title}</div>
                              <div className="text-xs text-muted-foreground">{document.deal.company_name}</div>
                            </div>
                          </div>
                        )}
                      </td>
                    )}
                    
                    <td className="p-4 hidden sm:table-cell">
                      <Badge variant="outline" className={getTagColor(document.tag)}>
                        {document.tag.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {document.file_size ? formatFileSize(document.file_size) : 'Unknown'}
                      </span>
                    </td>
                    
                    <td className="p-4 hidden lg:table-cell">
                      <div className="text-sm text-muted-foreground">
                        <div>{formatDate(document.created_at)}</div>
                        <div className="text-xs">v{document.version}</div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {canDownload && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(document.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          canDownload={canDownload}
        />
      )}
    </>
  );
};

export default DocumentList;
