const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key, { auth: { persistSession: false } });
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      firstName = '',
      lastName = '',
      email = '',
      phone = '',
      eventType = '',
      eventDate = '',
      location = '',
      message = '',
    } = body;

    if (!email || !firstName || !lastName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('bookings').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      event_type: eventType,
      event_date: eventDate || null,
      location,
      message,
    });

    if (error) {
      console.error('Supabase bookings insert error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save booking' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Booking handler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) };
  }
};

