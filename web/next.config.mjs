import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = dirname(__dirname);
const { loadEnvConfig } = nextEnv;

loadEnvConfig(appRoot);

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ...(supabaseUrl ? { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl } : {}),
    ...(supabaseAnonKey
      ? { NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey }
      : {}),
  },
  typedRoutes: false,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
