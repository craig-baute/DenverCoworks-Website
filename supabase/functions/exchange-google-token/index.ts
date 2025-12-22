import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { code, redirectUri } = await req.json();

        if (!code || !redirectUri) {
            return new Response(
                JSON.stringify({ error: 'Missing code or redirectUri' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
        const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

        if (!googleClientId || !googleClientSecret) {
            console.error('Missing Google credentials in Edge Function environment');
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: googleClientId,
                client_secret: googleClientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Google token exchange failed:', errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to exchange code for token', details: errorText }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const tokenData = await tokenResponse.json();

        // Init Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if a token row already exists to update it by ID (to be safe)
        const { data: existingToken } = await supabase
            .from('admin_tokens')
            .select('id')
            .eq('token_type', 'google_oauth')
            .maybeSingle();

        const payload = {
            token_type: 'google_oauth',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token, // Critical for long-term access
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            scope: tokenData.scope,
            updated_at: new Date().toISOString(),
        };

        let error;
        if (existingToken) {
            const res = await supabase.from('admin_tokens').update(payload).eq('id', existingToken.id);
            error = res.error;
        } else {
            const res = await supabase.from('admin_tokens').insert(payload);
            error = res.error;
        }

        if (error) {
            console.error('Database update failed:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to store tokens' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Google Calendar connected successfully.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err: any) {
        console.error('Edge Function Error:', err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
