const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_TEXT_LENGTH = 4000;
const MAX_TITLE_LENGTH = 200;
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You turn a dog owner's own care instructions into a daily checklist.

Rules:
- Use only what the owner wrote. Never add tasks, doses, drugs, durations, amounts, times or medical advice that are not in the text.
- Each item's source_quote must be copied exactly, word for word, from the text.
- If an amount, time or frequency is vague (for example "a bit", "some", "as needed", "sometimes"), set needs_confirmation to true and write one short question for the owner in ambiguity_question.
- If the text gives no time of day, use Morning and set needs_confirmation to true with a question asking which part of the day to use.
- If the text gives no frequency, use daily and set needs_confirmation to true with a question asking how often.
- Use "once" only when the text says something happens a single time. Otherwise use "daily".
- start_date is the date the text gives, or today's date when it gives none. Dates use YYYY-MM-DD.
- Put any line you cannot turn into a clear task in not_converted, with a short reason.
- Keep wording plain and in British English.`;

const RESPONSE_SCHEMA = {
  name: "checklist_draft",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["items", "not_converted"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "title",
            "category",
            "amount",
            "slots",
            "frequency",
            "start_date",
            "end_date",
            "notes",
            "source_quote",
            "needs_confirmation",
            "ambiguity_question",
          ],
          properties: {
            title: { type: "string" },
            category: { type: ["string", "null"] },
            amount: { type: ["string", "null"] },
            slots: { type: "array", items: { type: "string", enum: TIME_SLOTS } },
            frequency: { type: "string", enum: ["daily", "once"] },
            start_date: { type: "string" },
            end_date: { type: ["string", "null"] },
            notes: { type: ["string", "null"] },
            source_quote: { type: "string" },
            needs_confirmation: { type: "boolean" },
            ambiguity_question: { type: ["string", "null"] },
          },
        },
      },
      not_converted: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "reason"],
          properties: {
            text: { type: "string" },
            reason: { type: "string" },
          },
        },
      },
    },
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normaliseForMatch(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

type NotConverted = { text: string; reason: string };

function checkItems(draft: unknown, sourceText: string) {
  const items: Record<string, unknown>[] = [];
  const notConverted: NotConverted[] = [];
  const haystack = normaliseForMatch(sourceText);
  const rawItems = Array.isArray((draft as { items?: unknown })?.items)
    ? ((draft as { items: unknown[] }).items)
    : [];

  for (const raw of rawItems) {
    const item = (raw ?? {}) as Record<string, unknown>;
    const title = cleanText(item.title, MAX_TITLE_LENGTH);
    const sourceQuote = cleanText(item.source_quote, 500) ?? "";
    const slots = Array.isArray(item.slots)
      ? item.slots.filter((slot): slot is string => TIME_SLOTS.includes(slot as string))
      : [];
    const startDate = item.start_date;
    const endDate = item.end_date ?? null;

    if (!title) {
      notConverted.push({ text: sourceQuote || "(blank line)", reason: "No clear task was found." });
      continue;
    }
    if (!sourceQuote || !haystack.includes(normaliseForMatch(sourceQuote))) {
      notConverted.push({ text: title, reason: "This could not be matched to your text, so it was left out." });
      continue;
    }
    if (slots.length === 0 || !isValidDate(startDate) || (endDate !== null && !isValidDate(endDate))) {
      notConverted.push({ text: sourceQuote, reason: "The time or dates were unclear." });
      continue;
    }
    if (endDate !== null && endDate < startDate) {
      notConverted.push({ text: sourceQuote, reason: "The end date is before the start date." });
      continue;
    }

    const ambiguity = cleanText(item.ambiguity_question, 300);
    const needsConfirmation = item.needs_confirmation === true || ambiguity !== null;
    items.push({
      title,
      category: cleanText(item.category, 60),
      amount: cleanText(item.amount, 120),
      slots,
      frequency: item.frequency === "once" ? "once" : "daily",
      start_date: startDate,
      end_date: endDate,
      notes: cleanText(item.notes, 1000),
      source_quote: sourceQuote.slice(0, 500),
      needs_confirmation: needsConfirmation,
      ambiguity_question: needsConfirmation ? ambiguity ?? "Please check this item." : null,
    });
  }

  const extraNotConverted = Array.isArray((draft as { not_converted?: unknown })?.not_converted)
    ? ((draft as { not_converted: unknown[] }).not_converted)
    : [];
  for (const raw of extraNotConverted) {
    const entry = (raw ?? {}) as Record<string, unknown>;
    const text = cleanText(entry.text, 500);
    const reason = cleanText(entry.reason, 300);
    if (text && reason) notConverted.push({ text, reason });
  }

  return { items, not_converted: notConverted };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const todayDate = body?.today_date;
    const timeZone = typeof body?.time_zone === "string" ? body.time_zone.slice(0, 64) : "UTC";

    if (!text || text.length > MAX_TEXT_LENGTH) {
      return json({ error: `Please paste between 1 and ${MAX_TEXT_LENGTH} characters.` }, 400);
    }
    if (!isValidDate(todayDate)) {
      return json({ error: "Today's date is missing or invalid." }, 400);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return json({ error: "Checklist generation isn't available yet. Please try again later." }, 503);
    }

    const aiResponse = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Today is ${todayDate} (time zone: ${timeZone}).\n\nOwner's instructions:\n"""\n${text}\n"""`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("OpenAI request failed", aiResponse.status);
      return json({ error: "The checklist service is busy. Please try again shortly." }, 502);
    }

    const payload = (await aiResponse.json()) as { choices?: { message?: { content?: unknown } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return json({ error: "The checklist service returned an unexpected reply. Please try again." }, 502);
    }

    let draft: unknown;
    try {
      draft = JSON.parse(content);
    } catch {
      return json({ error: "The checklist service returned an unexpected reply. Please try again." }, 502);
    }

    return json(checkItems(draft, text));
  } catch (error) {
    console.error("generate-checklist failed", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
