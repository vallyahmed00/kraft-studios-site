const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key, { auth: { persistSession: false } });
}

exports.handler = async function (event) {
  const supabase = getSupabase();

  if (event.httpMethod === 'GET') {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('id, src, type, caption, cat')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase gallery select error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load gallery' }) };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data || []),
      };
    } catch (err) {
      console.error('Gallery GET error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '[]');
      if (!Array.isArray(body)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Expected an array' }) };
      }

      // Replace all items with the current array
      const { error: delError } = await supabase.from('gallery_items').delete().neq('id', 0);
      if (delError) {
        console.error('Supabase gallery delete error:', delError);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to reset gallery' }) };
      }

      if (body.length) {
        const { error: insError } = await supabase.from('gallery_items').insert(
          body.map((item) => ({
            src: item.src,
            type: item.type,
            caption: item.caption || '',
            cat: item.cat || 'All',
          }))
        );

        if (insError) {
          console.error('Supabase gallery insert error:', insError);
          return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save gallery' }) };
        }
      }

      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      console.error('Gallery POST error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};

