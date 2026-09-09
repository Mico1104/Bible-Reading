
import "jsr:@Supabase/functions-js/edge-runtime.d.ts";
  
import "jsr:@Supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  console.log("🚀 send-reminders started");

  try {
    // --------------------------------------------------
    // 1. Create Supabase client
    // --------------------------------------------------

    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");

    if (!secretKeysRaw) {
      throw new Error("SUPABASE_SECRET_KEYS is missing");
    }

    const secretKeys = JSON.parse(secretKeysRaw);
    const secretKey = secretKeys.default;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is missing");
    }

    const supabase = createClient(supabaseUrl, secretKey);

    console.log("✅ Supabase client created");

    // --------------------------------------------------
    // 2. Get profiles with reminders
    // --------------------------------------------------

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, name, username, reminder_time, timezone")
      .not("reminder_time", "is", null);

    if (error) {
      console.error("❌ Profiles query failed:", error);
      throw error;
    }

    console.log(`👥 Profiles found: ${profiles?.length ?? 0}`);

    // --------------------------------------------------
    // 3. Current time
    // --------------------------------------------------

    const now = new Date();

    console.log("🌎 Current UTC time:", now.toISOString());

    let sentCount = 0;
    let skippedCount = 0;

    // --------------------------------------------------
    // 4. Process each profile
    // --------------------------------------------------

    for (const profile of profiles ?? []) {
      console.log("--------------------------------------------------");

      console.log("👤 Processing user:", profile.id);
      console.log("🕐 Reminder time:", profile.reminder_time);
      console.log("🌍 Timezone:", profile.timezone);

      if (!profile.timezone) {
        console.log("⚠️ User has no timezone. Skipping.");
        skippedCount++;
        continue;
      }

      // ------------------------------------------------
      // Convert current time to user's timezone
      // ------------------------------------------------

      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: profile.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const parts = timeFormatter.formatToParts(now);

      const getPart = (type: string) =>
        parts.find((part) => part.type === type)?.value;

      const year = getPart("year");
      const month = getPart("month");
      const day = getPart("day");
      const hour = getPart("hour");
      const minute = getPart("minute");

      if (!year || !month || !day || !hour || !minute) {
        console.error(
          "❌ Could not determine user's local date/time",
        );

        skippedCount++;
        continue;
      }

      const currentTime = `${hour}:${minute}`;
      const localDate = `${year}-${month}-${day}`;

      const currentHour = Number(hour);
      const currentMinute = Number(minute);

      const [reminderHour, reminderMinute] =
        profile.reminder_time
          .split(":")
          .map(Number);

      const currentTotalMinutes =
        currentHour * 60 + currentMinute;

      const reminderTotalMinutes =
        reminderHour * 60 + reminderMinute;

      let diffMinutes = Math.abs(
        currentTotalMinutes - reminderTotalMinutes,
      );

      // Handle midnight correctly
      if (diffMinutes > 720) {
        diffMinutes = 1440 - diffMinutes;
      }

      console.log("🕐 User local time:", currentTime);
      console.log("📅 User local date:", localDate);
      console.log("⏰ Reminder time:", profile.reminder_time);
      console.log("⏱️ Minutes from reminder:", diffMinutes);

      if (diffMinutes > 5) {
        console.log("⏭️ Reminder is not due. Skipping.");
        skippedCount++;
        continue;
      }

      console.log("🔔 Reminder is due!");

      // ------------------------------------------------
      // 5. Duplicate prevention
      // ------------------------------------------------

      console.log(
        "🔐 Attempting to claim today's reminder...",
      );

      const { data: reminderLog, error: logError } =
        await supabase
          .from("reminder_logs")
          .insert({
            user_id: profile.id,
            reminder_date: localDate,
            status: "pending",
          })
          .select("id")
          .single();

      if (logError) {
        // PostgreSQL unique violation.
        // This means another invocation already created
        // today's reminder for this user.
        if (logError.code === "23505") {
          console.log(
            "⏭️ Reminder already processed today. Skipping.",
          );

          skippedCount++;
          continue;
        }

        console.error(
          "❌ Could not create reminder log:",
          logError,
        );

        skippedCount++;
        continue;
      }

      console.log(
        "✅ Reminder successfully claimed:",
        reminderLog.id,
      );

      // ------------------------------------------------
      // 6. Get user's email
      // ------------------------------------------------

      const { data: authData, error: authError } =
        await supabase.auth.admin.getUserById(profile.id);

      if (authError) {
        console.error(
          "❌ Could not get user:",
          authError,
        );

        await supabase
          .from("reminder_logs")
          .update({
            status: "failed",
          })
          .eq("id", reminderLog.id);

        skippedCount++;
        continue;
      }

      const email = authData?.user?.email;

      console.log("📧 User email:", email);

      if (!email) {
        console.log(
          "⚠️ User has no email. Skipping.",
        );

        await supabase
          .from("reminder_logs")
          .update({
            status: "failed",
          })
          .eq("id", reminderLog.id);

        skippedCount++;
        continue;
      }

      // ------------------------------------------------
      // 7. Get Brevo API key
      // ------------------------------------------------

      const apiKey = Deno.env.get("BREVO_API_KEY");

      if (!apiKey) {
        throw new Error("BREVO_API_KEY is missing");
      }

      console.log("🔑 Brevo API key found");

      // ------------------------------------------------
      // 8. Send email
      // ------------------------------------------------

      console.log("📨 Sending email to:", email);

      const brevoResponse = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },

          body: JSON.stringify({
            sender: {
              name: "Daily Word",
              email: "michealmarvellous782@gmail.com",
            },

            to: [
              {
                email,
              },
            ],

            subject: "Your daily reading is waiting.",

            htmlContent: `
              <p>Hi ${
                profile.name ??
                profile.username ??
                "there"
              },</p>

              <p>
                Just a gentle nudge —
                today's Bible reading is ready whenever you are.
              </p>
            `,
          }),
        },
      );

      const brevoBody = await brevoResponse.text();

      console.log(
        "📨 Brevo status:",
        brevoResponse.status,
      );

      console.log(
        "📨 Brevo response:",
        brevoBody,
      );

      // ------------------------------------------------
      // 9. Handle Brevo response
      // ------------------------------------------------

      if (!brevoResponse.ok) {
        console.error(
          "❌ Brevo rejected the email",
        );

        await supabase
          .from("reminder_logs")
          .update({
            status: "failed",
          })
          .eq("id", reminderLog.id);

        skippedCount++;
        continue;
      }

      console.log("✅ Email accepted by Brevo");

      // ------------------------------------------------
      // 10. Mark reminder as sent
      // ------------------------------------------------

      const { error: updateError } =
        await supabase
          .from("reminder_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", reminderLog.id);

      if (updateError) {
        console.error(
          "⚠️ Email was accepted, but reminder log could not be updated:",
          updateError,
        );

        // Do NOT send another email.
        // The email has already been accepted by Brevo.
      }

      sentCount++;
    }

    // --------------------------------------------------
    // 11. Final result
    // --------------------------------------------------

    console.log("==========================================");
    console.log("🏁 send-reminders finished");
    console.log("📨 Emails sent:", sentCount);
    console.log("⏭️ Users skipped:", skippedCount);
    console.log("==========================================");

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        skipped: skippedCount,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error(
      "🔥 send-reminders failed:",
      err,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
