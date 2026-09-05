import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {

  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders})
  }

  try{
  const {bibleId, chapterId} = await req.json();
  const apiKey = Deno.env.get("API_BIBLE_KEY");

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=html&include-verse-spans=true&include-verse-numbers=true&include-titles=false`;

  const response = await fetch(url, {
    headers: {"api-key": apiKey!},
  });

  if(!response.ok){
    return new Response(JSON.stringify({error: "Failed to fetch chapter"}), {
      status: response.status,
      headers: {...corsHeaders, "Content-Type": "application/json"}
    });
  }

  const data = await response.json();
  const html: string = data.data.content;
  const parts = html.split(/<span data-number="(\d+)"[^>]*>\d+<\/span>/);
  const verses: {verse: number; text: string}[] = [];

  for(let i = 1; i < parts.length; i += 2){
    const verseNum = Number(parts[i]);
    const text = parts[i + 1].replace(/<[^>]+>/g, "").trim();
    if(text) verses.push({verse: verseNum, text});
  }

  return new Response(
    JSON.stringify({reference: data.data.reference, verses}),
    {headers: {...corsHeaders, "Content-Type": "application/json"}}
  );
} catch (err) {
  return new Response(
    JSON.stringify({ error: "Internal error", detail: String(err)}),
    {status: 500, headers: {...corsHeaders, "Content-Type": "application/json"}}
  )
}
})

