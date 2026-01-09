import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { DealWithDiligence, DiligenceRequest, DiligenceCategory } from '@/hooks/useDiligenceTracker';

interface ExportDropdownProps {
  deals: DealWithDiligence[];
  requests: DiligenceRequest[];
  categories: DiligenceCategory[];
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ 
  deals, 
  requests,
  categories 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Helper to convert data to CSV format
  const convertToCSV = (data: Record<string, any>[], headers: string[]): string => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] ?? '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // Download helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Export current view as CSV
  const exportCurrentViewCSV = async () => {
    setIsExporting(true);
    try {
      const headers = ['Company', 'Deal Title', 'Status', 'Total Requests', 'Completed', 'Progress %'];
      const data = deals.map(deal => ({
        'Company': deal.company_name,
        'Deal Title': deal.title,
        'Status': deal.status,
        'Total Requests': deal.total_requests,
        'Completed': deal.completed_requests,
        'Progress %': deal.progress_percentage
      }));

      const csv = convertToCSV(data, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(csv, `diligence-trackers-${timestamp}.csv`, 'text/csv');
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Export all trackers with detailed data (Excel-like CSV)
  const exportAllTrackersExcel = async () => {
    setIsExporting(true);
    try {
      const headers = [
        'Company', 'Deal Title', 'Request Title', 'Category', 'Priority', 
        'Status', 'Due Date', 'Created At', 'Description'
      ];
      
      const data = requests.map(req => {
        const deal = deals.find(d => d.id === req.deal_id);
        const category = categories.find(c => c.id === req.category_id);
        return {
          'Company': deal?.company_name || 'Unknown',
          'Deal Title': deal?.title || 'Unknown',
          'Request Title': req.title,
          'Category': category?.name || 'General',
          'Priority': req.priority.charAt(0).toUpperCase() + req.priority.slice(1),
          'Status': req.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          'Due Date': req.due_date ? new Date(req.due_date).toLocaleDateString() : 'Not set',
          'Created At': new Date(req.created_at).toLocaleDateString(),
          'Description': req.description || ''
        };
      });

      const csv = convertToCSV(data, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(csv, `diligence-all-requests-${timestamp}.csv`, 'text/csv');
      toast.success('All trackers exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate Executive Report (HTML that can be printed as PDF)
  const generateExecutiveReport = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toLocaleString();
      const totalRequests = requests.length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const overdueRequests = requests.filter(r => {
        if (!r.due_date || r.status === 'completed') return false;
        return new Date(r.due_date) < new Date();
      }).length;
      const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

      // Category breakdown
      const categoryStats = categories.map(cat => {
        const catRequests = requests.filter(r => r.category_id === cat.id);
        const completed = catRequests.filter(r => r.status === 'completed').length;
        return {
          name: cat.name,
          total: catRequests.length,
          completed,
          percentage: catRequests.length > 0 ? Math.round((completed / catRequests.length) * 100) : 0
        };
      }).filter(c => c.total > 0);

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diligence Tracker Executive Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 700; color: #2563eb; }
    .subtitle { color: #666; margin-top: 5px; }
    .timestamp { color: #888; font-size: 12px; margin-top: 10px; }
    h2 { color: #1a1a1a; font-size: 18px; margin: 25px 0 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .summary-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; }
    .summary-value { font-size: 32px; font-weight: 700; color: #2563eb; }
    .summary-label { color: #666; font-size: 12px; text-transform: uppercase; margin-top: 5px; }
    .overdue .summary-value { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f8f9fa; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #666; }
    .progress-bar { width: 100px; height: 8px; background: #e5e5e5; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #2563eb; border-radius: 4px; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .status-active { background: #dcfce7; color: #166534; }
    .status-warning { background: #fef3c7; color: #92400e; }
    .status-danger { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #888; font-size: 12px; }
    @media print { body { padding: 20px; } .summary-grid { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">📋 Diligence Tracker</div>
    <div class="subtitle">Executive Summary Report</div>
    <div class="timestamp">Generated: ${timestamp}</div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${deals.length}</div>
      <div class="summary-label">Active Trackers</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${totalRequests}</div>
      <div class="summary-label">Total Requests</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${completionRate}%</div>
      <div class="summary-label">Completion Rate</div>
    </div>
    <div class="summary-card ${overdueRequests > 0 ? 'overdue' : ''}">
      <div class="summary-value">${overdueRequests}</div>
      <div class="summary-label">Overdue Items</div>
    </div>
  </div>

  <h2>Tracker Progress</h2>
  <table>
    <thead>
      <tr>
        <th>Company</th>
        <th>Deal</th>
        <th>Status</th>
        <th>Progress</th>
        <th>Requests</th>
      </tr>
    </thead>
    <tbody>
      ${deals.map(deal => `
        <tr>
          <td><strong>${deal.company_name}</strong></td>
          <td>${deal.title}</td>
          <td>
            <span class="status-badge ${
              deal.progress_percentage === 100 ? 'status-active' :
              deal.progress_percentage < 25 ? 'status-danger' : 'status-warning'
            }">${deal.status}</span>
          </td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${deal.progress_percentage}%"></div>
            </div>
            ${deal.progress_percentage}%
          </td>
          <td>${deal.completed_requests}/${deal.total_requests}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Category Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Total Items</th>
        <th>Completed</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>
      ${categoryStats.map(cat => `
        <tr>
          <td><strong>${cat.name}</strong></td>
          <td>${cat.total}</td>
          <td>${cat.completed}</td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${cat.percentage}%"></div>
            </div>
            ${cat.percentage}%
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This report was automatically generated by the Diligence Tracker system.</p>
    <p>For questions or support, please contact your administrator.</p>
  </div>
</body>
</html>`;

      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        toast.success('Report generated - Use browser print to save as PDF');
      } else {
        toast.error('Pop-up blocked. Please allow pop-ups to generate report.');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  // Export raw data as JSON
  const exportRawDataJSON = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        summary: {
          totalDeals: deals.length,
          totalRequests: requests.length,
          completedRequests: requests.filter(r => r.status === 'completed').length,
          categories: categories.length
        },
        deals: deals.map(deal => ({
          ...deal,
          requests: requests.filter(r => r.deal_id === deal.id).map(req => ({
            ...req,
            category_name: categories.find(c => c.id === req.category_id)?.name || 'Unknown'
          }))
        })),
        categories
      };

      const json = JSON.stringify(exportData, null, 2);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(json, `diligence-raw-data-${timestamp}.json`, 'application/json');
      toast.success('JSON data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export JSON');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-200 text-gray-700 hover:bg-gray-50"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={exportCurrentViewCSV} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          <div>
            <div className="font-medium">Export Current View</div>
            <div className="text-xs text-gray-500">CSV format</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAllTrackersExcel} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />
          <div>
            <div className="font-medium">Export All Trackers</div>
            <div className="text-xs text-gray-500">Excel/CSV with details</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={generateExecutiveReport} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2 text-purple-600" />
          <div>
            <div className="font-medium">Executive Report</div>
            <div className="text-xs text-gray-500">Print as PDF</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportRawDataJSON} className="cursor-pointer">
          <FileJson className="w-4 h-4 mr-2 text-amber-600" />
          <div>
            <div className="font-medium">Download Raw Data</div>
            <div className="text-xs text-gray-500">JSON format</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
