"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyConsentModal({
  isOpen,
  onOpenChange,
  onAccept,
  onDecline,
}: PrivacyConsentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>カメラ利用の同意</DialogTitle>
          <DialogDescription>
            集中度を計測するためにカメラへのアクセスを許可してください。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground space-y-2">
          <p>
            <strong>目的:</strong> あなたの表情や視線から集中度をリアルタイムで分析し、学習効率の向上をサポートします。
          </p>
          <p>
            <strong>保存されるデータ:</strong>
            集中度のスコアとセッション時間のみが保存されます。カメラの映像や画像がサーバーにアップロード・保存されることは一切ありません。
          </p>
          <p>
            <strong>同意の撤回:</strong>
            この設定はいつでもプロフィール画面から変更できます。
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            同意しない
          </Button>
          <Button onClick={onAccept}>同意して続ける</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
