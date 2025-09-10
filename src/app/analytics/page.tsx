import React from 'react';
import './analytics-new.css';
import NewAnalyticsHeader from '@/components/analytics/NewAnalyticsHeader';
import NewSummaryCards from '@/components/analytics/NewSummaryCards';
import NewHeatmap from '@/components/analytics/NewHeatmap';
import NewTopImprovements from '@/components/analytics/NewTopImprovements';

export default function AnalyticsPage() {
  return (
    <main className="main-content flex-1 p-8">
      <NewAnalyticsHeader />
      <NewSummaryCards />
      <NewHeatmap />
      <NewTopImprovements />
    </main>
  );
}
