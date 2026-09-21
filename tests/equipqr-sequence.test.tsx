import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import HeroAnimation from "../components/equipqr/HeroAnimation";
import type { AnimationPhases } from "../components/equipqr/loadAnimation";
const phases: AnimationPhases = {
  QRScanPhase: ({ onPhaseComplete }) => <button onClick={onPhaseComplete}>scan</button>,
  StateMorphPhase: ({ onComplete }) => <button onClick={onComplete}>morph</button>,
  AssetDotsPhase: () => <span>assets</span>,
  NationalMapPhase: ({ onComplete, nationalSeed }) => (
    <button onClick={onComplete}>national {nationalSeed}</button>
  ),
  PMChecklistPhase: ({ onComplete }) => <button onClick={onComplete}>export</button>,
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
test("cycles through scan, state, assets, checklist/export and every third national map", () => {
  vi.useFakeTimers();
  const { unmount } = render(<HeroAnimation phases={phases} />);
  for (let i = 0; i < 6; i++) {
    fireEvent.click(screen.getByText("scan"));
    if ((i + 1) % 3 === 0) {
      fireEvent.click(screen.getByText(`national ${Math.floor((i + 1) / 3) - 1}`));
    } else {
      fireEvent.click(screen.getByText("morph"));
      expect(screen.getByText("assets")).toBeTruthy();
      act(() => vi.advanceTimersByTime(800));
      act(() => vi.advanceTimersByTime(680));
      fireEvent.click(screen.getByText("export"));
    }
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByText("scan")).toBeTruthy();
  }
  fireEvent.click(screen.getByText("scan"));
  fireEvent.click(screen.getByText("morph"));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
