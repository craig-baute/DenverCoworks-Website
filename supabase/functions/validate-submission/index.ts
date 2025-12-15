import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ValidationRequest {
  identifier: string;
  actionType: string;
  formData: any;
  honeypot?: string;
  recaptchaToken?: string;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  blocked?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { identifier, actionType, formData, honeypot, recaptchaToken }: ValidationRequest = await req.json();

    if (!identifier || !actionType) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Honeypot Check
    if (honeypot && honeypot.trim() !== '') {
      await logSpam(supabase, identifier, actionType, 'Honeypot field filled', formData);
      return new Response(
        JSON.stringify({ valid: false, reason: 'Spam detected', blocked: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. reCAPTCHA Verification
    if (recaptchaToken) {
      const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
      if (recaptchaSecret) {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: recaptchaToken,
          }),
        });

        const recaptchaResult = await recaptchaResponse.json();
        if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
          await logSpam(supabase, identifier, actionType, `reCAPTCHA failed (score: ${recaptchaResult.score})`, formData);
          return new Response(
            JSON.stringify({ valid: false, reason: 'Bot detected', blocked: false }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // 3. Check if IP is blocked
    const { data: blockedCheck } = await supabase.rpc('is_ip_blocked', { ip: identifier });
    if (blockedCheck) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'IP address is blocked', blocked: true }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Rate Limiting
    const rateLimitResult = await checkRateLimit(supabase, identifier, actionType);
    if (!rateLimitResult.allowed) {
      await logSpam(supabase, identifier, actionType, rateLimitResult.reason!, formData);
      return new Response(
        JSON.stringify({
          valid: false,
          reason: rateLimitResult.reason,
          blocked: rateLimitResult.blocked,
          retryAfter: rateLimitResult.retryAfter
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Content Validation
    const contentValidation = validateContent(formData);
    if (!contentValidation.valid) {
      await logSpam(supabase, identifier, actionType, contentValidation.reason!, formData);
      return new Response(
        JSON.stringify({ valid: false, reason: contentValidation.reason }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Update rate limit
    await updateRateLimit(supabase, identifier, actionType);

    // All checks passed
    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-submission:', error);
    return new Response(
      JSON.stringify({ valid: false, reason: 'Validation error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkRateLimit(
  supabase: any,
  identifier: string,
  actionType: string
): Promise<{ allowed: boolean; reason?: string; blocked?: boolean; retryAfter?: number }> {
  const limits = {
    rsvp: { max: 2, window: 60 * 60 * 1000, blockAfter: 5 },
    contact: { max: 2, window: 60 * 60 * 1000, blockAfter: 5 },
    apply: { max: 2, window: 60 * 60 * 1000, blockAfter: 5 },
  };

  const limit = limits[actionType as keyof typeof limits] || { max: 5, window: 60 * 60 * 1000, blockAfter: 10 };

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action_type', actionType)
    .maybeSingle();

  if (!existing) {
    return { allowed: true };
  }

  const now = new Date();
  const lastAttempt = new Date(existing.last_attempt);
  const timeSinceLastAttempt = now.getTime() - lastAttempt.getTime();

  if (existing.blocked_until) {
    const blockedUntil = new Date(existing.blocked_until);
    if (now < blockedUntil) {
      const retryAfter = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
      return {
        allowed: false,
        reason: 'Too many attempts. Please try again later.',
        blocked: true,
        retryAfter,
      };
    }
  }

  if (timeSinceLastAttempt < limit.window) {
    if (existing.attempts >= limit.max) {
      const blockedUntil = new Date(now.getTime() + 30 * 60 * 1000);
      await supabase
        .from('rate_limits')
        .update({ blocked_until: blockedUntil.toISOString() })
        .eq('id', existing.id);

      return {
        allowed: false,
        reason: `Rate limit exceeded. Try again in 30 minutes.`,
        blocked: true,
        retryAfter: 1800,
      };
    }

    if (existing.attempts >= limit.blockAfter) {
      const blockedUntil = new Date(now.getTime() + 60 * 60 * 1000);
      await supabase
        .from('rate_limits')
        .update({ blocked_until: blockedUntil.toISOString() })
        .eq('id', existing.id);

      return {
        allowed: false,
        reason: 'Suspicious activity detected. Blocked for 1 hour.',
        blocked: true,
        retryAfter: 3600,
      };
    }
  } else {
    await supabase
      .from('rate_limits')
      .update({ attempts: 1, last_attempt: now.toISOString(), blocked_until: null })
      .eq('id', existing.id);
    return { allowed: true };
  }

  return { allowed: true };
}

async function updateRateLimit(supabase: any, identifier: string, actionType: string) {
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action_type', actionType)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('rate_limits')
      .update({
        attempts: existing.attempts + 1,
        last_attempt: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('rate_limits').insert({
      identifier,
      action_type: actionType,
      attempts: 1,
      last_attempt: new Date().toISOString(),
    });
  }
}

function validateContent(formData: any): { valid: boolean; reason?: string } {
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'bitcoin', 'crypto', 'investment opportunity',
    'click here', 'buy now', 'limited time', 'act now', 'congratulations',
    'winner', 'claim your prize', 'discount', 'free money'
  ];

  const urlPattern = /(https?:\/\/[^\s]+)/gi;

  const textFields = Object.values(formData)
    .filter(val => typeof val === 'string')
    .join(' ')
    .toLowerCase();

  for (const keyword of spamKeywords) {
    if (textFields.includes(keyword.toLowerCase())) {
      return { valid: false, reason: 'Spam content detected' };
    }
  }

  const urlMatches = textFields.match(urlPattern);
  if (urlMatches && urlMatches.length > 3) {
    return { valid: false, reason: 'Too many URLs detected' };
  }

  if (formData.email && !isValidEmail(formData.email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string' && value.length > 5000) {
      return { valid: false, reason: 'Field content too long' };
    }
  }

  return { valid: true };
}

function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

async function logSpam(
  supabase: any,
  identifier: string,
  actionType: string,
  reason: string,
  formData: any
) {
  await supabase.from('spam_log').insert({
    identifier,
    action_type: actionType,
    reason,
    form_data: formData,
  });
}
