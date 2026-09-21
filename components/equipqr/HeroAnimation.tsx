import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { ALL_STATE_CODES } from "./stateVectors";
import type { StateCode } from "./stateVectors";
import { computeDotPositionsInState, chosenDotIndex, strToSeed } from "./dotPositions";

import type { AnimationPhases } from "./loadAnimation";

type AnimPhase =
  | "qr"
  | "morph" // state cycle: MorphSVG line → state outline
  | "national" // national cycle: CSS scaleX expand → US map
  | "dots" // state cycle: asset dots scatter
  | "phase5-slide" // state cycle: slide map+dots to the side
  | "phase5-checklist" // state cycle: work-order sequence
  | "fade";

/** Pick a random state that is not the same as the previous one. */
function pickNextState(prev: StateCode | null): StateCode {
  const pool = prev ? ALL_STATE_CODES.filter((c) => c !== prev) : ALL_STATE_CODES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function HeroAnimation({ phases }: { phases: AnimationPhases }) {
  const { QRScanPhase, StateMorphPhase, AssetDotsPhase, NationalMapPhase, PMChecklistPhase } =
    phases;

  // Counts COMPLETED cycles (incremented at the end of each cycle).
  // The cycle currently in progress is `cycleSeed + 1` (1-indexed).
  const [cycleSeed, setCycleSeed] = useState(0);

  const [phase, setPhase] = useState<AnimPhase>("qr");
  const [stateKey, setStateKey] = useState<StateCode>(() => pickNextState(null));
  const prevStateRef = useRef<StateCode>(stateKey);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [opacity, setOpacity] = useState(1);

  // Cycle seed — re-randomizes dot positions per loop. Read at render time so
  // any state change after cycle count increment picks it up.

  // Every 3rd cycle (1-indexed: cycles 3, 6, 9, …) is national. `nationalSeed`
  // counts national instances (0 for the first national cycle, 1 for the next, …)
  // so each national render picks a distinct feature-card set. Negative values
  // during state cycles are harmless: NationalMapPhase only mounts during
  // national cycles, and it uses `Math.abs(nationalSeed) % len` defensively.
  const nationalSeed = Math.floor((cycleSeed + 1) / 3) - 1;

  // --- Dots (state cycle): rejection-sampled inside the state polygon ---
  // Computed in HeroAnimation so the chosen dot is guaranteed to match a
  // visible dot in AssetDotsPhase (same rejection-sampling result).
  // ICON_SIZE in AssetDotsPhase is 9 viewBox units; minDist=12 adds a small gap
  // between icons so they never visually overlap at the rendered stage size.
  // Dot count is 10 — easier to pack non-overlapping icons in small states.
  const dots = useMemo(
    () => computeDotPositionsInState(stateKey, 10, cycleSeed, 12),
    [stateKey, cycleSeed],
  );
  const chosenIdx = useMemo(
    () => chosenDotIndex(stateKey, dots, cycleSeed),
    [stateKey, dots, cycleSeed],
  );
  const chosenDot = dots[chosenIdx] ?? { cx: 50, cy: 50 };
  const slideDirection = chosenDot.cx > 50 ? "left" : "right";
  const exportSeed = useMemo(
    () => strToSeed(stateKey + "_export") + cycleSeed * 17,
    [stateKey, cycleSeed],
  );

  // The map takes 50% of the stage width during Phase 5. The stage is 1:1 square,
  // so the map container is 50% wide × 100% tall.
  //
  // AssetDotsPhase uses a square viewBox (100×100) with default preserveAspectRatio
  // ("xMidYMid meet"). In the 50%-wide container, the SVG scales to fill the width
  // and is letterboxed vertically:
  //   svgRenderedHeight = MAP_WIDTH_PCT% of stage (matches the rendered width)
  //   svgTopOffset      = (100% - MAP_WIDTH_PCT%) / 2  (blank space above/below)
  //
  // So a dot at (cx, cy) in the 0-100 viewBox sits at:
  //   dotStageX = (cx / 100) × MAP_WIDTH_PCT           (left-anchored)
  //   dotStageY = svgTopOffset + (cy / 100) × MAP_WIDTH_PCT
  const MAP_WIDTH_PCT = 50;
  const svgTopOffsetPct = (100 - MAP_WIDTH_PCT) / 2; // = 25 for 50%

  const dotStageX =
    slideDirection === "left"
      ? (chosenDot.cx / 100) * MAP_WIDTH_PCT
      : 100 - MAP_WIDTH_PCT + (chosenDot.cx / 100) * MAP_WIDTH_PCT;
  const dotStageY = svgTopOffsetPct + (chosenDot.cy / 100) * MAP_WIDTH_PCT;

  // --- Phase transition handlers ---

  const handleQRComplete = useCallback(() => {
    // cycleSeed counts COMPLETED cycles, so the cycle now starting is
    // (cycleSeed + 1). We want cycles 3, 6, 9, … to be national.
    const currentCycle1Indexed = cycleSeed + 1;
    setPhase(currentCycle1Indexed % 3 === 0 ? "national" : "morph");
  }, [cycleSeed]);

  const handleMorphComplete = useCallback(() => {
    setPhase("dots");
  }, []);

  const restartCycleAfterFade = useCallback(() => {
    setOpacity(0);
    holdTimerRef.current = setTimeout(() => {
      setCycleSeed((current) => current + 1);
      const next = pickNextState(prevStateRef.current);
      prevStateRef.current = next;
      setStateKey(next);
      setPhase("qr");
      setOpacity(1);
    }, 400);
  }, []);

  const handleNationalComplete = useCallback(() => {
    // National cycles skip Phase 5 — go straight to fade → restart
    restartCycleAfterFade();
  }, [restartCycleAfterFade]);

  const handleDotsReady = useCallback(() => {
    // After a short hold, start Phase 5 on state cycles
    holdTimerRef.current = setTimeout(() => {
      setPhase("phase5-slide");
    }, 800);
  }, []);

  const handleChecklistComplete = useCallback(() => {
    // Phase 5 complete → fade out → restart cycle
    restartCycleAfterFade();
  }, [restartCycleAfterFade]);

  // Phase 5a: wait one frame so the CSS width transition kicks in, then
  // advance to 'phase5-checklist' after the 600ms transition completes.
  useEffect(() => {
    if (phase === "phase5-slide") {
      holdTimerRef.current = setTimeout(() => {
        setPhase("phase5-checklist");
      }, 680);
    }
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [phase]);

  // Trigger the hold timer for state-cycle dots phase
  useEffect(() => {
    if (phase === "dots") {
      handleDotsReady();
    }
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [phase, handleDotsReady]);

  // Defensive unmount guarantee: clear any pending fade/restart timer on the
  // ref regardless of which phase we were in. The phase-scoped effects above
  // already clean up, but those callbacks (handleNationalComplete,
  // handleChecklistComplete) write to holdTimerRef from outside an effect,
  // so we keep an explicit unmount-only cleanup here in case the user
  // navigates away mid-fade.
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="eq-sequence" style={{ opacity }} data-phase={phase} data-cycle={cycleSeed}>
      {/*
              Map container. During Phase 5 it shrinks to 50% width on the
              appropriate side, revealing room for the checklist panel.
              CSS transition on `width` creates the "slide" effect — no
              translateX needed, which avoids the percentage-of-self confusion.
            */}
      <div
        className="eq-map-slot"
        style={{
          [slideDirection === "left" ? "left" : "right"]: 0,
          width:
            phase === "phase5-slide" || phase === "phase5-checklist" ? `${MAP_WIDTH_PCT}%` : "100%",
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {phase === "qr" && <QRScanPhase onPhaseComplete={handleQRComplete} />}
        {phase === "morph" && (
          <StateMorphPhase stateKey={stateKey} onComplete={handleMorphComplete} />
        )}
        {(phase === "dots" || phase === "phase5-slide" || phase === "phase5-checklist") && (
          <AssetDotsPhase stateKey={stateKey} dots={dots} />
        )}
        {phase === "national" && (
          <NationalMapPhase
            cycleSeed={cycleSeed}
            nationalSeed={nationalSeed}
            onComplete={handleNationalComplete}
          />
        )}
      </div>

      {/* Phase 5 checklist overlay — full-stage absolute, so the connector
                line SVG can start at the dot's stage position and end at the panel */}
      {phase === "phase5-checklist" && (
        <PMChecklistPhase
          slideDirection={slideDirection}
          dotStageX={dotStageX}
          dotStageY={dotStageY}
          exportSeed={exportSeed}
          onComplete={handleChecklistComplete}
        />
      )}
    </div>
  );
}
