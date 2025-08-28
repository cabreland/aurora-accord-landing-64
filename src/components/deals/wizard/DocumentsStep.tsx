import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { DealFormData } from './DealWizard';

interface DocumentsStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

const documentCategories = [
  { id: 'financial', label: 'Financial Statements', color: 'bg-blue-100 text-blue-800' },
  { id: 'legal', label: 'Legal Documents', color: 'bg-green-100 text-green-800' },
  { id: 'operational', label: 'Operational Reports', color: 'bg-purple-100 text-purple-800' },
  { id: 'marketing', label: 'Marketing Materials', color: 'bg-orange-100 text-orange-800' },
  { id: 'other', label: 'Other Documents', color: 'bg-gray-100 text-gray-800' },
];

export const DocumentsStep: React.FC<DocumentsStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange({
      documents: [...data.documents, ...acceptedFiles]
    });
  }, [data.documents, onChange]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeDocument = (index: number) => {
    onChange({
      documents: data.documents.filter((_, i) => i !== index)
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Documents & Materials</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload key documents that will be shared with potential investors.
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <Label>Document Upload</Label>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : isDragReject 
                ? 'border-destructive bg-destructive/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the files here...</p>
          ) : isDragReject ? (
            <div>
              <p className="text-destructive font-medium mb-2">Some files are not supported</p>
              <p className="text-sm text-muted-foreground">
                Please upload PDF, Word, Excel, CSV, or image files (max 10MB each)
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-foreground mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: PDF, Word, Excel, CSV, Images (max 10MB each)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents */}
      {data.documents.length > 0 && (
        <div className="space-y-4">
          <Label>Uploaded Documents ({data.documents.length})</Label>
          <div className="space-y-2">
            {data.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-medium text-sm text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Categories Guide */}
      <div className="space-y-4">
        <Label>Recommended Document Categories</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2 p-3 border border-muted rounded-lg">
              <Badge variant="secondary" className={category.color}>
                {category.label}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {category.id === 'financial' && 'P&L, Balance Sheet, Cash Flow'}
                {category.id === 'legal' && 'Contracts, Leases, IP Documents'}
                {category.id === 'operational' && 'KPIs, Process Docs, Org Chart'}
                {category.id === 'marketing' && 'Brand Assets, Case Studies, Deck'}
                {category.id === 'other' && 'Additional supporting materials'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-primary mb-2">Document Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload clean, professional versions of your documents</li>
              <li>• Financial statements should be recent (within 12 months)</li>
              <li>• Redact sensitive information that shouldn't be shared initially</li>
              <li>• Consider creating an executive summary or teaser document</li>
            </ul>
          </div>
        </div>
      </div>

      {data.documents.length === 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm text-warning-foreground">
            <strong>Optional:</strong> While documents aren't required to create the deal, 
            having key materials ready will help attract serious investors.
          </p>
        </div>
      )}
    </div>
  );
};