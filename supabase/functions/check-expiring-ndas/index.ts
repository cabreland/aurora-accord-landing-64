import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiringNDA {
  id: string;
  user_id: string;
  company_id: string;
  signer_name: string;
  signer_email: string;
  expires_at: string;
  deals?: {
    company_name: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting NDA expiration check...');

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range: 7 days from now
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const eightDaysFromNow = new Date();
    eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8);

    // Find NDAs expiring in exactly 7 days (to avoid duplicate emails)
    const { data: expiringNDAs, error: queryError } = await supabase
      .from('company_nda_acceptances')
      .select(`
        id,
        user_id,
        company_id,
        signer_name,
        signer_email,
        expires_at,
        deals:company_id(company_name)
      `)
      .eq('status', 'active')
      .gte('expires_at', sevenDaysFromNow.toISOString())
      .lt('expires_at', eightDaysFromNow.toISOString());

    if (queryError) {
      console.error('Error querying expiring NDAs:', queryError);
      throw queryError;
    }

    console.log(`Found ${expiringNDAs?.length || 0} NDAs expiring in 7 days`);

    if (!expiringNDAs || expiringNDAs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expiring NDAs found', count: 0 }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send emails for each expiring NDA
    const emailResults = [];
    for (const nda of expiringNDAs as ExpiringNDA[]) {
      try {
        // Generate secure extension token
        const extensionToken = crypto.randomUUID();
        const expiresAt = new Date(nda.expires_at);
        const companyName = nda.deals?.company_name || 'the company';
        
        // Store extension token in database for verification
        const { error: tokenError } = await supabase
          .from('nda_extension_tokens')
          .insert({
            nda_id: nda.id,
            token: extensionToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Token valid for 7 days
          });

        if (tokenError) {
          console.error('Error storing extension token:', tokenError);
          throw tokenError;
        }

        // Create extension URL
        const extensionUrl = `${supabaseUrl.replace('.supabase.co', '')}/functions/v1/extend-nda?token=${extensionToken}`;

        // Send email
        const emailResponse = await resend.emails.send({
          from: 'Investor Portal <noreply@resend.dev>',
          to: [nda.signer_email],
          subject: `Your NDA for ${companyName} expires in 7 days`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">NDA Expiration Notice</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hello ${nda.signer_name},</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Your Non-Disclosure Agreement (NDA) for <strong>${companyName}</strong> will expire on 
                    <strong>${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                  </p>
                  
                  <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>What happens when it expires?</strong><br>
                      You will lose access to confidential documents and data room materials until you sign a new NDA.
                    </p>
                  </div>
                  
                  <p style="font-size: 16px; margin-bottom: 25px;">
                    To maintain uninterrupted access, you can extend your NDA by 60 days with one click:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${extensionUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Extend NDA by 60 Days
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    Or copy and paste this link into your browser:<br>
                    <code style="background: #e5e7eb; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; word-break: break-all; font-size: 12px;">
                      ${extensionUrl}
                    </code>
                  </p>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    If you have any questions or prefer not to extend, please contact us or simply let the NDA expire.
                  </p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px;">
                    <p style="margin: 5px 0;">This is an automated notification from the Investor Portal</p>
                    <p style="margin: 5px 0;">This link will expire in 7 days</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Email sent to ${nda.signer_email} for NDA ${nda.id}`);
        emailResults.push({ 
          nda_id: nda.id, 
          email: nda.signer_email, 
          success: true,
          email_id: emailResponse.data?.id 
        });

      } catch (emailError: any) {
        console.error(`Error sending email for NDA ${nda.id}:`, emailError);
        emailResults.push({ 
          nda_id: nda.id, 
          email: nda.signer_email, 
          success: false, 
          error: emailError.message 
        });
      }
    }

    const successCount = emailResults.filter(r => r.success).length;
    console.log(`Successfully sent ${successCount}/${expiringNDAs.length} emails`);

    return new Response(
      JSON.stringify({
        message: `Processed ${expiringNDAs.length} expiring NDAs`,
        success_count: successCount,
        results: emailResults,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in check-expiring-ndas function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
