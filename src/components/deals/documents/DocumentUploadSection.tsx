import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadSectionProps {
  dealId: string;
  onUploadComplete: () => void;
}

export const DocumentUploadSection = ({ dealId, onUploadComplete }: DocumentUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<'pitch' | 'cim' | 'financial' | 'legal'>('cim');
  const [dragActive, setDragActive] = useState(false);

  // Map tags to confidentiality levels
  const getConfidentialityLevel = (tag: string) => {
    const mapping: Record<string, string> = {
      'pitch': 'teaser',
      'cim': 'cim',
      'financial': 'financials',
      'legal': 'full'
    };
    return mapping[tag] || 'cim';
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to upload documents');
        return;
      }

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${dealId}/${Date.now()}-${file.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          deal_id: dealId,
          name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          tag: selectedTag as any,
          confidentiality_level: getConfidentialityLevel(selectedTag),
          uploaded_by: user.id
        }]);

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      onUploadComplete();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Category Selection */}
        <div className="space-y-2">
          <Label>Document Category</Label>
          <Select value={selectedTag} onValueChange={(value: any) => setSelectedTag(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pitch">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Pitch Deck</span>
                  <span className="text-xs text-muted-foreground">Teaser access level</span>
                </div>
              </SelectItem>
              <SelectItem value="cim">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Confidential Information Memorandum</span>
                  <span className="text-xs text-muted-foreground">CIM access level</span>
                </div>
              </SelectItem>
              <SelectItem value="financial">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Financial Documents</span>
                  <span className="text-xs text-muted-foreground">Financials access level</span>
                </div>
              </SelectItem>
              <SelectItem value="legal">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Legal Documents</span>
                  <span className="text-xs text-muted-foreground">Full access level</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, XLSX, CSV files accepted
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Select File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
