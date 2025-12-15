import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  eventId: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, title, description, startDateTime, endDateTime, location }: RequestBody = await req.json();

    if (!eventId || !title || !startDateTime || !endDateTime) {
      return new Response(
        JSON.stringify({ error: 'eventId, title, startDateTime, and endDateTime are required' }),
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

    // Create the Google Calendar event
    const calendarId = tokenData.calendar_id || 'primary';
    const eventBody = {
      summary: title,
      description: description || '',
      location: location || '',
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Denver',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Denver',
      },
      attendees: [],
      reminders: {
        useDefault: true,
      },
    };

    const createResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Create event failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create event in Google Calendar' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleEvent = await createResponse.json();

    // Update our event with the Google Calendar event ID
    const { error: updateError } = await supabase
      .from('events')
      .update({ google_calendar_event_id: googleEvent.id })
      .eq('id', eventId);

    if (updateError) {
      console.error('Failed to update event with Google Calendar ID:', updateError);
      return new Response(
        JSON.stringify({ error: 'Event created in Google Calendar but failed to update database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Event created in Google Calendar successfully',
        success: true,
        googleEventId: googleEvent.id,
        eventLink: googleEvent.htmlLink,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-calendar-event:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
