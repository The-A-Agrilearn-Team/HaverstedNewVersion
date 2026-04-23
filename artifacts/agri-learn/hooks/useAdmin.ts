import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      // Use Promise.allSettled so a single failure doesn't block all stats
      const [userCountsResult, listingsTotalResult, listingsActiveResult, modulesResult, modulesCountResult] =
        await Promise.allSettled([
          // get_user_counts() is SECURITY DEFINER — bypasses RLS recursion entirely
          supabase.rpc("get_user_counts").single(),
          supabase.from("product_listings").select("*", { count: "exact", head: true }),
          supabase
            .from("product_listings")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase.from("learning_modules").select("category"),
          supabase.from("learning_modules").select("*", { count: "exact", head: true }),
        ]);

      // Extract user counts from RPC
      const userCounts =
        userCountsResult.status === "fulfilled" && !userCountsResult.value.error
          ? (userCountsResult.value.data as {
              total_users: number;
              farmers_count: number;
              retailers_count: number;
              new_users_this_month: number;
            })
          : null;

      // If user counts failed AND it's a recursion error, report it
      if (!userCounts) {
        const err =
          userCountsResult.status === "fulfilled"
            ? userCountsResult.value.error
            : null;
        if (err?.message?.includes("infinite recursion")) {
          throw new Error("RLS_RECURSION");
        }
        // For other errors just use 0s and continue
      }

      const totalListings =
        listingsTotalResult.status === "fulfilled"
          ? (listingsTotalResult.value.count ?? 0)
          : 0;

      const activeListings =
        listingsActiveResult.status === "fulfilled"
          ? (listingsActiveResult.value.count ?? 0)
          : 0;

      const moduleCategories =
        modulesResult.status === "fulfilled" ? (modulesResult.value.data ?? []) : [];

      const uniqueCategories = new Set(
        moduleCategories.map((r: any) => r.category)
      ).size;

      const totalModules =
        modulesCountResult.status === "fulfilled"
          ? (modulesCountResult.value.count ?? 0)
          : 0;

      return {
        totalUsers: userCounts?.total_users ?? 0,
        farmersCount: userCounts?.farmers_count ?? 0,
        retailersCount: userCounts?.retailers_count ?? 0,
        newUsersThisMonth: userCounts?.new_users_this_month ?? 0,
        totalListings,
        activeListings,
        totalModules,
        categoriesCount: uniqueCategories,
      };
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "deactivated" })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAllListingsAdmin() {
  return useQuery({
    queryKey: ["admin", "listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_listings")
        .select("*, profiles:farmer_id(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRemoveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from("product_listings")
        .update({ status: "removed" })
        .eq("id", listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAllModulesAdmin() {
  return useQuery({
    queryKey: ["admin", "modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase
        .from("learning_modules")
        .delete()
        .eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (module: {
      title: string;
      description: string;
      category: string;
      level: string;
      duration_minutes: number;
      content: string;
      language: string;
    }) => {
      const { error } = await supabase.from("learning_modules").insert([{
        ...module,
        is_active: true,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["modules"] });
    },
  });
}

export function useActivityLog() {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async () => {
      const [{ data: recentUsers }, { data: recentListings }, { data: recentModules }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, role, created_at")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("product_listings")
          .select("id, title, status, created_at, profiles:farmer_id(full_name)")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("learning_modules")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const logs: { time: string; type: string; icon: string; color: string; message: string }[] = [];

      (recentUsers ?? []).forEach((u: any) => {
        logs.push({
          time: u.created_at,
          type: "user",
          icon: "user-plus",
          color: "#3B82F6",
          message: `${u.full_name ?? u.email} registered as ${u.role}`,
        });
      });

      (recentListings ?? []).forEach((l: any) => {
        logs.push({
          time: l.created_at,
          type: "listing",
          icon: "package",
          color: "#F2994A",
          message: `${(l.profiles as any)?.full_name ?? "Unknown"} posted "${l.title}"`,
        });
      });

      (recentModules ?? []).forEach((m: any) => {
        logs.push({
          time: m.created_at,
          type: "module",
          icon: "book-open",
          color: "#2D6A4F",
          message: `Module published: "${m.title}"`,
        });
      });

      return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    },
  });
}
