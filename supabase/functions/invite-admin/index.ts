
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
    email: string;
    fullName: string;
    role: 'super_admin' | 'space_user' | 'user';
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization')!;
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        // Client with service role for admin actions
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Verify the requester is a super_admin
        // We use the user's JWT to verify their identity and role
        const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'super_admin') {
            throw new Error('Only super admins can invite new users');
        }

        // 2. Process the invitation
        const { email, fullName, role }: InviteRequest = await req.json();

        if (!email || !fullName || !role) {
            throw new Error('Missing required fields: email, fullName, role');
        }

        // 3. Invite the user via Supabase Auth
        // This will send an invitation email to the user
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { full_name: fullName },
            redirectTo: `${new URL(req.url).origin}/admin`, // Adjust if you have a specific confirm page
        });

        if (inviteError) throw inviteError;

        // 4. Create/Update the profile record
        // Auth hooks might handle this, but explicit is better here to ensure role/fullName
        const { error: upsertError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: inviteData.user.id,
                email: email,
                full_name: fullName,
                role: role,
                updated_at: new Date().toISOString()
            });

        if (upsertError) throw upsertError;

        return new Response(JSON.stringify({
            message: 'Invitation sent successfully',
            user: inviteData.user
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error in invite-admin:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
