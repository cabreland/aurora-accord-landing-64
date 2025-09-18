import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitationId: string;
  email: string;
  investorName: string;
  invitationCode: string;
  dealId: string;
  expiresAt: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      invitationId,
      email,
      investorName,
      invitationCode,
      dealId,
      expiresAt,
      isResend = false
    }: InvitationRequest = await req.json();

    console.log(`${isResend ? 'Resending' : 'Sending'} invitation to ${email} for deal ${dealId}`);

    // Get deal information
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title, company_name, description')
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      throw new Error('Failed to fetch deal information');
    }

    // Create invitation link
    const invitationUrl = `${supabaseUrl.replace('supabase.co', 'lovable.app')}/investor-registration?code=${invitationCode}`;
    
    // Format expiry date
    const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "Data Room <onboarding@resend.dev>",
      to: [email],
      subject: `${isResend ? '[Resent] ' : ''}Investment Opportunity: ${deal.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Investment Opportunity Invitation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Investment Opportunity</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hello ${investorName},</p>
            
            <p>You have been invited to review an exclusive investment opportunity:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin: 0 0 10px 0; color: #667eea;">${deal.title}</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">Company: ${deal.company_name}</p>
              ${deal.description ? `<p style="margin: 10px 0 0 0; font-size: 14px;">${deal.description}</p>` : ''}
            </div>
            
            <p>To access the secure data room and review detailed information about this opportunity, please click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: 600; 
                        display: inline-block;
                        font-size: 16px;">
                Access Data Room
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>Important:</strong> This invitation expires on ${expiryDate}. 
                Please complete your registration before this date.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              If you're unable to click the button above, copy and paste this link into your browser:<br>
              <a href="${invitationUrl}" style="color: #667eea; word-break: break-all;">${invitationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This invitation is confidential and intended only for ${email}.<br>
              If you received this email in error, please delete it immediately.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-investor-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);