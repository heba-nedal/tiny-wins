import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AccountState = { user: User; refreshUser: (user: User) => void; signOut: () => Promise<void> };
const AccountContext = createContext<AccountState | null>(null);

export function AccountProvider({ initialUser, signOut, children }: { initialUser: User; signOut: () => Promise<void>; children: ReactNode }) {
  const [user, setUser] = useState(initialUser);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <AccountContext.Provider value={{ user, refreshUser: setUser, signOut }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("AccountProvider is required");
  return account;
}