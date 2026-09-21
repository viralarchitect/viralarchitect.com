import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { gsap } from "../components/equipqr/gsap";
import QRScanPhase from "../components/equipqr/QRScanPhase";
import AssetDotsPhase from "../components/equipqr/AssetDotsPhase";
import NationalMapPhase from "../components/equipqr/NationalMapPhase";
import PMChecklistPhase from "../components/equipqr/PMChecklistPhase";

afterEach(() => {
  cleanup();
  gsap.ticker.sleep();
  vi.useRealTimers();
});
test("real GSAP contexts and phase timers are released on repeated unmounts", () => {
  vi.useFakeTimers();
  const phases = [
    <QRScanPhase key="qr" onPhaseComplete={() => undefined} />,
    <AssetDotsPhase key="dots" stateKey="TX" dots={[{ id: 0, cx: 50, cy: 50 }]} />,
    <NationalMapPhase key="map" cycleSeed={2} nationalSeed={0} onComplete={() => undefined} />,
    <PMChecklistPhase
      key="pm"
      slideDirection="left"
      dotStageX={25}
      dotStageY={50}
      exportSeed={0}
      onComplete={() => undefined}
    />,
  ];
  for (let i = 0; i < 3; i++)
    for (const phase of phases) {
      const { unmount } = render(phase);
      expect(gsap.globalTimeline.getChildren().length).toBeGreaterThan(0);
      unmount();
      gsap.ticker.sleep();
      expect(gsap.globalTimeline.getChildren()).toHaveLength(0);
      expect(vi.getTimerCount()).toBe(0);
    }
});
