import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type OnlineUser = {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  online_at: string;
  current_page?: string;
};

/**
 * Track presence for the current clinic.
 * - `track`: when true, broadcasts the current user as online.
 * - returns the list of online users in the same clinic.
 */
export function useClinicPresence(opts: {
  clinicId?: string | null;
  me?: { user_id: string; full_name: string; role: string; avatar_url?: string | null } | null;
  track?: boolean;
  currentPage?: string;
}) {
  const { clinicId, me, track = true, currentPage } = opts;
  const [online, setOnline] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!clinicId) return;

    const channel = supabase.channel(`presence:clinic:${clinicId}`, {
      config: { presence: { key: me?.user_id ?? crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const flat = Object.values(state).flat() as OnlineUser[];
        // Dedupe by user_id (a user may have multiple tabs)
        const map = new Map<string, OnlineUser>();
        for (const u of flat) {
          const existing = map.get(u.user_id);
          if (!existing || new Date(u.online_at) > new Date(existing.online_at)) {
            map.set(u.user_id, u);
          }
        }
        setOnline(Array.from(map.values()));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && track && me) {
          await channel.track({
            user_id: me.user_id,
            full_name: me.full_name,
            role: me.role,
            avatar_url: me.avatar_url ?? null,
            online_at: new Date().toISOString(),
            current_page: currentPage,
          } satisfies OnlineUser);
        }
      });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [clinicId, me?.user_id, track, currentPage, me?.full_name, me?.role, me?.avatar_url]);

  return online;
}
