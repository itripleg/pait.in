// components/ClientTime.tsx
"use client";

import { useState, useEffect } from "react";

export function ClientTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    // Set initial time
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span className="font-mono tabular-nums">{time}</span>;
}

export function ClientDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      setDate(new Date().toLocaleDateString());
    };

    // Set initial date
    updateDate();

    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      updateDate();
      // Then update every 24 hours
      const interval = setInterval(updateDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  return <span className="font-mono tabular-nums">{date}</span>;
}
