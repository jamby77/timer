import {
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  TimerCategory,
  TimerType,
  WorkRestConfig,
  WorkRestMode,
} from "@/types/configure";
import { describe, expect, it } from "vitest";

import {
  createPredefinedStyle,
  getPredefinedStyleById,
  getPredefinedStyles,
  getPredefinedStylesByCategory,
  PREDEFINED_STYLES,
} from "./presets";

describe("presets", () => {
  describe("getPredefinedStyles", () => {
    it("returns all predefined styles", () => {
      const styles = getPredefinedStyles();
      expect(styles).toEqual(PREDEFINED_STYLES);
      expect(styles).toHaveLength(8);
    });

    it("returns array of predefined styles", () => {
      const styles = getPredefinedStyles();
      expect(Array.isArray(styles)).toBe(true);

      styles.forEach((style) => {
        expect(style).toHaveProperty("id");
        expect(style).toHaveProperty("name");
        expect(style).toHaveProperty("description");
        expect(style).toHaveProperty("category");
        expect(style).toHaveProperty("isBuiltIn");
        expect(style).toHaveProperty("config");
      });
    });
  });

  describe("getPredefinedStyleById", () => {
    it("returns style by ID", () => {
      const styles = getPredefinedStyles();
      const firstStyle = styles[0];

      const found = getPredefinedStyleById(firstStyle.id);
      expect(found).toEqual(firstStyle);
    });

    it("returns undefined for non-existent ID", () => {
      const found = getPredefinedStyleById("non-existent-id");
      expect(found).toBeUndefined();
    });
  });

  describe("getPredefinedStylesByCategory", () => {
    it("filters styles by category", () => {
      const cardioStyles = getPredefinedStylesByCategory(TimerCategory.CARDIO);
      const strengthStyles = getPredefinedStylesByCategory(TimerCategory.STRENGTH);
      const flexibilityStyles = getPredefinedStylesByCategory(TimerCategory.FLEXIBILITY);

      expect(cardioStyles.every((style) => style.category === TimerCategory.CARDIO)).toBe(true);
      expect(strengthStyles.every((style) => style.category === TimerCategory.STRENGTH)).toBe(true);
      expect(flexibilityStyles.every((style) => style.category === TimerCategory.FLEXIBILITY)).toBe(
        true,
      );
    });

    it("returns empty array for category with no styles", () => {
      const sportsStyles = getPredefinedStylesByCategory(TimerCategory.SPORTS);
      expect(sportsStyles).toEqual([]);
    });

    it("returns correct counts for each category", () => {
      const cardioStyles = getPredefinedStylesByCategory(TimerCategory.CARDIO);
      const strengthStyles = getPredefinedStylesByCategory(TimerCategory.STRENGTH);
      const flexibilityStyles = getPredefinedStylesByCategory(TimerCategory.FLEXIBILITY);

      expect(cardioStyles).toHaveLength(4); // Tabata, EMOM, HIIT, Stopwatch
      expect(strengthStyles).toHaveLength(3); // E2MOM, Work/Rest Ratio, Work/Rest Fixed
      expect(flexibilityStyles).toHaveLength(1); // Countdown
    });
  });

  describe("createPredefinedStyle", () => {
    it("creates predefined style from config", () => {
      const config = {
        name: "Custom Timer",
        type: TimerType.COUNTDOWN,
        duration: 300,
        completionMessage: "Done!",
      } as CountdownConfig;

      const style = createPredefinedStyle<CountdownConfig>(
        "custom-timer",
        "Custom Timer",
        "A custom countdown timer",
        TimerCategory.CUSTOM,
        config,
      );

      expect(style.id).toBeTruthy();
      expect(style.name).toBe("Custom Timer");
      expect(style.description).toBe("A custom countdown timer");
      expect(style.category).toBe(TimerCategory.CUSTOM);
      expect(style.isBuiltIn).toBe(false);
      expect(style.config.name).toBe("Custom Timer");
      expect(style.config.type).toBe(TimerType.COUNTDOWN);
      expect(style.config.duration).toBe(300);
      expect(style.config.id).toBe("custom-timer");
      expect(style.config.createdAt).toBeInstanceOf(Date);
      expect(style.config.lastUsed).toBeInstanceOf(Date);
    });

    it("generates unique ID for style", () => {
      const config1 = {
        name: "Custom Timer",
        type: TimerType.COUNTDOWN,
        duration: 300,
      } as Omit<CountdownConfig, "id" | "createdAt" | "lastUsed">;

      const config2 = {
        name: "Custom Timer 2",
        type: TimerType.COUNTDOWN,
        duration: 300,
      } as Omit<CountdownConfig, "id" | "createdAt" | "lastUsed">;

      const style1 = createPredefinedStyle<CountdownConfig>(
        "timer-1",
        "Timer 1",
        "Description 1",
        TimerCategory.CUSTOM,
        config1,
      );

      const style2 = createPredefinedStyle<CountdownConfig>(
        "timer-2",
        "Timer 2",
        "Description 2",
        TimerCategory.CUSTOM,
        config2,
      );

      expect(style1.id).not.toBe(style2.id);
    });

    it("handles interval timer config", () => {
      const config = {
        name: "Custom Interval",
        type: TimerType.INTERVAL,
        workDuration: 45,
        restDuration: 15,
        intervals: 6,
        workLabel: "Work",
        restLabel: "Rest",
        skipLastRest: false,
      } as Omit<IntervalConfig, "id" | "createdAt" | "lastUsed">;

      const style = createPredefinedStyle<IntervalConfig>(
        "custom-interval",
        "Custom Interval",
        "A custom interval timer",
        TimerCategory.CUSTOM,
        config,
      );

      expect(style.config.type).toBe(TimerType.INTERVAL);
      expect(style.config.workDuration).toBe(45);
      expect(style.config.restDuration).toBe(15);
      expect(style.config.intervals).toBe(6);
    });

    it("handles work/rest timer config", () => {
      const config = {
        name: "Custom Work/Rest",
        type: TimerType.WORKREST,
        ratio: 3.0,
        maxWorkTime: 600,
        maxRounds: 12,
        restMode: WorkRestMode.RATIO,
      } as Omit<WorkRestConfig, "id" | "createdAt" | "lastUsed">;

      const style = createPredefinedStyle<WorkRestConfig>(
        "custom-workrest",
        "Custom Work/Rest",
        "A custom work/rest timer",
        TimerCategory.CUSTOM,
        config,
      );

      expect(style.config.type).toBe(TimerType.WORKREST);
      expect(style.config.ratio).toBe(3.0);
      expect(style.config.maxWorkTime).toBe(600);
      expect(style.config.maxRounds).toBe(12);
      expect(style.config.restMode).toBe("ratio");
    });
  });

  describe("PREDEFINED_STYLES", () => {
    it("contains all expected timer types", () => {
      const types = new Set(PREDEFINED_STYLES.map((style) => style.config.type));

      expect(types.has(TimerType.COUNTDOWN)).toBe(true);
      expect(types.has(TimerType.STOPWATCH)).toBe(true);
      expect(types.has(TimerType.INTERVAL)).toBe(true);
      expect(types.has(TimerType.WORKREST)).toBe(true);
    });

    it("contains all expected categories", () => {
      const categories = new Set(PREDEFINED_STYLES.map((style) => style.category));

      expect(categories.has(TimerCategory.CARDIO)).toBe(true);
      expect(categories.has(TimerCategory.STRENGTH)).toBe(true);
      expect(categories.has(TimerCategory.FLEXIBILITY)).toBe(true);
    });

    it("all built-in styles are marked as built-in", () => {
      PREDEFINED_STYLES.forEach((style) => {
        expect(style.isBuiltIn).toBe(true);
      });
    });

    it("Tabata config is correct", () => {
      const tabata = PREDEFINED_STYLES.find((style) => style.name === "Tabata");
      expect(tabata).toBeTruthy();
      expect(tabata?.config.type).toBe(TimerType.INTERVAL);
      expect((tabata?.config as IntervalConfig).workDuration).toBe(20);
      expect((tabata?.config as IntervalConfig).restDuration).toBe(10);
      expect((tabata?.config as IntervalConfig).intervals).toBe(8);
      expect((tabata?.config as IntervalConfig).skipLastRest).toBe(true);
      expect(tabata?.category).toBe(TimerCategory.CARDIO);
    });

    it("EMOM config is correct", () => {
      const emom = PREDEFINED_STYLES.find((style) => style.name === "EMOM (10 min)");
      expect(emom).toBeTruthy();
      expect(emom?.config.type).toBe(TimerType.INTERVAL);
      expect((emom?.config as IntervalConfig).workDuration).toBe(60);
      expect((emom?.config as IntervalConfig).restDuration).toBe(0);
      expect((emom?.config as IntervalConfig).intervals).toBe(10);
      expect(emom?.category).toBe(TimerCategory.CARDIO);
    });

    it("E2MOM config is correct", () => {
      const e2mom = PREDEFINED_STYLES.find((style) => style.name === "E2MOM (5 rounds)");
      expect(e2mom).toBeTruthy();
      expect(e2mom?.config.type).toBe(TimerType.INTERVAL);
      expect((e2mom?.config as IntervalConfig).workDuration).toBe(60);
      expect((e2mom?.config as IntervalConfig).restDuration).toBe(60);
      expect((e2mom?.config as IntervalConfig).intervals).toBe(5);
      expect(e2mom?.category).toBe(TimerCategory.STRENGTH);
    });

    it("HIIT config is correct", () => {
      const hiit = PREDEFINED_STYLES.find((style) => style.name === "HIIT");
      expect(hiit).toBeTruthy();
      expect(hiit?.config.type).toBe(TimerType.INTERVAL);
      expect((hiit?.config as IntervalConfig).workDuration).toBe(30);
      expect((hiit?.config as IntervalConfig).restDuration).toBe(30);
      expect((hiit?.config as IntervalConfig).intervals).toBe(10);
      expect(hiit?.category).toBe(TimerCategory.CARDIO);
    });

    it("Countdown config is correct", () => {
      const countdown = PREDEFINED_STYLES.find((style) => style.name === "Countdown (5 min)");
      expect(countdown).toBeTruthy();
      expect(countdown?.config.type).toBe(TimerType.COUNTDOWN);
      expect((countdown?.config as CountdownConfig).duration).toBe(300);
      expect((countdown?.config as CountdownConfig).completionMessage).toBe("Time is up!");
      expect(countdown?.category).toBe(TimerCategory.FLEXIBILITY);
    });

    it("Stopwatch config is correct", () => {
      const stopwatch = PREDEFINED_STYLES.find(
        (style) => style.name === "Stopwatch (10 min limit)",
      );
      expect(stopwatch).toBeTruthy();
      expect(stopwatch?.config.type).toBe(TimerType.STOPWATCH);
      expect((stopwatch?.config as StopwatchConfig).timeLimit).toBe(600);
      expect((stopwatch?.config as StopwatchConfig).completionMessage).toBe("Time limit reached");
      expect(stopwatch?.category).toBe(TimerCategory.CARDIO);
    });

    it("Work/Rest Ratio config is correct", () => {
      const ratio = PREDEFINED_STYLES.find((style) => style.name === "Work/Rest (1:1 ratio)");
      expect(ratio).toBeTruthy();
      expect(ratio?.config.type).toBe(TimerType.WORKREST);
      expect((ratio?.config as WorkRestConfig).ratio).toBe(1.0);
      expect((ratio?.config as WorkRestConfig).restMode).toBe("ratio");
      expect(ratio?.category).toBe(TimerCategory.STRENGTH);
    });

    it("Work/Rest Fixed config is correct", () => {
      const fixed = PREDEFINED_STYLES.find((style) => style.name === "Work/Rest (Fixed 30s rest)");
      expect(fixed).toBeTruthy();
      expect(fixed?.config.type).toBe(TimerType.WORKREST);
      expect((fixed?.config as WorkRestConfig).restMode).toBe("fixed");
      expect((fixed?.config as WorkRestConfig).fixedRestDuration).toBe(30);
      expect(fixed?.category).toBe(TimerCategory.STRENGTH);
    });
  });
});
