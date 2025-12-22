import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get the admin's refresh token and calendar ID
        const { data: tokenData, error: tokenError } = await supabase
            .from('admin_tokens')
            .select('*')
            .eq('token_type', 'google_oauth')
            .maybeSingle();

        if (tokenError || !tokenData || !tokenData.refresh_token) {
            return new Response(
                JSON.stringify({ error: 'Google Calendar not configured. Admin needs to authorize in the dashboard.' }),
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

        // Fetch events from Google Calendar
        const calendarId = tokenData.calendar_id || 'primary';
        // Fetch upcoming events from the last 30 days and future events
        const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const eventsResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        if (!eventsResponse.ok) {
            const errorText = await eventsResponse.text();
            console.error('Fetch events failed:', errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch events from Google Calendar' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { items: googleEvents } = await eventsResponse.json();

        const results = {
            created: 0,
            updated: 0,
            errors: 0
        };

        for (const gEvent of (googleEvents || [])) {
            try {
                // Skip events without start time (all-day events might have date instead of dateTime)
                const start = gEvent.start?.dateTime || gEvent.start?.date;
                if (!start) continue;

                const startDate = new Date(start);
                const endDate = new Date(gEvent.end?.dateTime || gEvent.end?.date || start);

                const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000));

                // Format date for display: "July 23, 2024"
                const displayDate = startDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                // Format time for display: "1 PM"
                const displayTime = startDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).replace(':00', '');

                const eventData = {
                    topic: gEvent.summary || 'Untitled Event',
                    description: gEvent.description || '',
                    location: gEvent.location || 'Available to Members',
                    date: displayDate,
                    time: displayTime,
                    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80', // Default image
                    google_calendar_event_id: gEvent.id
                };

                // Check if event already exists
                const { data: existingEvent } = await supabase
                    .from('events')
                    .select('id')
                    .eq('google_calendar_event_id', gEvent.id)
                    .maybeSingle();

                if (existingEvent) {
                    const { error } = await supabase
                        .from('events')
                        .update(eventData)
                        .eq('id', existingEvent.id);

                    if (error) throw error;
                    results.updated++;
                } else {
                    const { error } = await supabase
                        .from('events')
                        .insert(eventData);

                    if (error) throw error;
                    results.created++;
                }
            } catch (err) {
                console.error(`Error processing event ${gEvent.id}:`, err);
                results.errors++;
            }
        }

        return new Response(
            JSON.stringify({
                message: 'Sync completed successfully',
                success: true,
                stats: results
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in sync-google-calendar:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
