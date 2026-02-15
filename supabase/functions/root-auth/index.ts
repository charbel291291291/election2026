
declare const Deno: any;

// Follow this setup for Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // MUST use Service Role to read root_admins
    )

    const { pin, user_id } = await req.json()

    // 1. Fetch Root Admin Record
    const { data: admin, error } = await supabaseClient
      .from('root_admins')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      // Fake delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 1000));
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 2. Verify PIN Hash
    const isValid = await bcrypt.compare(pin, admin.pin_hash)

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid Credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 3. Grant Root Access (Update User Metadata with Claim)
    // We set a claim 'is_root_admin' and an expiration 'root_exp'
    const sessionDuration = 20 * 60 * 1000; // 20 minutes
    const rootExp = Date.now() + sessionDuration;

    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user_id,
      { app_metadata: { is_root_admin: true, root_exp: rootExp } }
    )

    if (updateError) throw updateError;

    // 4. Log Login
    await supabaseClient.from('root_activity_logs').insert({
        root_admin_id: admin.id,
        action_type: 'LOGIN',
        target_type: 'system',
        target_id: 'auth',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Root Session Active (20m)' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
