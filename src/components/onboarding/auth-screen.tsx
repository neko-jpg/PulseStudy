
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GoogleIcon } from "../icons/google-icon";
import { AppleIcon } from "../icons/apple-icon";
import { useToast } from "@/hooks/use-toast";

const subjects = [
  { id: "math", label: "数学" },
  { id: "english", label: "英語" },
  { id: "science", label: "理科" },
  { id: "social", label: "社会" },
  { id: "programming", label: "プログラミング" },
  { id: "toeic", label: "TOEIC" },
];

export default function AuthScreen() {
  const [timeValue, setTimeValue] = useState(60);
  const { toast } = useToast();
  const router = useRouter();

  const handleAuthClick = (provider: string) => {
    if (provider === "Guest") {
      router.push("/home");
      return;
    }
    toast({
      title: "認証機能",
      description: `${provider}での認証は現在実装されていません。`,
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分`;
    return `${minutes / 60}時間`;
  }

  return (
    <div className="flex size-full flex-col p-8 opacity-100 transition-opacity duration-300">
      <div className="mb-4">
        <h1 className="font-headline text-2xl font-bold leading-tight">
          最後にいくつか
          <br />
          教えてください
        </h1>
      </div>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="time-slider">目標の学習時間（1日）</Label>
          <Slider
            id="time-slider"
            min={0}
            max={180}
            step={60}
            value={[timeValue]}
            onValueChange={(value) => setTimeValue(value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0時間</span>
            <span>1時間</span>
            <span>2時間</span>
            <span>3時間</span>
          </div>
          <div className="pt-2 text-center font-medium text-primary-foreground/80">
            {formatTime(timeValue)}
          </div>
        </div>

        <div className="space-y-3">
          <Label>興味のある科目（任意）</Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-2">
                <Checkbox id={subject.id} />
                <Label htmlFor={subject.id} className="font-normal">
                  {subject.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          className="w-full bg-[#4285F4] text-white hover:bg-[#4285F4]/90"
          onClick={() => handleAuthClick("Google")}
        >
          <GoogleIcon className="mr-2 size-5" />
          Googleアカウントで続行
        </Button>
        <Button
          className="w-full bg-black text-white hover:bg-black/90"
          onClick={() => handleAuthClick("Apple")}
        >
          <AppleIcon className="mr-2 size-5" />
          Appleで続行
        </Button>
        <Button variant="ghost" onClick={() => handleAuthClick("Guest")}>
          ゲストとして試す
        </Button>
        <p className="px-4 text-center text-xs text-muted-foreground">
          続行することで、<a href="#" className="underline hover:text-primary">利用規約</a>と
          <a href="#" className="underline hover:text-primary">プライバシーポリシー</a>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
