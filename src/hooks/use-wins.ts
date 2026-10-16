import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Win } from "@/lib/wins";

const KEY = ["wins"];

export function useWins() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Win[]> => {
      const { data: account, error: accountError } = await supabase.auth.getUser();
      if (accountError) throw accountError;
      if (!account.user) throw new Error("Please sign in again.");
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", account.user.id)
        .order("achievement_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

type Payload = { title: string; description: string | null; category: Category; achievement_date: string };

export function useSaveWin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...p }: Payload & { id?: string | undefined }) => {
      if (id) {
        const { error } = await supabase.from("achievements").update(p).eq("id", id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) throw new Error("Please sign in again.");
        const { error } = await supabase.from("achievements").insert({ ...p, user_id: u.user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteWin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("achievements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
