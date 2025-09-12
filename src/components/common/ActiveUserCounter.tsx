"use client";

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export function ActiveUserCounter() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/rooms', { cache: 'no-store' })
        if (!res.ok) return
        const rooms = await res.json()
        const count = Array.isArray(rooms)
          ? rooms.reduce((a: number, r: any) => a + (Array.isArray(r?.members) ? r.members.length : 0), 0)
          : 0
        if (mounted) setActiveUsers(count)
      } catch {}
    }
    load()
    const iv = setInterval(load, 10000)
    return () => { mounted = false; clearInterval(iv) }
  }, []);

  if (activeUsers <= 0) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-green-400 animate-pulse">
      <Users className="h-4 w-4" />
      <span>現在 <strong>{activeUsers}</strong> 人が集中して学習中です</span>
    </div>
  );
}
