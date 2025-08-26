
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { useCustomFields } from '@/hooks/useSettings';
import { CustomField } from '@/lib/data/settings';

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
];

const CustomFieldsTab: React.FC = () => {
  const { fields, loading, createField, updateField } = useCustomFields();
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [newField, setNewField] = useState({
    key: '',
    label: '',
    type: 'text' as const,
    is_required: false,
    is_active: true,
  });
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    await createField(newField);
    setNewField({ key: '', label: '', type: 'text', is_required: false, is_active: true });
    setShowForm(false);
  };

  const handleUpdate = async () => {
    if (editingField) {
      await updateField(editingField.id, editingField);
      setEditingField(null);
    }
  };

  const generateKey = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">
            Define custom fields that can be added to company profiles
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Field
        </Button>
      </div>

      {showForm && (
        <Card className="bg-muted/20 border-border">
          <CardHeader>
            <CardTitle>Create New Custom Field</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={newField.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setNewField({ 
                    ...newField, 
                    label,
                    key: generateKey(label)
                  });
                }}
                placeholder="Field label..."
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                value={newField.key}
                onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                placeholder="field_key"
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier for this field (auto-generated from label)
              </p>
            </div>

            <div>
              <Label htmlFor="type">Field Type</Label>
              <Select 
                value={newField.type} 
                onValueChange={(value: any) => setNewField({ ...newField, type: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Required</Label>
              <Switch
                checked={newField.is_required}
                onCheckedChange={(checked) => setNewField({ ...newField, is_required: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={newField.is_active}
                onCheckedChange={(checked) => setNewField({ ...newField, is_active: checked })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newField.label || !newField.key || loading}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {fields.map((field) => (
          <Card key={field.id} className="bg-card border-border">
            <CardContent className="pt-6">
              {editingField?.id === field.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={editingField.label}
                      onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={editingField.type} 
                      onValueChange={(value: any) => setEditingField({ ...editingField, type: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Required</Label>
                    <Switch
                      checked={editingField.is_required}
                      onCheckedChange={(checked) => setEditingField({ ...editingField, is_required: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={editingField.is_active}
                      onCheckedChange={(checked) => setEditingField({ ...editingField, is_active: checked })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={loading}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingField(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{field.label}</h4>
                      <Badge variant="outline" className="text-xs">
                        {fieldTypes.find(t => t.value === field.type)?.label}
                      </Badge>
                      {field.is_required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      {!field.is_active && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Key: {field.key}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingField(field)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomFieldsTab;
