import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, ProductListing } from "@/lib/supabase";

const MOCK_LISTINGS: ProductListing[] = [
  { id: "1", farmer_id: "f1", farmer_name: "Sipho Ndlovu", title: "Fresh Tomatoes", description: "Ripe, juicy farm-fresh tomatoes. Grown without pesticides using organic methods. Available for pickup or delivery within Durban.", category: "Vegetables", price: 12.50, quantity: 50, unit: "kg", location: "Durban, KZN", status: "active", created_at: new Date().toISOString() },
  { id: "2", farmer_id: "f2", farmer_name: "Thabo Molefe", title: "Free-Range Eggs", description: "Organic free-range eggs from happy hens. Fresh daily. No hormones or antibiotics.", category: "Poultry", price: 4.00, quantity: 200, unit: "dozen", location: "Johannesburg, GP", status: "active", created_at: new Date().toISOString() },
  { id: "3", farmer_id: "f3", farmer_name: "Nomvula Dlamini", title: "Butternut Squash", description: "Large, sweet butternut squash. Perfect for soups and roasting.", category: "Vegetables", price: 8.00, quantity: 100, unit: "kg", location: "Pretoria, GP", status: "active", created_at: new Date().toISOString() },
  { id: "4", farmer_id: "f4", farmer_name: "Pieter van Niekerk", title: "Mango Harvest", description: "Sweet Keitt mangoes, freshly harvested. Bulk orders welcome.", category: "Fruits", price: 25.00, quantity: 300, unit: "kg", location: "Limpopo", status: "active", created_at: new Date().toISOString() },
  { id: "5", farmer_id: "f5", farmer_name: "Zanele Khumalo", title: "Yellow Maize", description: "Grade A yellow maize, dried and ready for milling or livestock feed. Moisture content below 14%.", category: "Grains", price: 3.50, quantity: 2000, unit: "kg", location: "Free State", status: "active", created_at: new Date().toISOString() },
  { id: "6", farmer_id: "f6", farmer_name: "Johan Botha", title: "Fresh Milk", description: "Raw milk from Jersey cows. Collected daily. Contact for delivery schedule.", category: "Dairy", price: 15.00, quantity: 100, unit: "litre", location: "Western Cape", status: "active", created_at: new Date().toISOString() },
];

async function fetchListings(category?: string): Promise<ProductListing[]> {
  let query = supabase
    .from("product_listings")
    .select(`
      *,
      profiles:farmer_id (full_name)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return MOCK_LISTINGS.filter(
      (l) => !category || category === "All" || l.category === category
    );
  }

  return data.map((item: any) => ({
    ...item,
    farmer_name: item.profiles?.full_name ?? "Unknown Farmer",
  })) as ProductListing[];
}

export function useListings(category?: string) {
  return useQuery({
    queryKey: ["listings", category],
    queryFn: () => fetchListings(category),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

export function useRecentListings() {
  return useQuery({
    queryKey: ["listings", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_listings")
        .select(`*, profiles:farmer_id (full_name)`)
        .eq("status", "active")
        .limit(4)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) return MOCK_LISTINGS.slice(0, 2);
      return data.map((item: any) => ({
        ...item,
        farmer_name: item.profiles?.full_name ?? "Unknown Farmer",
      })) as ProductListing[];
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

export function useMyListings(farmerId?: string) {
  return useQuery({
    queryKey: ["listings", "mine", farmerId],
    queryFn: async () => {
      if (!farmerId) return [];
      const { data, error } = await supabase
        .from("product_listings")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });
      if (error || !data) return [];
      return data as ProductListing[];
    },
    enabled: !!farmerId,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listing: Partial<ProductListing>) => {
      const { data, error } = await supabase
        .from("product_listings")
        .insert([listing])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useMarkAsSold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from("product_listings")
        .update({ status: "sold" })
        .eq("id", listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
