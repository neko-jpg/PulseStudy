"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Timer, Users2 } from "lucide-react";

const slides = [
  {
    icon: <Timer className="size-16 text-primary" />,
    title: "5分で完結",
    description: "すきま時間にさくっと学習。\n無理なく続けられる。",
  },
  {
    icon: <Bot className="size-16 text-primary" />,
    title: "AIがあなたの律さん",
    description: "苦手を自動分析。\n最適な問題を出題してくれるコーチ。",
  },
  {
    icon: <Users2 className="size-16 text-primary" />,
    title: "みんなとゆるくつながる",
    description: "友達と励まし合い、\n競い合えるから孤独じゃない。",
  },
];

type SlidesScreenProps = {
  onNext: () => void;
};

export default function SlidesScreen({ onNext }: SlidesScreenProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleNextClick = () => {
    if (current < count) {
      api?.scrollNext();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex size-full flex-col p-8 opacity-100 transition-opacity duration-300">
      <Carousel setApi={setApi} className="flex-1">
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="flex size-full flex-col items-center justify-center text-center">
                <div className="mb-6">{slide.icon}</div>
                <h2 className="mb-4 font-headline text-xl font-bold">
                  {slide.title}
                </h2>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {slide.description}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="my-5 flex justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "size-2 rounded-full bg-primary/20 transition-all",
              current === index + 1 && "w-4 bg-primary"
            )}
          />
        ))}
      </div>

      <Button className="w-full" onClick={handleNextClick} variant="default">
        {current === count ? "認証へ進む" : "次へ"}
      </Button>
    </div>
  );
}
