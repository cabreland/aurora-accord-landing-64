import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  FileText, 
  Send, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Download,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DealRequest, RequestResponse, RequestDocument, REQUEST_STATUSES } from '@/hooks/useDealRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequestDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: DealRequest | null;
  responses: RequestResponse[];
  documents: RequestDocument[];
  onAddResponse: (text: string) => Promise<void>;
  onUpdateStatus: (status: string) => Promise<void>;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Answered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  open,
  onOpenChange,
  request,
  responses,
  documents,
  onAddResponse,
  onUpdateStatus,
  isLoading
}) => {
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!request) return null;

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    setIsSending(true);
    try {
      await onAddResponse(responseText.trim());
      setResponseText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadDocument = async (doc: RequestDocument) => {
    const filePath = doc.document?.file_path || doc.data_room_document?.file_path;
    const fileName = doc.document?.name || doc.data_room_document?.file_name;
    
    if (!filePath) {
      toast.error('Document file not found');
      return;
    }

    try {
      const bucket = doc.document_id ? 'deal-documents' : 'deal-documents';
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60);

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{request.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{request.category}</Badge>
                <Badge className={cn(statusColors[request.status])}>
                  {request.status}
                </Badge>
                {request.due_date && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(request.due_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
            <Select value={request.status} onValueChange={onUpdateStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {/* Description */}
        {request.description && (
          <div className="px-6 py-4 bg-muted/30 mx-6 rounded-lg mt-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">{request.description}</p>
          </div>
        )}

        <Separator className="my-4" />

        {/* Attached Documents */}
        {documents.length > 0 && (
          <div className="px-6">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Attached Documents ({documents.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <Button
                  key={doc.id}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleDownloadDocument(doc)}
                >
                  <Download className="h-3 w-3" />
                  {doc.document?.name || doc.data_room_document?.file_name || 'Document'}
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
          </div>
        )}

        {/* Responses Timeline */}
        <div className="flex-1 overflow-hidden px-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Responses ({responses.length})
          </h4>
          <ScrollArea className="h-[250px] pr-4">
            {responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No responses yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {response.user_profile?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {response.user_profile?.first_name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(response.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Response Input */}
        <div className="p-6 pt-4 border-t bg-muted/20">
          <div className="flex gap-3">
            <Textarea
              placeholder="Type your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={2}
              className="flex-1 resize-none"
            />
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSendResponse}
                disabled={!responseText.trim() || isSending}
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              {request.status !== 'Answered' && request.status !== 'Closed' && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateStatus('Answered')}
                  title="Mark as Answered"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
