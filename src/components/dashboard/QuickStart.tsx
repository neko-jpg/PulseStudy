import { History, School, MessageCircleQuestion, Lightbulb, LucideIcon } from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key:string]: LucideIcon } = {
  history: History,
  school: School,
  quiz: MessageCircleQuestion,
  lightbulb: Lightbulb,
};

export type QuickStartItem = {
  iconName: keyof typeof iconMap;
  iconColorClass: string;
  title: string;
  badge?: {
    text: string;
    colorClass: string;
  };
  href: string;
};

type QuickStartCardProps = {
  items: QuickStartItem[];
};

function QuickStartButton({ item }: { item: QuickStartItem }) {
  const IconComponent = iconMap[item.iconName];
  return (
    <Link href={item.href} passHref className="h-full">
        <button className="relative bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors w-full h-full flex flex-col justify-center items-center">
            {item.badge && (
                <span className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${item.badge.colorClass}`}>
                    {item.badge.text}
                </span>
            )}
            <IconComponent className={`h-10 w-10 mb-2 mx-auto ${item.iconColorClass}`} />
            <p className="font-semibold text-white">{item.title}</p>
        </button>
    </Link>
  );
}

export function QuickStart({ items }: QuickStartCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-6">
      <h3 className="text-xl font-bold mb-4 text-white">クイックスタート</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <QuickStartButton key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}
