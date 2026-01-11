import React, { useState, useEffect, useMemo } from 'react';
import { Lock, FileText, Shield, FolderOpen, Download, Eye, Clock, HardDrive, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { AccessLevel } from '@/hooks/useCompanyNDA';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DataRoomDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  status: string | null;
  created_at: string;
  folder_id: string | null;
}

interface DataRoomFolder {
  id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  index_number: string;
}

interface InvestorDataRoomSectionProps {
  dealId: string;
  companyId?: string;
  hasSignedNDA: boolean;
  accessLevel: AccessLevel;
  onOpenNDA: () => void;
  onRequestAccess: () => void;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const getFileIcon = (fileType: string | null) => {
  return <FileText className="w-5 h-5 text-primary" />;
};

export const InvestorDataRoomSection: React.FC<InvestorDataRoomSectionProps> = ({
  dealId,
  companyId,
  hasSignedNDA,
  accessLevel,
  onOpenNDA,
  onRequestAccess
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [folders, setFolders] = useState<DataRoomFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (dealId) {
      fetchData();
    }
  }, [dealId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch folders for this deal
      const { data: foldersData, error: foldersError } = await supabase
        .from('data_room_folders')
        .select('id, name, description, is_required, index_number')
        .eq('deal_id', dealId)
        .order('sort_order', { ascending: true });

      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

      // Fetch documents for this deal
      const { data: docsData, error: docsError } = await supabase
        .from('data_room_documents')
        .select('id, file_name, file_path, file_size, file_type, status, created_at, folder_id')
        .eq('deal_id', dealId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error) {
      console.error('Error fetching data room:', error);
    } finally {
      setLoading(false);
    }
  };

  const folderDocumentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(doc => {
      const folderId = doc.folder_id || 'uncategorized';
      counts[folderId] = (counts[folderId] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const getFolderDocuments = (folderId: string): DataRoomDocument[] => {
    return documents.filter(doc => doc.folder_id === folderId);
  };

  const handleDownload = async (doc: DataRoomDocument) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download documents",
        variant: "destructive"
      });
      return;
    }

    setDownloading(doc.id);
    
    try {
      // Generate signed URL from data-room-documents bucket
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `Downloading ${doc.file_name}`
        });
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (doc: DataRoomDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('data-room-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast({
        title: "View Failed",
        description: error.message || "Failed to view document",
        variant: "destructive"
      });
    }
  };

  // NDA required overlay
  if (!hasSignedNDA) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">
            NDA Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Sign a Non-Disclosure Agreement to access the data room and confidential documents.
          </p>
          <Button onClick={onOpenNDA} size="lg" className="gap-2">
            <Shield className="w-4 h-4" />
            Review & Sign NDA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-16 text-center text-muted-foreground">
          Loading data room...
        </CardContent>
      </Card>
    );
  }

  // Show file list view if a folder is selected
  if (selectedFolder) {
    const folder = folders.find(f => f.id === selectedFolder);
    const folderDocs = getFolderDocuments(selectedFolder);
    const totalSize = folderDocs.reduce((acc, doc) => acc + (doc.file_size || 0), 0);

    return (
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedFolder(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Data Room
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{folder?.name || 'Documents'}</span>
        </div>

        {/* Folder Info Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                {folder?.name || 'Documents'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {folderDocs.length} files
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                {formatFileSize(totalSize)} total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {folderDocs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No files in this folder</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folderDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.file_type)}
                          <span className="truncate">{doc.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(doc.created_at), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleView(doc)}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            disabled={downloading === doc.id}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main folder grid view
  return (
    <div className="space-y-6">
      {/* Access Level Banner */}
      <Card className="bg-card border-border">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Your Access Level</h3>
              <p className="text-sm text-muted-foreground">
                {accessLevel === 'public' && 'You have access to public documents only'}
                {accessLevel === 'teaser' && 'You have access to teaser and public documents'}
                {accessLevel === 'cim' && 'You have access to CIM, teaser, and public documents'}
                {accessLevel === 'financials' && 'You have access to financial documents and below'}
                {accessLevel === 'full' && 'You have full access to all documents'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg py-1 px-3 capitalize">
                {accessLevel}
              </Badge>
              {accessLevel !== 'full' && (
                <Button variant="outline" size="sm" onClick={onRequestAccess}>
                  Request Higher Access
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folder Grid */}
      {folders.length === 0 && documents.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Documents Available
            </h3>
            <p className="text-muted-foreground">
              Documents will appear here once uploaded by the broker.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map(folder => {
            const docCount = folderDocumentCounts[folder.id] || 0;
            
            return (
              <Card 
                key={folder.id}
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-primary" />
                    </div>
                    {folder.is_required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{folder.name}</h3>
                  {folder.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{folder.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{docCount} {docCount === 1 ? 'file' : 'files'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
