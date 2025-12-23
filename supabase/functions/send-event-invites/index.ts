import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EventInvite {
    id: string
    event_id: string
    email: string
    name: string | null
}

interface Event {
    id: string
    topic: string
    date: string
    start_time: string
    duration_minutes: number
    location: string
    description: string
    image_url: string
}

// Generate ICS (iCalendar) file content
function generateICS(event: Event): string {
    const eventDate = new Date(event.date)
    const [hours, minutes] = event.start_time.split(':').map(Number)

    const startDateTime = new Date(eventDate)
    startDateTime.setHours(hours, minutes, 0, 0)

    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + event.duration_minutes)

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Denver Coworks//Event Invitation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${event.id}@denvercoworks.org`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDateTime)}`,
        `DTEND:${formatICSDate(endDateTime)}`,
        `SUMMARY:${event.topic}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        `LOCATION:${event.location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n')

    return icsContent
}

// Generate HTML email with calendar invite
function generateEmailHTML(event: Event, recipientName: string | null): string {
    const eventDate = new Date(event.date)
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const [hours, minutes] = event.start_time.split(':').map(Number)
    const startTime = new Date(eventDate)
    startTime.setHours(hours, minutes)
    const formattedTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })

    const greeting = recipientName ? `Hi ${recipientName}` : 'Hello'

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Denver Coworks Event Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Denver Coworks
              </h1>
              <p style="margin: 10px 0 0; color: #a0a0a0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                Event Invitation
              </p>
            </td>
          </tr>
          
          <!-- Event Image -->
          ${event.image_url ? `
          <tr>
            <td style="padding: 0;">
              <img src="${event.image_url}" alt="${event.topic}" style="width: 100%; height: 250px; object-fit: cover; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                ${greeting},
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                You're invited to join us for an upcoming Denver Coworks event!
              </p>
              
              <!-- Event Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      ${event.topic}
                    </h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600; width: 100px;">
                          📅 Date:
                        </td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                          🕐 Time:
                        </td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">
                          ${formattedTime} (${event.duration_minutes} minutes)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                          📍 Location:
                        </td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">
                          ${event.location}
                        </td>
                      </tr>
                    </table>
                    
                    ${event.description ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                        ${event.description}
                      </p>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px; color: #666666; font-size: 14px;">
                      This email includes a calendar invite attachment. Click below or use your email client's calendar feature to add this event to your calendar.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                We look forward to seeing you there!
              </p>
              
              <p style="margin: 15px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #1a1a1a;">The Denver Coworks Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                Denver Coworks | The Premier Alliance of Coworking Spaces<br>
                <a href="https://denvercoworks.org" style="color: #666666; text-decoration: none;">denvercoworks.org</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

serve(async (req) => {
    try {
        const { event_id } = await req.json()

        if (!event_id) {
            return new Response(
                JSON.stringify({ error: 'event_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Fetch event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', event_id)
            .single()

        if (eventError || !event) {
            return new Response(
                JSON.stringify({ error: 'Event not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Fetch pending invites
        const { data: invites, error: invitesError } = await supabase
            .from('event_invites')
            .select('*')
            .eq('event_id', event_id)
            .eq('status', 'pending')

        if (invitesError || !invites || invites.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No pending invites to send' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Generate ICS file
        const icsContent = generateICS(event)
        const icsBase64 = btoa(icsContent)

        const eventDate = new Date(event.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })

        // Send emails
        const results = await Promise.allSettled(
            invites.map(async (invite: EventInvite) => {
                const emailHTML = generateEmailHTML(event, invite.name)

                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'Denver Coworks <events@denvercoworks.org>',
                        to: [invite.email],
                        subject: `We have a new Denver Coworks Event on ${eventDate}`,
                        html: emailHTML,
                        attachments: [
                            {
                                filename: 'event.ics',
                                content: icsBase64,
                                content_type: 'text/calendar; method=REQUEST'
                            }
                        ]
                    }),
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Failed to send email: ${errorText}`)
                }

                // Update invite status
                await supabase
                    .from('event_invites')
                    .update({ status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', invite.id)

                return { email: invite.email, success: true }
            })
        )

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        // Mark failed invites
        const failedEmails = results
            .filter(r => r.status === 'rejected')
            .map((_, idx) => invites[idx].id)

        if (failedEmails.length > 0) {
            await supabase
                .from('event_invites')
                .update({ status: 'failed' })
                .in('id', failedEmails)
        }

        return new Response(
            JSON.stringify({
                message: `Sent ${successful} invites, ${failed} failed`,
                successful,
                failed
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error sending event invites:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
