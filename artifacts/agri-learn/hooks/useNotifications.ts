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
  buyer_name: string;
  listing_title: string;
  message: string;
  accepted: boolean;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
  text: string;
  msgType: string;
}

export interface Conversation {
  threadKey: string;
  listingId: string | null;
  otherUserId: string;
  otherName: string;
  listingTitle: string;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageSenderId: string;
  unreadCount: number;
}

function parseContent(raw: string): { buyer_name: string; listing_title: string; message: string; accepted?: boolean } {
  try {
    return JSON.parse(raw);
  } catch {
    return { buyer_name: "A buyer", listing_title: "", message: raw };
  }
}

function parseMsgText(content: string): { text: string; msgType: string; listingTitle?: string } {
  try {
    const p = JSON.parse(content);
    if (p.type === "chat") return { text: p.text ?? "", msgType: "chat" };
    if (p.type === "offer") {
      const statusStr = p.status === "accepted" ? " · Accepted" : p.status === "declined" ? " · Declined" : "";
      return {
        text: `Offer: ${p.quantity} ${p.unit} @ R${Number(p.price_per_unit || 0).toFixed(2)}/${p.unit}${statusStr}`,
        msgType: "offer",
        listingTitle: p.listing_title,
      };
    }
    return { text: p.message ?? content, msgType: p.type ?? "unknown", listingTitle: p.listing_title };
  } catch {
    return { text: content, msgType: "text" };
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

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (error || !data) return [] as Conversation[];

      const threadMap = new Map<string, { msgs: any[]; otherId: string; listingId: string | null }>();
      for (const msg of data) {
        const otherId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id;
        const listingId: string | null = msg.listing_id ?? null;
        const key = `${listingId ?? "null"}__${[user!.id, otherId].sort().join("__")}`;
        if (!threadMap.has(key)) {
          threadMap.set(key, { msgs: [], otherId, listingId });
        }
        threadMap.get(key)!.msgs.push(msg);
      }

      const otherIds = [...new Set([...threadMap.values()].map((t) => t.otherId))];
      const profileMap: Record<string, string> = {};
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", otherIds);
        for (const p of profiles ?? []) {
          profileMap[p.id] = p.full_name ?? "Unknown";
        }
      }

      const conversations: Conversation[] = [];
      for (const [, thread] of threadMap.entries()) {
        const { msgs, otherId, listingId } = thread;
        const lastMsg = msgs[0];
        const { text: lastText, listingTitle: parsedTitle } = parseMsgText(lastMsg.content);

        let listingTitle = parsedTitle ?? "";
        if (!listingTitle) {
          for (const m of msgs) {
            const p = parseMsgText(m.content);
            if (p.listingTitle) { listingTitle = p.listingTitle; break; }
          }
        }

        const unreadCount = msgs.filter(
          (m) => m.receiver_id === user!.id && !m.read_at
        ).length;

        conversations.push({
          threadKey: `${listingId ?? "null"}__${[user!.id, otherId].sort().join("__")}`,
          listingId,
          otherUserId: otherId,
          otherName: profileMap[otherId] ?? "Unknown",
          listingTitle,
          lastMessageText: lastText,
          lastMessageTime: lastMsg.created_at,
          lastMessageSenderId: lastMsg.sender_id,
          unreadCount,
        });
      }

      return conversations.sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    },
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: false,
  });
}

export function useConversationMessages(listingId: string | null, otherUserId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat", user?.id, listingId, otherUserId],
    enabled: !!user && !!otherUserId,
    queryFn: async () => {
      let query = supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user!.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user!.id})`
        )
        .order("created_at", { ascending: true });

      if (listingId) {
        query = (query as any).eq("listing_id", listingId);
      }

      const { data, error } = await query;
      if (error) return [] as ChatMessage[];

      const unreadIds = (data ?? [])
        .filter((m: any) => m.receiver_id === user!.id && !m.read_at)
        .map((m: any) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }

      return (data ?? []).map((msg: any) => {
        const { text, msgType } = parseMsgText(msg.content);
        return { ...msg, text, msgType } as ChatMessage;
      });
    },
    staleTime: 2 * 1000,
    refetchInterval: 3 * 1000,
    retry: false,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      receiverId,
      listingId,
      text,
    }: {
      receiverId: string;
      listingId: string | null;
      text: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!receiverId) throw new Error("Missing receiver");
      const content = JSON.stringify({
        type: "chat",
        text,
        sender_name: profile?.full_name ?? user?.email ?? "User",
      });
      const payload: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        read_at: null,
      };
      if (listingId) payload.listing_id = listingId;
      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnread"] });
    },
  });
}

export function useSendRawMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      receiverId,
      listingId,
      rawContent,
    }: {
      receiverId: string;
      listingId: string | null;
      rawContent: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!receiverId) throw new Error("Missing receiver");
      const payload: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: rawContent,
        read_at: null,
      };
      if (listingId) payload.listing_id = listingId;
      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnread"] });
    },
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
        message: `Hi! I'm interested in your listing "${listingTitle}". I'd like to get in touch to discuss details.`,
      });

      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        receiver_id: farmerId,
        listing_id: listingId,
        content: contentJson,
        read_at: null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
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

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, status }: { messageId: string; status: "accepted" | "declined" }) => {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("content")
        .eq("id", messageId)
        .single();
      if (fetchError) throw fetchError;
      let parsed: any = {};
      try { parsed = JSON.parse(data.content); } catch {}
      const updated = JSON.stringify({ ...parsed, status });
      const { error } = await supabase
        .from("messages")
        .update({ content: updated })
        .eq("id", messageId);
      if (error) throw error;
      return parsed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
