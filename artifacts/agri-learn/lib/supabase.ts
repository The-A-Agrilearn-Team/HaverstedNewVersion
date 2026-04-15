import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://quxdfknwgymgghemkmcd.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eGRma253Z3ltZ2doZW1rbWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzk2NTUsImV4cCI6MjA4OTY1NTY1NX0.F0Jt5ISnkKh9tigNS-R-4hqj2aiZLcC_h6VjY6fUTGQ";

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
  language_preference: string;
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
