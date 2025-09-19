import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyDeal } from '@/hooks/useMyDeals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react';

interface ExpandedDealEditModalProps {
  deal: MyDeal;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ExpandedDealEditModal: React.FC<ExpandedDealEditModalProps> = ({
  deal,
  open,
  onClose,
  onSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    company_name: '',
    description: '',
    industry: '',
    location: '',
    status: 'draft' as 'draft' | 'active' | 'archived',
    priority: 'medium',

    // Company Details
    company_overview: '',
    founded_year: '',
    team_size: '',
    reason_for_sale: '',

    // Founder Info
    founder_name: '',
    founder_title: '',
    founders_message: '',

    // Growth Opportunities (array)
    growth_opportunities: [] as string[],

    // Strategic Analysis
    ideal_buyer_profile: '',
    rollup_potential: '',
    market_trends_alignment: '',

    // Financial Metrics
    revenue: '',
    ebitda: '',
    asking_price: '',
    growth_rate: '',
    profit_margin: '',
    customer_count: '',
    recurring_revenue: '',
    cac_ltv_ratio: ''
  });

  const [newOpportunity, setNewOpportunity] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (deal && open) {
      // Parse growth opportunities from deal data
      const growthOpps = deal.growth_opportunities 
        ? (Array.isArray(deal.growth_opportunities) 
          ? deal.growth_opportunities 
          : (typeof deal.growth_opportunities === 'string' 
            ? [deal.growth_opportunities] 
            : []))
        : [];

      setFormData({
        title: deal.title || '',
        company_name: deal.company_name || '',
        description: (deal as any).description || '',
        industry: deal.industry || '',
        location: deal.location || '',
        status: deal.status || 'draft',
        priority: deal.priority || 'medium',
        
        company_overview: (deal as any).company_overview || '',
        founded_year: (deal as any).founded_year?.toString() || '',
        team_size: (deal as any).team_size || '',
        reason_for_sale: (deal as any).reason_for_sale || '',
        
        founder_name: (deal as any).founder_name || '',
        founder_title: (deal as any).founder_title || '',
        founders_message: (deal as any).founders_message || '',
        
        growth_opportunities: growthOpps,
        
        ideal_buyer_profile: (deal as any).ideal_buyer_profile || '',
        rollup_potential: (deal as any).rollup_potential || '',
        market_trends_alignment: (deal as any).market_trends_alignment || '',
        
        revenue: deal.revenue || '',
        ebitda: deal.ebitda || '',
        asking_price: (deal as any).asking_price || '',
        growth_rate: (deal as any).growth_rate || '',
        profit_margin: (deal as any).profit_margin || '',
        customer_count: (deal as any).customer_count || '',
        recurring_revenue: (deal as any).recurring_revenue || '',
        cac_ltv_ratio: (deal as any).cac_ltv_ratio || ''
      });
    }
  }, [deal, open]);

  const generateDealTitle = () => {
    const { company_name, revenue, ebitda, industry } = formData;
    if (!company_name) return '';
    
    let title = company_name;
    if (revenue) title += ` | ${revenue}`;
    if (ebitda) title += ` | ${ebitda} EBITDA`;
    if (industry) title += ` | ${industry}`;
    
    return title;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Auto-generate title if not set
      const finalTitle = formData.title || generateDealTitle();
      
      const updateData = {
        ...formData,
        title: finalTitle,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        growth_opportunities: formData.growth_opportunities,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', deal.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error updating deal:', error);
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addGrowthOpportunity = () => {
    if (newOpportunity.trim()) {
      setFormData(prev => ({
        ...prev,
        growth_opportunities: [...prev.growth_opportunities, newOpportunity.trim()]
      }));
      setNewOpportunity('');
    }
  };

  const removeGrowthOpportunity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      growth_opportunities: prev.growth_opportunities.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span>Edit Deal</span>
              <Badge className={getStatusColor(formData.status)}>
                {formData.status}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="py-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="founder">Founder Info</TabsTrigger>
            <TabsTrigger value="growth">Growth & Strategy</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Deal Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={generateDealTitle() || "Enter deal title"}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated from company name and financials if left blank
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Austin, TX"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status & Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief company description"
                      rows={4}
                    />
                  </div>

                  <div className="pt-4">
                    <div className="text-sm text-muted-foreground mb-2">Status Information:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div><strong>Draft:</strong> Not visible to investors</div>
                      <div><strong>Active:</strong> Available based on permissions</div>
                      <div><strong>Archived:</strong> Read-only historical access</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company_overview">Company Overview</Label>
                  <Textarea
                    id="company_overview"
                    value={formData.company_overview}
                    onChange={(e) => handleInputChange('company_overview', e.target.value)}
                    placeholder="Detailed company overview and description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => handleInputChange('founded_year', e.target.value)}
                      placeholder="e.g., 2015"
                    />
                  </div>

                  <div>
                    <Label htmlFor="team_size">Team Size</Label>
                    <Input
                      id="team_size"
                      value={formData.team_size}
                      onChange={(e) => handleInputChange('team_size', e.target.value)}
                      placeholder="e.g., 25 employees"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason_for_sale">Reason for Sale</Label>
                  <Textarea
                    id="reason_for_sale"
                    value={formData.reason_for_sale}
                    onChange={(e) => handleInputChange('reason_for_sale', e.target.value)}
                    placeholder="Why is the business being sold?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="founder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Founder & Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="founder_name">Founder Name</Label>
                    <Input
                      id="founder_name"
                      value={formData.founder_name}
                      onChange={(e) => handleInputChange('founder_name', e.target.value)}
                      placeholder="Enter founder's name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="founder_title">Founder Title</Label>
                    <Input
                      id="founder_title"
                      value={formData.founder_title}
                      onChange={(e) => handleInputChange('founder_title', e.target.value)}
                      placeholder="e.g., CEO & Founder"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="founders_message">Founder's Message</Label>
                  <Textarea
                    id="founders_message"
                    value={formData.founders_message}
                    onChange={(e) => handleInputChange('founders_message', e.target.value)}
                    placeholder="Personal message from the founder about the business"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newOpportunity}
                      onChange={(e) => setNewOpportunity(e.target.value)}
                      placeholder="Add growth opportunity"
                      onKeyDown={(e) => e.key === 'Enter' && addGrowthOpportunity()}
                    />
                    <Button onClick={addGrowthOpportunity} disabled={!newOpportunity.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.growth_opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <span className="text-sm">{opportunity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGrowthOpportunity(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strategic Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ideal_buyer_profile">Ideal Buyer Profile</Label>
                    <Textarea
                      id="ideal_buyer_profile"
                      value={formData.ideal_buyer_profile}
                      onChange={(e) => handleInputChange('ideal_buyer_profile', e.target.value)}
                      placeholder="Describe the ideal buyer for this business"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rollup_potential">Rollup Potential</Label>
                    <Textarea
                      id="rollup_potential"
                      value={formData.rollup_potential}
                      onChange={(e) => handleInputChange('rollup_potential', e.target.value)}
                      placeholder="Platform or rollup opportunities"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="market_trends_alignment">Market Trends Alignment</Label>
                    <Textarea
                      id="market_trends_alignment"
                      value={formData.market_trends_alignment}
                      onChange={(e) => handleInputChange('market_trends_alignment', e.target.value)}
                      placeholder="How does this align with market trends?"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Primary Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="revenue">Annual Revenue</Label>
                    <Input
                      id="revenue"
                      value={formData.revenue}
                      onChange={(e) => handleInputChange('revenue', e.target.value)}
                      placeholder="e.g., $5M, $500K"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ebitda">EBITDA</Label>
                    <Input
                      id="ebitda"
                      value={formData.ebitda}
                      onChange={(e) => handleInputChange('ebitda', e.target.value)}
                      placeholder="e.g., $1.2M, $200K"
                    />
                  </div>

                  <div>
                    <Label htmlFor="asking_price">Asking Price</Label>
                    <Input
                      id="asking_price"
                      value={formData.asking_price}
                      onChange={(e) => handleInputChange('asking_price', e.target.value)}
                      placeholder="e.g., $10M, $2.5M"
                    />
                  </div>

                  <div>
                    <Label htmlFor="growth_rate">Growth Rate</Label>
                    <Input
                      id="growth_rate"
                      value={formData.growth_rate}
                      onChange={(e) => handleInputChange('growth_rate', e.target.value)}
                      placeholder="e.g., 25% YoY"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="profit_margin">Profit Margin</Label>
                    <Input
                      id="profit_margin"
                      value={formData.profit_margin}
                      onChange={(e) => handleInputChange('profit_margin', e.target.value)}
                      placeholder="e.g., 35%"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer_count">Customer Count</Label>
                    <Input
                      id="customer_count"
                      value={formData.customer_count}
                      onChange={(e) => handleInputChange('customer_count', e.target.value)}
                      placeholder="e.g., 500+ customers"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recurring_revenue">Recurring Revenue</Label>
                    <Input
                      id="recurring_revenue"
                      value={formData.recurring_revenue}
                      onChange={(e) => handleInputChange('recurring_revenue', e.target.value)}
                      placeholder="e.g., 80% recurring"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cac_ltv_ratio">CAC/LTV Ratio</Label>
                    <Input
                      id="cac_ltv_ratio"
                      value={formData.cac_ltv_ratio}
                      onChange={(e) => handleInputChange('cac_ltv_ratio', e.target.value)}
                      placeholder="e.g., 1:8 ratio"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};