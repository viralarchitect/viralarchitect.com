"use client";

import { useEffect, useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";

/** Fixed bottom-left strip echoing the last hardware event. */
export function OpsTicker() {
  const { lastEvent } = useConsole();
  const [expiredId, setExpiredId] = useState(0);

  useEffect(() => {
    if (!lastEvent) return;
    const t = setTimeout(() => setExpiredId(lastEvent.id), 5000);
    return () => clearTimeout(t);
  }, [lastEvent]);

  const visible = lastEvent !== null && lastEvent.id !== expiredId;

  return (
    <div
      className={`ops-ticker${visible ? " show" : ""}`}
      role="status"
      aria-live="polite"
    >
      {lastEvent && (
        <>
          <b>
            [{lastEvent.time} {lastEvent.tag}]
          </b>{" "}
          {lastEvent.msg}
        </>
      )}
    </div>
  );
}
