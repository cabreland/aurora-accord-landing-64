import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        renderHTML('Invalid Request', 'No extension token provided.', false),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html', ...corsHeaders },
        }
      );
    }

    console.log('Processing NDA extension request with token:', token);

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get NDA ID
    const { data: tokenData, error: tokenError } = await supabase
      .from('nda_extension_tokens')
      .select('nda_id, expires_at, used_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found or error:', tokenError);
      return new Response(
        renderHTML('Invalid Token', 'This extension link is invalid or has expired.', false),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html', ...corsHeaders },
        }
      );
    }

    // Check if token has been used
    if (tokenData.used_at) {
      return new Response(
        renderHTML('Already Used', 'This extension link has already been used.', false),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html', ...corsHeaders },
        }
      );
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        renderHTML('Token Expired', 'This extension link has expired. Please contact support.', false),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html', ...corsHeaders },
        }
      );
    }

    // Get NDA details
    const { data: nda, error: ndaError } = await supabase
      .from('company_nda_acceptances')
      .select('id, signer_name, expires_at, status, deals:company_id(company_name)')
      .eq('id', tokenData.nda_id)
      .single();

    if (ndaError || !nda) {
      console.error('NDA not found or error:', ndaError);
      return new Response(
        renderHTML('NDA Not Found', 'The NDA associated with this token could not be found.', false),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html', ...corsHeaders },
        }
      );
    }

    // Extend NDA by 60 days
    const currentExpiry = new Date(nda.expires_at);
    const newExpiry = new Date(currentExpiry.getTime() + 60 * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('company_nda_acceptances')
      .update({
        expires_at: newExpiry.toISOString(),
        status: 'active',
      })
      .eq('id', tokenData.nda_id);

    if (updateError) {
      console.error('Error updating NDA:', updateError);
      throw updateError;
    }

    // Mark token as used
    await supabase
      .from('nda_extension_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    console.log(`Successfully extended NDA ${tokenData.nda_id} until ${newExpiry.toISOString()}`);

    const companyName = (nda as any).deals?.company_name || 'the company';
    
    return new Response(
      renderHTML(
        'NDA Extended Successfully!',
        `Your NDA for <strong>${companyName}</strong> has been extended until <strong>${newExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.<br><br>You can now continue accessing confidential documents and materials.`,
        true
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in extend-nda function:', error);
    return new Response(
      renderHTML('Error', 'An error occurred while extending your NDA. Please contact support.', false),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      }
    );
  }
});

function renderHTML(title: string, message: string, success: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
        <div style="max-width: 500px; width: 100%; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="background: ${success ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">${success ? '✓' : '✗'}</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
          </div>
          
          <div style="padding: 40px; text-align: center;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 30px;">
              ${message}
            </p>
            
            ${success ? `
              <a href="${supabaseUrl.replace('https://gbjmklhvrmecawaacqeb.supabase.co', 'https://your-app-domain.com')}/investor-portal" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Return to Portal
              </a>
            ` : ''}
          </div>
          
          <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Investor Portal © ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
