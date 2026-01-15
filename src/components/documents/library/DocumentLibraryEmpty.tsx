import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Upload, ArrowRight } from 'lucide-react';

interface DocumentLibraryEmptyProps {
  type: 'recent' | 'deals';
}

export function DocumentLibraryEmpty({ type }: DocumentLibraryEmptyProps) {
  const navigate = useNavigate();
  
  if (type === 'recent') {
    return (
      <Card className="p-8 bg-card border-border border-dashed">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">No Documents Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-4">
            Documents will appear here once they're uploaded to your deals. 
            Start by creating a deal and adding documents.
          </p>
          <Button onClick={() => navigate('/deals')} variant="outline">
            Go to Deals
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-8 bg-card border-border border-dashed">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">No Deals with Documents</h3>
        <p className="text-muted-foreground text-sm max-w-md mb-4">
          Create a deal and upload documents to see them organized here by company.
        </p>
        <Button onClick={() => navigate('/deals')} variant="outline">
          View Deals
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
