
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

const FILE_VALIDATION = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.gif', '.txt', '.csv'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/gif',
    'text/plain',
    'text/csv'
  ],
  DANGEROUS_PATTERNS: [
    /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi,
    /(javascript:)/gi,
    /(vbscript:)/gi,
    /(onload=)/gi,
    /(onerror=)/gi,
    /(onclick=)/gi,
    /(<iframe[\s\S]*?>)/gi,
    /(<object[\s\S]*?>)/gi,
    /(<embed[\s\S]*?>)/gi
  ]
}

// Sanitize filename to be safe but allow common business document characters
const sanitizeFilename = (filename: string): string => {
  // Remove or replace dangerous characters but allow spaces, hyphens, underscores, parentheses, ampersands
  return filename
    .replace(/[<>:"|?*]/g, '_') // Replace Windows-forbidden chars
    .replace(/\.\./g, '_') // Replace path traversal attempts
    .replace(/^\./, '_') // Don't allow hidden files
    .trim()
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const dealId = formData.get('dealId') as string
    const fileName = formData.get('fileName') as string

    if (!file || !dealId || !fileName) {
      throw new Error('Missing required parameters')
    }

    // Validate file size
    if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${FILE_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB`)
    }

    // Validate file extension
    const extension = '.' + fileName.split('.').pop()?.toLowerCase()
    if (!FILE_VALIDATION.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`File type not allowed. Allowed types: ${FILE_VALIDATION.ALLOWED_EXTENSIONS.join(', ')}`)
    }

    // Validate MIME type
    if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Invalid file type detected')
    }

    // Sanitize filename - now more permissive for business documents
    const sanitizedName = sanitizeFilename(fileName)
    
    // Check for filename length
    if (sanitizedName.length > 255) {
      throw new Error('Filename is too long. Maximum 255 characters allowed.')
    }

    // Check for reserved Windows names
    const baseName = sanitizedName.split('.')[0].toUpperCase()
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    if (reservedNames.includes(baseName)) {
      throw new Error('Filename uses a reserved system name')
    }

    // Check for executable extensions (security)
    const executableExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar', '.app', '.dmg']
    if (executableExtensions.includes(extension)) {
      throw new Error('Executable file types are not allowed')
    }

    // Read file content for additional validation (only for text-based files to avoid memory issues)
    if (file.type.startsWith('text/') && file.size < 1024 * 1024) { // Only check text files under 1MB
      const fileContent = await file.text()
      
      // Check for dangerous patterns in file content
      for (const pattern of FILE_VALIDATION.DANGEROUS_PATTERNS) {
        if (pattern.test(fileContent)) {
          await supabase.rpc('log_security_event', {
            p_event_type: 'malicious_file_detected',
            p_event_data: {
              filename: fileName,
              dealId,
              userId: user.id,
              pattern: pattern.toString()
            }
          })
          throw new Error('File contains potentially malicious content')
        }
      }
    }

    // Check user permissions for the deal
    const { data: dealAccess, error: accessError } = await supabase
      .rpc('user_has_deal_access', { user_uuid: user.id, deal_uuid: dealId })

    if (accessError) {
      console.error('Error checking deal access:', accessError)
      throw new Error('Failed to verify deal access')
    }

    if (!dealAccess) {
      await supabase.rpc('log_security_event', {
        p_event_type: 'unauthorized_upload_attempt',
        p_event_data: {
          filename: fileName,
          dealId,
          userId: user.id
        }
      })
      throw new Error('Unauthorized: No access to this deal')
    }

    // Additional check for upload permissions
    const { data: assignments, error: assignmentError } = await supabase
      .from('deal_assignments')
      .select('can_upload')
      .eq('user_id', user.id)
      .eq('deal_id', dealId)
      .single()

    if (assignmentError && assignmentError.code !== 'PGRST116') {
      console.error('Error checking upload permissions:', assignmentError)
      throw new Error('Failed to verify upload permissions')
    }

    // Check if user is admin or has upload permissions
    const { data: userRole } = await supabase.rpc('get_user_role', { user_uuid: user.id })
    
    if (userRole !== 'admin' && (!assignments || !assignments.can_upload)) {
      await supabase.rpc('log_security_event', {
        p_event_type: 'unauthorized_upload_attempt',
        p_event_data: {
          filename: fileName,
          dealId,
          userId: user.id,
          reason: 'insufficient_permissions'
        }
      })
      throw new Error('Unauthorized: No upload permissions for this deal')
    }

    // Log successful validation
    await supabase.rpc('log_security_event', {
      p_event_type: 'file_validation_success',
      p_event_data: {
        filename: fileName,
        dealId,
        userId: user.id,
        fileSize: file.size,
        fileType: file.type
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'File validation passed',
        sanitizedName: sanitizedName
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('File validation error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'File validation failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
