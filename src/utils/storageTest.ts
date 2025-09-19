import { supabase } from '@/integrations/supabase/client';

export const checkStorageFiles = async (dealId: string) => {
  try {
    console.log('🔍 Checking storage for deal:', dealId);
    
    // Get database records first
    const { data: dbFiles, error: dbError } = await supabase
      .from('documents')
      .select('id, name, file_path')
      .eq('deal_id', dealId);
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
      return { error: 'Database error: ' + dbError.message };
    }
    
    console.log('📄 Database files:', dbFiles);
    
    // Check storage files
    const results = [];
    
    for (const dbFile of dbFiles || []) {
      console.log(`\n🔍 Checking file: ${dbFile.file_path}`);
      
      // Try to create signed URL
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(dbFile.file_path, 60);
      
      // Try to list the file
      const pathParts = dbFile.file_path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1).join('/');
      
      const { data: listData, error: listError } = await supabase.storage
        .from('deal-documents')
        .list(folderPath, { search: fileName });
      
      const result = {
        id: dbFile.id,
        name: dbFile.name,
        file_path: dbFile.file_path,
        signed_url_success: !urlError,
        signed_url_error: urlError?.message,
        list_success: !listError,
        list_error: listError?.message,
        found_in_list: listData ? listData.some(f => f.name === fileName) : false,
        list_data: listData
      };
      
      console.log('📊 Result:', result);
      results.push(result);
    }
    
    return { results, total_files: dbFiles?.length || 0 };
    
  } catch (error) {
    console.error('❌ Storage check error:', error);
    return { error: 'Storage check failed: ' + (error as Error).message };
  }
};

// Also check what's actually in storage for this deal
export const listStorageContents = async (dealId: string) => {
  try {
    console.log('📁 Listing storage contents for deal:', dealId);
    
    // List root level for this deal
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('deal-documents')
      .list(dealId, { limit: 100 });
    
    if (rootError) {
      console.error('❌ Root list error:', rootError);
      return { error: 'Root list error: ' + rootError.message };
    }
    
    console.log('📂 Root folders/files:', rootFiles);
    
    // If there are folders, list their contents
    const allFiles = [];
    for (const item of rootFiles || []) {
      if (item.name && !item.name.includes('.')) {
        // This is likely a folder, list its contents
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('deal-documents')
          .list(`${dealId}/${item.name}`, { limit: 100 });
        
        if (!folderError && folderFiles) {
          console.log(`📁 Folder ${item.name} contents:`, folderFiles);
          allFiles.push(...folderFiles.map(f => ({ ...f, folder: item.name, full_path: `${dealId}/${item.name}/${f.name}` })));
        }
      } else {
        // This is a file
        allFiles.push({ ...item, folder: 'root', full_path: `${dealId}/${item.name}` });
      }
    }
    
    return { storage_files: allFiles, total_storage_files: allFiles.length };
    
  } catch (error) {
    console.error('❌ Storage list error:', error);
    return { error: 'Storage list failed: ' + (error as Error).message };
  }
};