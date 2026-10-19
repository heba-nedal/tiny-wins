import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Letter } from "@/lib/letters";

const KEY = ["letters"];
const COLS = "id,user_id,title,message,deliver_at,timezone,email_status,email_sent_at,created_at";

export function useLetters() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Letter[]> => {
      const { data: u, error: ue } = await supabase.auth.getUser();
      if (ue) throw ue;
      if (!u.user) throw new Error("Please sign in again.");
      const { data, error } = await supabase.from("future_letters").select(COLS).eq("user_id", u.user.id).order("deliver_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { title: string | null; message: string; deliver_at: string; timezone: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Please sign in again.");
      const { data, error } = await supabase.from("future_letters").insert({ ...p, user_id: u.user.id }).select("deliver_at").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCancelLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("future_letters").delete().eq("id", id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("This letter has already been delivered and can't be cancelled.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Ticking clock for display-only countdowns. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
