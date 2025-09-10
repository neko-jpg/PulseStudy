'use client';

import { useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useHomeStore, type CameraPermission } from '@/store/homeStore';
import { usePulseEngine } from '@/hooks/usePulseEngine';
import { PulseEngineOutput } from '@/lib/pulse-engine';
import { track } from '@/lib/analytics';
import { Video, VideoOff } from 'lucide-react';

type FocusModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function PulseController() {
  const {
    isPulseEngineEnabled,
    setPulseEngineEnabled,
    cameraPermission,
    setCameraPermission,
    setPulse,
  } = useHomeStore();

  const handleUpdate = useCallback(
    (output: PulseEngineOutput) => {
      const score = Math.round(output.smoothedScore * 100);
      setPulse(score);
    },
    [setPulse]
  );

  const handlePermissionChange = useCallback(
    (status: CameraPermission) => {
      setCameraPermission(status);
    },
    [setCameraPermission]
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);

  usePulseEngine({
    enabled: isPulseEngineEnabled,
    onUpdate: handleUpdate,
    onPermissionChange: handlePermissionChange,
    videoEl: videoRef.current,
  });

  const handleToggle = () => {
    const nextState = !isPulseEngineEnabled;
    setPulseEngineEnabled(nextState);
    if (nextState) {
      track({ name: 'pulse_measurement_start_from_modal' });
    } else {
      track({ name: 'pulse_measurement_stop_from_modal' });
    }
  };

  const getButtonState = () => {
    if (cameraPermission === 'denied') {
      return { text: 'カメラがブロックされています', disabled: true, icon: <VideoOff className="mr-2 h-4 w-4" /> };
    }
    if (cameraPermission === 'pending') {
      return { text: '許可を待っています...', disabled: true, icon: <Video className="mr-2 h-4 w-4" /> };
    }
    if (isPulseEngineEnabled) {
      return { text: '計測を停止', disabled: false, icon: <VideoOff className="mr-2 h-4 w-4" /> };
    }
    return { text: '集中度を計測', disabled: false, icon: <Video className="mr-2 h-4 w-4" /> };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} muted playsInline autoPlay style={{ display: 'none' }} />
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
  // We need to manage the pulse engine state when the modal opens/closes
  const { setPulseEngineEnabled } = useHomeStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Ensure the engine is turned off when the modal is closed
      setPulseEngineEnabled(false);
      onClose();
    }
  };

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
          <PulseController />
        </div>
        <DialogFooter>
            <Button variant="secondary" onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
