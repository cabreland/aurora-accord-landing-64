import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    email: string;
    id: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailRequest = await req.json();
    console.log("Auth email request:", { 
      email: payload.user.email, 
      type: payload.email_data.email_action_type 
    });

    const { user, email_data } = payload;
    const confirmLink = `${email_data.site_url}/auth/confirm?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

    let subject = "";
    let html = "";

    if (email_data.email_action_type === "signup") {
      subject = "Confirm Your Account";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to EBB Data Room!</h1>
          <p style="color: #666; font-size: 16px;">Thank you for signing up. Please confirm your email address to get started.</p>
          <div style="margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #5B8CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #5B8CFF; font-size: 14px; word-break: break-all;">${confirmLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `;
    } else if (email_data.email_action_type === "recovery" || email_data.email_action_type === "magiclink") {
      subject = "Sign In to Your Account";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Sign In to EBB Data Room</h1>
          <p style="color: #666; font-size: 16px;">Click the button below to sign in to your account.</p>
          <div style="margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #5B8CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign In
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #5B8CFF; font-size: 14px; word-break: break-all;">${confirmLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "EBB Data Room <onboarding@resend.dev>",
      to: [user.email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
