import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Progress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  progress_pct: number;
  last_accessed: string;
}

const LOCAL_PROGRESS_KEY = (userId: string) => `progress_${userId}`;

async function getLocalProgress(userId: string): Promise<Progress[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PROGRESS_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function upsertLocalProgress(
  userId: string,
  record: Omit<Progress, "id">
): Promise<Progress> {
  const records = await getLocalProgress(userId);
  const idx = records.findIndex(
    (r) => r.user_id === record.user_id && r.module_id === record.module_id
  );
  const existing = idx >= 0 ? records[idx] : null;
  if (existing && existing.completed && !record.completed) {
    return existing;
  }
  const updated: Progress = {
    id: existing?.id ?? `local-${record.module_id}`,
    ...record,
  };
  if (idx >= 0) {
    records[idx] = updated;
  } else {
    records.push(updated);
  }
  await AsyncStorage.setItem(LOCAL_PROGRESS_KEY(userId), JSON.stringify(records));
  return updated;
}

export function useProgress(moduleId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["progress", user?.id, moduleId],
    enabled: !!user,
    queryFn: async (): Promise<Progress | Progress[] | null> => {
      const local = await getLocalProgress(user!.id);

      let remote: Progress[] = [];
      try {
        let query = supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", user!.id);
        const { data } = await query;
        if (Array.isArray(data)) remote = data as Progress[];
      } catch {}

      const remoteIds = new Set(remote.map((r) => r.module_id));
      const localOnly = local.filter((r) => !remoteIds.has(r.module_id));
      const merged = [...remote, ...localOnly];

      if (moduleId) {
        return merged.find((r) => r.module_id === moduleId) ?? null;
      }
      return merged;
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}

async function saveProgress(
  userId: string,
  moduleId: string,
  progressPct: number,
  completed: boolean
): Promise<void> {
  const record: Omit<Progress, "id"> = {
    user_id: userId,
    module_id: moduleId,
    completed,
    progress_pct: Math.min(progressPct, 100),
    last_accessed: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from("learning_progress")
      .upsert(
        { ...record },
        { onConflict: "user_id,module_id" }
      );
    if (error) throw error;
  } catch {
    await upsertLocalProgress(userId, record);
  }
}

export function useMarkComplete() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!user) throw new Error("Not authenticated");
      await saveProgress(user.id, moduleId, 100, true);
    },
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id, moduleId] });
      queryClient.invalidateQueries({ queryKey: ["profileStats", user?.id] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, progressPct }: { moduleId: string; progressPct: number }) => {
      if (!user) return;
      await saveProgress(user.id, moduleId, progressPct, progressPct >= 100);
    },
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id, moduleId] });
    },
  });
}

export function useBookmarks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("module_id")
          .eq("user_id", user!.id);
        if (error) return [] as string[];
        return (data ?? []).map((b: any) => b.module_id as string);
      } catch {
        return [] as string[];
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, isBookmarked }: { moduleId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("module_id", moduleId);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, module_id: moduleId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
    },
  });
}

const LESSON_STORE_KEY = (userId: string) => `lesson_store_${userId}`;

type LessonRecord = { completed: boolean; watchPct: number; completedAt?: string };
type LessonStore = Record<string, LessonRecord>;

async function getLessonStore(userId: string): Promise<LessonStore> {
  try {
    const raw = await AsyncStorage.getItem(LESSON_STORE_KEY(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function setLessonStore(userId: string, store: LessonStore): Promise<void> {
  try {
    await AsyncStorage.setItem(LESSON_STORE_KEY(userId), JSON.stringify(store));
  } catch {}
}

export function useLessonProgress(moduleId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lessonProgress", user?.id, moduleId],
    enabled: !!user,
    queryFn: async (): Promise<LessonStore> => {
      const store = await getLessonStore(user!.id);
      const result: LessonStore = {};
      for (const key of Object.keys(store)) {
        if (key.startsWith(`${moduleId}:`)) {
          result[key] = store[key];
        }
      }
      return result;
    },
    staleTime: 30 * 1000,
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, lessonId, totalLessons }: { moduleId: string; lessonId: string; totalLessons: number }) => {
      if (!user) return;
      const store = await getLessonStore(user.id);
      const key = `${moduleId}:${lessonId}`;
      store[key] = { completed: true, watchPct: 100, completedAt: new Date().toISOString() };
      await setLessonStore(user.id, store);
      const completedCount = Object.keys(store).filter(k => k.startsWith(`${moduleId}:`) && store[k].completed).length;
      const pct = Math.round((completedCount / totalLessons) * 100);
      await saveProgress(user.id, moduleId, pct, pct >= 100);
    },
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ["lessonProgress", user?.id, moduleId] });
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id, moduleId] });
      queryClient.invalidateQueries({ queryKey: ["profileStats", user?.id] });
    },
  });
}

export function useUpdateWatchProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, lessonId, watchPct }: { moduleId: string; lessonId: string; watchPct: number }) => {
      if (!user) return;
      const store = await getLessonStore(user.id);
      const key = `${moduleId}:${lessonId}`;
      const existing = store[key];
      if (existing?.completed) return;
      store[key] = { completed: false, watchPct: Math.max(existing?.watchPct ?? 0, watchPct) };
      await setLessonStore(user.id, store);
    },
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ["lessonProgress", user?.id, moduleId] });
    },
  });
}

export function useProfileStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profileStats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      let completed = 0;
      let bookmarks = 0;
      let listings = 0;

      const local = await getLocalProgress(user!.id);
      const localCompleted = local.filter((r) => r.completed).length;

      try {
        const [progressRes, bookmarksRes, listingsRes] = await Promise.all([
          supabase.from("learning_progress").select("id").eq("user_id", user!.id).eq("completed", true),
          supabase.from("bookmarks").select("id").eq("user_id", user!.id),
          supabase.from("product_listings").select("id").eq("farmer_id", user!.id),
        ]);
        const remoteIds = new Set(
          (progressRes.data ?? []).map((r: any) => r.id)
        );
        const localOnlyCompleted = local.filter(
          (r) => r.completed && !remoteIds.has(r.id)
        ).length;
        completed = (progressRes.data?.length ?? 0) + localOnlyCompleted;
        bookmarks = bookmarksRes.data?.length ?? 0;
        listings = listingsRes.data?.length ?? 0;
      } catch {
        completed = localCompleted;
      }

      return { completed, bookmarks, listings };
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}
