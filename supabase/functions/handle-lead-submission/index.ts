
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
    name: string;
    email: string;
    phone?: string;
    type: string;
    address?: string;
    buildingSize?: string;
    message?: string;
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

        const lead: Lead = await req.json();

        // 1. Save to Database
        const { error: dbError } = await supabaseClient
            .from('leads')
            .insert([
                {
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone,
                    type: lead.type,
                    address: lead.address,
                    building_size: lead.buildingSize,
                    message: lead.message,
                },
            ]);

        if (dbError) throw dbError;

        // 2. Send Email using Resend
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY) {
            // Fetch Notification Overrides from admin_tokens
            const { data: config } = await supabaseClient
                .from('admin_tokens')
                .select('notify_landlord_emails')
                .eq('token_type', 'google_oauth')
                .maybeSingle();

            let recipientEmails: string[] = [];

            if (config?.notify_landlord_emails) {
                recipientEmails = config.notify_landlord_emails.split(',').map((e: string) => e.trim()).filter(Boolean);
            }

            // If no overrides, fetch all Super Admins
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
        <h2>New Lead Inquiry: ${lead.type}</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
        <p><strong>Address:</strong> ${lead.address || 'N/A'}</p>
        <p><strong>Building Size:</strong> ${lead.buildingSize || 'N/A'}</p>
        <p><strong>Message:</strong> ${lead.message || 'N/A'}</p>
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
                    subject: `New Lead Inquiry: ${lead.type} - ${lead.name}`,
                    html: emailBody,
                }),
            });
        }

        return new Response(JSON.stringify({ message: 'Lead captured and notification sent' }), {
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
