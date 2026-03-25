import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SupplyWindow {
  id: string;
  retailer_id: string;
  retailer_name?: string;
  title: string;
  description: string;
  category: string;
  quantity_needed: number;
  unit: string;
  price_offered: number;
  location: string;
  deadline: string;
  status: "open" | "closed" | "filled";
  applicant_count?: number;
  created_at: string;
}

export interface WindowApplication {
  id: string;
  window_id: string;
  farmer_id: string;
  farmer_name?: string;
  message: string;
  quantity_available: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

const MOCK_WINDOWS: SupplyWindow[] = [
  {
    id: "w1",
    retailer_id: "r1",
    retailer_name: "FreshMart Durban",
    title: "500kg Potatoes Required",
    description: "Looking for Grade A potatoes for weekly supply to our 3 Durban stores. Must be washed and bagged in 10kg bags. Consistent weekly delivery preferred.",
    category: "Vegetables",
    quantity_needed: 500,
    unit: "kg",
    price_offered: 8.50,
    location: "Durban, KwaZulu-Natal",
    deadline: "2026-04-15",
    status: "open",
    applicant_count: 3,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "w2",
    retailer_id: "r1",
    retailer_name: "FreshMart Durban",
    title: "200 dozen Free-Range Eggs",
    description: "Need certified free-range eggs, medium to large size. Bi-weekly delivery to Pinetown store.",
    category: "Poultry",
    quantity_needed: 200,
    unit: "dozen",
    price_offered: 45.00,
    location: "Pinetown, KZN",
    deadline: "2026-04-10",
    status: "open",
    applicant_count: 1,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "w3",
    retailer_id: "r2",
    retailer_name: "Gauteng Greens Wholesale",
    title: "1 Ton Spinach — Monthly Contract",
    description: "Seeking a reliable spinach supplier for a 6-month contract. Must meet food safety standards. Delivery to Johannesburg warehouse.",
    category: "Vegetables",
    quantity_needed: 1000,
    unit: "kg",
    price_offered: 12.00,
    location: "Johannesburg, Gauteng",
    deadline: "2026-04-30",
    status: "open",
    applicant_count: 5,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "w4",
    retailer_id: "r2",
    retailer_name: "Gauteng Greens Wholesale",
    title: "300kg Butternut Squash",
    description: "One-time order, butternut must be uniform size (800g–1.2kg each). Available for collection from farm.",
    category: "Vegetables",
    quantity_needed: 300,
    unit: "kg",
    price_offered: 9.00,
    location: "Pretoria, Gauteng",
    deadline: "2026-04-05",
    status: "filled",
    applicant_count: 2,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export function useSupplyWindows(filters?: { status?: string; myOnly?: boolean; retailerId?: string }) {
  return useQuery({
    queryKey: ["supply-windows", filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from("supply_windows")
          .select("*, profiles:retailer_id(full_name)")
          .order("created_at", { ascending: false });

        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.retailerId) query = query.eq("retailer_id", filters.retailerId);

        const { data, error } = await query;
        if (error || !data?.length) return MOCK_WINDOWS;

        return data.map((w: any) => ({
          ...w,
          retailer_name: w.profiles?.full_name ?? "Retailer",
        })) as SupplyWindow[];
      } catch {
        return MOCK_WINDOWS;
      }
    },
  });
}

export function useWindowDetail(id: string) {
  return useQuery({
    queryKey: ["supply-window", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("supply_windows")
          .select("*, profiles:retailer_id(full_name)")
          .eq("id", id)
          .single();
        if (error || !data) return MOCK_WINDOWS.find((w) => w.id === id) ?? null;
        return { ...data, retailer_name: data.profiles?.full_name ?? "Retailer" } as SupplyWindow;
      } catch {
        return MOCK_WINDOWS.find((w) => w.id === id) ?? null;
      }
    },
  });
}

export function useWindowApplications(windowId: string) {
  return useQuery({
    queryKey: ["window-applications", windowId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("window_applications")
          .select("*, profiles:farmer_id(full_name)")
          .eq("window_id", windowId)
          .order("created_at", { ascending: false });
        if (error || !data) return [] as WindowApplication[];
        return data.map((a: any) => ({
          ...a,
          farmer_name: a.profiles?.full_name ?? "Farmer",
        })) as WindowApplication[];
      } catch {
        return [] as WindowApplication[];
      }
    },
  });
}

export function useCreateWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<SupplyWindow, "id" | "created_at" | "applicant_count" | "retailer_name">) => {
      const { data, error } = await supabase.from("supply_windows").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supply-windows"] }),
  });
}

export function useApplyToWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { window_id: string; farmer_id: string; message: string; quantity_available: number }) => {
      const { data, error } = await supabase.from("window_applications").insert({ ...payload, status: "pending" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["window-applications", vars.window_id] });
      qc.invalidateQueries({ queryKey: ["supply-windows"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, windowId }: { id: string; status: "accepted" | "rejected"; windowId: string }) => {
      const { error } = await supabase.from("window_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["window-applications", vars.windowId] });
    },
  });
}
