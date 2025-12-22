import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  eventId: string;
  attendeeEmail: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, attendeeEmail }: RequestBody = await req.json();

    if (!eventId || !attendeeEmail) {
      return new Response(
        JSON.stringify({ error: 'eventId and attendeeEmail are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the event's Google Calendar ID
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('google_calendar_event_id')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!event.google_calendar_event_id) {
      return new Response(
        JSON.stringify({ error: 'Event is not synced with Google Calendar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the admin's refresh token
    const { data: tokenData, error: tokenError } = await supabase
      .from('admin_tokens')
      .select('*')
      .eq('token_type', 'google_oauth')
      .maybeSingle();

    if (tokenError || !tokenData || !tokenData.refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not configured. Admin needs to authorize.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh the access token
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to refresh Google access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token, expires_in } = await tokenResponse.json();

    // Update the stored access token
    await supabase
      .from('admin_tokens')
      .update({
        access_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenData.id);

    // Get current event details from Google Calendar
    const calendarId = tokenData.calendar_id || 'primary';
    const getEventResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.google_calendar_event_id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!getEventResponse.ok) {
      const errorText = await getEventResponse.text();
      console.error('Get event failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch event from Google Calendar' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleEvent = await getEventResponse.json();

    // Add the new attendee
    const attendees = googleEvent.attendees || [];
    const existingAttendee = attendees.find(
      (a: any) => a.email.toLowerCase() === attendeeEmail.toLowerCase()
    );

    if (existingAttendee) {
      return new Response(
        JSON.stringify({ message: 'Attendee already added', success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    attendees.push({
      email: attendeeEmail,
      responseStatus: 'needsAction',
    });

    // Update the event with the new attendee
    const updateResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.google_calendar_event_id}?sendUpdates=all`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Update event failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to add attendee to Google Calendar' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updatedEvent = await updateResponse.json();

    return new Response(
      JSON.stringify({
        message: 'Attendee added successfully. Calendar invite sent!',
        success: true,
        eventLink: updatedEvent.htmlLink
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in add-calendar-attendee:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
