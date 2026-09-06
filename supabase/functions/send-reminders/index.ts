import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders});
  }

  try {
    
 const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!);
 const secretKey= secretKeys.default;
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, secretKey)

    const { data: profiles, error} = await supabase.from("profiles")
    .select("id, name, username, reminder_time, timezone")
    .not("reminder_time", "is", null);

    if(error) throw error;

    const now = new Date();
    let sentCount = 0;

    for(const profile of profiles){
    const nowInTz = new Date(
      now.toLocaleString("en-US", { timeZone: profile.timezone})
      );
        const [reminderHour, reminderMinute] = profile.reminder_time.split(":").map(Number);

        const reminderDate = new Date(nowInTz);
        reminderDate.setHours(reminderHour, reminderMinute, 0, 0);

        const diffMinutes = Math.abs((nowInTz.getTime() - reminderDate.getTime())  / 6000);
        if(diffMinutes > 5) continue; 

      //Skip if they've already completed today's reading
      const {data: auth} = await supabase.auth.admin.getUserById(profile.id);
      const email = auth?.user?.email;

      if(!email) continue;

      const apiKey = Deno.env.get("BREVO_API_KEY");
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {"Content-Type": "application/json", "api-key": apiKey!},
        body: JSON.stringify({
          sender: {name: "Daily Word", email: "michealmarvellous782@gmail.com"},
          to: [{email}],
          subject: "Your daily reading is waiting.",
          htmlContent: `<p>Hi ${profile.name ?? profile.username},</p> <p>Just a gentle nudge - today's Bible reading is ready whenever you are.</p>`,
        })
      })

      sentCount++;
    }

    return new Response(JSON.stringify({sent: sentCount}), {
      headers: {...corsHeaders, "Content-Type": "application/json"}
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err)}), {
      status: 500,
      headers: {...corsHeaders, "Content-Type": "application/json"}
    })
  }
})