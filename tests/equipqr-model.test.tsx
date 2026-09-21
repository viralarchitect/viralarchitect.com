import { useEffect } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EquipQRModel } from "../components/equipqr/EquipQRModel";
import { loadAnimation } from "../components/equipqr/loadAnimation";
vi.mock("../components/equipqr/loadAnimation", () => ({ loadAnimation: vi.fn() }));

let reduced = false;
let hidden = false;
const mediaListeners = new Set<() => void>();
const observers: Array<{
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  disconnect: ReturnType<typeof vi.fn>;
}> = [];
function animation() {
  const timer = setInterval(() => undefined, 100);
  return () => clearInterval(timer);
}
function Demo() {
  useEffect(animation, []);
  return <div data-testid="running-demo" />;
}
function intersect(near: boolean, visible: boolean) {
  act(() => {
    observers.forEach((o) =>
      o.callback(
        [{ isIntersecting: o.options?.rootMargin ? near : visible } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    );
  });
}
async function loaded() {
  await act(async () => {
    await Promise.resolve();
  });
}
beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  hidden = false;
  observers.length = 0;
  vi.mocked(loadAnimation).mockReset().mockResolvedValue(Demo);
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, f: () => void) => mediaListeners.add(f),
    removeEventListener: (_: string, f: () => void) => mediaListeners.delete(f),
  }));
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observers.push({ callback, options, disconnect: this.disconnect });
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("reduced motion retains static artwork and never loads the animation", async () => {
  reduced = true;
  const { container } = render(<EquipQRModel />);
  intersect(true, true);
  await loaded();
  expect(loadAnimation).not.toHaveBeenCalled();
  expect(container.querySelector("img")?.getAttribute("src")).toBe("/equipqr/static-composite.svg");
  expect(screen.queryByRole("button")).toBeNull();
  expect(container.querySelector(".equipqr-stage")?.getAttribute("aria-hidden")).toBe("true");
});

test("loads near viewport, starts only when visible, cleans up offscreen/hidden/pause", async () => {
  const { unmount } = render(<EquipQRModel />);
  expect(loadAnimation).not.toHaveBeenCalled();
  intersect(true, false);
  await loaded();
  expect(loadAnimation).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("running-demo")).toBeNull();
  for (let i = 0; i < 5; i++) {
    intersect(true, true);
    expect(screen.queryByTestId("running-demo")).not.toBeNull();
    intersect(false, false);
    expect(vi.getTimerCount()).toBe(0);
  }
  intersect(true, true);
  await loaded();
  fireEvent.click(screen.getByRole("button", { name: "Pause animation" }));
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Play animation" }));
  await loaded();
  act(() => {
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(vi.getTimerCount()).toBe(0);
  act(() => {
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  act(() => {
    reduced = true;
    mediaListeners.forEach((f) => f());
  });
  expect(vi.getTimerCount()).toBe(0);
  unmount();
  expect(observers.every((o) => o.disconnect.mock.calls.length === 1)).toBe(true);
  expect(mediaListeners.size).toBe(0);
});

test("failed loading keeps a useful static visual", async () => {
  vi.mocked(loadAnimation).mockRejectedValue(new Error("chunk unavailable"));
  const { container } = render(<EquipQRModel />);
  intersect(true, true);
  await loaded();
  expect(container.querySelector("img")).not.toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
});
