import React, { useCallback, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, FileText, X, SkipForward } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { DealFormData } from './DealWizard';
import { mapFileToFolder } from '@/lib/data/mapFileToFolder';

interface EnhancedDocumentsStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
  onSkip?: () => void;
}

type QueuedFile = {
  file: File;
  id: string;
  detectedFolder: string | null;
  selectedFolder: string | null;
};

const FOLDER_OPTIONS = [
  { value: 'financials', label: 'Financials' },
  { value: 'corporate_legal', label: 'Corporate & Legal' },
  { value: 'operations', label: 'Operations' },
  { value: 'client_contracts', label: 'Client Base & Contracts' },
  { value: 'marketing_sales', label: 'Marketing & Sales' },
  { value: 'hr_team', label: 'HR & Team' },
  { value: 'ip_technology', label: 'IP & Technology' },
  { value: 'real_estate', label: 'Real Estate / Assets' },
  { value: 'unassigned', label: 'Unassigned' },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EnhancedDocumentsStep: React.FC<EnhancedDocumentsStepProps> = ({
  data,
  onChange,
  isValid,
  onSkip,
}) => {
  const [queue, setQueue] = useState<QueuedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: QueuedFile[] = acceptedFiles.map(file => {
      // Use keyword matching — pass empty folders array since we're pre-wizard
      const detected = mapFileToFolder(file.name, []);
      return {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        detectedFolder: detected,
        selectedFolder: detected,
      };
    });
    setQueue(prev => {
      const updated = [...prev, ...newFiles];
      onChange({ documents: updated.map(q => q.file) });
      return updated;
    });
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setQueue(prev => {
      const updated = prev.filter(q => q.id !== id);
      onChange({ documents: updated.map(q => q.file) });
      return updated;
    });
  };

  const updateFolder = (id: string, folder: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, selectedFolder: folder } : q));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Upload Documents</h3>
        <p className="text-sm text-muted-foreground">
          Drop files here and we'll auto-detect the right folder. You can adjust assignments before saving.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left: Drop Zone (60%) */}
        <div className="md:col-span-3">
          <div
            {...getRootProps()}
            className={`
              min-h-[280px] flex flex-col items-center justify-center
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            {isDragActive ? (
              <p className="text-primary font-semibold text-base">Drop your files here…</p>
            ) : (
              <>
                <p className="font-semibold text-foreground text-base mb-1">
                  Drop all files here
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  or click to browse your computer
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, PowerPoint, CSV, Images • Max 20MB each
                </p>
              </>
            )}
          </div>

          {/* Skip CTA */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip for now — upload directly in the Data Room
            </button>
          </div>
        </div>

        {/* Right: File Queue (40%) */}
        <div className="md:col-span-2">
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            {queue.length === 0 ? 'Files will appear here' : `${queue.length} file${queue.length > 1 ? 's' : ''} queued`}
          </Label>

          {queue.length === 0 ? (
            <div className="h-[240px] border border-dashed border-border rounded-xl flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center px-4">
                No files yet. Drop files on the left to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {queue.map((item) => {
                const folder = FOLDER_OPTIONS.find(f => f.value === item.selectedFolder);
                const isAutoDetected = item.detectedFolder !== null;

                return (
                  <div key={item.id} className="bg-muted/40 border border-border rounded-lg p-3">
                    {/* File name row */}
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium text-foreground truncate flex-1 cursor-default">
                              {item.file.name}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.file.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Folder assignment row */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={item.selectedFolder || 'unassigned'}
                        onValueChange={(v) => updateFolder(item.id, v)}
                      >
                        <SelectTrigger className="h-7 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FOLDER_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isAutoDetected && (
                        <Badge variant="secondary" className="text-xs shrink-0 h-5">
                          Auto
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatFileSize(item.file.size)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
