
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

 

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalListings },
        { count: activeListings },
        { count: totalModules },
        { count: newUsersToday },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("product_listings").select("*", { count: "exact", head: true }),
        supabase.from("product_listings").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("learning_modules").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      ]);
      return {
        totalUsers: totalUsers ?? 0,
        totalListings: totalListings ?? 0,
        activeListings: activeListings ?? 0,
        totalModules: totalModules ?? 0,
        newUsersToday: newUsersToday ?? 0,
      };
    },
    staleTime: 30_000,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
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

