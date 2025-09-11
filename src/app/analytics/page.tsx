"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import './analytics-new.css';
import NewAnalyticsHeader from '@/components/analytics/NewAnalyticsHeader';
import NewSummaryCards from '@/components/analytics/NewSummaryCards';
import NewHeatmap from '@/components/analytics/NewHeatmap';
import NewTopImprovements from '@/components/analytics/NewTopImprovements';

interface SessionDoc {
  durationSec: number;
  sumFocus: number;
  countFocus: number;
  status: string;
  startedAt: Timestamp;
}

interface AnalyticsStats {
  totalStudyMinutes: number;
  averageFocus: number;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AnalyticsStats>({ totalStudyMinutes: 0, averageFocus: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, `sessions/${user.uid}/items`),
      where('status', '==', 'completed'),
      where('startedAt', '>=', sevenDaysAgo),
      where('durationSec', '>=', 60) // Filter out short sessions
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let totalSumFocus = 0;
        let totalCountFocus = 0;
        let totalDurationSec = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as SessionDoc;
          totalSumFocus += data.sumFocus || 0;
          totalCountFocus += data.countFocus || 0;
          totalDurationSec += data.durationSec || 0;
        });

        const averageFocus = totalCountFocus > 0 ? totalSumFocus / totalCountFocus : 0;
        const totalStudyMinutes = Math.round(totalDurationSec / 60);

        setStats({
          totalStudyMinutes,
          averageFocus,
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching analytics data:", error);
        setIsLoading(false);
      }
    );

    // This cleanup function is crucial for unsubscribing from the Firestore listener
    // when the component unmounts. This prevents memory leaks and unnecessary network requests
    // by ensuring the listener does not persist after the user navigates away.
    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <main className="main-content flex-1 p-8">
      <NewAnalyticsHeader />
      <NewSummaryCards
        isLoading={isLoading}
        totalStudyMinutes={stats.totalStudyMinutes}
        averageFocus={stats.averageFocus}
      />
      <NewHeatmap />
      <NewTopImprovements />
    </main>
  );
}
