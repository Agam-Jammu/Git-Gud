import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

class ResizeObserverStub {
  constructor(_callback: ResizeObserverCallback) {}

  observe() {}

  unobserve() {}

  disconnect() {}
}

function mediaQueryList(query: string): MediaQueryList {
  return {
    matches: query === REDUCED_MOTION_QUERY,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => true,
  } as unknown as MediaQueryList;
}

beforeAll(() => {
  Object.defineProperty(globalThis, "ResizeObserver", {
    configurable: true,
    writable: true,
    value: ResizeObserverStub,
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: mediaQueryList,
  });
});

afterEach(() => {
  cleanup();
});

