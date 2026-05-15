import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ServiceSummary {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  price: string;
}

interface AiSearchRequest {
  query: string;
  services: ServiceSummary[];
}

router.post("/ai-search", async (req, res) => {
  const { query, services }: AiSearchRequest = req.body ?? {};
  console.log("Incoming request:", { query, services });
  if (!query?.trim()) {
    res.json({ summary: "", match_ids: [], external: [] });
    return;
  }

  const servicesText = (services ?? [])
    .map(
      (s) =>
        `ID: ${s.id}\nTitle: ${s.title}\nCategory: ${s.category}\nDescription: ${s.description}\nLocation: ${s.location}\nPrice: ${s.price}`
    )
    .join("\n---\n");

  const systemPrompt = `You are an agricultural services assistant for South African farmers. 
Your job is to help farmers find the right services from the AgriLearn platform.

Available services in the app:
${servicesText || "No services currently listed."}

When a farmer asks a question:
1. If matching services exist in the list above, return their IDs and write a helpful summary explaining why they match.
2. If no services match, write a friendly summary explaining what the farmer might need, and suggest relevant external South African agricultural resources.

Always respond in plain, friendly English that a farmer can understand. Keep summaries concise (1-3 sentences).

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "match_ids": ["id1", "id2"],
  "external": [
    { "name": "...", "description": "...", "where_to_find": "https://..." }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      response_format: {
  type: "json_schema",
  json_schema: {
    name: "ai_search_response",
    schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        match_ids: {
          type: "array",
          items: { type: "string" }
        },
        external: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              where_to_find: { type: "string" }
            },
            required: ["name", "description", "where_to_find"]
          }
        }
      },
      required: ["summary", "match_ids", "external"]
    }
  }
},
      max_completion_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let parsed;

    try {
      const raw = completion.choices?.[0]?.message?.content;

      if (!raw) {
        throw new Error("Empty AI response");
      }

      // Clean response (removes accidental markdown)
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.warn("[ai-search] JSON parse failed:", err);

      parsed = {
        summary: "I couldn't fully process your request, but here are some possible matches.",
        match_ids: [],
        external: [],
      };
    }

    res.json({
      summary: parsed.summary ?? "",
      match_ids: Array.isArray(parsed.match_ids) ? parsed.match_ids : [],
      external: Array.isArray(parsed.external) ? parsed.external : [],
    });
  } catch (err) {
    console.error("[ai-search] OpenAI error:", err);
    res.status(500).json({
      summary: `Could not process your search right now. Try browsing services by category.`,
      match_ids: [],
      external: [
        {
          name: "Agrihandbook South Africa",
          description: "Annual directory of SA agri service providers and suppliers.",
          where_to_find: "https://www.agrihandbook.co.za",
        },
        {
          name: `Search Google: "${query}"`,
          description: "Find providers, reviews, and contact details on Google.",
          where_to_find: `https://www.google.com/search?q=${encodeURIComponent(query + " South Africa")}`,
        },
      ],
    });
  }
});

router.post("/module-assist", async (req, res) => {
  const { question, moduleTitle, moduleContent } = req.body ?? {};

  if (!question?.trim()) {
    res.json({ answer: "" });
    return;
  }

  const systemPrompt = `You are a friendly agricultural learning assistant helping a South African farmer understand the module "${moduleTitle || "this learning module"}".

The module content is:
---
${moduleContent || "No content provided."}
---

Answer the farmer's question using the module content as your primary reference. 
- Keep answers short and practical (3-6 sentences max).
- Use simple language — avoid jargon.
- If the answer is not in the module, say so and give a brief general agricultural tip.
- Always be encouraging and supportive.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_completion_tokens: 400,
    });

    const answer = completion.choices[0]?.message?.content ?? "I could not generate an answer right now. Please try again.";
    
    res.json({ answer });
    
  } catch (err) {
    console.error("[module-assist] OpenAI error:", err);
    res.status(500).json({ answer: "I'm having trouble connecting right now. Please try again in a moment." });
    
  }
});

export default router;
