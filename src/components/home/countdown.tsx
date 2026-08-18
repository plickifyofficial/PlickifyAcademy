"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(target: number): Remaining {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const EMPTY: Remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export function Countdown({ target }: { target: number }) {
  const [time, setTime] = useState<Remaining | null>(null);

  useEffect(() => {
    setTime(getRemaining(target));
    const timer = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const current = time ?? EMPTY;

  const boxes = [
    { value: current.days, label: "Days" },
    { value: current.hours, label: "Hours" },
    { value: current.minutes, label: "Minutes" },
    { value: current.seconds, label: "Seconds" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {boxes.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center rounded-2xl bg-white/15 py-3 backdrop-blur"
        >
          <span className="text-2xl font-extrabold text-white sm:text-3xl">
            {time ? String(b.value).padStart(2, "0") : "--"}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}