// Edge Function: Reject Application and Send Notification
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RejectionRequest {
    applicationId: string;
    adminId: string;
    rejectionReason: string;
    notes?: string;
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

        const { applicationId, adminId, rejectionReason, notes }: RejectionRequest = await req.json();

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

        // 2. Update application status to rejected
        const { error: updateError } = await supabaseClient
            .from('pending_applications')
            .update({
                status: 'rejected',
                rejection_reason: rejectionReason,
                notes: notes || application.notes, // Keep existing notes if none provided, or overwrite
                approved_by: adminId, // Reuse column for "reviewer"
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // 3. Send rejection email
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY) {
            // Use configured admin email for reply-to
            const adminEmail = 'craig@creativedensity.com';

            const rejectionEmailBody = `
                <h2>Update on your Denver Coworks Alliance Application</h2>
                <p>Hi ${application.applicant_name},</p>
                <p>Thank you for your interest in joining the Denver Coworks Alliance with <strong>${application.space_name}</strong>.</p>
                <p>After reviewing your application, we are unable to accept it at this time.</p>
                
                ${rejectionReason ? `
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; margin: 20px 0;">
                    <strong>Reason:</strong><br/>
                    ${rejectionReason}
                </div>
                ` : ''}

                <p>If you have any questions or would like to discuss this further, please don't hesitate to reply to this email.</p>
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
                    reply_to: adminEmail,
                    subject: 'Update on Your Denver Coworks Application',
                    html: rejectionEmailBody,
                }),
            });
        }

        return new Response(
            JSON.stringify({
                message: 'Application rejected and notification email sent'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Rejection error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
