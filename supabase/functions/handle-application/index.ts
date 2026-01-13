// Edge Function: Handle Application Submission
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApplicationSubmission {
    spaceName: string;
    spaceAddress: string;
    applicantName: string;
    applicantEmail: string;
    roleInCompany: 'Owner' | 'Manager';
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

        const submission: ApplicationSubmission = await req.json();

        // Validate required fields
        if (!submission.spaceName || !submission.spaceAddress ||
            !submission.applicantName || !submission.applicantEmail ||
            !submission.roleInCompany) {
            throw new Error('Missing required fields');
        }

        // 1. Check for duplicate applications
        const { data: existingApp } = await supabaseClient
            .from('pending_applications')
            .select('id, status')
            .eq('applicant_email', submission.applicantEmail)
            .eq('status', 'pending')
            .maybeSingle();

        if (existingApp) {
            return new Response(
                JSON.stringify({
                    error: 'You already have a pending application. Please wait for admin review.'
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            );
        }

        // 2. Save application to pending_applications table
        const { data: applicationData, error: dbError } = await supabaseClient
            .from('pending_applications')
            .insert([
                {
                    space_name: submission.spaceName,
                    space_address: submission.spaceAddress,
                    applicant_name: submission.applicantName,
                    applicant_email: submission.applicantEmail,
                    role_in_company: submission.roleInCompany,
                    status: 'pending'
                },
            ])
            .select()
            .single();

        if (dbError) throw dbError;

        // 3. Send email notification to admin
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (RESEND_API_KEY) {
            // Fetch notification email addresses
            const { data: config } = await supabaseClient
                .from('admin_tokens')
                .select('notify_new_space_emails')
                .eq('token_type', 'site_config')
                .maybeSingle();

            let recipientEmails: string[] = [];

            if (config?.notify_new_space_emails) {
                recipientEmails = config.notify_new_space_emails
                    .split(',')
                    .map((e: string) => e.trim())
                    .filter(Boolean);
            }

            // Fallback to super admins
            if (recipientEmails.length === 0) {
                const { data: adminProfiles } = await supabaseClient
                    .from('profiles')
                    .select('email')
                    .eq('role', 'super_admin');

                if (adminProfiles && adminProfiles.length > 0) {
                    recipientEmails = adminProfiles.map((p: any) => p.email).filter(Boolean);
                }
            }

            // Final fallback
            if (recipientEmails.length === 0) {
                recipientEmails = ['bautecm@gmail.com'];
            }

            // Admin notification email
            const adminEmailBody = `
                <h2>New Denver Coworks Alliance Application</h2>
                <p>A new member has applied to join the alliance.</p>
                <hr>
                <p><strong>Applicant Name:</strong> ${submission.applicantName}</p>
                <p><strong>Email:</strong> ${submission.applicantEmail}</p>
                <p><strong>Role:</strong> ${submission.roleInCompany}</p>
                <p><strong>Space Name:</strong> ${submission.spaceName}</p>
                <p><strong>Space Address:</strong> ${submission.spaceAddress}</p>
                <br>
                <p><a href="${Deno.env.get('PUBLIC_URL') || 'https://denvercoworks.org'}/admin/applications">Review Application in Admin Dashboard</a></p>
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
                    subject: `New Alliance Application: ${submission.spaceName}`,
                    html: adminEmailBody,
                }),
            });

            // Confirmation email to applicant
            const applicantEmailBody = `
                <h2>Application Received!</h2>
                <p>Hi ${submission.applicantName},</p>
                <p>Thank you for applying to join the Denver Coworks Alliance.</p>
                <p>We've received your application for <strong>${submission.spaceName}</strong> and our team will review it shortly.</p>
                <p>Once approved, you'll receive an email with instructions to create your account and complete your space profile.</p>
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
                    to: [submission.applicantEmail],
                    subject: 'Your Denver Coworks Application is Under Review',
                    html: applicantEmailBody,
                }),
            });
        }

        return new Response(
            JSON.stringify({
                message: 'Application submitted successfully',
                data: applicationData
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Application submission error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
