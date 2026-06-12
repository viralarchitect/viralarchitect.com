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
import { chromaHue, hslToRgb, mixRgb, rgbString } from "@/lib/color";
import { utcStamp } from "@/lib/format";

export type AccentMode = "green" | "amber";

export type StyleDials = {
  /** DIAL-A — accent hue sweep */
  chroma: number;
  /** DIAL-B — phosphor glow intensity */
  phosphor: number;
  /** DIAL-C — secondary cyan channel */
  cyanAux: number;
  /** DIAL-D — ambient wash / background warmth */
  ambient: number;
};

export const DEFAULT_STYLE_DIALS: StyleDials = {
  chroma: 42,
  phosphor: 55,
  cyanAux: 70,
  ambient: 35,
};

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
  styleDials: StyleDials;
  setStyleDial: (key: keyof StyleDials, value: number) => void;
  resetAll: () => void;
  lastEvent: OpsEvent | null;
  log: (tag: string, msg: string) => void;
  blip: (freq?: number) => void;
};

const ConsoleContext = createContext<ConsoleState | null>(null);

const AMBER_RGB = { r: 255, g: 176, b: 0 };
const BASE_CYAN = { r: 0, g: 229, b: 255 };
const MUTED_CYAN = { r: 0, g: 120, b: 140 };

export function useConsole(): ConsoleState {
  const ctx = useContext(ConsoleContext);
  if (!ctx) {
    throw new Error("useConsole must be used within <ConsoleProvider>");
  }
  return ctx;
}

function applyStyleTokens(accent: AccentMode, dials: StyleDials) {
  const root = document.documentElement;

  const accentRgb =
    accent === "amber"
      ? AMBER_RGB
      : hslToRgb(chromaHue(dials.chroma), 100, 50);

  const cyanRgb = mixRgb(MUTED_CYAN, BASE_CYAN, dials.cyanAux / 100);
  const glow = 0.12 + (dials.phosphor / 100) * 0.88;
  const ambient = dials.ambient / 100;
  const gridAlpha = 0.02 + (dials.phosphor / 100) * 0.08;
  const washHue = chromaHue(dials.chroma);

  root.style.setProperty("--accent", `rgb(${rgbString(accentRgb)})`);
  root.style.setProperty("--accent-rgb", rgbString(accentRgb));
  root.style.setProperty("--cyan", `rgb(${rgbString(cyanRgb)})`);
  root.style.setProperty("--cyan-rgb", rgbString(cyanRgb));
  root.style.setProperty("--style-glow", String(glow));
  root.style.setProperty("--style-ambient", String(ambient));
  root.style.setProperty("--style-grid-alpha", String(gridAlpha));
  root.style.setProperty("--style-wash-hue", String(washHue));
  root.style.setProperty(
    "--style-wash-strength",
    String(0.08 + ambient * 0.22),
  );
}

function clearStyleTokens() {
  const root = document.documentElement;
  for (const prop of [
    "--accent",
    "--accent-rgb",
    "--cyan",
    "--cyan-rgb",
    "--style-glow",
    "--style-ambient",
    "--style-grid-alpha",
    "--style-wash-hue",
    "--style-wash-strength",
  ]) {
    root.style.removeProperty(prop);
  }
}

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccent] = useState<AccentMode>("green");
  const [grid, setGrid] = useState(true);
  const [scan, setScan] = useState(true);
  const [snd, setSnd] = useState(false);
  const [styleDials, setStyleDials] = useState<StyleDials>(DEFAULT_STYLE_DIALS);
  const [lastEvent, setLastEvent] = useState<OpsEvent | null>(null);
  const eventSeq = useRef(0);
  const sndRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const setStyleDial = useCallback((key: keyof StyleDials, value: number) => {
    setStyleDials((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setAccent("green");
    setGrid(true);
    setScan(true);
    setStyleDials(DEFAULT_STYLE_DIALS);
    eventSeq.current += 1;
    setLastEvent({
      id: eventSeq.current,
      tag: "RST",
      msg: "FACTORY RESET :: ALL STYLE BUSES RESTORED TO NOMINAL",
      time: utcStamp(new Date()),
    });
  }, []);

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
    applyStyleTokens(accent, styleDials);
    return () => clearStyleTokens();
  }, [accent, styleDials]);

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
      styleDials,
      setStyleDial,
      resetAll,
      lastEvent,
      log,
      blip,
    }),
    [accent, grid, scan, snd, styleDials, setStyleDial, resetAll, lastEvent, log, blip],
  );

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}
