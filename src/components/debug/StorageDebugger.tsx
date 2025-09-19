import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkStorageFiles, listStorageContents } from '@/utils/storageTest';
import { CheckCircle, XCircle, FileText, Folder } from 'lucide-react';

interface StorageDebuggerProps {
  dealId: string;
}

const StorageDebugger = ({ dealId }: StorageDebuggerProps) => {
  const [results, setResults] = useState<any>(null);
  const [storageContents, setStorageContents] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting storage check...');
      
      const [fileCheck, storageList] = await Promise.all([
        checkStorageFiles(dealId),
        listStorageContents(dealId)
      ]);
      
      setResults(fileCheck);
      setStorageContents(storageList);
      
      console.log('✅ Storage check complete');
    } catch (error) {
      console.error('❌ Check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Storage Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runCheck} disabled={loading}>
            {loading ? 'Checking Storage...' : 'Check Storage Files'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Database vs Storage Check</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <div className="text-red-400">{results.error}</div>
            ) : (
              <div className="space-y-3">
                <p>Total files in database: {results.total_files}</p>
                {results.results?.map((result: any, index: number) => (
                  <div key={index} className="border rounded p-3 space-y-2">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.file_path}</div>
                    <div className="flex gap-2">
                      <Badge variant={result.signed_url_success ? "default" : "destructive"}>
                        {result.signed_url_success ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />Signed URL OK</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" />Signed URL Failed</>
                        )}
                      </Badge>
                      <Badge variant={result.found_in_list ? "default" : "destructive"}>
                        {result.found_in_list ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />Found in Storage</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" />Not Found</>
                        )}
                      </Badge>
                    </div>
                    {result.signed_url_error && (
                      <div className="text-sm text-red-400">Signed URL Error: {result.signed_url_error}</div>
                    )}
                    {result.list_error && (
                      <div className="text-sm text-red-400">List Error: {result.list_error}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {storageContents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Actual Storage Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storageContents.error ? (
              <div className="text-red-400">{storageContents.error}</div>
            ) : (
              <div className="space-y-2">
                <p>Total files in storage: {storageContents.total_storage_files}</p>
                {storageContents.storage_files?.map((file: any, index: number) => (
                  <div key={index} className="border rounded p-2">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Folder: {file.folder} | Full Path: {file.full_path}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Size: {file.metadata?.size || 'unknown'} | 
                      Last Modified: {file.updated_at || file.created_at || 'unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StorageDebugger;