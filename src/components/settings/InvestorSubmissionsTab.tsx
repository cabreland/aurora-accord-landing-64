import React, { useState } from 'react';
import { useInvestorSubmissions } from '@/hooks/useInvestorSubmissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, Eye, FileJson, FileSpreadsheet, TrendingUp, Users, Target, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const InvestorSubmissionsTab = () => {
  const { submissions, loading, stats, fetchSubmissions, exportToCSV, exportToJSON } = useInvestorSubmissions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [acquisitionGoalFilter, setAcquisitionGoalFilter] = useState('all');
  const [referralSourceFilter, setReferralSourceFilter] = useState('all');
  const [businessOwnerFilter, setBusinessOwnerFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleFilter = () => {
    fetchSubmissions({
      searchQuery,
      acquisitionGoal: acquisitionGoalFilter,
      referralSource: referralSourceFilter,
      businessOwner: businessOwnerFilter
    });
  };

  const handleViewDetail = (submission: any) => {
    setSelectedSubmission(submission);
    setIsDetailOpen(true);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Referral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold">
                {stats.topReferrals[0]?.source?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Submissions</CardTitle>
          <CardDescription>Search and filter investor onboarding submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={acquisitionGoalFilter} onValueChange={setAcquisitionGoalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Acquisition Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="first_acquisition">First Acquisition</SelectItem>
                <SelectItem value="growing_portfolio">Growing Portfolio</SelectItem>
                <SelectItem value="strategic_addon">Strategic Add-on</SelectItem>
                <SelectItem value="exit_strategy">Exit Strategy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={referralSourceFilter} onValueChange={setReferralSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Referral Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleFilter} className="w-full">
              Apply Filters
            </Button>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(submissions)}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToJSON(submissions)}
              className="gap-2"
            >
              <FileJson className="w-4 h-4" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>View all investor onboarding submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Investment Range</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.full_name || 'N/A'}</TableCell>
                      <TableCell>{submission.company_name || '-'}</TableCell>
                      <TableCell className="text-sm">{submission.profiles?.email || 'N/A'}</TableCell>
                      <TableCell>
                        {submission.acquisition_goal ? (
                          <Badge variant="outline">
                            {submission.acquisition_goal.replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.asking_price_min || submission.asking_price_max
                          ? `${formatCurrency(submission.asking_price_min)} - ${formatCurrency(submission.asking_price_max)}`
                          : 'Not specified'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.completed_at
                          ? format(new Date(submission.completed_at), 'MMM dd, yyyy')
                          : 'Not completed'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(submission)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Complete onboarding information for {selectedSubmission?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Full Name</h4>
                  <p>{selectedSubmission.full_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Company</h4>
                  <p>{selectedSubmission.company_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Phone</h4>
                  <p>{selectedSubmission.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">LinkedIn</h4>
                  <p className="text-sm break-all">{selectedSubmission.linkedin_url || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Business Background</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Owns Business:</span>{' '}
                    {selectedSubmission.owns_business ? 'Yes' : 'No'}
                  </p>
                  {selectedSubmission.owns_business && (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {selectedSubmission.business_type || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Revenue:</span> {selectedSubmission.annual_revenue || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Profit:</span> {selectedSubmission.annual_profit || 'N/A'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Investment Criteria</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Goal:</span>{' '}
                    {selectedSubmission.acquisition_goal?.replace(/_/g, ' ') || 'N/A'}
                  </p>
                  {selectedSubmission.ideal_business_types?.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Business Types:</span>{' '}
                      {selectedSubmission.ideal_business_types.join(', ')}
                    </p>
                  )}
                  {selectedSubmission.preferred_tech_stacks?.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Tech Stacks:</span>{' '}
                      {selectedSubmission.preferred_tech_stacks.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Financial Parameters</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">TTM Revenue:</span>{' '}
                    {formatCurrency(selectedSubmission.ttm_revenue_min)} -{' '}
                    {formatCurrency(selectedSubmission.ttm_revenue_max)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Asking Price:</span>{' '}
                    {formatCurrency(selectedSubmission.asking_price_min)} -{' '}
                    {formatCurrency(selectedSubmission.asking_price_max)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Referral:</span> {selectedSubmission.referral_source || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Submitted</h4>
                  <p className="text-sm">
                    {selectedSubmission.completed_at
                      ? format(new Date(selectedSubmission.completed_at), 'MMM dd, yyyy h:mm a')
                      : 'Not completed'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Created</h4>
                  <p className="text-sm">
                    {format(new Date(selectedSubmission.created_at), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorSubmissionsTab;
