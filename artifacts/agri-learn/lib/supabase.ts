import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "implicit",

  },
});

export type UserRole = "farmer" | "buyer" | "retailer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  location?: string;
  language_pref: string;
  created_at: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  content: string;
  image_url?: string;
  duration_minutes: number;
  language: string;
  created_at: string;
  is_bookmarked?: boolean;
  progress?: number;
}

export interface ProductListing {
  id: string;
  farmer_id: string;
  farmer_name?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  image_url?: string;
  status: "active" | "pending" | "sold";
  created_at: string;
}
