import { LucideIcon } from 'lucide-react';

type ActionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgClass: string;
  iconFgClass: string;
  onClick?: () => void;
};

export function ActionCard({ icon: Icon, title, description, iconBgClass, iconFgClass, onClick }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center hover:bg-gray-700/80 transition-transform transform hover:-translate-y-1 cursor-pointer h-full"
    >
      <div className={`p-4 rounded-full mb-4 ${iconBgClass}`}>
        <Icon className={`h-10 w-10 ${iconFgClass}`} />
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
