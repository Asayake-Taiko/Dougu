// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? ""
        }
      }
    });
    const { data, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !data?.user) {
      return new Response(JSON.stringify({
        error: "Not authenticated"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const userId = data.user.id;
    // Admin client (service role) for deleting auth users
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    // Delete the profile account
    const { error: cleanupErr } = await supabaseAdmin.rpc('delete_user', {
      user_id: userId
    });
    if (cleanupErr) {
      return new Response(JSON.stringify({
        error: cleanupErr.message
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Delete the auth account (auth.users)
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delErr) {
      return new Response(JSON.stringify({
        error: delErr.message
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify({
      ok: true
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      message: err?.message ?? err
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
