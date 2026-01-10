import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Trash2, 
  ClipboardList, 
  MessageSquare, 
  UserPlus, 
  Shield, 
  Activity, 
  Download,
  FolderOpen,
  RotateCcw
} from 'lucide-react';
import { TeamMemberPermissions, DealTeamRole } from '@/hooks/useDealTeam';
import { cn } from '@/lib/utils';

interface PermissionEditorProps {
  permissions: TeamMemberPermissions;
  onChange: (permissions: TeamMemberPermissions) => void;
  role?: DealTeamRole;
  onResetToDefault?: () => void;
}

type PermissionPreset = 'full' | 'contributor' | 'reviewer' | 'viewer' | 'custom';

const presetConfigs: Record<Exclude<PermissionPreset, 'custom'>, Partial<TeamMemberPermissions>> = {
  full: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: true,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: true,
    restricted_folders: [],
  },
  contributor: {
    can_view_all_folders: true,
    can_upload_documents: true,
    can_delete_documents: false,
    can_create_requests: true,
    can_edit_requests: true,
    can_approve_documents: false,
    restricted_folders: [],
  },
  reviewer: {
    can_view_all_folders: true,
    can_upload_documents: false,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: true,
    restricted_folders: [],
  },
  viewer: {
    can_view_all_folders: true,
    can_upload_documents: false,
    can_delete_documents: false,
    can_create_requests: false,
    can_edit_requests: false,
    can_approve_documents: false,
    restricted_folders: [],
  },
};

const permissionItems = [
  {
    key: 'can_view_all_folders' as const,
    label: 'View All Folders',
    description: 'Access to all folders in the data room',
    icon: FolderOpen,
    category: 'Access',
  },
  {
    key: 'can_upload_documents' as const,
    label: 'Upload Documents',
    description: 'Can upload new documents to the data room',
    icon: Upload,
    category: 'Documents',
  },
  {
    key: 'can_delete_documents' as const,
    label: 'Delete Documents',
    description: 'Can remove documents from the data room',
    icon: Trash2,
    category: 'Documents',
  },
  {
    key: 'can_approve_documents' as const,
    label: 'Approve Documents',
    description: 'Can approve or reject pending documents',
    icon: Shield,
    category: 'Documents',
  },
  {
    key: 'can_create_requests' as const,
    label: 'Create Requests',
    description: 'Can create new Q&A requests',
    icon: ClipboardList,
    category: 'Requests',
  },
  {
    key: 'can_edit_requests' as const,
    label: 'Edit Requests',
    description: 'Can modify and respond to requests',
    icon: MessageSquare,
    category: 'Requests',
  },
];

export const PermissionEditor: React.FC<PermissionEditorProps> = ({
  permissions,
  onChange,
  role,
  onResetToDefault,
}) => {
  const [activePreset, setActivePreset] = React.useState<PermissionPreset>('custom');

  // Determine current preset
  React.useEffect(() => {
    const checkPreset = (preset: Exclude<PermissionPreset, 'custom'>): boolean => {
      const config = presetConfigs[preset];
      return Object.entries(config).every(([key, value]) => {
        if (key === 'restricted_folders') return true;
        return permissions[key as keyof TeamMemberPermissions] === value;
      });
    };

    if (checkPreset('full')) setActivePreset('full');
    else if (checkPreset('contributor')) setActivePreset('contributor');
    else if (checkPreset('reviewer')) setActivePreset('reviewer');
    else if (checkPreset('viewer')) setActivePreset('viewer');
    else setActivePreset('custom');
  }, [permissions]);

  const applyPreset = (preset: Exclude<PermissionPreset, 'custom'>) => {
    onChange({
      ...permissions,
      ...presetConfigs[preset],
    });
    setActivePreset(preset);
  };

  const togglePermission = (key: keyof TeamMemberPermissions) => {
    if (typeof permissions[key] === 'boolean') {
      onChange({
        ...permissions,
        [key]: !permissions[key],
      });
    }
  };

  const presets: { id: Exclude<PermissionPreset, 'custom'>; label: string; description: string }[] = [
    { id: 'full', label: 'Full Access', description: 'All permissions enabled' },
    { id: 'contributor', label: 'Contributor', description: 'Upload and create requests' },
    { id: 'reviewer', label: 'Reviewer', description: 'Review and approve only' },
    { id: 'viewer', label: 'View Only', description: 'Read-only access' },
  ];

  // Group permissions by category
  const categories = Array.from(new Set(permissionItems.map(p => p.category)));

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Permission Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(preset => (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? 'default' : 'outline'}
              size="sm"
              className="justify-start h-auto py-2 px-3"
              onClick={() => applyPreset(preset.id)}
            >
              <div className="text-left">
                <div className="font-medium">{preset.label}</div>
                <div className="text-xs opacity-70">{preset.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Granular Permissions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Granular Permissions</Label>
          {onResetToDefault && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetToDefault}
              className="text-xs h-7"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset to Role Default
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {permissionItems
                  .filter(p => p.category === category)
                  .map(item => {
                    const Icon = item.icon;
                    const isEnabled = permissions[item.key] as boolean;
                    
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border transition-colors',
                          isEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-1.5 rounded-md',
                            isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <Label 
                              htmlFor={item.key} 
                              className="text-sm font-medium cursor-pointer"
                            >
                              {item.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={item.key}
                          checked={isEnabled}
                          onCheckedChange={() => togglePermission(item.key)}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Preset Indicator */}
      {activePreset !== 'custom' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {presets.find(p => p.id === activePreset)?.label || 'Custom'}
          </Badge>
          <span>preset applied</span>
        </div>
      )}
    </div>
  );
};
