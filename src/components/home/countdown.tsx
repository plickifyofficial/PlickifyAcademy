"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function Countdown({ target }: { target: number }) {
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const timer = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const boxes = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Minutes" },
    { value: time.seconds, label: "Seconds" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {boxes.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center rounded-2xl bg-white/15 py-3 backdrop-blur"
        >
          <span className="text-2xl font-extrabold text-white sm:text-3xl">
            {String(b.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}