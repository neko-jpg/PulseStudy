import { Bell } from 'lucide-react';

type DashboardHeaderProps = {
  userName: string;
  hasNotifications: boolean;
};

export function DashboardHeader({ userName, hasNotifications }: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <p className="text-xl text-slate-400">こんばんは、{userName}さん。</p>
        <p className="text-2xl font-bold text-white">昨日の集中、見事でした！</p>
      </div>
      <div className="relative">
        <Bell className="h-8 w-8 text-slate-400 hover:text-white cursor-pointer" />
        {hasNotifications && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-slate-900"></span>
        )}
      </div>
    </header>
  );
}
