// Edge Function: Approve Application and Send Account Creation Link
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
    applicationId: string;
    adminId: string;
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

        const { applicationId, adminId }: ApprovalRequest = await req.json();

        // 1. Get the application details
        const { data: application, error: fetchError } = await supabaseClient
            .from('pending_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchError || !application) {
            throw new Error('Application not found');
        }

        if (application.status !== 'pending') {
            throw new Error('Application has already been processed');
        }

        // 2. Update application status to approved
        const { error: updateError } = await supabaseClient
            .from('pending_applications')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: adminId
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // 3. Add to contacts list
        const { error: contactError } = await supabaseClient
            .from('contacts')
            .insert([
                {
                    email: application.applicant_email,
                    full_name: application.applicant_name,
                    space_name: application.space_name,
                    role_in_company: application.role_in_company,
                    tags: ['pending_account', 'new_member', application.role_in_company.toLowerCase()]
                }
            ]);

        if (contactError && contactError.code !== '23505') { // Ignore duplicate email errors
            console.error('Contact creation error:', contactError);
        }

        // 4. Generate magic link for account creation
        const { data: magicLinkData, error: magicLinkError } = await supabaseClient.auth.admin.generateLink({
            type: 'magiclink',
            email: application.applicant_email,
            options: {
                redirectTo: `${Deno.env.get('PUBLIC_URL') || 'https://denvercoworks.org'}/onboarding/complete-profile`
            }
        });

        if (magicLinkError) throw magicLinkError;

        // 5. Send approval email with account creation link
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY && magicLinkData) {
            const approvalEmailBody = `
                <h2>Welcome to Denver Coworks Alliance! 🎉</h2>
                <p>Hi ${application.applicant_name},</p>
                <p>Great news! Your application for <strong>${application.space_name}</strong> has been approved.</p>
                <p>You're now part of Denver's premier coworking community.</p>
                <br>
                <h3>Next Steps:</h3>
                <ol>
                    <li>Click the button below to create your account</li>
                    <li>Set up your password</li>
                    <li>Complete your space profile</li>
                    <li>Start connecting with other members!</li>
                </ol>
                <br>
                <p style="text-align: center;">
                    <a href="${magicLinkData.properties.action_link}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                        Create Your Account
                    </a>
                </p>
                <br>
                <p><small>This link will expire in 24 hours. If you need a new link, please contact us.</small></p>
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
                    to: [application.applicant_email],
                    subject: '🎉 Welcome to Denver Coworks Alliance!',
                    html: approvalEmailBody,
                }),
            });
        }

        return new Response(
            JSON.stringify({
                message: 'Application approved and account creation email sent',
                magicLink: magicLinkData?.properties.action_link
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Approval error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
