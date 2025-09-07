'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Award, Calendar, Star, Trophy, Loader2, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import './challenge.css';

// --- TYPE DEFINITIONS ---
interface Challenge { id: string; type: 'daily' | 'weekly' | 'special'; title: string; description: string; reward: { type: 'points' | 'badge'; value: number | string }; moduleId: string; progress?: number; }
interface RankingData { rank: number; you: { name: string; score: number }; friends: { name: string; rank: number; score: number }[]; }

// --- HELPER & SKELETON COMPONENTS ---
const RewardIcon = ({ reward }: { reward: Challenge['reward'] }) => ( <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">{reward.type === 'points' ? <Star className="h-4 w-4" /> : <Award className="h-4 w-4" />}<span>{reward.value}{reward.type === 'points' && 'pt'}</span></div> );
const ChallengeCardSkeleton = () => ( <Card><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-2 w-full" /><div className="flex justify-between items-center"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></CardContent></Card> );

// --- MAIN CHALLENGE PAGE ---
export default function ChallengePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningChallengeId, setJoiningChallengeId] = useState<string | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [isRankingLoading, setIsRankingLoading] = useState(false);

  useEffect(() => { /* ... fetchChallenges logic ... */
    const fetchChallenges = async () => { setLoading(true); try { const res = await fetch(`/api/challenges?tab=${activeTab}`); const data = await res.json(); setChallenges(data.items); } catch (error) { console.error(error); } finally { setLoading(false); } };
    fetchChallenges();
  }, [activeTab]);

  const handleJoinChallenge = async (challenge: Challenge) => {
    setJoiningChallengeId(challenge.id);
    try {
      await fetch('/api/challenge/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId: challenge.id }) });
      router.push(`/learn?module=${challenge.moduleId}&source=challenge`);
    } catch (error) {
      console.error("Failed to join challenge:", error);
    } finally {
      setJoiningChallengeId(null);
    }
  };

  const handleFetchRanking = async (challengeId: string) => {
    setIsRankingLoading(true);
    setRankingData(null);
    try {
        const res = await fetch(`/api/challenge/progress?challengeId=${challengeId}`);
        const data = await res.json();
        setRankingData(data);
    } catch (error) {
        console.error("Failed to fetch ranking:", error);
    } finally {
        setIsRankingLoading(false);
    }
  };

  const TABS = [ /* ... */ { value: 'daily', label: 'デイリー', icon: Star }, { value: 'weekly', label: 'ウィークリー', icon: Calendar }, { value: 'special', label: 'スペシャル', icon: Trophy }];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="flex items-center p-2 border-b bg-background z-20 sticky top-0"><Button variant="ghost" size="icon" onClick={() => router.push('/home')}><ArrowLeft /></Button><h1 className="ml-2 font-bold text-md sm:text-lg truncate">チャレンジ</h1></header>
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full"><TabsList className="grid w-full grid-cols-3">{TABS.map(tab => ( <TabsTrigger key={tab.value} value={tab.value}><tab.icon className="mr-2 h-4 w-4" /> {tab.label}</TabsTrigger> ))}</TabsList></Tabs>
        <div className="mt-6 space-y-4">
          {loading ? ( Array.from({ length: 3 }).map((_, i) => <ChallengeCardSkeleton key={i} />) ) : challenges.length > 0 ? (
            challenges.map(challenge => (
              <Card key={challenge.id}>
                <CardHeader><div className="flex justify-between items-start"><CardTitle>{challenge.title}</CardTitle><RewardIcon reward={challenge.reward} /></div></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  {challenge.progress !== undefined && <Progress value={challenge.progress} />}
                  <div className="flex justify-end gap-2">
                    <Dialog onOpenChange={(open) => open && handleFetchRanking(challenge.id)}>
                      <DialogTrigger asChild><Button variant="ghost">ランキング</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>{challenge.title} - ランキング</DialogTitle></DialogHeader>
                        {isRankingLoading ? <p>読み込み中...</p> : rankingData ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-center">
                              <p className="text-sm">あなたの順位</p>
                              <p className="text-3xl font-bold">{rankingData.rank}位</p>
                              <p className="text-sm font-semibold">{rankingData.you.score.toLocaleString()} pt</p>
                            </div>
                            <div className="space-y-2">
                              {rankingData.friends.map(friend => (
                                <div key={friend.rank} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
                                  <span>{friend.rank}位: {friend.name}</span>
                                  <span className="font-semibold">{friend.score.toLocaleString()} pt</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : <p>ランキングデータを読み込めませんでした。</p>}
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => handleJoinChallenge(challenge)} disabled={joiningChallengeId === challenge.id}>
                      {joiningChallengeId === challenge.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      参加する
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : ( <div className="text-center py-16 text-muted-foreground"><p>現在参加できるチャレンジはありません。</p></div> )}
        </div>
      </div>
    </div>
  );
}
