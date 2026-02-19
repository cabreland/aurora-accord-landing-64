import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Settings, Lock, Bell, Trash2, GitBranch, Clock, Zap, CheckCircle2, 
  AlertTriangle, Archive, BarChart3, FileCheck, Rocket, FileSignature,
  FileText, PartyPopper, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
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
import { useDealStageManager, DealStage, DealStatus, STAGE_ORDER, STAGE_LABELS } from '@/hooks/useDealStageManager';
import { MilestoneItem, StageHistoryTimeline } from './settings';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  data_gathering: { label: 'Data Gathering', color: 'bg-yellow-500/20 text-yellow-700' },
  live: { label: 'Live (Marketing)', color: 'bg-blue-500/20 text-blue-700' },
  active: { label: 'Active (Buyer Access)', color: 'bg-green-500/20 text-green-700' },
  under_loi: { label: 'Under LOI', color: 'bg-purple-500/20 text-purple-700' },
  closing: { label: 'Closing', color: 'bg-orange-500/20 text-orange-700' },
  closed: { label: 'Closed', color: 'bg-emerald-500/20 text-emerald-700' },
  dead: { label: 'Dead', color: 'bg-destructive/20 text-destructive' }
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-destructive/20 text-destructive' }
];

export const DealSettingsTab = () => {
  const { dealId } = useParams();
  const queryClient = useQueryClient();
  
  // Local state for settings (seeded from DB via useDealStageManager)
  const [autoProgressionEnabled, setAutoProgressionEnabled] = useState(true);
  const [ddThreshold, setDdThreshold] = useState(90);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [stageChangeReason, setStageChangeReason] = useState('');
  const [selectedStage, setSelectedStage] = useState<DealStage | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

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

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-stage-info', dealId] });
      toast.success('Deal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update deal: ' + error.message);
    }
  });

  // Update timestamp mutation
  const updateTimestampMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: string | null }) => {
      const { error } = await supabase
        .from('deals')
        .update({ [field]: value })
        .eq('id', dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-stage-info', dealId] });
      toast.success('Milestone updated');
    },
    onError: (error) => {
      toast.error('Failed to update milestone: ' + error.message);
    }
  });

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

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    updateDealMutation.mutate({ deal_status: status });
  };

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
    updateDealMutation.mutate({ priority });
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    updateTimestampMutation.mutate({ 
      field, 
      value: date ? date.toISOString() : null 
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Deal Settings
        </h1>
        <p className="text-muted-foreground">
          Manage deal configuration, stage progression, and automation rules
        </p>
      </div>

      {/* Stage Management Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Stage Management
        </h2>

        {/* Current Stage Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Current Stage</CardTitle>
            <CardDescription>
              Track and manage the deal's progression through the M&A lifecycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingStageInfo ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                {/* Stage Display */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <Badge variant="default" className="text-sm py-1.5 px-4 font-semibold">
                      {currentStage ? STAGE_LABELS[currentStage] : 'Unknown'}
                    </Badge>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {daysInCurrentStage} day{daysInCurrentStage !== 1 ? 's' : ''} in stage
                      </span>
                      {stageInfo?.stage_entered_at && (
                        <>
                          <span className="text-border">•</span>
                          <span>Since {format(new Date(stageInfo.stage_entered_at), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {progressionCheck?.should_progress && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Ready to progress to {progressionCheck.suggested_stage ? STAGE_LABELS[progressionCheck.suggested_stage] : ''}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Manual Stage Override */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Manual Stage Override</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select
                      value={selectedStage || ''}
                      onValueChange={(value) => setSelectedStage(value as DealStage)}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select new stage..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_ORDER.map((stage) => (
                          <SelectItem 
                            key={stage} 
                            value={stage}
                            disabled={stage === currentStage}
                          >
                            <span className="flex items-center gap-2">
                              {stage === currentStage && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
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
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                            Confirm Stage Change
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>
                              You are about to manually change the deal stage from{' '}
                              <strong className="text-foreground">{currentStage ? STAGE_LABELS[currentStage] : 'Unknown'}</strong> to{' '}
                              <strong className="text-foreground">{selectedStage ? STAGE_LABELS[selectedStage] : 'Unknown'}</strong>.
                            </p>
                            <p className="text-sm">
                              This action will be logged in the stage history for audit purposes.
                            </p>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Milestone Timestamps Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Milestone Timestamps
            </CardTitle>
            <CardDescription>
              Key dates and milestones in the deal lifecycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStageInfo ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {/* Sell-Side Milestones */}
                <MilestoneItem
                  label="Listing Received"
                  date={stageInfo?.listing_received_at || null}
                  icon="📥"
                  description="Initial company information submitted"
                  canEdit
                  onDateChange={handleDateChange('listing_received_at')}
                  onMark={() => updateTimestampMutation.mutate({ 
                    field: 'listing_received_at', 
                    value: new Date().toISOString() 
                  })}
                />
                <MilestoneItem
                  label="Listing Approved"
                  date={stageInfo?.listing_approved_at || null}
                  icon="✅"
                  description="Agreed to represent this seller"
                  canEdit
                  onDateChange={handleDateChange('listing_approved_at')}
                  onMark={() => updateTimestampMutation.mutate({ 
                    field: 'listing_approved_at', 
                    value: new Date().toISOString() 
                  })}
                />
                <MilestoneItem
                  label="Data Room Complete"
                  date={stageInfo?.data_room_complete_at || null}
                  icon="📁"
                  description="All required documents uploaded and verified"
                  canEdit
                  onDateChange={handleDateChange('data_room_complete_at')}
                  onMark={() => updateTimestampMutation.mutate({ 
                    field: 'data_room_complete_at', 
                    value: new Date().toISOString() 
                  })}
                />
                {/* Buy-Side Milestones */}
                <MilestoneItem
                  label="Deal Published"
                  date={stageInfo?.deal_published_at || null}
                  icon="🚀"
                  description="Listing went live for buyer marketplace"
                  canEdit
                  onDateChange={handleDateChange('deal_published_at')}
                  onMark={() => updateTimestampMutation.mutate({ 
                    field: 'deal_published_at', 
                    value: new Date().toISOString() 
                  })}
                />
                <MilestoneItem
                  label="First NDA Signed"
                  date={stageInfo?.first_nda_signed_at || null}
                  icon="📝"
                  description="First investor NDA acceptance"
                  canEdit
                  onMark={markNdaSigned}
                  onDateChange={handleDateChange('first_nda_signed_at')}
                />
                <MilestoneItem
                  label="LOI Submitted"
                  date={stageInfo?.loi_submitted_at || null}
                  icon="📄"
                  description="Letter of Intent submitted"
                  canEdit
                  onMark={markLoiSubmitted}
                  onDateChange={handleDateChange('loi_submitted_at')}
                />
                <MilestoneItem
                  label="LOI Accepted"
                  date={stageInfo?.loi_accepted_at || null}
                  icon="✅"
                  description="Letter of Intent accepted by seller"
                  canEdit
                  onMark={markLoiAccepted}
                  onDateChange={handleDateChange('loi_accepted_at')}
                />
                <MilestoneItem
                  label="Purchase Agreement Signed"
                  date={stageInfo?.purchase_agreement_signed_at || null}
                  icon="📜"
                  description="Definitive purchase agreement executed"
                  canEdit
                  onMark={markPurchaseAgreementSigned}
                  onDateChange={handleDateChange('purchase_agreement_signed_at')}
                />
                <MilestoneItem
                  label="Deal Closed"
                  date={stageInfo?.closed_at || null}
                  icon="🎉"
                  description="Transaction completed successfully"
                  canEdit
                  onMark={markDealClosed}
                  onDateChange={handleDateChange('closed_at')}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Stage History Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Stage History
        </h2>
        
        <Card>
          <CardContent className="pt-6">
            {isLoadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StageHistoryTimeline 
                history={stageHistory || []} 
                currentStage={currentStage || 'deal_initiated'} 
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Automation Rules Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Automation Rules
        </h2>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Auto Progression Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="font-medium">Enable Automatic Stage Progression</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically move deals to next stage when triggers are met (e.g., NDA signed, LOI accepted)
                </p>
              </div>
              <Switch 
                checked={autoProgressionEnabled}
                onCheckedChange={(val) => {
                  setAutoProgressionEnabled(val);
                  updateDealMutation.mutate({ settings: { auto_progression: val, dd_threshold: ddThreshold, email_notifications: emailNotificationsEnabled } });
                }}
              />
            </div>

            <Separator />

            {/* DD Completion Threshold */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-medium">DD Completion Threshold</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimum request completion to progress from Analysis to Final Review
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm font-mono">
                  {ddThreshold}%
                </Badge>
              </div>
              <div className="flex items-center gap-4">
              <Slider
                  value={[ddThreshold]}
                  onValueChange={(value) => setDdThreshold(value[0])}
                  onPointerUp={() => updateDealMutation.mutate({ settings: { auto_progression: autoProgressionEnabled, dd_threshold: ddThreshold, email_notifications: emailNotificationsEnabled } })}
                  min={50}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={ddThreshold}
                  onChange={(e) => setDdThreshold(Math.min(100, Math.max(50, parseInt(e.target.value) || 50)))}
                  onBlur={() => updateDealMutation.mutate({ settings: { auto_progression: autoProgressionEnabled, dd_threshold: ddThreshold, email_notifications: emailNotificationsEnabled } })}
                  min={50}
                  max={100}
                  className="w-20 text-center"
                />
              </div>
            </div>

            <Separator />

            {/* Email Notifications Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="font-medium">Stage Change Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email alerts to team members when deal stage changes
                </p>
              </div>
              <Switch 
                checked={emailNotificationsEnabled}
                onCheckedChange={(val) => {
                  setEmailNotificationsEnabled(val);
                  updateDealMutation.mutate({ settings: { auto_progression: autoProgressionEnabled, dd_threshold: ddThreshold, email_notifications: val } });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Deal Information Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Deal Information
        </h2>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Deal Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium">Deal Status</Label>
                <Select
                  value={selectedStatus || stageInfo?.deal_status || 'draft'}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The overall status of this deal in your pipeline
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Priority Level</Label>
                <Select
                  value={selectedPriority || 'medium'}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Set the priority level for this deal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </h2>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="font-medium">Document uploads</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new documents are uploaded
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="font-medium">Request updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when request status changes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="font-medium">Team changes</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when team members are added or removed
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="font-medium">Stage progression alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when deal is ready to progress to next stage
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Access Control Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Access Control
        </h2>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="font-medium">Require NDA for data room access</Label>
                <p className="text-sm text-muted-foreground">
                  Investors must sign NDA before viewing documents
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="font-medium">Watermark documents</Label>
                <p className="text-sm text-muted-foreground">
                  Add viewer email as watermark to downloaded documents
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h2>

        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label className="font-medium">Archive Deal</Label>
                <p className="text-sm text-muted-foreground">
                  Archive this deal and all associated data. This action can be reversed.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Archive Deal
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to archive this deal? The deal will be moved to the archive and will no longer appear in active lists. This action can be reversed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        updateDealMutation.mutate({ status: 'archived' });
                      }}
                    >
                      Archive Deal
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DealSettingsTab;
