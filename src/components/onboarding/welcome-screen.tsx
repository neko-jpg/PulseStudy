import { Button } from "@/components/ui/button";
import { AppLogoIcon } from "@/components/icons/app-logo-icon";
import { useToast } from "@/hooks/use-toast";

type WelcomeScreenProps = {
  onNext: () => void;
};

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { toast } = useToast();

  const handleTeacherClick = () => {
    toast({
      title: "教員向け機能",
      description: "教員向けの機能は現在準備中です。",
    });
  };

  return (
    <div className="flex size-full flex-col p-8 text-center opacity-100 transition-opacity duration-300">
      <div className="flex-1">
        <div className="mb-4 font-headline text-2xl font-bold text-primary">
          PulseStudy
        </div>
        <div className="mx-auto mb-8 flex size-44 items-center justify-center rounded-full bg-primary/10">
          <AppLogoIcon className="size-24" />
        </div>

        <h1 className="mb-2 font-headline text-2xl font-bold">
          学びの、その先へ。
        </h1>
        <p className="text-sm text-muted-foreground">
          5分のスナック学習とAIコーチで、
          <br />
          「続かない」を「楽しい」に変えよう。
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <Button className="w-full" onClick={onNext} variant="default">
          生徒はこちら
        </Button>
        <Button
          className="w-full"
          onClick={handleTeacherClick}
          variant="ghost"
        >
          教員はこちら
        </Button>
      </div>
    </div>
  );
}
