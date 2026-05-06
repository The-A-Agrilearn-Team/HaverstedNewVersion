import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Order {
  id: string;
  buyer_id: string;
  farmer_id: string;
  listing_id: string | null;
  offer_message_id: string | null;
  quantity: number;
  price_per_unit: number;
  unit: string;
  status: "confirmed" | "ready_for_pickup" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  buyer_name: string;
  farmer_name: string;
  listing_title: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

export function useOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, buyer:profiles!buyer_id(full_name), farmer:profiles!farmer_id(full_name), listing:product_listings(title)`)
        .or(`buyer_id.eq.${user!.id},farmer_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        if ((error as any).code === "42P01") return [] as Order[];
        return [] as Order[];
      }

      return (data ?? []).map((row: any) => ({
        ...row,
        buyer_name: row.buyer?.full_name ?? "Unknown Buyer",
        farmer_name: row.farmer?.full_name ?? "Unknown Farmer",
        listing_title: row.listing?.title ?? "Unlisted Product",
      })) as Order[];
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, buyer:profiles!buyer_id(full_name), farmer:profiles!farmer_id(full_name), listing:product_listings(title, category)`)
        .eq("id", orderId!)
        .single();

      if (error) return null;

      return {
        ...data,
        buyer_name: (data as any).buyer?.full_name ?? "Unknown Buyer",
        farmer_name: (data as any).farmer?.full_name ?? "Unknown Farmer",
        listing_title: (data as any).listing?.title ?? "Unlisted Product",
        listing_category: (data as any).listing?.category ?? "",
      } as Order & { listing_category: string };
    },
    staleTime: 15 * 1000,
    retry: false,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      buyerId: string;
      farmerId: string;
      listingId: string | null;
      offerMessageId: string;
      quantity: number;
      pricePerUnit: number;
      unit: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          buyer_id: params.buyerId,
          farmer_id: params.farmerId,
          listing_id: params.listingId,
          offer_message_id: params.offerMessageId,
          quantity: params.quantity,
          price_per_unit: params.pricePerUnit,
          unit: params.unit,
          notes: params.notes ?? null,
          status: "confirmed",
        })
        .select()
        .single();
      if (error) throw error;
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order["status"] }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", vars.orderId] });
    },
  });
}

export function useReviews(revieweeId: string | null) {
  return useQuery({
    queryKey: ["reviews", revieweeId],
    enabled: !!revieweeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`*, reviewer:profiles!reviewer_id(full_name)`)
        .eq("reviewee_id", revieweeId!)
        .order("created_at", { ascending: false });

      if (error) return [] as Review[];

      return (data ?? []).map((r: any) => ({
        ...r,
        reviewer_name: r.reviewer?.full_name ?? "User",
      })) as Review[];
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useMyReview(orderId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-review", orderId, user?.id],
    enabled: !!user && !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("order_id", orderId!)
        .eq("reviewer_id", user!.id)
        .maybeSingle();

      if (error) return null;
      return data as Review | null;
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      revieweeId: string;
      orderId: string;
      rating: number;
      comment?: string;
    }) => {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user!.id,
        reviewee_id: params.revieweeId,
        order_id: params.orderId,
        rating: params.rating,
        comment: params.comment ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.revieweeId] });
      queryClient.invalidateQueries({ queryKey: ["my-review", vars.orderId] });
      queryClient.invalidateQueries({ queryKey: ["order", vars.orderId] });
    },
  });
}
