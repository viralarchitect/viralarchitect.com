"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { utcStamp } from "@/lib/format";

export type AccentMode = "green" | "amber";

export type OpsEvent = {
  id: number;
  tag: string;
  msg: string;
  time: string;
};

type ConsoleState = {
  accent: AccentMode;
  setAccent: (mode: AccentMode) => void;
  grid: boolean;
  setGrid: (on: boolean) => void;
  scan: boolean;
  setScan: (on: boolean) => void;
  snd: boolean;
  setSnd: (on: boolean) => void;
  lastEvent: OpsEvent | null;
  log: (tag: string, msg: string) => void;
  blip: (freq?: number) => void;
};

const ConsoleContext = createContext<ConsoleState | null>(null);

export function useConsole(): ConsoleState {
  const ctx = useContext(ConsoleContext);
  if (!ctx) {
    throw new Error("useConsole must be used within <ConsoleProvider>");
  }
  return ctx;
}

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccent] = useState<AccentMode>("green");
  const [grid, setGrid] = useState(true);
  const [scan, setScan] = useState(true);
  const [snd, setSnd] = useState(false);
  const [lastEvent, setLastEvent] = useState<OpsEvent | null>(null);
  const eventSeq = useRef(0);
  const sndRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  /* sync cosmetic state onto <body> so CSS owns all visuals */
  useEffect(() => {
    if (accent === "amber") {
      document.body.dataset.accent = "amber";
    } else {
      delete document.body.dataset.accent;
    }
  }, [accent]);

  useEffect(() => {
    document.body.dataset.grid = grid ? "on" : "off";
  }, [grid]);

  useEffect(() => {
    document.body.dataset.scan = scan ? "on" : "off";
  }, [scan]);

  useEffect(() => {
    sndRef.current = snd;
  }, [snd]);

  const log = useCallback((tag: string, msg: string) => {
    eventSeq.current += 1;
    setLastEvent({
      id: eventSeq.current,
      tag,
      msg,
      time: utcStamp(new Date()),
    });
  }, []);

  const blip = useCallback((freq = 1400) => {
    if (!sndRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      /* audio unavailable — stay silent */
    }
  }, []);

  const value = useMemo<ConsoleState>(
    () => ({
      accent,
      setAccent,
      grid,
      setGrid,
      scan,
      setScan,
      snd,
      setSnd,
      lastEvent,
      log,
      blip,
    }),
    [accent, grid, scan, snd, lastEvent, log, blip],
  );

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}
