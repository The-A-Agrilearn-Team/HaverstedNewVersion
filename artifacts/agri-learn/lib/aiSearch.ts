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

export async function aiSearchServices(
  query: string,
  services: AgriService[],
): Promise<AiSearchResult> {
  if (!query.trim()) {
    return { summary: "", matches: [], externalSuggestions: [] };
  }

  const servicesSummary = services.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    description: s.description,
    location: s.location,
    price: `R${s.price_from} ${s.price_unit}`,
  }));

  try {
    const response = await fetch("http://localhost:3000/api/ai-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, services: servicesSummary }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const matchIds: string[] = Array.isArray(data.match_ids)
      ? data.match_ids
      : [];

    const matches = matchIds
      .map((id: string) => services.find((s) => s.id === id))
      .filter((s): s is AgriService => Boolean(s));

    return {
      summary: data.summary ?? "",
      matches,
      externalSuggestions: Array.isArray(data.external)
        ? data.external
        : [],
    };
  } catch (err) {
    console.warn(
      "[aiSearch] backend unavailable, using offline fallback:",
      err,
    );
    return offlineFallback(query, services);
  }
}

/**
 * ✅ FIXED: Module Assistant function
 * Now matches backend expectations
 */
export async function askModuleAssistant(
  question: string,
  moduleId: number
): Promise<string> {
  if (!question.trim()) return "";

  try {
    const response = await fetch(
      "http://localhost:3000/api/module-assist",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: moduleId, // ✅ REQUIRED
          question: question, // ✅ REQUIRED
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Module Assist Response:", data); // ✅ Debug log

    return data.answer ?? "No answer returned.";
  } catch (err) {
    console.warn("[moduleAssist] backend unavailable:", err);
    return "I can't connect to the AI assistant right now. Please check your connection and try again.";
  }
}

function offlineFallback(
  query: string,
  services: AgriService[],
): AiSearchResult {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (!tokens.length) {
    return {
      summary:
        "Showing all services. Type a more specific question for better matches.",
      matches: services,
      externalSuggestions: [],
      fromCache: true,
    };
  }

  const scored = services.map((s) => {
    const haystack = `${s.title} ${s.description} ${s.category} ${s.location}`.toLowerCase();

    const score = tokens.reduce(
      (acc, t) => acc + (haystack.includes(t) ? 1 : 0),
      0,
    );

    return { service: s, score };
  });

  const matches = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.service);

  const googleLink = `https://www.google.com/search?q=${encodeURIComponent(
    query + " South Africa",
  )}`;

  const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(
    query + " South Africa",
  )}`;

  const externalSuggestions: ExternalSuggestion[] = matches.length
    ? []
    : [
        {
          name: `Search Google: "${query}"`,
          description:
            "Find providers, reviews, and contact details on Google.",
          where_to_find: googleLink,
        },
        {
          name: "Find on Google Maps",
          description: "Locate nearby businesses providing this service.",
          where_to_find: mapsLink,
        },
        {
          name: "Agrihandbook South Africa",
          description:
            "Annual directory of SA agri service providers and suppliers.",
          where_to_find: "https://www.agrihandbook.co.za",
        },
      ];

  return {
    summary: matches.length
      ? `Found ${matches.length} service${matches.length === 1 ? "" : "s"} matching your search.`
      : `"${query}" is not in the app yet. Here are some external resources:`,
    matches,
    externalSuggestions,
    fromCache: true,
  };
}

export { getMockServices };
