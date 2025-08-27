import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  user_id?: string;
  email?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client to verify the requester
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using service role
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin privileges' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body (accept either user_id or email)
    const { user_id: bodyUserId, email }: DeleteUserRequest = await req.json();

    let targetUserId = bodyUserId?.trim() || '';
    let targetEmail = email?.trim() || '';

    if (!targetUserId && !targetEmail) {
      return new Response(
        JSON.stringify({ error: 'Provide user_id or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If only email provided, try to resolve user_id via profiles first
    if (!targetUserId && targetEmail) {
      const { data: profByEmail } = await supabaseServiceRole
        .from('profiles')
        .select('user_id')
        .eq('email', targetEmail)
        .maybeSingle();
      if (profByEmail?.user_id) {
        targetUserId = profByEmail.user_id;
      }

      // If still no user_id, search auth users (paginate)
      if (!targetUserId) {
        try {
          let page = 1;
          const perPage = 200;
          while (true) {
            const { data: list, error: listErr } = await supabaseServiceRole.auth.admin.listUsers({ page, perPage });
            if (listErr) {
              console.warn('listUsers error:', listErr);
              break;
            }
            const match = list?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
            if (match) {
              targetUserId = match.id;
              break;
            }
            if (!list || list.users.length < perPage) break;
            page += 1;
          }
        } catch (e) {
          console.warn('Error searching auth users by email:', e);
        }
      }
    }

    // Prevent admin from deleting themselves
    if (targetUserId && targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile before deletion for logging (try by user_id then email)
    let targetProfile: { email: string | null; first_name: string | null; last_name: string | null } | null = null;
    if (targetUserId) {
      const { data } = await supabaseServiceRole
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('user_id', targetUserId)
        .maybeSingle();
      if (data) targetProfile = data;
    }
    if (!targetProfile && targetEmail) {
      const { data } = await supabaseServiceRole
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('email', targetEmail)
        .maybeSingle();
      if (data) targetProfile = data;
    }

    // Try to delete from auth if we have an id
    let authDeleted = false;
    if (targetUserId) {
      const { error: deleteError } = await supabaseServiceRole.auth.admin.deleteUser(targetUserId);
      if (deleteError) {
        console.warn('Error deleting user from auth (continuing to clean profiles):', deleteError);
      } else {
        authDeleted = true;
      }
    }

    // Always delete profile rows (by user_id or email)
    let profileDeletedCount = 0;
    if (targetUserId) {
      const { error: profDelErr, count } = await supabaseServiceRole
        .from('profiles')
        .delete({ count: 'exact' })
        .eq('user_id', targetUserId);
      if (!profDelErr) profileDeletedCount += (count || 0);
    }
    if (targetEmail) {
      const { error: profDelByEmailErr, count } = await supabaseServiceRole
        .from('profiles')
        .delete({ count: 'exact' })
        .eq('email', targetEmail);
      if (!profDelByEmailErr) profileDeletedCount += (count || 0);
    }

    // Log security event
    await supabaseServiceRole.rpc('log_security_event', {
      p_event_type: 'user_deleted',
      p_event_data: {
        deleted_user_id: targetUserId || null,
        deleted_email: targetProfile?.email || targetEmail || null,
        deleted_name: targetProfile ? `${targetProfile.first_name || ''} ${targetProfile.last_name || ''}`.trim() : null,
        auth_deleted: authDeleted,
        profiles_removed: profileDeletedCount
      },
      p_user_id: user.id
    });

    if (!authDeleted && profileDeletedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found in auth or profiles' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User removed from authentication system and/or profiles',
        details: { authDeleted, profileDeletedCount }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});