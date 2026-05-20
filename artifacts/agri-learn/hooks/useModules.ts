import { useQuery } from "@tanstack/react-query";
import { supabase, LearningModule } from "@/lib/supabase";

async function fetchModules(category?: string): Promise<LearningModule[]> {
  let query = supabase
    .from("learning_modules")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LearningModule[];
}

export function useModules(category?: string) {
  return useQuery({
    queryKey: ["modules", category],
    queryFn: () => fetchModules(category),
    staleTime: 0,
    retry: false,
  });
}

export function useFeaturedModules() {
  return useQuery({
    queryKey: ["modules", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("is_active", true)
        .limit(5)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as LearningModule[];
    },
    staleTime: 0,
    retry: false,
  });
}
