import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ServiceCategory =
  | "Fertilisers"
  | "Pest Control"
  | "Soil Testing"
  | "Equipment Rental"
  | "Veterinary"
  | "Irrigation"
  | "Transport"
  | "Seeds & Seedlings"
  | "Other";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Fertilisers",
  "Pest Control",
  "Soil Testing",
  "Equipment Rental",
  "Veterinary",
  "Irrigation",
  "Transport",
  "Seeds & Seedlings",
  "Other",
];

export interface AgriService {
  id: string;
  provider_id: string;
  provider_name: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price_from: number;
  price_unit: string;
  location: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  rating: number;
  review_count: number;
  status: "active" | "inactive";
  created_at: string;
}

const MOCK_SERVICES: AgriService[] = [
  {
    id: "s1",
    provider_id: "p1",
    provider_name: "GreenGrow Fertilisers",
    title: "Organic NPK Fertiliser — Bulk Supply",
    description:
      "Certified organic NPK 5-3-3 fertiliser, ideal for vegetable and grain crops. Available in 25kg and 50kg bags. Free delivery within 50km of Pietermaritzburg.",
    category: "Fertilisers",
    price_from: 320,
    price_unit: "per 25kg bag",
    location: "Pietermaritzburg, KZN",
    contact_phone: "+27 33 555 0101",
    contact_whatsapp: "+27 82 555 0101",
    rating: 4.7,
    review_count: 28,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "s2",
    provider_id: "p2",
    provider_name: "AgriShield Pest Control",
    title: "Crop Pest Inspection & Spraying",
    description:
      "Licensed pesticide application service. Includes free initial inspection, integrated pest management plan, and follow-up visit. Specialising in maize, tomatoes, and citrus.",
    category: "Pest Control",
    price_from: 850,
    price_unit: "per hectare",
    location: "Polokwane, Limpopo",
    contact_phone: "+27 15 555 0202",
    contact_whatsapp: "+27 84 555 0202",
    rating: 4.9,
    review_count: 47,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "s3",
    provider_id: "p3",
    provider_name: "SoilLab SA",
    title: "Comprehensive Soil Testing & Report",
    description:
      "Full soil analysis: pH, nutrients (N, P, K), micronutrients, organic matter, and texture. Detailed report with crop-specific fertiliser recommendations within 7 working days.",
    category: "Soil Testing",
    price_from: 450,
    price_unit: "per sample",
    location: "Bloemfontein, Free State (nationwide postal)",
    contact_phone: "+27 51 555 0303",
    contact_whatsapp: "+27 71 555 0303",
    rating: 4.8,
    review_count: 134,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "s4",
    provider_id: "p4",
    provider_name: "FarmTech Equipment Hire",
    title: "Tractor & Implement Rental",
    description:
      "John Deere & Massey Ferguson tractors (50–120 HP) with operator. Ploughs, planters, harrows, and balers available. Daily, weekly, or per-hectare rates. Insurance included.",
    category: "Equipment Rental",
    price_from: 1500,
    price_unit: "per day",
    location: "Bethlehem, Free State",
    contact_phone: "+27 58 555 0404",
    contact_whatsapp: "+27 82 555 0404",
    rating: 4.6,
    review_count: 62,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "s5",
    provider_id: "p5",
    provider_name: "VetCare Mobile",
    title: "Mobile Livestock Veterinary Service",
    description:
      "On-farm veterinary visits for cattle, sheep, goats, and poultry. Vaccinations, dehorning, pregnancy checks, and emergency care. Travel within 100km of Mthatha included.",
    category: "Veterinary",
    price_from: 600,
    price_unit: "per visit",
    location: "Mthatha, Eastern Cape",
    contact_phone: "+27 47 555 0505",
    contact_whatsapp: "+27 73 555 0505",
    rating: 4.9,
    review_count: 89,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "s6",
    provider_id: "p6",
    provider_name: "AquaFlow Irrigation",
    title: "Drip Irrigation Installation & Repair",
    description:
      "Design, supply, and installation of drip and sprinkler irrigation systems for any farm size. Includes water pump consultation and free maintenance for first 3 months.",
    category: "Irrigation",
    price_from: 12000,
    price_unit: "per hectare (installation)",
    location: "Stellenbosch, Western Cape",
    contact_phone: "+27 21 555 0606",
    contact_whatsapp: "+27 82 555 0606",
    rating: 4.7,
    review_count: 41,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    id: "s7",
    provider_id: "p7",
    provider_name: "FarmFreight Transport",
    title: "Refrigerated & Bulk Produce Transport",
    description:
      "Cold-chain trucks for fresh produce, dairy, and meat. Bulk grain trailers also available. Nationwide deliveries with GPS tracking and SLA guarantees.",
    category: "Transport",
    price_from: 18,
    price_unit: "per km",
    location: "Johannesburg, Gauteng",
    contact_phone: "+27 11 555 0707",
    contact_whatsapp: "+27 83 555 0707",
    rating: 4.5,
    review_count: 156,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 22).toISOString(),
  },
  {
    id: "s8",
    provider_id: "p8",
    provider_name: "HarvestSeed Co.",
    title: "Certified Vegetable Seeds & Seedlings",
    description:
      "Wide range of certified, disease-free vegetable seeds and seedlings: tomato, spinach, onion, cabbage, carrot, butternut. Bulk discounts for orders over 1000 seedlings.",
    category: "Seeds & Seedlings",
    price_from: 1.5,
    price_unit: "per seedling",
    location: "Tzaneen, Limpopo",
    contact_phone: "+27 15 555 0808",
    contact_whatsapp: "+27 79 555 0808",
    rating: 4.8,
    review_count: 203,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function useAgriServices(filters?: { category?: ServiceCategory; providerId?: string }) {
  return useQuery({
    queryKey: ["agri-services", filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from("agri_services")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (filters?.category) query = query.eq("category", filters.category);
        if (filters?.providerId) query = query.eq("provider_id", filters.providerId);

        const { data, error } = await query;
        if (error || !data?.length) {
          let result = MOCK_SERVICES;
          if (filters?.category) result = result.filter((s) => s.category === filters.category);
          if (filters?.providerId) result = result.filter((s) => s.provider_id === filters.providerId);
          return result;
        }
        return data as AgriService[];
      } catch {
        return MOCK_SERVICES;
      }
    },
  });
}

export function useServiceDetail(id: string) {
  return useQuery({
    queryKey: ["agri-service", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("agri_services")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !data) return MOCK_SERVICES.find((s) => s.id === id) ?? null;
        return data as AgriService;
      } catch {
        return MOCK_SERVICES.find((s) => s.id === id) ?? null;
      }
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<AgriService, "id" | "created_at" | "rating" | "review_count">,
    ) => {
      const { data, error } = await supabase
        .from("agri_services")
        .insert({ ...payload, rating: 0, review_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agri-services"] }),
  });
}

export function getMockServices(): AgriService[] {
  return MOCK_SERVICES;
}
