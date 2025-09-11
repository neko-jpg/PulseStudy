"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users } from 'lucide-react';

export function ActiveUserCounter() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const q = collection(db, "active_sessions");

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setActiveUsers(querySnapshot.size);
    }, (error) => {
      console.error("Error fetching active user count: ", error);
    });

    return () => unsubscribe();
  }, []);

  if (activeUsers === 0) {
    return null; // Don't show anything if no one is active
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-400 animate-pulse">
      <Users className="h-4 w-4" />
      <span>
        現在 <strong>{activeUsers}</strong> 人が集中して学習中！
      </span>
    </div>
  );
}
