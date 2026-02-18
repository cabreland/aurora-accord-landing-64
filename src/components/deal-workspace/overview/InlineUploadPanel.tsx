import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  Loader2,
  ChevronDown,
  ChevronUp,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataRoom } from '@/hooks/useDataRoom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InlineUploadPanelProps {
  dealId: string;
  onClose: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  folderId: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const InlineUploadPanel: React.FC<InlineUploadPanelProps> = ({ dealId, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { folders } = useDataRoom({ dealId });
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('none');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
      folderId: selectedFolderId === 'none' ? null : selectedFolderId,
    }));
    setUploadQueue(prev => [...prev, ...newFiles]);
  }, [selectedFolderId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 20 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setUploadQueue(prev => prev.filter(f => f.id !== id));
  };

  const updateFileFolderId = (id: string, folderId: string | null) => {
    setUploadQueue(prev => prev.map(f => f.id === id ? { ...f, folderId } : f));
  };

  const handleUploadAll = async () => {
    if (!user || uploadQueue.length === 0) return;
    
    setIsUploading(true);
    let successCount = 0;

    for (const item of uploadQueue) {
      if (item.status === 'done') continue;

      setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading', progress: 10 } : f));

      try {
        const fileName = `${dealId}/${Date.now()}-${item.file.name}`;
        
        const { error: storageError } = await supabase.storage
          .from('data-room-documents')
          .upload(fileName, item.file);

        if (storageError) throw storageError;

        setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, progress: 70 } : f));

        const { error: dbError } = await supabase
          .from('data_room_documents')
          .insert({
            deal_id: dealId,
            file_name: item.file.name,
            file_path: fileName,
            file_size: item.file.size,
            file_type: item.file.type,
            mime_type: item.file.type,
            folder_id: item.folderId || null,
            uploaded_by: user.id,
            status: 'pending_review',
          });

        if (dbError) throw dbError;

        setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done', progress: 100 } : f));
        successCount++;
      } catch (err: any) {
        console.error('Upload error:', err);
        setUploadQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', progress: 0 } : f));
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ['data-room', dealId] });
      
      // Auto-close after a short delay if all succeeded
      if (successCount === uploadQueue.filter(f => f.status !== 'done').length) {
        setTimeout(onClose, 1500);
      }
    }
  };

  const pendingCount = uploadQueue.filter(f => f.status === 'pending').length;
  const doneCount = uploadQueue.filter(f => f.status === 'done').length;

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4 text-primary" />
            Quick Upload
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Drop files here to upload directly to the data room without leaving this page.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Folder Selector */}
        <div className="flex items-center gap-3">
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <Select
              value={selectedFolderId}
              onValueChange={setSelectedFolderId}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select a folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder (Unassigned)</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.index_number} — {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-primary font-medium">Drop files here…</p>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">Click to browse or drag files here</p>
              <p className="text-xs text-muted-foreground mt-1">Any file type · Max 20MB per file</p>
            </div>
          )}
        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="space-y-2">
            {uploadQueue.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-background border">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1 mt-1" />
                  )}
                </div>
                {/* Per-file folder override */}
                <Select
                  value={item.folderId || 'none'}
                  onValueChange={(v) => updateFileFolderId(item.id, v === 'none' ? null : v)}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue placeholder="Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {folders.slice(0, 10).map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {item.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : item.status === 'uploading' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {uploadQueue.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {doneCount > 0 ? `${doneCount} uploaded · ` : ''}
              {pendingCount} pending
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setUploadQueue([])}>
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleUploadAll}
                disabled={isUploading || pendingCount === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
