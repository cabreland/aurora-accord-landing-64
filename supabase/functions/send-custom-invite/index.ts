import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Resend client will be created inside the request handler to avoid preflight failures

interface InviteRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'viewer' | 'editor' | 'admin';
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

    // Initialize Resend inside handler to avoid preflight failures
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_KEY) {
      console.error('Missing RESEND_API_KEY secret');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const resend = new Resend(RESEND_KEY);

    // Parse request body
    const { email, first_name, last_name, role }: InviteRequest = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the site URL for redirect
    let siteUrl = Deno.env.get('SITE_URL');
    if (!siteUrl) {
      const origin = req.headers.get('origin');
      const allowedOrigins = [
        'http://localhost:3000',
        'https://gbjmklhvrmecawaacqeb.lovable.dev'
      ];
      
      if (origin && allowedOrigins.includes(origin)) {
        siteUrl = origin;
      } else {
        siteUrl = 'https://gbjmklhvrmecawaacqeb.lovable.dev';
      }
    }

    // Generate invite or recovery link using service role (handle existing users)
    let linkData: any | null = null;
    let linkError: any | null = null;
    let isExistingUser = false;

    const lowerEmail = email.trim().toLowerCase();

    ({ data: linkData, error: linkError } = await supabaseServiceRole.auth.admin.generateLink({
      type: 'invite',
      email: lowerEmail,
      options: {
        redirectTo: `${siteUrl}/auth/accept`,
        data: {
          first_name: first_name?.trim(),
          last_name: last_name?.trim()
        }
      }
    }));

    if (linkError && (linkError.status === 422 || linkError?.code === 'email_exists')) {
      // User already exists - send a password setup (recovery) link instead
      isExistingUser = true;
      ({ data: linkData, error: linkError } = await supabaseServiceRole.auth.admin.generateLink({
        type: 'recovery',
        email: lowerEmail,
        options: {
          redirectTo: `${siteUrl}/auth/accept`
        }
      }));
    }

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Error generating invite/recovery link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate invitation link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const actionLink = linkData.properties.action_link;

    // Send custom branded email
    const roleDisplayName = role === 'admin' ? 'Administrator' : role === 'editor' ? 'Editor' : 'Viewer';
    const displayName = first_name && last_name ? `${first_name} ${last_name}` : email.trim().toLowerCase();
    const introText = isExistingUser
      ? `You've been granted access. Click the button below to sign in and set your password.`
      : `You've been invited as <strong>${roleDisplayName}</strong> to join the Exclusive Business Brokers investor platform. Click the button below to verify your account and set your password.`;
    const buttonText = isExistingUser ? 'Set Password & Sign In' : 'Accept Invitation & Set Password';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1e293b, #334155); padding: 40px 20px; text-align: center; }
          .logo { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 20px; }
          .title { color: #1e293b; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; }
          .text { color: #64748b; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Exclusive Business Brokers</h1>
          </div>
          <div class="content">
            <h2 class="title">Welcome ${first_name ? first_name : ''}!</h2>
            <p class="text">
              ${introText}
            </p>
            <p style="text-align: center; margin: 32px 0;">
              <a href="${actionLink}" class="button">
                ${buttonText}
              </a>
            </p>
            <p class="text">
              If you have any questions, please contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Exclusive Business Brokers. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Exclusive Business Brokers <onboarding@resend.dev>',
      to: [email.trim().toLowerCase()],
      subject: isExistingUser ? "Complete your access to Exclusive Business Brokers" : "You're invited to Exclusive Business Brokers",
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or update profile entry
    if (linkData.user?.id) {
      await supabaseServiceRole.from('profiles').upsert({
        user_id: linkData.user.id,
        email: lowerEmail,
        first_name: first_name?.trim() || null,
        last_name: last_name?.trim() || null,
        role,
        onboarding_completed: false
      });
    } else {
      // Existing user without user object in response - update by email
      await supabaseServiceRole
        .from('profiles')
        .update({
          first_name: first_name?.trim() || null,
          last_name: last_name?.trim() || null,
          role
        })
        .eq('email', lowerEmail);
    }

    // Log security event
    await supabaseServiceRole.rpc('log_security_event', {
      p_event_type: 'user_invited',
      p_event_data: { invited_email: lowerEmail, invited_user_id: linkData.user?.id, role, existing_user: isExistingUser },
      p_user_id: user.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        user_id: linkData.user?.id 
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