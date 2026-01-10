import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  invitee_email: string;
  invitee_name?: string;
  role: string;
  personal_message?: string;
  deal_id?: string;
  permissions?: Record<string, boolean>;
}

const roleDescriptions: Record<string, string> = {
  deal_lead: 'Full access to manage the deal, team, and all documents',
  analyst: 'Can view all documents and create/edit diligence requests',
  external_reviewer: 'Can review and approve specific documents',
  investor: 'View-only access to approved deal materials',
  seller: 'Upload documents and respond to information requests',
  advisor: 'Collaborate on due diligence with document access',
  admin: 'Full administrative access to all platform features',
  editor: 'Can create and manage deals and companies',
  viewer: 'Read-only access to assigned deals',
};

const getRoleDisplayName = (role: string): string => {
  const names: Record<string, string> = {
    deal_lead: 'Deal Lead',
    analyst: 'Analyst',
    external_reviewer: 'External Reviewer',
    investor: 'Investor',
    seller: 'Seller',
    advisor: 'Advisor',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return names[role] || role;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify requester
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get inviter profile
    const { data: inviterProfile, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('first_name, last_name, email, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !inviterProfile) {
      return new Response(
        JSON.stringify({ error: 'Failed to get inviter profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check permissions
    if (!['admin', 'super_admin', 'editor'].includes(inviterProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to send invitations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_KEY) {
      console.error('Missing RESEND_API_KEY secret');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const resend = new Resend(RESEND_KEY);

    // Parse request
    const { invitee_email, invitee_name, role, personal_message, deal_id, permissions }: InviteRequest = await req.json();

    if (!invitee_email?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lowerEmail = invitee_email.trim().toLowerCase();

    // Determine site URL
    let siteUrl = Deno.env.get('SITE_URL');
    if (!siteUrl) {
      const origin = req.headers.get('origin');
      const allowedOrigins = ['http://localhost:3000', 'https://gbjmklhvrmecawaacqeb.lovable.dev'];
      siteUrl = origin && allowedOrigins.includes(origin) ? origin : 'https://gbjmklhvrmecawaacqeb.lovable.dev';
    }

    // Create invitation record
    const { data: invitation, error: inviteDbError } = await supabaseServiceRole
      .from('team_invitations')
      .insert({
        inviter_id: user.id,
        invitee_email: lowerEmail,
        invitee_name: invitee_name?.trim() || null,
        role,
        personal_message: personal_message?.trim() || null,
        deal_id: deal_id || null,
        permissions: permissions || {},
      })
      .select()
      .single();

    if (inviteDbError || !invitation) {
      console.error('Error creating invitation:', inviteDbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseServiceRole
      .from('profiles')
      .select('user_id, first_name, last_name')
      .eq('email', lowerEmail)
      .maybeSingle();

    let actionLink: string;
    let isExistingUser = false;

    if (existingUser) {
      isExistingUser = true;
      // Generate login magic link
      const { data: linkData, error: linkError } = await supabaseServiceRole.auth.admin.generateLink({
        type: 'magiclink',
        email: lowerEmail,
        options: {
          redirectTo: `${siteUrl}/auth/accept?invitation=${invitation.invitation_token}`
        }
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.error('Error generating magic link:', linkError);
        actionLink = `${siteUrl}/auth?invitation=${invitation.invitation_token}`;
      } else {
        actionLink = linkData.properties.action_link;
      }
    } else {
      // Generate invite link for new user
      const { data: linkData, error: linkError } = await supabaseServiceRole.auth.admin.generateLink({
        type: 'invite',
        email: lowerEmail,
        options: {
          redirectTo: `${siteUrl}/auth/accept?invitation=${invitation.invitation_token}`,
          data: {
            first_name: invitee_name?.split(' ')[0] || '',
            last_name: invitee_name?.split(' ').slice(1).join(' ') || ''
          }
        }
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.error('Error generating invite link:', linkError);
        actionLink = `${siteUrl}/auth?invitation=${invitation.invitation_token}`;
      } else {
        actionLink = linkData.properties.action_link;
      }
    }

    // Get deal info if applicable
    let dealTitle = '';
    if (deal_id) {
      const { data: dealData } = await supabaseServiceRole
        .from('deals')
        .select('title, company_name')
        .eq('id', deal_id)
        .maybeSingle();
      
      if (dealData) {
        dealTitle = dealData.title || dealData.company_name || '';
      }
    }

    // Inviter name
    const inviterName = [inviterProfile.first_name, inviterProfile.last_name].filter(Boolean).join(' ') || 'The Team';
    const inviteeName = invitee_name || lowerEmail.split('@')[0];
    const roleDisplayName = getRoleDisplayName(role);
    const roleDescription = roleDescriptions[role] || 'Access to the platform';

    // Format expiry date
    const expiryDate = new Date(invitation.expires_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build personal message section
    const personalMessageHtml = personal_message ? `
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="font-style: italic; margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">"${personal_message}"</p>
        <p style="font-size: 14px; color: #64748b; margin-top: 12px; margin-bottom: 0;">— ${inviterName}</p>
      </div>
    ` : '';

    // Build deal section
    const dealSectionHtml = dealTitle ? `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Deal Access</p>
        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">${dealTitle}</p>
      </div>
    ` : '';

    // Send email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to the Team</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 12px; font-size: 16px;">M&A Deal Room Platform</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 8px 0;">You've been invited!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Hi ${inviteeName},
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              <strong>${inviterName}</strong> has invited you to collaborate on M&A deals in their data room.
            </p>
            
            ${personalMessageHtml}
            
            <!-- Role Card -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                  ${roleDisplayName}
                </div>
              </div>
              <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">${roleDescription}</p>
            </div>
            
            ${dealSectionHtml}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${actionLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
                ${isExistingUser ? 'Accept Invitation' : 'Create Your Account'}
              </a>
            </div>
            
            <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px;">
              This invitation expires on ${expiryDate}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #1e293b; color: white; padding: 32px 40px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 14px;">Questions? Contact <a href="mailto:${inviterProfile.email}" style="color: #a5b4fc;">${inviterProfile.email}</a></p>
            <p style="font-size: 12px; color: #94a3b8; margin: 16px 0 0 0;">© ${new Date().getFullYear()} Exclusive Business Brokers. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Exclusive Business Brokers <onboarding@resend.dev>',
      to: [lowerEmail],
      subject: `${inviterName} invited you to collaborate${dealTitle ? ` on ${dealTitle}` : ''}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      // Update invitation with send failure
      await supabaseServiceRole
        .from('team_invitations')
        .update({ status: 'pending' })
        .eq('id', invitation.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email', details: emailError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log security event
    await supabaseServiceRole.rpc('log_security_event', {
      p_event_type: 'team_invitation_sent',
      p_event_data: { 
        invitation_id: invitation.id,
        invitee_email: lowerEmail,
        role,
        deal_id,
        is_existing_user: isExistingUser
      },
      p_user_id: user.id
    });

    console.log(`Team invitation sent successfully to ${lowerEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        invitation_id: invitation.id,
        is_existing_user: isExistingUser
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