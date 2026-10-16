import { createMiddleware } from "@tanstack/react-start";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  if (typeof window === "undefined") return next();
  const { supabase } = await import("./client");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return next();
  return next({ headers: { Authorization: `Bearer ${token}` } });
});
