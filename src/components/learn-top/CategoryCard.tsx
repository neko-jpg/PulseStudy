import { LucideIcon } from 'lucide-react';

type CategoryCardProps = {
  icon: LucideIcon;
  title: string;
  iconColorClass: string;
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
};

export function CategoryCard({ icon: Icon, title, iconColorClass, onClick, isActive, disabled }: CategoryCardProps) {
  const activeClass = isActive ? 'bg-slate-600 border-blue-400' : 'border-transparent';
  const disableClass = disabled ? 'opacity-50 cursor-not-allowed' : ''
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`bg-gray-800 p-6 rounded-xl flex flex-col items-center justify-center text-center w-full transition-all border-2 ${activeClass} ${disableClass} ${disabled ? '' : 'hover:border-blue-400'}`}
    >
      <Icon className={`h-12 w-12 mb-2 ${iconColorClass}`} />
      <h3 className="font-semibold">{title}</h3>
      {disabled && (
        <span className="mt-2 text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded-full">近日公開</span>
      )}
    </button>
  );
}
