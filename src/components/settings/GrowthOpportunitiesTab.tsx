
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useGrowthOpportunities } from '@/hooks/useSettings';
import { GrowthOpportunity } from '@/lib/data/settings';

const GrowthOpportunitiesTab: React.FC = () => {
  const { opportunities, loading, createOpportunity, updateOpportunity } = useGrowthOpportunities();
  const [editingOpp, setEditingOpp] = useState<GrowthOpportunity | null>(null);
  const [newOpp, setNewOpp] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    is_active: true,
  });
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    await createOpportunity(newOpp);
    setNewOpp({ title: '', description: '', tags: [], is_active: true });
    setShowForm(false);
  };

  const handleUpdate = async () => {
    if (editingOpp) {
      await updateOpportunity(editingOpp.id, editingOpp);
      setEditingOpp(null);
    }
  };

  const handleTagsChange = (tagsString: string, isEditing = false) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    if (isEditing && editingOpp) {
      setEditingOpp({ ...editingOpp, tags });
    } else {
      setNewOpp({ ...newOpp, tags });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Growth Opportunities</h3>
          <p className="text-sm text-muted-foreground">
            Manage predefined growth opportunities that can be assigned to companies
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Opportunity
        </Button>
      </div>

      {showForm && (
        <Card className="bg-muted/20 border-border">
          <CardHeader>
            <CardTitle>Create New Growth Opportunity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newOpp.title}
                onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                placeholder="Growth opportunity title..."
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newOpp.description}
                onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                placeholder="Detailed description..."
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newOpp.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="marketing, expansion, technology"
                className="bg-background border-border"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={newOpp.is_active}
                onCheckedChange={(checked) => setNewOpp({ ...newOpp, is_active: checked })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newOpp.title || loading}>
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
        {opportunities.map((opp) => (
          <Card key={opp.id} className="bg-card border-border">
            <CardContent className="pt-6">
              {editingOpp?.id === opp.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingOpp.title}
                      onChange={(e) => setEditingOpp({ ...editingOpp, title: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editingOpp.description || ''}
                      onChange={(e) => setEditingOpp({ ...editingOpp, description: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={editingOpp.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value, true)}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={editingOpp.is_active}
                      onCheckedChange={(checked) => setEditingOpp({ ...editingOpp, is_active: checked })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={loading}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingOpp(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{opp.title}</h4>
                      {!opp.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {opp.description && (
                      <p className="text-sm text-muted-foreground">{opp.description}</p>
                    )}
                    {opp.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {opp.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingOpp(opp)}
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

export default GrowthOpportunitiesTab;
