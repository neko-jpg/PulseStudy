import { Flame, Star, Rocket, LucideIcon } from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key: string]: LucideIcon } = {
  flame: Flame,
  star: Star,
  rocket: Rocket,
};

export type Challenge = {
  iconName: keyof typeof iconMap;
  badge?: string;
  title: string;
  description: string;
  progress: number;
  progressText: string;
  gradientClass: string;
  shadowClass: string;
  href: string;
};

type ChallengesCarouselProps = {
  challenges: Challenge[];
};

function ChallengeCard({ item }: { item: Challenge }) {
  const IconComponent = iconMap[item.iconName];
  return (
    <Link href={item.href} passHref>
      <div className={`flex-shrink-0 w-72 rounded-xl p-6 flex flex-col justify-between shadow-lg transition-shadow ${item.gradientClass} ${item.shadowClass}`}>
        <div>
          <div className="flex justify-between items-start">
            <IconComponent className="h-12 w-12 text-white opacity-80" />
            {item.badge && (
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{item.badge}</span>
            )}
          </div>
          <h4 className="text-xl font-bold text-white mt-4">{item.title}</h4>
          <p className="text-white/80 mt-1">{item.description}</p>
        </div>
        <div>
          <div className="w-full bg-white/30 rounded-full h-2.5 mt-4">
            <div className="bg-white rounded-full h-2.5" style={{ width: `${item.progress}%` }}></div>
          </div>
          <p className="text-sm text-white/80 mt-2">{item.progressText}</p>
        </div>
      </div>
    </Link>
  );
}

export function ChallengesCarousel({ challenges }: ChallengesCarouselProps) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-white">チャレンジ</h3>
      <div className="flex space-x-6 overflow-x-auto pb-4 card-carousel">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.title} item={challenge} />
        ))}
      </div>
    </div>
  );
}
