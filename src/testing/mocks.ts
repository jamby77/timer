import { vi } from "vitest";
import { TimerCategory, TimerType, WorkRestMode } from "@/types/configure";
import { createMockTimerConfig } from "./utils";

/**
 * Mock localStorage implementation for testing
 */
export const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

/**
 * Sets up global localStorage mock for tests
 */
export const setupLocalStorageMock = () => {
  vi.stubGlobal("localStorage", localStorageMock);
};

/**
 * Mock predefined styles for testing components
 */
export const mockStyles = [
  {
    id: "style-1",
    name: "Tabata",
    description: "High-intensity interval training protocol",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: createMockTimerConfig("Tabata", TimerType.INTERVAL),
  },
  {
    id: "style-2",
    name: "EMOM",
    description: "Every minute on the minute - 10 minutes",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: createMockTimerConfig("EMOM", TimerType.INTERVAL),
  },
  {
    id: "style-3",
    name: "Work/Rest Ratio",
    description: "Work/rest timer with equal work and rest periods",
    category: TimerCategory.STRENGTH,
    isBuiltIn: true,
    config: createMockTimerConfig("Work/Rest Ratio", TimerType.WORKREST),
  },
  {
    id: "style-4",
    name: "Countdown",
    description: "Simple 5-minute countdown",
    category: TimerCategory.FLEXIBILITY,
    isBuiltIn: true,
    config: createMockTimerConfig("Countdown", TimerType.COUNTDOWN),
  },
  {
    id: "style-5",
    name: "Stopwatch",
    description: "10-minute limited stopwatch",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: createMockTimerConfig("Stopwatch", TimerType.STOPWATCH),
  },
];

/**
 * Mock event handlers for testing
 */
export const mockEventHandlers = {
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
};

/**
 * Creates a mock HTML element with common properties
 * @param tagName - The tag name for the element
 * @param properties - Additional properties to set on the element
 * @returns A mock HTML element
 */
export const mockHTMLElement = (tagName: string, properties: Record<string, any> = {}) => {
  return {
    tagName: tagName.toUpperCase(),
    textContent: "",
    value: "",
    checked: false,
    disabled: false,
    click: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    ...properties,
  };
};

/**
 * Creates a mock form input element
 * @param type - Input type (default: 'text')
 * @param value - Initial value
 * @returns A mock input element
 */
export const mockInput = (type: string = "text", value: string = "") => {
  return mockHTMLElement("input", {
    type,
    value,
    placeholder: "",
  });
};

/**
 * Creates a mock button element
 * @param text - Button text content
 * @param disabled - Whether button is disabled
 * @returns A mock button element
 */
export const mockButton = (text: string = "", disabled: boolean = false) => {
  return mockHTMLElement("button", {
    textContent: text,
    disabled,
    type: "button",
  });
};

/**
 * Mock canvas element for testing
 */
export const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
  })),
  width: 800,
  height: 600,
  style: {},
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

/**
 * Mock window object properties
 */
export const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn(),
};

/**
 * Sets up global window mocks for tests
 */
export const setupWindowMocks = () => {
  Object.entries(mockWindow).forEach(([key, value]) => {
    vi.stubGlobal(key, value);
  });
};
