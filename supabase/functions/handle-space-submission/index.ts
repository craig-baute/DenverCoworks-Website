
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpaceSubmission {
    name: string;
    neighborhood: string;
    address: string;
    vibe: string;
    imageUrl: string;
    description: string;
    website: string;
    amenities: string[];
    ownerId: string;
    userEmail: string;
    contactName?: string;
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

        const submission: SpaceSubmission = await req.json();

        // 1. Save to Database with 'pending' status
        const { data: spaceData, error: dbError } = await supabaseClient
            .from('spaces')
            .insert([
                {
                    name: submission.name,
                    neighborhood: submission.neighborhood,
                    address: submission.address,
                    vibe: submission.vibe,
                    imageUrl: submission.imageUrl,
                    description: submission.description,
                    website: submission.website,
                    amenities: submission.amenities,
                    ownerId: submission.ownerId,
                    status: 'pending'
                },
            ])
            .select();

        if (dbError) throw dbError;

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY) {
            // 2. Alert Admin (bautecm@gmail.com)
            const adminEmailBody = `
                <h2>New Denver Coworks Space Partner Signup</h2>
                <p>A new partner has applied to join the alliance.</p>
                <hr>
                <p><strong>Partner Name:</strong> ${submission.contactName || 'Not provided'}</p>
                <p><strong>Email Address:</strong> ${submission.userEmail}</p>
                <p><strong>Space Name:</strong> ${submission.name}</p>
                <p><strong>Space URL:</strong> ${submission.website}</p>
                <p><strong>Space Address:</strong> ${submission.address}</p>
                <p><strong>Vibe of the Space:</strong> ${submission.vibe}</p>
                <br>
                <p><a href="${Deno.env.get('PUBLIC_URL') || 'https://denvercoworks.org'}/admin">Go to Admin Dashboard to Review</a></p>
            `;

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Denver Coworks <onboarding@resend.dev>',
                    to: ['bautecm@gmail.com'],
                    subject: `New Space Partner Submission: ${submission.name}`,
                    html: adminEmailBody,
                }),
            });

            // 3. Confirm to Partner
            const partnerEmailBody = `
                <h2>We've Received Your Submission!</h2>
                <p>Hi there,</p>
                <p>Thank you for submitting <strong>${submission.name}</strong> to the Denver Coworks Alliance.</p>
                <p>Our team has been notified and will review your listing shortly. You will receive another update once your space has been approved and is live on the site.</p>
                <br>
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
                    to: [submission.userEmail],
                    subject: 'Your Denver Coworks Submission is Pending Review',
                    html: partnerEmailBody,
                }),
            });
        }

        return new Response(JSON.stringify({ message: 'Submission successful', data: spaceData }), {
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
