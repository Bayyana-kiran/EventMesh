import { NextResponse } from "next/server";

type ReqBody = {
  intent: string;
  context?: string;
};
function validateFlowShape(obj: any) {
  if (!obj || typeof obj !== "object") return false;
  if (!Array.isArray(obj.nodes)) return false;
  if (!Array.isArray(obj.edges)) return false;
  // basic node shape checks
  for (const n of obj.nodes) {
    if (typeof n.id !== "string") return false;
    if (typeof n.type !== "string") return false;
  }
  for (const e of obj.edges) {
    if (typeof e.id !== "string") return false;
    if (typeof e.source !== "string") return false;
    if (typeof e.target !== "string") return false;
  }
  return true;
}

async function callGemini(intent: string, context?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  // Build a strict instruction prompting the model to return only JSON matching the schema
  const prompt = `Convert the following user intent into a JSON flow specification with this exact shape:\n{\n  "nodes": [{\n    "id": string,\n    "type": "source|transform|destination",\n    "data": object,\n    "position": { "x": number, "y": number }\n  }],\n  "edges": [{\n    "id": string,\n    "source": string,\n    "target": string\n  }],\n  "confidence": number,\n  "explanation": string\n}\n\nUser Intent: ${intent}\n\nContext: ${
    context || ""
  }\n\nIMPORTANT: Respond with raw JSON ONLY. Do not include any surrounding prose or markdown fences.`;

  // Use the gemini-2.0-flash endpoint and send the API key as the X-goog-api-key header.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${txt}`);
  }

  const payload = await resp.json();

  // Gather candidate text by joining all parts (defensive)
  const candidates = payload?.candidates as Array<any> | undefined;
  let text: string | null = null;
  if (Array.isArray(candidates) && candidates.length > 0) {
    const parts = candidates[0]?.content?.parts;
    if (Array.isArray(parts)) {
      text = parts.map((p: any) => String(p?.text ?? "")).join("\n");
    }
  }

  return { text, raw: payload };
}

export async function POST(request: Request) {
  try {
    const body: ReqBody = await request.json();
    const { intent, context } = body;

    if (!intent || intent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing intent" },
        { status: 400 }
      );
    }

    // Attempt 1: call Gemini
    const attempt1 = await callGemini(intent, context);

    // Helper: sanitize model text and try to parse JSON defensively
    function sanitizeAndParse(text: string | null) {
      const debugAttempts: string[] = [];
      if (!text) return { parsed: null, debugAttempts };

      let s = text.trim();
      debugAttempts.push(s);

      // If wrapped in markdown code fences, extract inner
      const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fence && fence[1]) {
        s = fence[1].trim();
        debugAttempts.push(s);
      }

      // If there's leading text before the first brace, cut it off
      const firstBrace = s.indexOf("{");
      if (firstBrace > 0) {
        s = s.slice(firstBrace);
        debugAttempts.push(s);
      }

      // Try direct parse
      try {
        return { parsed: JSON.parse(s), debugAttempts };
      } catch (e) {
        // continue to heuristics
      }

      // Try to find JSON-like substrings and parse them (try largest first)
      const matches = s.match(/\{[\s\S]*\}/g) || [];
      // sort by length desc to prefer larger blocks
      matches.sort((a, b) => b.length - a.length);
      for (const m of matches) {
        try {
          debugAttempts.push(m);
          return { parsed: JSON.parse(m), debugAttempts };
        } catch (e) {
          // try next
        }
      }

      // Final heuristic: use from first "{" to last "}" and try parse
      const lastBrace = s.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const sub = s.slice(firstBrace, lastBrace + 1);
        try {
          debugAttempts.push(sub);
          return { parsed: JSON.parse(sub), debugAttempts };
        } catch (e) {
          // give up
        }
      }

      return { parsed: null, debugAttempts };
    }

    let parsed: any = null;
    let debug: any = { attempts: [] };

    // Try parsing attempt1
    const result1 = sanitizeAndParse(attempt1.text ?? null);
    debug.attempts.push({
      source: "attempt1",
      tries: result1.debugAttempts,
      raw: attempt1.raw,
    });
    parsed = result1.parsed;

    // If parse failed or shape invalid, try a second call
    if (!parsed || !validateFlowShape(parsed)) {
      const attempt2 = await callGemini(
        `${intent} (REPLY WITH RAW JSON ONLY)`,
        context
      );
      const result2 = sanitizeAndParse(attempt2.text ?? null);
      debug.attempts.push({
        source: "attempt2",
        tries: result2.debugAttempts,
        raw: attempt2.raw,
      });
      parsed = result2.parsed;
    }

    if (!parsed || !validateFlowShape(parsed)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to obtain a valid flow JSON from Gemini. The model output could not be parsed or did not match the expected schema.",
          debug,
        },
        { status: 502 }
      );
    }

    // At this point parsed is validated
    return NextResponse.json({ success: true, flow: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
