import { LucideIcon } from 'lucide-react';

type CategoryCardProps = {
  icon: LucideIcon;
  title: string;
  iconColorClass: string;
  onClick: () => void;
  isActive: boolean;
};

export function CategoryCard({ icon: Icon, title, iconColorClass, onClick, isActive }: CategoryCardProps) {
  const activeClass = isActive ? 'bg-slate-600 border-blue-400' : 'border-transparent';
  return (
    <button
      onClick={onClick}
      className={`bg-gray-800 p-6 rounded-xl flex flex-col items-center justify-center text-center w-full transition-all border-2 ${activeClass} hover:border-blue-400`}
    >
      <Icon className={`h-12 w-12 mb-2 ${iconColorClass}`} />
      <h3 className="font-semibold">{title}</h3>
    </button>
  );
}
