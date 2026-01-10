import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Lock, Bell, Trash2, GitBranch, Clock, ChevronDown, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDealStageManager, DealStage, STAGE_ORDER, STAGE_LABELS } from '@/hooks/useDealStageManager';
import { StageHistoryCard } from '@/components/deal-workspace/overview/StageHistoryCard';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export const DealSettingsTab = () => {
  const { dealId } = useParams();
  const [autoProgressionEnabled, setAutoProgressionEnabled] = useState(true);
  const [stageChangeReason, setStageChangeReason] = useState('');
  const [selectedStage, setSelectedStage] = useState<DealStage | null>(null);

  const {
    stageInfo,
    stageHistory,
    progressionCheck,
    isLoadingStageInfo,
    isLoadingHistory,
    isProgressing,
    currentStage,
    daysInCurrentStage,
    manuallyMoveStage,
    markNdaSigned,
    markLoiSubmitted,
    markLoiAccepted,
    markPurchaseAgreementSigned,
    markDealClosed
  } = useDealStageManager(dealId || '');

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  const handleStageChange = () => {
    if (selectedStage) {
      manuallyMoveStage(selectedStage, stageChangeReason || 'Manual stage change by admin');
      setSelectedStage(null);
      setStageChangeReason('');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Stage Management */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5 text-primary" />
            Stage Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Stage Display */}
          {isLoadingStageInfo ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Current Stage</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-sm py-1 px-3">
                      {currentStage ? STAGE_LABELS[currentStage] : 'Unknown'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({daysInCurrentStage} day{daysInCurrentStage !== 1 ? 's' : ''} in stage)
                    </span>
                  </div>
                </div>
                {progressionCheck?.should_progress && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Zap className="w-3 h-3 mr-1" />
                    Ready to progress
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Manual Stage Override */}
              <div className="space-y-3">
                <Label>Manual Stage Override</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedStage || ''}
                    onValueChange={(value) => setSelectedStage(value as DealStage)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_ORDER.map((stage) => (
                        <SelectItem 
                          key={stage} 
                          value={stage}
                          disabled={stage === currentStage}
                        >
                          <span className="flex items-center gap-2">
                            {stage === currentStage && <CheckCircle2 className="w-3 h-3" />}
                            {STAGE_LABELS[stage]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={!selectedStage || isProgressing}
                      >
                        Change Stage
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Stage Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to manually change the deal stage from{' '}
                          <strong>{currentStage ? STAGE_LABELS[currentStage] : 'Unknown'}</strong> to{' '}
                          <strong>{selectedStage ? STAGE_LABELS[selectedStage] : 'Unknown'}</strong>?
                          <br /><br />
                          This action will be logged in the stage history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedStage(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleStageChange}>
                          Confirm Change
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-xs text-muted-foreground">
                  Override the automatic stage progression. This is logged for audit purposes.
                </p>
              </div>

              <Separator />

              {/* Auto Progression Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Stage Progression</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically suggest stage changes when triggers are met
                  </p>
                </div>
                <Switch 
                  checked={autoProgressionEnabled}
                  onCheckedChange={setAutoProgressionEnabled}
                />
              </div>

              <Separator />

              {/* Milestone Timestamps */}
              <div className="space-y-4">
                <Label className="text-sm text-muted-foreground">Milestone Timestamps</Label>
                
                <div className="grid gap-3">
                  {/* First NDA Signed */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">First NDA Signed</span>
                    </div>
                    {stageInfo?.first_nda_signed_at ? (
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(stageInfo.first_nda_signed_at), 'MMM d, yyyy')}
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={markNdaSigned}>
                        Mark Now
                      </Button>
                    )}
                  </div>

                  {/* LOI Submitted */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">LOI Submitted</span>
                    </div>
                    {stageInfo?.loi_submitted_at ? (
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(stageInfo.loi_submitted_at), 'MMM d, yyyy')}
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={markLoiSubmitted}>
                        Mark Now
                      </Button>
                    )}
                  </div>

                  {/* LOI Accepted */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">LOI Accepted</span>
                    </div>
                    {stageInfo?.loi_accepted_at ? (
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(stageInfo.loi_accepted_at), 'MMM d, yyyy')}
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={markLoiAccepted}>
                        Mark Now
                      </Button>
                    )}
                  </div>

                  {/* Purchase Agreement Signed */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Purchase Agreement Signed</span>
                    </div>
                    {stageInfo?.purchase_agreement_signed_at ? (
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(stageInfo.purchase_agreement_signed_at), 'MMM d, yyyy')}
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={markPurchaseAgreementSigned}>
                        Mark Now
                      </Button>
                    )}
                  </div>

                  {/* Deal Closed */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Deal Closed</span>
                    </div>
                    {stageInfo?.closed_at ? (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700">
                        {format(new Date(stageInfo.closed_at), 'MMM d, yyyy')}
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={markDealClosed}>
                        Mark Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage History */}
      {isLoadingHistory ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <StageHistoryCard 
          history={stageHistory || []} 
          currentStage={currentStage || 'deal_initiated'} 
        />
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Document uploads</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new documents are uploaded
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Request updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when request status changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Team changes</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when team members are added or removed
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stage progression alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when deal is ready to progress to next stage
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require NDA for data room access</Label>
              <p className="text-sm text-muted-foreground">
                Investors must sign NDA before viewing documents
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Watermark documents</Label>
              <p className="text-sm text-muted-foreground">
                Add viewer email as watermark to downloaded documents
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Archive Deal</Label>
              <p className="text-sm text-muted-foreground">
                Archive this deal and all associated data
              </p>
            </div>
            <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
              Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealSettingsTab;
