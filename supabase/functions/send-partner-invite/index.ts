import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerInviteRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  partner_team_id: string;
  team_name: string;
  company_name: string;
  default_permissions?: {
    can_upload_documents?: boolean;
    can_edit_deal_info?: boolean;
    can_answer_dd_questions?: boolean;
    can_view_buyer_activity?: boolean;
    can_message_buyers?: boolean;
    can_approve_data_room?: boolean;
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: { user: sender }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !sender) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if sender is admin
    const { data: senderProfile } = await supabaseServiceRole
      .from("profiles")
      .select("role")
      .eq("user_id", sender.id)
      .single();

    if (!senderProfile || !["admin", "super_admin"].includes(senderProfile.role)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const resend = new Resend(resendApiKey);

    // Parse request body
    const body: PartnerInviteRequest = await req.json();
    const { email, first_name, last_name, partner_team_id, team_name, company_name } = body;

    if (!email || !partner_team_id || !team_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing partner invite for: ${email} to team: ${team_name}`);

    // Determine site URL
    const siteUrl = Deno.env.get("SITE_URL") || 
                    Deno.env.get("PUBLIC_SITE_URL") || 
                    req.headers.get("origin") || 
                    "https://aurora-accord-landing-64.lovable.app";

    // Check if user already exists
    const { data: existingUsers } = await supabaseServiceRole.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let inviteLink: string;
    let userId: string;

    if (existingUser) {
      // User exists - generate magic link for login
      console.log(`User ${email} already exists, generating magic link`);
      
      const { data: linkData, error: linkError } = await supabaseServiceRole.auth.admin.generateLink({
        type: "magiclink",
        email: email,
        options: { redirectTo: `${siteUrl}/investor` }
      });

      if (linkError) {
        throw new Error(`Failed to generate magic link: ${linkError.message}`);
      }

      inviteLink = linkData.properties.action_link;
      userId = existingUser.id;

      // Update existing profile with partner_team_id
      await supabaseServiceRole
        .from("profiles")
        .update({ 
          partner_team_id: partner_team_id,
          role: 'partner' 
        })
        .eq("user_id", userId);

    } else {
      // New user - generate invite link
      console.log(`Creating new user for ${email}`);

      const { data: linkData, error: linkError } = await supabaseServiceRole.auth.admin.generateLink({
        type: "invite",
        email: email,
        options: { 
          redirectTo: `${siteUrl}/investor`,
          data: {
            first_name: first_name || "",
            last_name: last_name || "",
          }
        }
      });

      if (linkError) {
        throw new Error(`Failed to generate invite link: ${linkError.message}`);
      }

      inviteLink = linkData.properties.action_link;
      userId = linkData.user.id;

      // Update profile with partner info
      await supabaseServiceRole
        .from("profiles")
        .upsert({
          user_id: userId,
          email: email,
          first_name: first_name || "",
          last_name: last_name || "",
          role: 'partner',
          partner_team_id: partner_team_id,
        }, { onConflict: "user_id" });
    }

    // Send branded email
    const displayName = first_name ? `${first_name}` : "Partner";
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
              Welcome to EBB Data Room
            </h1>
            <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">
              Partner Portal Access
            </p>
          </div>
          
          <!-- Body -->
          <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Hello ${displayName},
            </p>
            
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              You've been invited to join <strong style="color: #1e293b;">${team_name}</strong> as a partner on the EBB Data Room platform. As a partner, you'll have access to manage deals, upload documents, and collaborate with the team.
            </p>
            
            <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Your Team
              </p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">
                ${team_name} (${company_name})
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);">
                ${existingUser ? 'Sign In to Partner Portal' : 'Accept Invitation'}
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
              This invitation link will expire in 7 days.<br>
              If you have any questions, please contact the EBB team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 24px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} EBB Data Room. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "EBB Data Room <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to join ${team_name} on EBB Data Room`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log(`Successfully sent partner invite to ${email}`);

    // Log security event
    await supabaseServiceRole.rpc("log_security_event", {
      p_event_type: "partner_invite_sent",
      p_event_data: { 
        invited_email: email, 
        team_id: partner_team_id,
        team_name: team_name,
        invited_by: sender.id 
      },
      p_user_id: sender.id,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        user_id: userId 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-partner-invite:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
