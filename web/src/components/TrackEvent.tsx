"use client";

import { useEffect } from "react";

interface TrackEventProps {
  eventName: string;
  properties?: Record<string, string | number | boolean | null>;
}

export function TrackEvent({ eventName, properties = {} }: TrackEventProps) {
  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventName, properties }),
      keepalive: true,
    }).catch(() => {});
  }, [eventName, properties]);

  return null;
}
