import React, { useEffect, useState } from 'react';
import { Lock, FileText, DollarSign, Scale, Presentation, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from '@/integrations/supabase/client';
import { DocumentList } from './DocumentList';
import { AccessLevel } from '@/hooks/useCompanyNDA';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  confidentiality_level: AccessLevel;
}

interface DataRoomSectionProps {
  dealId: string;
  companyId?: string;
  hasSignedNDA: boolean;
  accessLevel: AccessLevel;
  onOpenNDA: () => void;
  onRequestAccess: () => void;
}

export const DataRoomSection: React.FC<DataRoomSectionProps> = ({
  dealId,
  companyId,
  hasSignedNDA,
  accessLevel,
  onOpenNDA,
  onRequestAccess
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, file_path, file_size, created_at, confidentiality_level')
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

  // Group documents by confidentiality level
  const publicDocs = documents.filter(d => d.confidentiality_level === 'public');
  const teaserDocs = documents.filter(d => d.confidentiality_level === 'teaser');
  const cimDocs = documents.filter(d => d.confidentiality_level === 'cim');
  const financialDocs = documents.filter(d => d.confidentiality_level === 'financials');
  const fullDocs = documents.filter(d => d.confidentiality_level === 'full');

  if (!hasSignedNDA) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">NDA Required</h3>
          <p className="text-muted-foreground mb-6">
            Sign a Non-Disclosure Agreement to access the data room and confidential documents
          </p>
          <Button onClick={onOpenNDA} size="lg">
            Review & Sign NDA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading documents...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Access Level Badge */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Current Access Level</h3>
              <p className="text-sm text-muted-foreground">
                {accessLevel === 'public' && 'You have access to public documents only'}
                {accessLevel === 'teaser' && 'You have access to teaser and public documents'}
                {accessLevel === 'cim' && 'You have access to CIM, teaser, and public documents'}
                {accessLevel === 'financials' && 'You have access to financial documents and below'}
                {accessLevel === 'full' && 'You have full access to all documents'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold capitalize">{accessLevel}</div>
              {accessLevel !== 'full' && (
                <Button variant="link" size="sm" onClick={onRequestAccess}>
                  Request Higher Access
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents by Category */}
      <Card>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {publicDocs.length > 0 && (
              <AccordionItem value="public">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Public Documents</p>
                      <p className="text-sm text-muted-foreground">{publicDocs.length} documents</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DocumentList
                    documents={publicDocs}
                    accessLevel={accessLevel}
                    requiredLevel="public"
                    onRequestAccess={onRequestAccess}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {teaserDocs.length > 0 && (
              <AccordionItem value="teaser">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Presentation className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Teaser & Pitch Materials</p>
                      <p className="text-sm text-muted-foreground">{teaserDocs.length} documents</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DocumentList
                    documents={teaserDocs}
                    accessLevel={accessLevel}
                    requiredLevel="teaser"
                    onRequestAccess={onRequestAccess}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {cimDocs.length > 0 && (
              <AccordionItem value="cim">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Confidential Information Memorandum</p>
                      <p className="text-sm text-muted-foreground">{cimDocs.length} documents</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DocumentList
                    documents={cimDocs}
                    accessLevel={accessLevel}
                    requiredLevel="cim"
                    onRequestAccess={onRequestAccess}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {financialDocs.length > 0 && (
              <AccordionItem value="financial">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Financial Documents</p>
                      <p className="text-sm text-muted-foreground">{financialDocs.length} documents</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DocumentList
                    documents={financialDocs}
                    accessLevel={accessLevel}
                    requiredLevel="financials"
                    onRequestAccess={onRequestAccess}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {fullDocs.length > 0 && (
              <AccordionItem value="legal">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Legal & Due Diligence</p>
                      <p className="text-sm text-muted-foreground">{fullDocs.length} documents</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DocumentList
                    documents={fullDocs}
                    accessLevel={accessLevel}
                    requiredLevel="full"
                    onRequestAccess={onRequestAccess}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {documents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No documents have been uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
