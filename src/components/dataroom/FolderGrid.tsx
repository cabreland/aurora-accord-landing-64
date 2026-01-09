import React, { useMemo } from 'react';
import { 
  DollarSign, 
  BarChart3, 
  Scale, 
  PieChart, 
  FileText, 
  FolderOpen 
} from 'lucide-react';
import { FolderCard, FolderData } from './FolderCard';
import { AccessLevel } from '@/hooks/useCompanyNDA';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  confidentiality_level: AccessLevel;
  tag?: string;
}

interface FolderGridProps {
  documents: Document[];
  accessLevel: AccessLevel;
  hasSignedNDA: boolean;
  onOpenFolder: (folderId: string) => void;
  onRequestNDA: () => void;
}

// Define folder configurations
const FOLDER_CONFIG: Record<string, {
  name: string;
  icon: React.ReactNode;
  accessLevels: AccessLevel[];
  requiresNDA: boolean;
}> = {
  financial: {
    name: 'Financial Documents',
    icon: <DollarSign className="w-7 h-7" />,
    accessLevels: ['financials', 'full'],
    requiresNDA: true
  },
  operations: {
    name: 'Operations & Metrics',
    icon: <BarChart3 className="w-7 h-7" />,
    accessLevels: ['public', 'teaser', 'cim', 'financials', 'full'],
    requiresNDA: false
  },
  legal: {
    name: 'Legal & Compliance',
    icon: <Scale className="w-7 h-7" />,
    accessLevels: ['cim', 'financials', 'full'],
    requiresNDA: true
  },
  marketing: {
    name: 'Marketing & Analytics',
    icon: <PieChart className="w-7 h-7" />,
    accessLevels: ['public', 'teaser', 'cim', 'financials', 'full'],
    requiresNDA: false
  },
  pitch: {
    name: 'Pitch & Overview',
    icon: <FileText className="w-7 h-7" />,
    accessLevels: ['teaser', 'cim', 'financials', 'full'],
    requiresNDA: true
  },
  cim: {
    name: 'Confidential Memorandum',
    icon: <FolderOpen className="w-7 h-7" />,
    accessLevels: ['cim', 'financials', 'full'],
    requiresNDA: true
  }
};

// Map document tags/levels to folder categories
const mapDocumentToFolder = (doc: Document): string => {
  // First try by tag
  if (doc.tag) {
    const tagLower = doc.tag.toLowerCase();
    if (tagLower.includes('financial') || tagLower === 'financial') return 'financial';
    if (tagLower.includes('legal') || tagLower === 'legal') return 'legal';
    if (tagLower.includes('pitch') || tagLower === 'pitch') return 'pitch';
    if (tagLower.includes('cim') || tagLower === 'cim') return 'cim';
    if (tagLower.includes('marketing') || tagLower.includes('analytics')) return 'marketing';
    if (tagLower.includes('operations') || tagLower.includes('metrics')) return 'operations';
  }

  // Fall back to confidentiality level
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

export const FolderGrid: React.FC<FolderGridProps> = ({
  documents,
  accessLevel,
  hasSignedNDA,
  onOpenFolder,
  onRequestNDA
}) => {
  // Group documents into folders
  const folders = useMemo((): FolderData[] => {
    const grouped: Record<string, Document[]> = {};
    
    documents.forEach(doc => {
      const folderId = mapDocumentToFolder(doc);
      if (!grouped[folderId]) {
        grouped[folderId] = [];
      }
      grouped[folderId].push(doc);
    });

    // Create folder objects
    return Object.entries(FOLDER_CONFIG)
      .filter(([id]) => grouped[id]?.length > 0)
      .map(([id, config]) => {
        const folderDocs = grouped[id] || [];
        const lastDoc = folderDocs.reduce((latest, doc) => {
          const docDate = new Date(doc.created_at);
          return !latest || docDate > latest ? docDate : latest;
        }, null as Date | null);

        return {
          id,
          name: config.name,
          icon: config.icon,
          fileCount: folderDocs.length,
          lastUpdated: lastDoc,
          requiresNDA: config.requiresNDA,
          accessLevel: config.accessLevels[0] as FolderData['accessLevel']
        };
      });
  }, [documents]);

  // Check if user has access to a folder
  const hasAccessToFolder = (folder: FolderData): boolean => {
    if (!folder.requiresNDA) return true;
    if (!hasSignedNDA) return false;
    
    const hierarchy: AccessLevel[] = ['public', 'teaser', 'cim', 'financials', 'full'];
    return hierarchy.indexOf(accessLevel) >= hierarchy.indexOf(folder.accessLevel);
  };

  if (folders.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Documents Available
        </h3>
        <p className="text-muted-foreground">
          Documents will appear here once uploaded by the broker.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {folders.map(folder => (
        <FolderCard
          key={folder.id}
          folder={folder}
          hasAccess={hasAccessToFolder(folder)}
          onOpen={onOpenFolder}
          onRequestAccess={onRequestNDA}
        />
      ))}
    </div>
  );
};
