import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type GeminiContent = {
  type?: string;
  text?: string;
};

type GeminiStep = {
  type?: string;
  content?: GeminiContent[];
};

type GeminiResponse = {
  id?: string;
  model?: string;
  status?: string;
  steps?: GeminiStep[];
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed. Use POST.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // Read request body
    const {
      question,
      passageText,
      passageReference,
    } = await req.json();

    // Validate required fields
    if (!question || !passageText || !passageReference) {
      return new Response(
        JSON.stringify({
          error:
            "question, passageText, and passageReference are required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get Gemini API key from Supabase secrets
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured.",
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

    // Instructions that keep Gemini focused on today's passage'

const systemInstruction = `
You help someone understand a specific Bible passage they are reading today.

Only discuss this passage: "${passageReference}".

Here is the passage:

"${passageText}"

Rules:
- Answer using ONLY the provided passage.
- Do not use information from other Bible passages.
- Do not invent information that is not found in the provided passage.
- If the answer cannot be found in the provided passage, clearly say that it is not stated in today's passage.
- If the question is unrelated to today's passage, gently redirect the user back to the passage.
- Keep answers concise, warm, simple, and reflective.
- Reference the relevant verse when possible.
- Do not sound preachy or like a long lecture.
`;

    // Call Gemini Interactions API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          system_instruction: systemInstruction,
          input: question,
        }),
      },
    );

    // Handle Gemini API errors
    if (!response.ok) {
      const errorText = await response.text();

      console.error("Gemini API error:", errorText);

      return new Response(
        JSON.stringify({
          error: "Failed to get a response from Gemini.",
          detail: errorText,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Parse Gemini response
    const data: GeminiResponse = await response.json();

    // Find the model's text response
    const answer =
      data.steps
        ?.find((step) => step.type === "model_output")
        ?.content?.find((content) => content.type === "text")
        ?.text ??
      "I couldn't come up with an answer to that.";

    // Return answer to React
    return new Response(
      JSON.stringify({
        answer,
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
    console.error("ask-about-passage error:", err);

    return new Response(
      JSON.stringify({
        error:
          err instanceof Error
            ? err.message
            : String(err),
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

