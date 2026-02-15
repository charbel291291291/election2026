
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize client with the USER'S Auth Header (to check claims)
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 1. Verify User Session & Claims
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) throw new Error('No active session')

    const isRoot = user.app_metadata?.is_root_admin === true;
    const rootExp = user.app_metadata?.root_exp;
    const now = Date.now();

    // 2. Enforce Root Restrictions
    if (!isRoot || !rootExp || now > rootExp) {
         return new Response(JSON.stringify({ error: 'Root session expired or invalid' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
        })
    }

    // 3. Initialize Admin Client for Execution
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...payload } = await req.json()

    // 4. Switch on Action
    let result;
    
    switch (action) {
        case 'SUSPEND_ORG':
            result = await supabaseAdmin.from('organizations').update({ is_active: false }).eq('id', payload.orgId);
            break;
        case 'ACTIVATE_ORG':
             result = await supabaseAdmin.from('organizations').update({ is_active: true }).eq('id', payload.orgId);
             break;
        case 'CHANGE_PLAN':
            result = await supabaseAdmin.from('organizations').update({ subscription_plan: payload.plan, max_users: payload.max_users }).eq('id', payload.orgId);
            break;
        case 'BAN_USER':
            // Logic to ban user in auth or org_users table
            result = await supabaseAdmin.from('organization_users').update({ is_banned: true }).eq('id', payload.userId);
            break;
        case 'MAINTENANCE_MODE':
            // Toggle feature flag in DB
            // result = ...
            result = { data: 'Maintenance mode toggled' }; 
            break;
        default:
            throw new Error('Unknown Action');
    }

    // 5. Audit Log
    const { data: rootAdmin } = await supabaseAdmin.from('root_admins').select('id').eq('user_id', user.id).single();
    
    if (rootAdmin) {
        await supabaseAdmin.from('root_activity_logs').insert({
            root_admin_id: rootAdmin.id,
            action_type: action,
            target_type: 'generic',
            target_id: payload.orgId || payload.userId || 'system',
            payload: payload,
            ip_address: req.headers.get('x-forwarded-for')
        })
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
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
