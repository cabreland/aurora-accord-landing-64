import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  email: string;
  role?: 'viewer' | 'editor' | 'admin';
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

    // Emergency bypass for super admin
    if (user.email === 'cabreland@gmail.com') {
      console.log('Emergency super admin bypass activated for:', user.email);
    } else if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, role = 'viewer' }: InviteRequest = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingProfile } = await supabaseServiceRole
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the site URL for redirect
    let siteUrl = Deno.env.get('SITE_URL');
    if (!siteUrl) {
      const origin = req.headers.get('origin');
      // Allowed origins for redirect
      const allowedOrigins = [
        'http://localhost:3000',
        'https://gbjmklhvrmecawaacqeb.lovable.dev'
      ];
      
      if (origin && allowedOrigins.includes(origin)) {
        siteUrl = origin;
      } else {
        siteUrl = 'https://gbjmklhvrmecawaacqeb.lovable.dev'; // fallback to deployed app
      }
    }

    // Invite user using service role
    const { data: inviteData, error: inviteError } = await supabaseServiceRole.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        data: { 
          invited_by_admin: true,
          invited_by: user.id,
          role: role
        },
        redirectTo: `${siteUrl}/auth/callback`
      }
    );

    if (inviteError) {
      console.error('Error inviting user:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create pending profile entry for invited user
    if (inviteData.user?.id) {
      await supabaseServiceRole.from('profiles').upsert({
        user_id: inviteData.user.id,
        email: email.trim().toLowerCase(),
        role: role,
        onboarding_completed: false
      });
    }

    // Log security event
    await supabaseServiceRole.rpc('log_security_event', {
      p_event_type: 'user_invited',
      p_event_data: { invited_email: email.trim().toLowerCase(), invited_user_id: inviteData.user?.id, role },
      p_user_id: user.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User invitation sent successfully',
        user_id: inviteData.user?.id 
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