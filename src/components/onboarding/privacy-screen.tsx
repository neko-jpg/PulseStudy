"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Lock, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type PrivacyOption = "standard" | "safety" | "advanced";

const options = [
  {
    id: "standard" as PrivacyOption,
    icon: <BarChart3 className="mr-3 size-6 text-primary" />,
    title: "標準 (推奨)",
    description: "アプリの操作ログ（解答時間など）のみで分析します。",
  },
  {
    id: "safety" as PrivacyOption,
    icon: <Lock className="mr-3 size-6 text-primary" />,
    title: "セーフティ",
    description:
      "操作ログに加え、手動で「集中」「退屈」ボタンを押して記録します。",
  },
  {
    id: "advanced" as PrivacyOption,
    icon: <Rocket className="mr-3 size-6 text-primary" />,
    title: "アドバンス",
    description:
      "カメラ/マイクを使用し、没入度を詳しく分析します。(※端末の許可が必要です)",
  },
];

type PrivacyScreenProps = {
  onNext: () => void;
};

export default function PrivacyScreen({ onNext }: PrivacyScreenProps) {
  const [selectedOption, setSelectedOption] = useState<PrivacyOption | null>(
    null
  );

  return (
    <div className="flex size-full flex-col p-8 opacity-100 transition-opacity duration-300">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold leading-tight">
          学習の様子を、
          <br />
          どのように計測しますか？
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          より最適な学習のためにご協力ください。
          <br />
          後から設定で変更できます。
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedOption === option.id &&
                "border-primary bg-primary/10"
            )}
            onClick={() => setSelectedOption(option.id)}
          >
            <CardHeader>
              <div className="flex items-center">
                {option.icon}
                <CardTitle className="text-base font-bold">
                  {option.title}
                </CardTitle>
              </div>
              <CardDescription className="pt-1 text-xs">
                {option.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Button
        className="mt-6 w-full"
        onClick={onNext}
        disabled={!selectedOption}
        variant="default"
      >
        同意して続行
      </Button>
    </div>
  );
}
