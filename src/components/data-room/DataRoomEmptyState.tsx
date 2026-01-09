import React, { useState } from 'react';
import { FolderOpen, LayoutTemplate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataRoomTemplate } from '@/hooks/useDataRoom';

interface DataRoomEmptyStateProps {
  templates: DataRoomTemplate[];
  onApplyTemplate: (templateName: string) => Promise<boolean>;
}

export const DataRoomEmptyState: React.FC<DataRoomEmptyStateProps> = ({
  templates,
  onApplyTemplate,
}) => {
  const [applying, setApplying] = useState<string | null>(null);

  const handleApply = async (templateName: string) => {
    setApplying(templateName);
    await onApplyTemplate(templateName);
    setApplying(null);
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Folder Structure Yet
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Apply a template to quickly set up a professional folder structure for this deal's data room.
        </p>

        {templates.length > 0 ? (
          <div className="space-y-4 max-w-md mx-auto">
            <h4 className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Available Templates
            </h4>
            <div className="grid gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="border-border hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium text-foreground">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleApply(template.name)}
                      disabled={applying !== null}
                    >
                      {applying === template.name ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No templates available. Contact an administrator to set up folder templates.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
