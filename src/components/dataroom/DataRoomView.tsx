import React, { useState, useEffect, useMemo } from 'react';
import { Lock, FileText, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FolderGrid } from './FolderGrid';
import { FileListView } from './FileListView';
import { AccessLevel } from '@/hooks/useCompanyNDA';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  confidentiality_level: AccessLevel;
  tag?: string;
  uploaded_by?: string;
}

interface DataRoomViewProps {
  dealId: string;
  companyId?: string;
  hasSignedNDA: boolean;
  accessLevel: AccessLevel;
  onOpenNDA: () => void;
  onRequestAccess: () => void;
}

// Folder configurations with access requirements
const FOLDER_CONFIG: Record<string, {
  name: string;
  accessLevels: AccessLevel[];
}> = {
  financial: {
    name: 'Financial Documents',
    accessLevels: ['financials', 'full']
  },
  operations: {
    name: 'Operations & Metrics',
    accessLevels: ['public', 'teaser', 'cim', 'financials', 'full']
  },
  legal: {
    name: 'Legal & Compliance',
    accessLevels: ['cim', 'financials', 'full']
  },
  marketing: {
    name: 'Marketing & Analytics',
    accessLevels: ['public', 'teaser', 'cim', 'financials', 'full']
  },
  pitch: {
    name: 'Pitch & Overview',
    accessLevels: ['teaser', 'cim', 'financials', 'full']
  },
  cim: {
    name: 'Confidential Memorandum',
    accessLevels: ['cim', 'financials', 'full']
  }
};

// Map document to folder category
const mapDocumentToFolder = (doc: Document): string => {
  if (doc.tag) {
    const tagLower = doc.tag.toLowerCase();
    if (tagLower.includes('financial') || tagLower === 'financial') return 'financial';
    if (tagLower.includes('legal') || tagLower === 'legal') return 'legal';
    if (tagLower.includes('pitch') || tagLower === 'pitch') return 'pitch';
    if (tagLower.includes('cim') || tagLower === 'cim') return 'cim';
    if (tagLower.includes('marketing') || tagLower.includes('analytics')) return 'marketing';
    if (tagLower.includes('operations') || tagLower.includes('metrics')) return 'operations';
  }

  switch (doc.confidentiality_level) {
    case 'financials':
      return 'financial';
    case 'full':
      return 'legal';
    case 'cim':
      return 'cim';
    case 'teaser':
      return 'pitch';
    case 'public':
      return 'operations';
    default:
      return 'operations';
  }
};

export const DataRoomView: React.FC<DataRoomViewProps> = ({
  dealId,
  companyId,
  hasSignedNDA,
  accessLevel,
  onOpenNDA,
  onRequestAccess
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, file_path, file_size, created_at, confidentiality_level, tag, uploaded_by')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get documents for a specific folder
  const getFolderDocuments = (folderId: string): Document[] => {
    return documents.filter(doc => mapDocumentToFolder(doc) === folderId);
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
    const folderConfig = FOLDER_CONFIG[selectedFolder];
    return (
      <FileListView
        folderName={folderConfig?.name || 'Documents'}
        documents={getFolderDocuments(selectedFolder)}
        onBack={() => setSelectedFolder(null)}
      />
    );
  }

  // Main folder grid view
  return (
    <div className="space-y-6">
      {/* Access Level Banner */}
      <Card className="bg-card border-border">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
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
      <FolderGrid
        documents={documents}
        accessLevel={accessLevel}
        hasSignedNDA={hasSignedNDA}
        onOpenFolder={setSelectedFolder}
        onRequestNDA={onOpenNDA}
      />
    </div>
  );
};
