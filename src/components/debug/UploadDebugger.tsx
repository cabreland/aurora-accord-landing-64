import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface UploadDebuggerProps {
  dealId: string;
}

const UploadDebugger = ({ dealId }: UploadDebuggerProps) => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runUploadTest = async () => {
    setLoading(true);
    const testResults: any = {};
    
    try {
      console.log('🧪 Starting upload test...');
      
      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      testResults.auth = {
        success: !authError && !!user,
        user: user?.email,
        error: authError?.message
      };
      console.log('🔐 Auth check:', testResults.auth);

      // 2. Check bucket access
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        testResults.buckets = {
          success: !bucketError,
          available: buckets?.map(b => b.name),
          hasDealDocs: buckets?.some(b => b.name === 'deal-documents'),
          error: bucketError?.message
        };
      } catch (bucketErr) {
        testResults.buckets = {
          success: false,
          error: (bucketErr as Error).message
        };
      }
      console.log('📦 Bucket check:', testResults.buckets);

      // 3. Test file upload permissions
      const testContent = new Blob(['Test upload content'], { type: 'text/plain' });
      const testPath = `${dealId}/test/upload-test-${Date.now()}.txt`;
      
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('deal-documents')
          .upload(testPath, testContent);
        
        testResults.upload = {
          success: !uploadError,
          path: uploadData?.path,
          error: uploadError?.message
        };
        
        // If upload succeeded, try to verify and clean up
        if (!uploadError) {
          const { data: listData, error: listError } = await supabase.storage
            .from('deal-documents')
            .list(testPath.substring(0, testPath.lastIndexOf('/')));
          
          testResults.verification = {
            success: !listError,
            found: listData?.some(f => f.name === testPath.substring(testPath.lastIndexOf('/') + 1)),
            error: listError?.message
          };
          
          // Clean up test file
          await supabase.storage
            .from('deal-documents')
            .remove([testPath]);
        }
      } catch (uploadErr) {
        testResults.upload = {
          success: false,
          error: (uploadErr as Error).message
        };
      }
      console.log('📤 Upload test:', testResults.upload);

      // 4. Check RLS policies
      try {
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('id, name')
          .eq('deal_id', dealId)
          .limit(1);
        
        testResults.database = {
          success: !docsError,
          canRead: !!docs,
          error: docsError?.message
        };
      } catch (dbErr) {
        testResults.database = {
          success: false,
          error: (dbErr as Error).message
        };
      }
      console.log('💾 Database check:', testResults.database);

      setResults(testResults);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setResults({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (test: any) => {
    if (!test) return <Badge variant="secondary">Not tested</Badge>;
    
    if (test.success) {
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Pass
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Fail
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runUploadTest} disabled={loading}>
          {loading ? 'Running Tests...' : 'Test Upload System'}
        </Button>

        {results && (
          <div className="space-y-3">
            {results.error ? (
              <div className="text-red-400">Test Error: {results.error}</div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span>Authentication</span>
                  {getStatusBadge(results.auth)}
                </div>
                {results.auth?.user && (
                  <div className="text-sm text-muted-foreground ml-4">
                    Logged in as: {results.auth.user}
                  </div>
                )}
                {results.auth?.error && (
                  <div className="text-sm text-red-400 ml-4">
                    Error: {results.auth.error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Storage Buckets</span>
                  {getStatusBadge(results.buckets)}
                </div>
                {results.buckets?.available && (
                  <div className="text-sm text-muted-foreground ml-4">
                    Available: {results.buckets.available.join(', ')}
                  </div>
                )}
                {results.buckets?.hasDealDocs === false && (
                  <div className="text-sm text-red-400 ml-4">
                    ⚠️ 'deal-documents' bucket not found!
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Upload Test</span>
                  {getStatusBadge(results.upload)}
                </div>
                {results.upload?.error && (
                  <div className="text-sm text-red-400 ml-4">
                    Error: {results.upload.error}
                  </div>
                )}

                {results.verification && (
                  <div className="flex items-center justify-between">
                    <span>Upload Verification</span>
                    {getStatusBadge(results.verification)}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Database Access</span>
                  {getStatusBadge(results.database)}
                </div>
                {results.database?.error && (
                  <div className="text-sm text-red-400 ml-4">
                    Error: {results.database.error}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadDebugger;