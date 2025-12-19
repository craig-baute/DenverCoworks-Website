
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
    spaceName: string;
    ownerId: string;
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

        const { spaceName, ownerId }: ApprovalRequest = await req.json();

        // 1. Get owner email
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(ownerId);

        if (userError || !userData?.user?.email) {
            throw new Error('Could not find owner email');
        }

        const ownerEmail = userData.user.email;
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY) {
            const emailBody = `
                <h2>Great News! Your space is live.</h2>
                <p>Hi there,</p>
                <p>We are excited to inform you that your space, <strong>${spaceName}</strong>, has been approved and is now live on the Denver Coworks website!</p>
                <p>You can view it now at <a href="https://denvercoworks.org/spaces">denvercoworks.org/spaces</a>.</p>
                <br>
                <p>Thank you for being part of the alliance!</p>
                <p>Best regards,<br>The Denver Coworks Team</p>
            `;

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Denver Coworks <onboarding@resend.dev>',
                    to: [ownerEmail],
                    subject: `Space Approved: ${spaceName} is now LIVE`,
                    html: emailBody,
                }),
            });
        }

        return new Response(JSON.stringify({ message: 'Approval notification sent' }), {
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
