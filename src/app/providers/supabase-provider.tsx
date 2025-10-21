"use client";

import {
  SessionContextProvider,
  useSupabaseClient as useSupabaseClientBase,
} from "@supabase/auth-helpers-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import type { ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Props = {
  initialSession: Parameters<typeof SessionContextProvider>[0]["initialSession"];
  children: ReactNode;
};

export function SupabaseProvider({ initialSession, children }: Props) {
  const [supabaseClient] = useState<SupabaseClient<Database>>(() =>
    createSupabaseBrowserClient(),
  );

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  );
}

export const useSupabaseClient = useSupabaseClientBase<Database>;
