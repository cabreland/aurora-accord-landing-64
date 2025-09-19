import React, { useCallback, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { DealFormData } from './DealWizard';

interface EnhancedDocumentsStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

type DocumentType = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  acceptedFiles: string[];
  maxFiles?: number;
  files: File[];
};

export const EnhancedDocumentsStep: React.FC<EnhancedDocumentsStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    {
      id: 'cim',
      label: 'Confidential Information Memorandum',
      description: 'Detailed business overview, strategy, and opportunity summary',
      required: true,
      acceptedFiles: ['.pdf', '.docx', '.pptx'],
      maxFiles: 1,
      files: []
    },
    {
      id: 'financials',
      label: 'Financial Statements (3 Years)',
      description: 'P&L, Balance Sheet, Cash Flow statements for the last 3 years',
      required: true,
      acceptedFiles: ['.pdf', '.xlsx', '.xls'],
      maxFiles: 6,
      files: []
    },
    {
      id: 'assets',
      label: 'Asset List & Inventory',
      description: 'Complete inventory of business assets, equipment, and property',
      required: false,
      acceptedFiles: ['.pdf', '.xlsx', '.csv'],
      maxFiles: 3,
      files: []
    },
    {
      id: 'contracts',
      label: 'Customer Contracts',
      description: 'Key customer agreements, recurring revenue contracts',
      required: false,
      acceptedFiles: ['.pdf', '.docx'],
      maxFiles: 10,
      files: []
    },
    {
      id: 'legal',
      label: 'Legal Documentation',
      description: 'Business licenses, IP documentation, legal compliance',
      required: false,
      acceptedFiles: ['.pdf', '.docx'],
      maxFiles: 5,
      files: []
    }
  ]);

  const updateDocumentType = (typeId: string, files: File[]) => {
    setDocumentTypes(prev => 
      prev.map(type => 
        type.id === typeId ? { ...type, files } : type
      )
    );
    
    // Update parent component with all files
    const allFiles = documentTypes.reduce((acc, type) => {
      if (type.id === typeId) {
        return [...acc, ...files];
      }
      return [...acc, ...type.files];
    }, [] as File[]);
    
    onChange({ documents: allFiles });
  };

  const createDropzone = (documentType: DocumentType) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      const currentFiles = documentType.files;
      const newFiles = documentType.maxFiles 
        ? [...currentFiles, ...acceptedFiles].slice(0, documentType.maxFiles)
        : [...currentFiles, ...acceptedFiles];
      
      updateDocumentType(documentType.id, newFiles);
    }, [documentType]);

    return useDropzone({
      onDrop,
      accept: documentType.acceptedFiles.reduce((acc, ext) => {
        const mimeTypes: Record<string, string[]> = {
          '.pdf': ['application/pdf'],
          '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          '.doc': ['application/msword'],
          '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          '.xls': ['application/vnd.ms-excel'],
          '.csv': ['text/csv'],
          '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation']
        };
        
        const mimeType = mimeTypes[ext];
        if (mimeType) {
          acc[mimeType[0]] = [ext];
        }
        return acc;
      }, {} as Record<string, string[]>),
      maxSize: 20 * 1024 * 1024, // 20MB
      disabled: documentType.maxFiles ? documentType.files.length >= documentType.maxFiles : false
    });
  };

  const removeFile = (typeId: string, fileIndex: number) => {
    const documentType = documentTypes.find(type => type.id === typeId);
    if (documentType) {
      const newFiles = documentType.files.filter((_, index) => index !== fileIndex);
      updateDocumentType(typeId, newFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadStatus = (documentType: DocumentType) => {
    if (documentType.files.length === 0) {
      return documentType.required ? 'missing' : 'optional';
    }
    if (documentType.maxFiles && documentType.files.length >= documentType.maxFiles) {
      return 'complete';
    }
    return 'partial';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCompletionPercentage = () => {
    const requiredTypes = documentTypes.filter(type => type.required);
    const completedRequired = requiredTypes.filter(type => type.files.length > 0);
    const optionalTypes = documentTypes.filter(type => !type.required);
    const completedOptional = optionalTypes.filter(type => type.files.length > 0);
    
    const requiredScore = requiredTypes.length > 0 ? (completedRequired.length / requiredTypes.length) * 70 : 70;
    const optionalScore = optionalTypes.length > 0 ? (completedOptional.length / optionalTypes.length) * 30 : 0;
    
    return Math.round(requiredScore + optionalScore);
  };

  const totalFiles = documentTypes.reduce((sum, type) => sum + type.files.length, 0);
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Document Upload Center</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload documents organized by category to provide comprehensive deal information.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Upload Progress
            <Badge variant="outline">{totalFiles} files uploaded</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Required documents provide 70% completion, optional documents add 30%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Sections */}
      <div className="space-y-4">
        {documentTypes.map((documentType) => {
          const dropzone = createDropzone(documentType);
          const status = getUploadStatus(documentType);
          
          return (
            <Card key={documentType.id} className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span>{documentType.label}</span>
                    {documentType.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {documentType.files.length}
                    {documentType.maxFiles && ` / ${documentType.maxFiles}`}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{documentType.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Drop Zone */}
                {(!documentType.maxFiles || documentType.files.length < documentType.maxFiles) && (
                  <div
                    {...dropzone.getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                      ${dropzone.isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : dropzone.isDragReject 
                          ? 'border-destructive bg-destructive/5'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25'
                      }
                    `}
                  >
                    <input {...dropzone.getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    
                    {dropzone.isDragActive ? (
                      <p className="text-primary font-medium text-sm">Drop files here...</p>
                    ) : dropzone.isDragReject ? (
                      <div>
                        <p className="text-destructive font-medium text-sm mb-1">Invalid file type</p>
                        <p className="text-xs text-muted-foreground">
                          Accepts: {documentType.acceptedFiles.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-sm text-foreground mb-1">
                          Click to upload or drag files here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Accepts: {documentType.acceptedFiles.join(', ')} (max 20MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Files */}
                {documentType.files.length > 0 && (
                  <div className="space-y-2">
                    {documentType.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-xs text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(documentType.id, index)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Message */}
                {documentType.maxFiles && documentType.files.length >= documentType.maxFiles && (
                  <div className="bg-success/10 border border-success/20 rounded-md p-2">
                    <p className="text-xs text-success-foreground font-medium">
                      Maximum files uploaded for this category
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-primary mb-2">Document Preparation Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>CIM:</strong> Create a professional presentation highlighting your business opportunity</li>
                <li>• <strong>Financials:</strong> Include audited statements when available, show clear trends</li>
                <li>• <strong>Assets:</strong> Detailed inventory helps buyers understand the full scope</li>
                <li>• <strong>Contracts:</strong> Focus on your largest and most strategic customer agreements</li>
                <li>• <strong>Legal:</strong> Ensure all compliance documentation is current and complete</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {completionPercentage < 50 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <p className="text-sm text-warning-foreground">
              <strong>Incomplete:</strong> Consider uploading required documents to attract serious buyers.
              Current completion: {completionPercentage}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};