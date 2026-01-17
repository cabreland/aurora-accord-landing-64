import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface DataRoomUploadZoneProps {
  folderName: string;
  onUpload: (file: File) => Promise<unknown>;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain', // .txt
  'text/rtf', // .rtf
  'application/rtf', // .rtf (alternate)
  'application/vnd.oasis.opendocument.text', // .odt
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DataRoomUploadZone: React.FC<DataRoomUploadZoneProps> = ({
  folderName,
  onUpload,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_TYPES,
}) => {
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const processUpload = async (file: File, id: string) => {
    setUploadQueue((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 30 } : f))
    );

    try {
      await onUpload(file);
      setUploadQueue((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'success', progress: 100 } : f))
      );
    } catch (err) {
      setUploadQueue((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'error', error: 'Upload failed', progress: 0 }
            : f
        )
      );
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      // Validate and add files to queue
      const newFiles: UploadFile[] = acceptedFiles.map((file) => {
        const validationError =
          file.size > maxSize
            ? `File too large (max ${formatFileSize(maxSize)})`
            : !acceptedTypes.includes(file.type)
            ? 'File type not supported'
            : undefined;

        return {
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          status: validationError ? 'error' : ('pending' as const),
          progress: 0,
          error: validationError,
        };
      });

      setUploadQueue((prev) => [...prev, ...newFiles]);

      // Process valid files
      setIsUploading(true);
      const validFiles = newFiles.filter((f) => f.status === 'pending');

      for (const uploadFile of validFiles) {
        await processUpload(uploadFile.file, uploadFile.id);
      }
      setIsUploading(false);

      // Clear successful uploads after delay
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((f) => f.status !== 'success'));
      }, 3000);
    },
    [onUpload, maxSize, acceptedTypes]
  );

  const removeFromQueue = (id: string) => {
    setUploadQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true, // Disable automatic click handling - we control it manually
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"
        >
          <Upload
            className={cn(
              'h-8 w-8 transition-colors',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </motion.div>

        <p className="text-sm font-medium text-foreground mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          or click to browse your computer
        </p>
        <p className="text-xs text-muted-foreground">
          Uploading to: <span className="font-medium">{folderName}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max file size: {formatFileSize(maxSize)} • PDF, Word, Excel, Images, Text
        </p>

        <Button variant="outline" size="sm" className="mt-4" onClick={open}>
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
      </div>

      {/* Upload Queue */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <span className="text-sm font-medium">Upload Queue ({uploadQueue.length})</span>
            </div>
            <div className="divide-y divide-border max-h-60 overflow-y-auto">
              {uploadQueue.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {item.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    {item.status === 'pending' && (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </span>
                      {item.error && (
                        <span className="text-xs text-destructive">{item.error}</span>
                      )}
                    </div>
                    {item.status === 'uploading' && (
                      <Progress value={item.progress} className="h-1 mt-1" />
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removeFromQueue(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
