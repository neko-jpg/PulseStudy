'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFocusMeter } from '@/hooks/useFocusMeter';
import { useFocusStore } from '@/store/focusStore';
import { track } from '@/lib/analytics';
import { Video, VideoOff, Loader2 } from 'lucide-react';

type FocusModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function FocusController() {
  const { start, stop } = useFocusMeter();
  const { state } = useFocusStore((s) => s.output);

  const isRunning = state === 'active' || state === 'warming_up' || state === 'calibrating';
  const isPending = state === 'warming_up' || state === 'calibrating';

  const handleToggle = () => {
    if (isRunning) {
      stop();
      track({ name: 'focus_measurement_stop_from_modal' });
    } else {
      start();
      track({ name: 'focus_measurement_start_from_modal' });
    }
  };

  const getButtonState = () => {
    if (state === 'no-signal') { // This state can indicate camera permission was denied
      return { text: 'カメラへのアクセスがありません', disabled: true, icon: <VideoOff className="mr-2 h-4 w-4" /> };
    }
    if (isPending) {
      return { text: '準備中...', disabled: true, icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
    }
    if (isRunning) {
      return { text: '計測を停止', disabled: false, icon: <VideoOff className="mr-2 h-4 w-4" /> };
    }
    return { text: '集中度を計測', disabled: false, icon: <Video className="mr-2 h-4 w-4" /> };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Video className="w-16 h-16 text-slate-500" />
      </div>
      <Button onClick={handleToggle} disabled={buttonState.disabled} className="w-full mt-2">
        {buttonState.icon}
        {buttonState.text}
      </Button>
    </div>
  );
}


export function FocusModal({ isOpen, onClose }: FocusModalProps) {
  const { stop } = useFocusMeter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Ensure the engine is turned off when the modal is closed
      stop();
      onClose();
    }
  };

  // Stop focus meter when the component unmounts
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>集中度計測</DialogTitle>
          <DialogDescription>
            カメラを使用してあなたの集中度をリアルタイムで計測します。準備ができたら下のボタンを押してください。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FocusController />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
