// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
Deno.serve(async (req) => {
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

    // 1. Authenticate User
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({
        error: "Not authenticated"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const userId = user.id;

    // 2. Setup Admin Client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // 3. Ensure "Deleted User" exists
    const DELETED_USER_EMAIL = 'deleted@dougu.app';
    let deletedUserId: string | undefined;

    // Try to find existing
    const { data: foundId } = await supabaseAdmin.rpc('get_user_id_by_email', {
      p_email: DELETED_USER_EMAIL
    });

    if (foundId) {
      deletedUserId = foundId;
    } else {
      // Create if not found
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: DELETED_USER_EMAIL,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          name: 'Deleted User',
          profile_image: null
        }
      });

      if (createError) {
        // If race condition where it was just created, try finding again
        const { data: retryFoundId } = await supabaseAdmin.rpc('get_user_id_by_email', {
          p_email: DELETED_USER_EMAIL
        });
        if (retryFoundId) {
          deletedUserId = retryFoundId;
        } else {
          throw new Error(`Failed to create or find deleted user placeholder: ${createError.message}`);
        }
      } else {
        deletedUserId = newUser.user.id;
      }
    }

    if (!deletedUserId) {
      throw new Error("Could not determine Deleted User ID");
    }

    // 4. Perform Reassign and Delete
    const { error: rpcError } = await supabaseAdmin.rpc('reassign_and_delete_user', {
      target_user_id: userId,
      deleted_user_id: deletedUserId
    });

    if (rpcError) {
      return new Response(JSON.stringify({
        error: rpcError.message
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
      error: err?.message ?? err
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
