
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Submission {
    name: string;
    email: string;
    address: string;
    size: string;
    buildingType: string;
    goal: string;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const submission: Submission = await req.json();

        // 1. Save to Database
        const { error: dbError } = await supabaseClient
            .from('expert_finder_submissions')
            .insert([
                {
                    name: submission.name,
                    email: submission.email,
                    address: submission.address,
                    building_size: submission.size,
                    building_type: submission.buildingType,
                    goal: submission.goal,
                },
            ]);

        if (dbError) throw dbError;

        // 2. Send Email using Resend
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY) {
            // 2. Fetch Notification Overrides
            const { data: config } = await supabaseClient
                .from('admin_tokens')
                .select('notify_expert_emails')
                .eq('token_type', 'site_config')
                .maybeSingle();

            let recipientEmails: string[] = [];

            if (config?.notify_expert_emails) {
                recipientEmails = config.notify_expert_emails.split(',').map((e: string) => e.trim()).filter(Boolean);
            }

            // 3. If no overrides, fetch all Super Admins
            if (recipientEmails.length === 0) {
                const { data: adminProfiles } = await supabaseClient
                    .from('profiles')
                    .select('email')
                    .eq('role', 'super_admin');

                if (adminProfiles && adminProfiles.length > 0) {
                    recipientEmails = adminProfiles.map((p: any) => p.email).filter(Boolean);
                }
            }

            // Fallback
            if (recipientEmails.length === 0) {
                recipientEmails = ['bautecm@gmail.com'];
            }

            const emailBody = `
        <h2>Denver Coworks Expert Form Filled</h2>
        <p><strong>Name:</strong> ${submission.name}</p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Address:</strong> ${submission.address}</p>
        <p><strong>Building Size:</strong> ${submission.size}</p>
        <p><strong>Building Type:</strong> ${submission.buildingType}</p>
        <p><strong>Goal:</strong> ${submission.goal}</p>
        <br>
        <p>A new lead has been captured and stored in the database.</p>
      `;

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Denver Coworks <onboarding@resend.dev>',
                    to: recipientEmails,
                    subject: 'Denver Coworks Expert Form Filled',
                    html: emailBody,
                }),
            });
        }

        return new Response(JSON.stringify({ message: 'Submission successful' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
