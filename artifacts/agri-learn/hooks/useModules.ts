import { useQuery } from "@tanstack/react-query";
import { supabase, LearningModule } from "@/lib/supabase";

const MOCK_MODULES: LearningModule[] = [
  { id: "1", title: "Growing Tomatoes: Complete Guide", description: "Step-by-step guide to planting, watering, nurturing, and harvesting tomatoes in South African conditions.", category: "Crops", level: "beginner", content: "", duration_minutes: 45, language: "en", created_at: new Date().toISOString() },
  { id: "2", title: "Growing Spinach: Complete Guide", description: "How to plant, water, feed, and harvest spinach for a continuous supply throughout the year.", category: "Crops", level: "beginner", content: "", duration_minutes: 30, language: "en", created_at: new Date().toISOString() },
  { id: "3", title: "Growing Potatoes: Complete Guide", description: "Step-by-step instructions for planting, hilling, watering, and harvesting potatoes in South Africa.", category: "Crops", level: "beginner", content: "", duration_minutes: 50, language: "en", created_at: new Date().toISOString() },
  { id: "4", title: "Growing Carrots: Complete Guide", description: "Learn to plant, thin, water, and harvest carrots for crisp, sweet results in South African gardens.", category: "Crops", level: "beginner", content: "", duration_minutes: 40, language: "en", created_at: new Date().toISOString() },
  { id: "5", title: "Growing Onions: Complete Guide", description: "Complete instructions for raising, transplanting, watering, and curing onions in South Africa.", category: "Crops", level: "intermediate", content: "", duration_minutes: 55, language: "en", created_at: new Date().toISOString() },
  { id: "6", title: "Growing Butternut Squash: Complete Guide", description: "How to plant, train, water, and harvest butternut squash for excellent yield and quality.", category: "Crops", level: "beginner", content: "", duration_minutes: 40, language: "en", created_at: new Date().toISOString() },
  { id: "7", title: "Growing Mangoes: Complete Guide", description: "From young tree establishment to first harvest — a complete mango-growing guide for South African farmers.", category: "Crops", level: "intermediate", content: "", duration_minutes: 60, language: "en", created_at: new Date().toISOString() },
  { id: "8", title: "Growing Cabbage: Complete Guide", description: "Step-by-step guide to raising, transplanting, feeding, and harvesting firm, quality cabbage heads.", category: "Crops", level: "beginner", content: "", duration_minutes: 42, language: "en", created_at: new Date().toISOString() },
];

async function fetchModules(category?: string): Promise<LearningModule[]> {
  const base = MOCK_MODULES.filter(
    (m) => !category || category === "All" || m.category === category
  );

  try {
    let query = supabase
      .from("learning_modules")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      const mockTitles = new Set(MOCK_MODULES.map((m) => m.title));
      const extras = (data as LearningModule[]).filter(
        (m) => !mockTitles.has(m.title)
      );
      return [...base, ...extras];
    }
  } catch {}

  return base;
}

export function useModules(category?: string) {
  return useQuery({
    queryKey: ["modules", category],
    queryFn: () => fetchModules(category),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useFeaturedModules() {
  return useQuery({
    queryKey: ["modules", "featured"],
    queryFn: async () => {
      const mockTitles = new Set(MOCK_MODULES.map((m) => m.title));
      try {
        const { data } = await supabase
          .from("learning_modules")
          .select("*")
          .eq("is_active", true)
          .limit(5)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const extras = (data as LearningModule[]).filter(
            (m) => !mockTitles.has(m.title)
          );
          return [...MOCK_MODULES.slice(0, 5), ...extras].slice(0, 5);
        }
      } catch {}
      return MOCK_MODULES.slice(0, 5);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
