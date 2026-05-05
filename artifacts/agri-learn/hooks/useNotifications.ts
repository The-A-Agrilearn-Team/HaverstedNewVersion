import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Notification {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  content: string;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  // parsed from content JSON
  buyer_name: string;
  listing_title: string;
  message: string;
  accepted: boolean;
}

function parseContent(raw: string): { buyer_name: string; listing_title: string; message: string; accepted?: boolean } {
  try {
    return JSON.parse(raw);
  } catch {
    return { buyer_name: "A buyer", listing_title: "", message: raw };
  }
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("receiver_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) return [] as Notification[];

      return (data ?? []).map((row: any) => {
        const parsed = parseContent(row.content ?? "");
        return {
          ...row,
          buyer_name: parsed.buyer_name,
          listing_title: parsed.listing_title,
          message: parsed.message,
          is_read: !!row.read_at,
          accepted: !!parsed.accepted,
        } as Notification;
      });
    },
    staleTime: 20 * 1000,
    retry: false,
  });
}

export function useUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notificationsUnread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id")
        .eq("receiver_id", user!.id)
        .is("read_at", null);

      if (error) return 0;
      return data?.length ?? 0;
    },
    staleTime: 20 * 1000,
    retry: false,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      farmerId,
      listingId,
      listingTitle,
    }: {
      farmerId: string;
      listingId: string;
      listingTitle: string;
    }) => {
      const buyerName = profile?.full_name ?? user?.email ?? "A buyer";

      const contentJson = JSON.stringify({
        type: "purchase_interest",
        buyer_name: buyerName,
        listing_id: listingId,
        listing_title: listingTitle,
        message: `${buyerName} is interested in buying your listing "${listingTitle}". They would like to get in touch with you.`,
      });

      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        receiver_id: farmerId,
        listing_id: null,
        content: contentJson,
        read_at: null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnread"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("messages")
        .update({ read_at: now })
        .eq("receiver_id", user!.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnread", user?.id] });
    },
  });
}

export function useMarkOneRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("messages")
        .update({ read_at: now })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnread", user?.id] });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, currentContent }: { id: string; currentContent: string }) => {
      let parsed: any = {};
      try { parsed = JSON.parse(currentContent); } catch {}
      const updated = JSON.stringify({ ...parsed, accepted: true });
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("messages")
        .update({ content: updated, read_at: now })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnread", user?.id] });
    },
  });
}
