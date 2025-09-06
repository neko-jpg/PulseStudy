
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "../icons/google-icon";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

type TeacherAuthScreenProps = {
  onBack: () => void;
};

export default function TeacherAuthScreen({ onBack }: TeacherAuthScreenProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleAuthClick = (provider: string) => {
    if (provider === "Guest") {
      router.push("/teacher-dashboard");
      return;
    }
    toast({
      title: "認証機能",
      description: `${provider}での認証は現在実装されていません。`,
    });
  };

  return (
    <div className="flex size-full flex-col p-8 opacity-100 transition-opacity duration-300">
      <div className="mb-8">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={onBack}>
          <ArrowLeft className="size-5" />
          <span className="sr-only">戻る</span>
        </Button>
        <h1 className="pt-12 text-center font-headline text-2xl font-bold leading-tight">
          教員アカウントで
          <br />
          サインイン
        </h1>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3">
        <Button
          className="w-full bg-[#4285F4] text-white hover:bg-[#4285F4]/90"
          onClick={() => handleAuthClick("Google")}
        >
          <GoogleIcon className="mr-2 size-5" />
          Googleアカウントで続行
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => handleAuthClick("Email")}
        >
          <Mail className="mr-2 size-5" />
          メールアドレスで続行
        </Button>
        <Button variant="ghost" onClick={() => handleAuthClick("Guest")}>
          ゲストとして試す
        </Button>
      </div>

      <div className="mt-auto">
        <p className="px-4 text-center text-xs text-muted-foreground">
          続行することで、<a href="#" className="underline hover:text-primary">利用規約</a>と
          <a href="#" className="underline hover:text-primary">プライバシーポリシー</a>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
