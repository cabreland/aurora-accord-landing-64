import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { seedTestData } from '@/lib/seedTestData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronDown, Database, Trash2, TestTube, Copy } from 'lucide-react';

export const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show in development mode
  if (!import.meta.env.DEV) return null;

  const handleSeedData = async () => {
    setLoading(true);
    await seedTestData();
    setLoading(false);
  };

  const handleClearTestData = async () => {
    if (!confirm('⚠️ Clear all test data?\n\nThis will delete:\n- All deals\n- All NDAs\n- All access requests\n- All documents\n\nThis action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      // Delete in correct order (child tables first to respect foreign keys)
      await supabase.from('document_views').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('access_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('company_nda_acceptances').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      toast.success('All test data cleared successfully');
    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Failed to clear data: ' + (error as Error).message);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const testAccounts = [
    {
      email: 'investor@test.com',
      password: 'TestInvestor123!',
      role: 'Investor (Viewer)',
      color: 'bg-blue-500 dark:bg-blue-600'
    },
    {
      email: 'admin@test.com', 
      password: 'TestAdmin123!',
      role: 'Admin',
      color: 'bg-purple-500 dark:bg-purple-600'
    }
  ];

  const setupSQL = `-- Run in Supabase SQL Editor AFTER creating test accounts via Auth UI

-- Set investor role
UPDATE profiles 
SET 
  role = 'viewer',
  full_name = 'Test Investor',
  company_name = 'Test Investment Group',
  phone = '+1-555-0100'
WHERE email = 'investor@test.com';

-- Set admin role  
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'Test Admin'
WHERE email = 'admin@test.com';

-- Verify roles
SELECT email, role, full_name FROM profiles WHERE email LIKE '%@test.com';`;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        title={isOpen ? 'Close Dev Tools' : 'Open Dev Tools'}
      >
        {isOpen ? <ChevronDown className="h-6 w-6" /> : <TestTube className="h-6 w-6" />}
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[420px] animate-in slide-in-from-bottom-5">
          <Card className="shadow-2xl border-orange-500 border-2">
            <CardHeader className="bg-orange-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Dev Tools
                <Badge variant="secondary" className="ml-auto">Development Only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="accounts">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="accounts">Test Accounts</TabsTrigger>
                  <TabsTrigger value="data">Test Data</TabsTrigger>
                </TabsList>

                <TabsContent value="accounts" className="space-y-3 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Use these test accounts for development:
                  </p>
                  
                  {testAccounts.map((account) => (
                    <Card key={account.email} className="bg-muted/50">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={account.color}>{account.role}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(account.email, 'Email')}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Email
                          </Button>
                        </div>
                        <div className="text-sm space-y-1 font-mono">
                          <p className="text-xs break-all text-muted-foreground">{account.email}</p>
                          <p className="text-xs break-all text-muted-foreground">{account.password}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="border-t pt-3 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Setup SQL</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(setupSQL, 'SQL')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy SQL
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold">⚠️ One-time setup required:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to Supabase Dashboard → Authentication → Users</li>
                        <li>Click "Add User" → "Create new user"</li>
                        <li>Create both accounts above</li>
                        <li>Go to SQL Editor and run the SQL above</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="space-y-3 mt-4">
                  <Button
                    onClick={handleSeedData}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Seed Test Data'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Creates 5 sample deals with realistic data and configures NDA settings.
                  </p>

                  <Button
                    onClick={handleClearTestData}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loading ? 'Clearing...' : 'Clear All Test Data'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Removes all deals, NDAs, access requests, and documents (irreversible!)
                  </p>

                  <div className="border-t pt-3 mt-4">
                    <p className="text-sm font-semibold mb-2">🧪 Testing Workflow:</p>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li><strong>Seed data</strong> using button above</li>
                      <li><strong>Open incognito</strong> window</li>
                      <li><strong>Login as investor@test.com</strong></li>
                      <li><strong>Browse deals</strong> on investor portal</li>
                      <li><strong>Click deal</strong> → Data Room → Sign NDA</li>
                      <li><strong>Request access</strong> to Financial docs</li>
                      <li><strong>Open 2nd incognito</strong> window</li>
                      <li><strong>Login as admin@test.com</strong></li>
                      <li><strong>Go to Access Requests</strong> → Approve</li>
                      <li><strong>Back to investor</strong> → verify access granted</li>
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
