declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { phone_number, pin } = await req.json();

    if (!phone_number || !pin) {
      return new Response(
        JSON.stringify({ error: "Phone number and PIN required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // 1. Find organization user by phone
    const { data: orgUser, error: findError } = await supabaseClient
      .from("organization_users")
      .select("*, organizations(*)")
      .eq("phone_number", phone_number)
      .single();

    if (findError || !orgUser) {
      // Fake delay to prevent timing attacks
      await new Promise((r) => setTimeout(r, 1000));
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 2. Verify PIN Hash
    const isValid = await bcrypt.compare(pin, orgUser.pin_hash);

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 3. Get or create auth user
    let authUserId = orgUser.auth_user_id;

    if (!authUserId) {
      // Create auth user with email = phone@election2026.app
      const email = `${phone_number}@election2026.app`;

      const { data: authData, error: createError } =
        await supabaseClient.auth.admin.createUser({
          email: email,
          phone: phone_number,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            full_name: orgUser.full_name,
            organization_id: orgUser.organization_id,
            role: orgUser.role,
          },
        });

      if (createError || !authData.user) {
        throw createError || new Error("Failed to create auth user");
      }

      authUserId = authData.user.id;

      // Update organization_users with auth_user_id
      await supabaseClient
        .from("organization_users")
        .update({ auth_user_id: authUserId })
        .eq("id", orgUser.id);
    }

    // 4. Generate session token (create admin session)
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone_number}@election2026.app`,
      });

    if (sessionError) {
      // Fallback: create a custom response without full session
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: authUserId,
            phone_number: orgUser.phone_number,
            full_name: orgUser.full_name,
            role: orgUser.role,
            organization: orgUser.organizations,
          },
          message: "Login successful. Use stored session for API calls.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 5. Return session
    return new Response(
      JSON.stringify({
        success: true,
        session: sessionData,
        user: {
          id: authUserId,
          phone_number: orgUser.phone_number,
          full_name: orgUser.full_name,
          role: orgUser.role,
          organization: orgUser.organizations,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
