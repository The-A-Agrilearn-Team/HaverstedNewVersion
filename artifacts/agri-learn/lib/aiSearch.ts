import { AgriService, getMockServices } from "@/hooks/useServices";

export interface AiSearchResult {
  summary: string;
  matches: AgriService[];
  externalSuggestions: ExternalSuggestion[];
  fromCache?: boolean;
}

export interface ExternalSuggestion {
  name: string;
  description: string;
  where_to_find: string;
}

const OPENAI_BASE_URL =
  process.env.EXPO_PUBLIC_OPENAI_BASE_URL ?? "";
const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "sk-no-key";

const MODEL = "gpt-5-mini";

const SYSTEM_PROMPT = `You are an agricultural service finder assistant for South African farmers using the AgriLearn app.

You will receive:
1. A farmer's natural-language question (in English, isiZulu, Sesotho, or any SA language)
2. A JSON list of available services in the app

Your job:
- Identify which in-app services (by id) best match the farmer's need. Rank by relevance.
- If NO in-app service matches well, return an empty matches array.
- Provide a short, friendly 1-2 sentence summary in the same language the farmer used.
- If matches are weak or absent, suggest 1-3 reputable external South African agricultural sources where the farmer could find this service (e.g. "Agrihandbook", "Yellow Pages SA", "your local Department of Agriculture extension office", "AFGRI", "Senwes", "NWK"). Be realistic — do NOT invent fake company names or fake URLs.

Respond ONLY with valid JSON in this exact shape:
{
  "summary": "string",
  "match_ids": ["s1", "s3"],
  "external": [
    { "name": "string", "description": "string", "where_to_find": "string" }
  ]
}`;

export async function aiSearchServices(
  query: string,
  services: AgriService[],
): Promise<AiSearchResult> {
  if (!query.trim()) {
    return { summary: "", matches: [], externalSuggestions: [] };
  }

  if (!OPENAI_BASE_URL) {
    return offlineFallback(query, services);
  }

  const servicesContext = services.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    description: s.description,
    location: s.location,
    price: `R${s.price_from} ${s.price_unit}`,
  }));

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_completion_tokens: 1000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Farmer's question: "${query}"\n\nAvailable services:\n${JSON.stringify(servicesContext, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("[aiSearch] OpenAI error:", response.status, errorText);
      return offlineFallback(query, services);
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    const matchIds: string[] = Array.isArray(parsed.match_ids) ? parsed.match_ids : [];
    const matches = matchIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is AgriService => Boolean(s));

    return {
      summary: parsed.summary ?? "",
      matches,
      externalSuggestions: Array.isArray(parsed.external) ? parsed.external : [],
    };
  } catch (err) {
    console.warn("[aiSearch] failed, falling back to keyword search:", err);
    return offlineFallback(query, services);
  }
}

function offlineFallback(query: string, services: AgriService[]): AiSearchResult {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  if (!tokens.length) {
    return {
      summary: "Showing all services. Type a more specific question for better matches.",
      matches: services,
      externalSuggestions: [],
      fromCache: true,
    };
  }

  const scored = services.map((s) => {
    const haystack = `${s.title} ${s.description} ${s.category} ${s.location}`.toLowerCase();
    const score = tokens.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
    return { service: s, score };
  });

  const matches = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.service);

  const externalSuggestions: ExternalSuggestion[] = matches.length
    ? []
    : [
        {
          name: "Agrihandbook South Africa",
          description: "Annual directory of SA agri service providers and suppliers.",
          where_to_find: "agrihandbook.co.za",
        },
        {
          name: "Department of Agriculture extension office",
          description: "Free advice and referrals to local services in your district.",
          where_to_find: "Visit your nearest provincial DALRRD office",
        },
      ];

  return {
    summary: matches.length
      ? `Found ${matches.length} service${matches.length === 1 ? "" : "s"} matching your search (offline mode).`
      : "No matching services in the app right now. Try one of the external sources below.",
    matches,
    externalSuggestions,
    fromCache: true,
  };
}

export { getMockServices };
