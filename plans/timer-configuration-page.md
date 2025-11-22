# Timer Configuration Page - Implementation Plan

## Overview
Create a comprehensive timer configuration page that allows users to select and configure different types of timers, track recent usage, and access predefined timer styles.

## Feature Requirements

### 1. Page Structure
The configuration page should consist of three main sections:
- **Recent Timers** - Display the 10 most recently used unique timer configurations
- **Timer Types** - List of available timer types for custom configuration
- **Predefined Styles** - Quick access to popular timer protocols (Tabata, EMOM, E2MOM)

### 2. Recent Timers Section
- **Purpose**: Quickly access previously used timer configurations
- **Requirements**:
  - Display up to 10 most recent unique timer configurations
  - Uniqueness determined by timer type AND settings
  - Show timer type, key settings, and last used date
  - One-click start functionality
  - Option to remove from recent list
  - Clear all recent timers option
- **Responsive Design**:
  - **Laptop (1024px+)**: All 10 timers visible horizontally
  - **Tablet (768px-1023px)**: 5-6 timers visible with horizontal scroll
  - **Phone (<768px)**: 3 most recent timers visible with horizontal scroll
  - Smooth horizontal scrolling with snap behavior
  - Visual indicators for additional timers (fade/scroll hint)

### 3. Timer Types Section
- **Purpose**: Configure new timers from scratch
- **Available Types**:
  - **Countdown Timer** - Simple countdown with duration
  - **Stopwatch** - Count-up timer with optional time limit
  - **Interval Timer** - Work/Rest cycles with configurable intervals
  - **Work/Rest Timer** - Ratio-based work/rest timer (from existing spec)
  - **Complex Timer** - Multi-sequence timer combining different timer types

### 4. Complex Timer Details
- **Purpose**: Create sophisticated workout sequences by combining different timer types
- **Description**: A complex timer allows users to build multiphase workouts by chaining together different timer types, each with their own settings and labels. This is ideal for structured training sessions that require different timing mechanisms throughout the workout.
- **Use Cases**:
  - Warm-up → Main workout → Cool-down sequences
  - Training sessions with different timing phases (e.g., EMOM followed by AMRAP)
  - Structured class workouts with multiple segments
  - Personalized workout routines with varied timing requirements
- **Example Workflow**:
  ```
  Phase 1: Stopwatch (10 min limit) - "Warm Up"
  Phase 2: Timer (3 min) - "Rest"
  Phase 3: Interval (10 rounds: 90s work / 60s rest) - "Main Set"
  Phase 4: Stopwatch (8 min limit) - "Recovery"
  Phase 5: Stopwatch (20 min limit) - "Metcon"
  ```
- **Features**:
  - Unlimited phases/segments
  - Each phase can be any timer type (Countdown, Stopwatch, Interval, Work/Rest)
  - Custom labels for each phase
  - Automatic progression between phases
  - Ability to skip phases during execution
  - Phase-specific completion messages
  - Overall workout progress tracking
  - **Overall Time Limit**: Optional soft time limit (e.g., 1 hour)
  - **Limit Behavior**: When overall limit is reached, user can choose to:
    - End the complex timer immediately
    - Continue running until all phases complete
    - Set default behavior to always prompt, always continue, or always stop

### 5. Predefined Styles Section
- **Purpose**: Quick access to popular workout protocols and user-saved configurations
- **Included Styles**:
  - **Tabata** - 8 rounds: 20s work, 10s rest, 8 cycles
  - **EMOM** (Every Minute On The Minute) - 10 rounds: 1 minute work, 0s rest
  - **E2MOM** (Every 2 Minutes On The Minute) - 5 rounds: 1 minute work, 1-minute rest
  - **HIIT** - 10 rounds: 30s work, 30s rest
  - **User-Saved Styles** - Custom timers saved by the user
- **Features**:
  - **Start Immediately**: One-click start with predefined configuration
  - **Edit Before Start**: Modify settings before launching the timer
  - **Save as Predefined**: Save any configured timer as a new predefined style
  - **Preview Configuration**: Show key settings before starting
  - **Quick Actions**: Start, Edit, Copy, and Delete options for each style

## Technical Architecture

### 1. File Structure
```
src/
├── app/
│   └── configure/
│       └── page.tsx                 # Main configuration page
├── components/
│   ├── configure/
│   │   ├── RecentTimers.tsx         # Recent timers section
│   │   ├── RecentTimers.spec.ts     # Tests for RecentTimers
│   │   ├── RecentTimers.stories.ts  # Storybook stories
│   │   ├── TimerTypeSelector.tsx    # Timer type selection
│   │   ├── TimerTypeSelector.spec.ts # Tests for TimerTypeSelector
│   │   ├── TimerTypeSelector.stories.ts # Storybook stories
│   │   ├── PredefinedStyles.tsx     # Predefined timer styles
│   │   ├── PredefinedStyles.spec.ts # Tests for PredefinedStyles
│   │   ├── PredefinedStyles.stories.ts # Storybook stories
│   │   ├── TimerConfigForm.tsx      # Dynamic configuration form
│   │   ├── TimerConfigForm.spec.ts  # Tests for TimerConfigForm
│   │   └── TimerConfigForm.stories.ts # Storybook stories
│   └── (existing components...)
├── lib/
│   ├── configure/
│   │   ├── types.ts                 # Configuration types
│   │   ├── storage.ts               # Local storage management
│   │   ├── storage.spec.ts          # Tests for storage utilities
│   │   ├── presets.ts               # Predefined timer configurations
│   │   ├── presets.spec.ts          # Tests for presets
│   │   ├── utils.ts                 # Helper functions
│   │   └── utils.spec.ts            # Tests for utils
│   └── (existing libs...)
├── .storybook/
│   ├── main.ts                      # Storybook configuration
│   ├── preview.ts                   # Storybook preview
│   └── vitest.setup.ts              # Test setup for Storybook
└── types/
    └── configure.ts                 # Global type definitions
```

### 2. Data Models

#### Timer Type Enums (leveraging existing enums where possible)
```tsx
// Import existing enums from src/lib/timer/types.ts
import { TimerState, TimerPhase } from '@/lib/timer/types';

// New enum for timer types (doesn't exist in current codebase)
export enum TimerType {
  COUNTDOWN = 'countdown',
  STOPWATCH = 'stopwatch', 
  INTERVAL = 'interval',
  WORKREST = 'workrest',
  COMPLEX = 'complex',
}

// New enum for predefined style categories
export enum TimerCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  USER = 'user',
}

// New enum for work/rest timer modes
export enum WorkRestMode {
  RATIO = 'ratio',
  FIXED = 'fixed',
}

// New enum for overall limit behavior for complex timers
export enum OverallLimitBehavior {
  PROMPT = 'prompt',      // Ask user what to do
  CONTINUE = 'continue',  // Continue running until all phases complete
  STOP = 'stop',         // End complex timer immediately
}
```

#### Timer Configuration Types
```tsx
// Base timer configuration
export interface BaseTimerConfig {
  id: string; // Generated by TimerConfigHash.generateTimerId() when needed
  name: string;
  type: TimerType; // Using enum instead of string literal
  createdAt: Date;
  lastUsed: Date;
  countdownBeforeStart?: number; // NEW: Countdown seconds before timer starts (default: 10)
}

// Specific timer configurations (aligned with existing component props)
export interface CountdownConfig extends BaseTimerConfig {
  type: TimerType.COUNTDOWN; // Using enum
  duration: number; // seconds (maps to TimerProps.duration)
  completionMessage?: string; // maps to TimerProps.completionMessage
}

export interface StopwatchConfig extends BaseTimerConfig {
  type: TimerType.STOPWATCH; // Using enum
  timeLimit?: number; // seconds (maps to StopwatchProps.timeLimit, default: 0 = unlimited)
  completionMessage?: string; // maps to StopwatchProps.completionMessage
}

export interface IntervalConfig extends BaseTimerConfig {
  type: TimerType.INTERVAL; // Using enum
  workDuration: number; // seconds (maps to IntervalConfig.workDuration)
  restDuration: number; // seconds (maps to IntervalConfig.restDuration)
  intervals: number; // maps to IntervalConfig.intervals
  workLabel?: string; // maps to IntervalConfig.workLabel
  restLabel?: string; // maps to IntervalConfig.restLabel
  skipLastRest?: boolean; // maps to IntervalConfig.skipLastRest
}

export interface WorkRestConfig extends BaseTimerConfig {
  type: TimerType.WORKREST; // Using enum
  ratio: number; // work/rest multiplier (0.01-100.0, stored as integer * 100 per spec)
  maxWorkTime?: number; // seconds (max 5999 = 99:59, from work-rest spec)
  maxRounds?: number; // maximum rounds (max 1000, from work-rest spec)
  restMode: WorkRestMode; // NEW: How rest duration is calculated (using enum)
  fixedRestDuration?: number; // seconds - only used when restMode is WorkRestMode.FIXED
}

// Constants for timer configuration
export const TIMER_CONSTANTS = {
  DEFAULT_COUNTDOWN_SECONDS: 10,
  MAX_COUNTDOWN_SECONDS: 60,
  DEFAULT_FIXED_REST_SECONDS: 60,
  MAX_WORK_TIME_SECONDS: 5999, // 99:59 per spec
  MAX_ROUNDS: 1000, // per spec
  STORAGE_CLEANUP_MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  DEFAULT_INTERVALS: 10,
  DEFAULT_WORK_DURATION: 90, // seconds
  DEFAULT_REST_DURATION: 60, // seconds
  DEFAULT_STOPWATCH_LIMIT: 600, // 10 minutes
  DEFAULT_WORKREST_RATIO: 1.0,
  DEFAULT_MAX_WORK_TIME: 1800, // 30 minutes
  DEFAULT_MAX_ROUNDS: 20,
} as const;

// Complex timer phase configuration
export interface ComplexTimerPhase {
  id: string;
  name: string; // Phase label (e.g., "Warm Up", "Main Set")
  type: TimerType.COUNTDOWN | TimerType.STOPWATCH | TimerType.INTERVAL | TimerType.WORKREST; // Using enums
  config: CountdownConfig | StopwatchConfig | IntervalConfig | WorkRestConfig;
  order: number;
}

// Complex timer configuration with multiple phases
export interface ComplexConfig extends BaseTimerConfig {
  type: TimerType.COMPLEX; // Using enum
  phases: ComplexTimerPhase[];
  autoProgress: boolean; // Automatically move to next phase
  allowSkipPhase: boolean; // Allow skipping current phase
  showOverallProgress: boolean; // Show overall workout progress
  overallTimeLimit?: number; // Soft time limit in seconds (e.g., 3600 for 1 hour)
  overallLimitBehavior: OverallLimitBehavior; // Using enum instead of string literal
}

export type TimerConfig = CountdownConfig | StopwatchConfig | IntervalConfig | WorkRestConfig | ComplexConfig;

// Recent timer entry
export interface RecentTimer {
  config: TimerConfig;
  lastUsed: Date;
  usageCount: number;
}

// Predefined style (aligned with existing component props)
export interface PredefinedStyle {
  id: string;
  name: string;
  description: string;
  category: TimerCategory; // Using enum instead of string literal
  config: TimerConfig;
  icon?: string;
  isBuiltIn?: boolean; // Distinguish built-in from user-saved
  createdAt?: Date; // For user-saved styles
}

// Component Props Alignment (maps configuration to existing component interfaces)
export interface ComponentPropsMapping {
  // Timer component props (from src/components/Timer.tsx)
  timer: {
    duration: number;
    label?: string;
    completionMessage?: string;
    onStateChange?: (state: TimerState) => void; // Using existing enum
  };
  
  // Stopwatch component props (from src/components/Stopwatch.tsx)
  stopwatch: {
    label?: string;
    timeLimit?: number;
    onStateChange?: (state: TimerState) => void; // Using existing enum
    completionMessage?: string;
  };
  
  // Interval component props (from src/components/Interval.tsx)
  interval: {
    intervalConfig: {
      workDuration: number;
      restDuration: number;
      intervals: number;
      workLabel?: string;
      restLabel?: string;
      skipLastRest?: boolean;
      onWorkStepComplete?: (time: number) => void;
      onStepChange?: (step: TimerStep | null, stepIndex: number) => void;
      onSequenceComplete?: () => void;
    };
  };
  
  // WorkRestTimer component props (from src/components/WorkRestTimer.tsx)
  workrest: {
    className?: string;
    // Note: WorkRestTimer currently manages its own state internally
    // Would need modification to accept initial configuration
  };
}

// Configuration conversion utilities
export const convertConfigToComponentProps = {
  countdown: (config: CountdownConfig) => ({
    duration: config.duration,
    label: config.name,
    completionMessage: config.completionMessage,
  }),
  
  stopwatch: (config: StopwatchConfig) => ({
    label: config.name,
    timeLimit: config.timeLimit || 0, // 0 = unlimited per existing implementation
    completionMessage: config.completionMessage,
  }),
  
  interval: (config: IntervalConfig) => ({
    intervalConfig: {
      workDuration: config.workDuration,
      restDuration: config.restDuration,
      intervals: config.intervals,
      workLabel: config.workLabel,
      restLabel: config.restLabel,
      skipLastRest: config.skipLastRest,
    },
  }),
  
  workrest: (config: WorkRestConfig) => ({
    // WorkRestTimer would need to be enhanced to accept initial config
    // Currently only accepts className prop
    className: undefined,
  }),
};

// Timer configuration hashing utilities
export const TimerConfigHash = {
  /**
   * Creates a consistent hash signature for timer configuration
   * Used ONLY during save operations to detect duplicates
   * Performance optimized for infrequent save operations, not runtime comparisons
   */
  createHash: (config: TimerConfig): string => {
    // Normalize configuration by ordering properties consistently
    const normalizedConfig = TimerConfigHash.normalizeConfig(config);
    
    // Stringify the normalized configuration
    const configString = JSON.stringify(normalizedConfig);
    
    // Create hash using a simple but effective algorithm
    return TimerConfigHash.simpleHash(configString);
  },

  /**
   * Normalizes timer configuration by ordering properties consistently
   * This ensures identical configurations produce the same hash regardless of property order
   * Only called during save operations, not during timer creation or execution
   */
  normalizeConfig: (config: TimerConfig): any => {
    const baseConfig = {
      type: config.type,
      name: config.name?.trim(), // Normalize whitespace
    };

    switch (config.type) {
      case TimerType.COUNTDOWN:
        return {
          ...baseConfig,
          duration: config.duration,
          completionMessage: config.completionMessage?.trim(), 
        };

      case TimerType.STOPWATCH:
        return {
          ...baseConfig,
          timeLimit: config.timeLimit, 
          completionMessage: config.completionMessage?.trim(), 
        };

      case TimerType.INTERVAL:
        return {
          ...baseConfig,
          workDuration: config.workDuration,
          restDuration: config.restDuration,
          intervals: config.intervals,
          workLabel: config.workLabel?.trim(), 
          restLabel: config.restLabel?.trim(), 
          skipLastRest: config.skipLastRest, 
        };

      case TimerType.WORKREST:
        return {
          ...baseConfig,
          ratio: config.ratio,
          maxWorkTime: config.maxWorkTime, 
          maxRounds: config.maxRounds, 
          restMode: config.restMode || WorkRestMode.RATIO, // Default only for enum
          fixedRestDuration: config.restMode === WorkRestMode.FIXED ? config.fixedRestDuration : undefined,
        };

      case TimerType.COMPLEX:
        return {
          ...baseConfig,
          phases: config.phases
            .map(phase => ({
              name: phase.name?.trim(),
              type: phase.type,
              order: phase.order,
              config: TimerConfigHash.normalizeConfig(phase.config),
            }))
            .sort((a, b) => a.order - b.order), // Ensure consistent ordering
          autoProgress: config.autoProgress || false,
          allowSkipPhase: config.allowSkipPhase || false,
          showOverallProgress: config.showOverallProgress || false,
          overallTimeLimit: config.overallTimeLimit,
          overallLimitBehavior: config.overallLimitBehavior || OverallLimitBehavior.CONTINUE,
        };

      default:
        throw new Error(`Unknown timer type: ${config.type}`);
    }
  },

  /**
   * Simple hash function for creating consistent IDs
   * Uses a variation of the djb2 algorithm for good distribution
   * 
   * Why djb2 instead of MD5/SHA:
   * - Performance: 10-100x faster than crypto hashes
   * - Size: 8-char output vs 32/64 chars for MD5/SHA
   * - Dependencies: No crypto libraries needed
   * - Scale: Sufficient for timer app (50% collision at 65K configs)
   * - Use case: Non-security, performance-critical timer identification
   * 
   * IMPORTANT: Only called during save operations, not during timer creation/execution
   * 
   * Collision Analysis:
   * - Hash space: 2^32 (4.3B possible values)
   * - 50% collision probability at ~65K unique configs (birthday paradox)
   * - < 0.001% collision probability for typical user scenarios (100-1K configs)
   * - Type prefix in generateTimerId() adds additional collision protection
   * 
   * Alternative: If crypto-level collision resistance is needed,
   * replace with Web Crypto API: await crypto.subtle.digest('SHA-256', data)
   */
  simpleHash: (str: string): string => {
    let hash = 5381;
    
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    
    // Convert to positive hex string and ensure consistent length
    const positiveHash = hash >>> 0; // Convert to unsigned
    return positiveHash.toString(16).padStart(8, '0');
  },

  /**
   * Generates a stable timer ID based on configuration
   * Only called during save operations to create persistent storage IDs
   * Runtime timer creation uses temporary IDs or no IDs at all
   */
  generateTimerId: (config: TimerConfig): string => {
    const hash = TimerConfigHash.createHash(config);
    return `${config.type}-${hash}`;
  },

  /**
   * Checks if a timer configuration already exists by comparing IDs
   * Used ONLY with saved/started timers that already have IDs
   * Much simpler than hash comparison - just check if ID already exists
   */
  isDuplicate: (timerId: string, existingIds: string[]): boolean => {
    return existingIds.includes(timerId);
  },

  /**
   * Legacy comparison function - kept for compatibility but should not be used during runtime
   * Use isDuplicateInRecent() or isDuplicateInPredefined() instead
   */
  areConfigsEqual: (config1: TimerConfig, config2: TimerConfig): boolean => {
    const hash1 = TimerConfigHash.createHash(config1);
    const hash2 = TimerConfigHash.createHash(config2);
    return hash1 === hash2;
  },

  /**
   * Finds duplicate timers in an array
   * Used only for maintenance/cleanup operations, not during normal app usage
   */
  findDuplicates: (configs: TimerConfig[]): Array<{
    config: TimerConfig;
    duplicates: TimerConfig[];
    hash: string;
  }> => {
    const hashMap = new Map<string, TimerConfig[]>();
    
    // Group configs by hash
    configs.forEach(config => {
      const hash = TimerConfigHash.createHash(config);
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash)!.push(config);
    });
    
    // Find groups with duplicates
    return Array.from(hashMap.entries())
      .filter(([_, configs]) => configs.length > 1)
      .map(([hash, configs]) => ({
        config: configs[0], // Original
        duplicates: configs.slice(1), // Duplicates
        hash,
      }));
  },
};

// Timer storage utilities for navigation
export const TimerStorage = {
  /**
   * Stores timer configuration for retrieval by timer pages
   * Uses timer ID from config for efficient lookup
   */
  storeTimerConfig: (config: TimerConfig): string => {
    // ID should already be part of the config at this stage
    const timerId = config.id;
    localStorage.setItem(`timer_${timerId}`, JSON.stringify(config));
    return timerId;
  },

  /**
   * Retrieves timer configuration by ID
   * Returns null if not found, allowing timer pages to handle missing configs
   */
  getTimerConfig: (timerId: string): TimerConfig | null => {
    try {
      const storedConfig = localStorage.getItem(`timer_${timerId}`);
      return storedConfig ? JSON.parse(storedConfig) as TimerConfig : null;
    } catch {
      return null;
    }
  },

  /**
   * Removes timer configuration from storage
   * Called when timer is completed or manually cleaned up
   */
  removeTimerConfig: (timerId: string): void => {
    localStorage.removeItem(`timer_${timerId}`);
  },

  /**
   * Gets all stored timer configurations
   * Used for maintenance and cleanup operations
   */
  getAllStoredTimers: (): Array<{ id: string; config: TimerConfig }> => {
    const timers: Array<{ id: string; config: TimerConfig }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('timer_')) {
        const timerId = key.replace('timer_', '');
        const config = TimerStorage.getTimerConfig(timerId);
        if (config) {
          timers.push({ id: timerId, config });
        }
      }
    }
    
    return timers;
  },

  /**
   * Cleans up old or expired timer configurations
   * Called periodically to prevent storage bloat
   */
  cleanupOldTimers: (maxAge: number = TIMER_CONSTANTS.STORAGE_CLEANUP_MAX_AGE_MS): void => {
    const now = Date.now();
    const timers = TimerStorage.getAllStoredTimers();
    
    timers.forEach(({ id, config }) => {
      const configAge = now - new Date(config.createdAt).getTime();
      if (configAge > maxAge) {
        TimerStorage.removeTimerConfig(id);
      }
    });
  },
};

// Navigation parameters (for passing timer ID to timer pages)
export interface TimerNavigationParams {
  type: TimerType; // Using enum
  id: string; // Timer ID for config retrieval from storage
}
```

#### Component Integration Notes
```tsx
/*
IMPORTANT INTEGRATION REQUIREMENTS:

1. Timer Component (src/components/Timer.tsx):
   - Expects duration in seconds
   - Accepts optional completionMessage
   - Uses useTimer hook with duration * 1000 (milliseconds)
   - Maps config.duration → TimerProps.duration

2. Stopwatch Component (src/components/Stopwatch.tsx):
   - Expects timeLimit in seconds (0 = unlimited)
   - Uses useStopwatch hook with timeLimit * 1000 (milliseconds)
   - Maps config.timeLimit → StopwatchProps.timeLimit

3. Interval Component (src/components/Interval.tsx):
   - Expects intervalConfig object with all timing parameters
   - Uses useIntervalTimer hook
   - Maps all interval config fields directly

4. WorkRestTimer Component (src/components/WorkRestTimer.tsx):
   - CURRENT LIMITATION: Only accepts className prop
   - Manages ratio/state internally with useWorkRestTimer hook
   - WOULD NEED ENHANCEMENT: Accept initial ratio and maxRounds config
   - Current implementation has hardcoded ratio controls

5. Navigation Flow:
   - Configuration page → Timer execution page
   - Pass only timer ID via URL params: `?id=${timerId}`
   - Timer page retrieves full config from localStorage using the ID
   - If timer not found in storage, show alert and redirect back to config page

6. State Management:
   - All timer components use custom hooks from src/lib/timer/
   - Hooks expect milliseconds internally, config stores seconds
   - Conversion: seconds * 1000 = milliseconds
   - Uses existing TimerState and TimerPhase enums from src/lib/timer/types.ts

7. Enum Usage:
   - TimerType: New enum for timer type selection
   - TimerCategory: New enum for predefined style categorization  
   - OverallLimitBehavior: New enum for complex timer limit behavior
   - TimerState, TimerPhase: Imported from existing codebase

8. Timer Configuration Hashing:
   - TimerConfigHash.createHash() generates consistent hash signatures
   - Used ONLY during save operations to detect duplicates, NOT during runtime
   - TimerConfigHash.generateTimerId() creates IDs like "interval-a1b2c3d4"
   - Hash normalization ensures identical configs produce identical hashes
   - Supports duplicate detection without performance impact on timer execution
   - IDs are deterministic: same config always produces same ID

9. Optimized Hashing Strategy:
   - NO hashing during timer creation or execution for maximum performance
   - Hashing ONLY occurs during save operations to generate stable IDs
   - Duplicate detection uses simple ID comparison: `existingIds.includes(newId)`
   - **Duplicate check ONLY when adding to recent timers**, not when saving predefined styles
   - Users can save multiple variations of similar timers as predefined styles
   - Runtime operations use direct config objects without hash overhead
   - Much simpler and faster than hash-based comparison

10. ID Management:
    - Manual ID fields removed from BaseTimerConfig interface
    - IDs generated on-demand using TimerConfigHash.generateTimerId() during saves
    - PredefinedStyle.id generated from config hash for consistency
    - Recent timers use hash-based IDs for duplicate detection
    - Storage operations use hash-based IDs for efficient lookup

11. Configuration Comparison:
    - TimerConfigHash.isDuplicate() uses simple ID array.includes() check
    - **Used ONLY in addRecentTimer() to prevent duplicates in recent list**
    - Predefined styles allow duplicates (users can save similar variations)
    - TimerConfigHash.areConfigsEqual() available but deprecated for runtime use
    - TimerConfigHash.findDuplicates() used only for maintenance operations
    - Performance optimized: ID comparison only during recent timer updates
*/
```

### 3. Storage Strategy

#### Local Storage Schema
```tsx
interface StoredData {
  recentTimers: RecentTimer[];
  userPredefinedStyles: PredefinedStyle[]; // Changed from customPresets
  userPreferences: {
    maxRecentTimers: number;
    defaultTimerType: TimerType;
    showAdvancedOptions: boolean;
  };
}

// Storage keys
const STORAGE_KEYS = {
  RECENT_TIMERS: 'timer_recent_timers',
  USER_PREDEFINED_STYLES: 'timer_user_predefined_styles', // Changed from CUSTOM_PRESETS
  USER_PREFERENCES: 'timer_user_preferences',
} as const;
```

#### Storage Utilities
```tsx
// Storage operations
export const storage = {
  getRecentTimers: (): RecentTimer[] => { /* ... */ },
  
  addRecentTimer: (config: TimerConfig): void => {
    const recentTimers = storage.getRecentTimers();
    
    // Generate ID for the new timer
    const timerId = TimerConfigHash.generateTimerId(config);
    
    // Get existing IDs from recent timers
    const existingIds = recentTimers.map(timer => 
      TimerConfigHash.generateTimerId(timer.config)
    );
    
    // Simple ID-based duplicate check - ONLY when adding to recent timers
    if (TimerConfigHash.isDuplicate(timerId, existingIds)) {
      // Update existing timer's lastUsed and usageCount instead of adding duplicate
      const existingIndex = recentTimers.findIndex(timer => 
        TimerConfigHash.generateTimerId(timer.config) === timerId
      );
      
      if (existingIndex !== -1) {
        recentTimers[existingIndex].lastUsed = new Date();
        recentTimers[existingIndex].usageCount += 1;
        storage.saveRecentTimers(recentTimers);
      }
      return;
    }
    
    // Add new timer
    const newTimer: RecentTimer = {
      config,
      lastUsed: new Date(),
      usageCount: 1,
    };
    
    recentTimers.unshift(newTimer);
    if (recentTimers.length > 10) {
      recentTimers.pop(); // Keep only 10 recent
    }
    
    storage.saveRecentTimers(recentTimers);
  },
  
  removeRecentTimer: (id: string): void => { /* ... */ },
  clearRecentTimers: (): void => { /* ... */ },
  getUserPredefinedStyles: (): PredefinedStyle[] => { /* ... */ }, // Changed from getCustomPresets
  saveUserPredefinedStyle: (style: PredefinedStyle): void => { /* ... */ }, // Changed from saveCustomPreset
  removeUserPredefinedStyle: (id: string): void => { /* ... */ }, // Added remove functionality
  getUserPreferences: (): UserPreferences => { /* ... */ },
  updateUserPreferences: (prefs: Partial<UserPreferences>): void => { /* ... */ },
};
```

## Component Implementation

### 1. Main Configuration Page (`src/app/configure/page.tsx`)
```tsx
export default function ConfigurePage() {
  const [recentTimers, setRecentTimers] = useState<RecentTimer[]>([]);
  const [selectedType, setSelectedType] = useState<TimerType | null>(null);
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <header>
        <h1>Timer Configuration</h1>
        <p>Choose and configure your timer</p>
      </header>
      
      <RecentTimers 
        timers={recentTimers}
        onStartTimer={handleStartTimer}
        onRemoveTimer={handleRemoveTimer}
        onClearAll={handleClearAll}
      />
      
      <TimerTypeSelector 
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />
      
      {selectedType && (
        <TimerConfigForm 
          type={selectedType}
          onSave={handleSaveConfig}
          onStart={handleStartTimer}
        />
      )}
      
      <PredefinedStyles 
        onSelectStyle={handleSelectStyle}
        onCreateCustom={handleCreateCustom}
      />
    </div>
  );
}
```

### 2. Recent Timers Component
```tsx
import cx from "clsx";

interface RecentTimersProps {
  timers: RecentTimer[];
  onStartTimer: (config: TimerConfig) => void;
  onRemoveTimer: (id: string) => void;
  onClearAll: () => void;
}

const RecentTimers = ({
  timers,
  onStartTimer,
  onRemoveTimer,
  onClearAll,
}: RecentTimersProps) => {
  if (timers.length === 0) {
    return <EmptyState message="No recent timers" />;
  }
  
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2>Recent Timers</h2>
        <Button variant="ghost" onClick={onClearAll}>
          Clear All
        </Button>
      </div>
      
      {/* Horizontal scrollable container */}
      <div className="relative">
        {/* Scroll hint gradient on right if there are more timers */}
        {timers.length > 3 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none lg:hidden" />
        )}
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {timers.map((timer, index) => (
            <div 
              key={timer.config.id}
              className="flex-none w-80 snap-start"
              style={{ 
                // Responsive width: laptop shows all, tablet 5-6, phone 3
                minWidth: index < 3 ? '280px' : '280px' // Always consistent width
              }}
            >
              <TimerCard
                timer={timer}
                onStart={() => onStartTimer(timer.config)}
                onRemove={() => onRemoveTimer(timer.config.id)}
                compact={true} // Use compact design for horizontal layout
              />
            </div>
          ))}
        </div>
        
        {/* Scroll indicators for mobile */}
        <div className="flex justify-center mt-2 gap-1 lg:hidden">
          {timers.map((_, index) => (
            <div
              key={index}
              className={cx(
                "h-1 w-8 rounded-full transition-colors",
                {
                  "bg-blue-500": index < 3,
                  "bg-gray-300": index >= 3,
                }
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
```

#### Responsive TimerCard Component
```tsx
import cx from "clsx";

interface TimerCardProps {
  timer: RecentTimer;
  onStart: () => void;
  onRemove: () => void;
  compact?: boolean; // For horizontal layout
}

const TimerCard = ({
  timer,
  onStart,
  onRemove,
  compact = false,
}: TimerCardProps) => {
  const config = timer.config;
  
  return (
    <Card className={cx("relative group hover:shadow-md transition-shadow", {
      "p-4": compact,
      "p-6": !compact,
    })}>
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove timer"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Timer type icon */}
      <div className="flex items-center gap-3 mb-3">
        <TimerTypeIcon type={config.type} className="h-8 w-8" />
        <div>
          <h3 className="font-semibold">{config.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{config.type}</p>
        </div>
      </div>
      
      {/* Timer configuration summary */}
      <div className="text-sm text-gray-700 mb-4">
        {getConfigSummary(config)}
      </div>
      
      {/* Last used info */}
      <div className="text-xs text-gray-500 mb-4">
        Last used: {formatRelativeTime(timer.lastUsed)}
      </div>
      
      {/* Start button */}
      <Button onClick={onStart} className="w-full">
        Start Timer
      </Button>
    </Card>
  );
};
```

#### CSS Utilities for Horizontal Scrolling

**Note**: In Tailwind v4, you don't need custom CSS for scrollbars! Use arbitrary variants:

**Hide scrollbar while keeping scroll functionality:**
```tsx
<div className="[&::-webkit-scrollbar]:hidden scrollbar-width-none overflow-x-auto">
  <!-- scrollable content -->
</div>
```

**Built-in scroll snap utilities:**
- `snap-x` - Horizontal scroll snapping
- `snap-mandatory` - Force snap to points  
- `snap-start` - Snap alignment
- `snap-center` - Center alignment
- `snap-end` - End alignment

**Complete example:**
```tsx
<div className="snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-width-none">
  <div className="snap-start min-w-full">Timer 1</div>
  <div className="snap-start min-w-full">Timer 2</div>
  <div className="snap-start min-w-full">Timer 3</div>
</div>
```

**No custom CSS needed!** All utilities are built-in or available via arbitrary values.

### 3. Timer Type Selector
```tsx
import cx from "clsx";
import { TimerType } from '@/types/configure';

const TIMER_TYPES = [
  { type: TimerType.COUNTDOWN, name: 'Countdown', description: 'Simple countdown timer' },
  { type: TimerType.STOPWATCH, name: 'Stopwatch', description: 'Count-up timer with optional limit' },
  { type: TimerType.INTERVAL, name: 'Interval', description: 'Work/rest cycles' },
  { type: TimerType.WORKREST, name: 'Work/Rest Ratio', description: 'Ratio-based timer' },
  { type: TimerType.COMPLEX, name: 'Complex', description: 'Multi-sequence timer combining different types' },
] as const;

const TimerTypeSelector = ({
  selectedType,
  onTypeSelect,
}: TimerTypeSelectorProps) => (
  <section>
    <h2>Timer Type</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {TIMER_TYPES.map(({ type, name, description }) => (
        <Card
          key={type}
          className={cx("cursor-pointer transition-colors", {
            "ring-2 ring-blue-500": selectedType === type,
          })}
          onClick={() => onTypeSelect(type)}
        >
          <h3>{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </Card>
      ))}
    </div>
  </section>
);
```

### 7. Dynamic Configuration Form
```tsx
interface TimerConfigFormProps {
  type: TimerType;
  initialConfig?: Partial<TimerConfig>;
  isPredefined?: boolean;
  onSave?: (config: TimerConfig) => void;
  onSaveAsPredefined?: (config: TimerConfig) => void;
  onStart: (config: TimerConfig, isPredefined?: boolean) => void;
}

// Timer configuration form with optimized duplicate detection
const TimerConfigForm = ({
  type,
  initialConfig,
  isPredefined = false,
  onSave,
  onSaveAsPredefined,
  onStart,
}: TimerConfigFormProps) => {
  const [config, setConfig] = useState<Partial<TimerConfig>>(initialConfig || {});
  
  const updateCommonConfig = (commonConfig: Partial<BaseTimerConfig>) => {
    setConfig(prev => ({ ...prev, ...commonConfig }));
  };
  
  const updateTypeConfig = (typeConfig: Partial<TimerConfig>) => {
    setConfig(prev => ({ ...prev, ...typeConfig }));
  };
  
  const renderFormFields = () => {
    switch (type) {
      case TimerType.COUNTDOWN:
        return <CountdownFields config={config} onChange={updateTypeConfig} />;
      case TimerType.STOPWATCH:
        return <StopwatchFields config={config} onChange={updateTypeConfig} />;
      case TimerType.INTERVAL:
        return <IntervalFields config={config} onChange={updateTypeConfig} />;
      case TimerType.WORKREST:
        return <WorkRestFields config={config} onChange={updateTypeConfig} />;
      case TimerType.COMPLEX:
        return <ComplexFields config={config} onChange={updateTypeConfig} />;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config && onStart) {
      // NO HASHING during timer creation/execution
      // Pass config directly to timer execution
      onStart(config as TimerConfig);
    }
  };
  
  const handleSave = () => {
    if (config && onSaveAsPredefined) {
      // Save predefined style - NO duplicate check needed
      // Users can save multiple variations of similar timers
      const fullConfig: TimerConfig = {
        ...config,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as TimerConfig;
      
      onSaveAsPredefined(fullConfig);
    } else if (config && onSave) {
      onSave(config as TimerConfig);
    }
  };
  
  return (
    <Card>
      <h3>Configure {type} Timer</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common fields for all timer types */}
        <CommonFields 
          config={config} 
          onChange={updateCommonConfig} 
        />
        
        {/* Type-specific fields */}
        {renderFormFields()}
        
        <div className="flex gap-2">
          <Button type="submit">Start Timer</Button>
          {!isPredefined && (
            <Button type="button" variant="outline" onClick={handleSave}>
              Save as Predefined
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};
```

### 5. Common Timer Fields
```tsx
interface CommonFieldsProps {
  config: Partial<BaseTimerConfig>;
  onChange: (config: Partial<BaseTimerConfig>) => void;
}

const CommonFields = ({
  config,
  onChange,
}: CommonFieldsProps) => {
  const updateConfig = (updates: Partial<BaseTimerConfig>) => {
    onChange({ ...config, ...updates });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Timer Name
        </label>
        <input
          type="text"
          value={config.name || ''}
          onChange={(e) => updateConfig({ name: e.target.value })}
          placeholder="Enter timer name"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Countdown Before Start (seconds)
        </label>
        <input
          type="number"
          min="0"
          max={TIMER_CONSTANTS.MAX_COUNTDOWN_SECONDS}
          value={config.countdownBeforeStart || ''}
          onChange={(e) => updateConfig({ countdownBeforeStart: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full border rounded px-3 py-2"
          placeholder="Optional: Enter countdown seconds"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional countdown time before timer starts. Leave empty for no countdown.
          For interval and complex timers, this applies only before the overall timer starts.
        </p>
      </div>
    </div>
  );
};
```

### 6. Work/Rest Timer Fields
```tsx
interface WorkRestFieldsProps {
  config: Partial<WorkRestConfig>;
  onChange: (config: Partial<WorkRestConfig>) => void;
}

const WorkRestFields = ({
  config,
  onChange,
}: WorkRestFieldsProps) => {
  const [restMode, setRestMode] = useState<WorkRestMode>(config.restMode || WorkRestMode.RATIO);
  
  const updateConfig = (updates: Partial<WorkRestConfig>) => {
    onChange({ ...config, ...updates });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Work/Rest Ratio
        </label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="100"
          value={config.ratio || TIMER_CONSTANTS.DEFAULT_WORKREST_RATIO}
          onChange={(e) => updateConfig({ ratio: parseFloat(e.target.value) })}
          className="w-full border rounded px-3 py-2"
          disabled={restMode === WorkRestMode.FIXED}
        />
        <p className="text-xs text-gray-500 mt-1">
          {restMode === WorkRestMode.RATIO 
            ? `Rest duration = Work time ÷ ${config.ratio || TIMER_CONSTANTS.DEFAULT_WORKREST_RATIO}`
            : 'Ratio is disabled when using fixed rest duration'
          }
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Rest Duration Mode
        </label>
        <select
          value={restMode}
          onChange={(e) => {
            const newMode = e.target.value as WorkRestMode;
            setRestMode(newMode);
            updateConfig({ 
              restMode: newMode,
              fixedRestDuration: newMode === WorkRestMode.FIXED ? (config.fixedRestDuration || TIMER_CONSTANTS.DEFAULT_FIXED_REST_SECONDS) : undefined
            });
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="ratio">Ratio-based (Work time ÷ ratio)</option>
          <option value="fixed">Fixed duration</option>
        </select>
      </div>
      
      {restMode === WorkRestMode.FIXED && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Fixed Rest Duration (seconds)
          </label>
          <input
            type="number"
            min="1"
            max="3600"
            value={config.fixedRestDuration || TIMER_CONSTANTS.DEFAULT_FIXED_REST_SECONDS}
            onChange={(e) => updateConfig({ fixedRestDuration: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Fixed rest time regardless of work duration
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Max Work Time (seconds)
          </label>
          <input
            type="number"
            min="1"
            max={TIMER_CONSTANTS.MAX_WORK_TIME_SECONDS}
            value={config.maxWorkTime || TIMER_CONSTANTS.DEFAULT_MAX_WORK_TIME}
            onChange={(e) => updateConfig({ maxWorkTime: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum work duration per round
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Max Rounds
          </label>
          <input
            type="number"
            min="1"
            max={TIMER_CONSTANTS.MAX_ROUNDS}
            value={config.maxRounds || TIMER_CONSTANTS.DEFAULT_MAX_ROUNDS}
            onChange={(e) => updateConfig({ maxRounds: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum number of work/rest cycles
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded text-sm">
        <p className="font-medium mb-1">How it works:</p>
        <ul className="text-xs space-y-1">
          <li>• <strong>Ratio mode:</strong> Rest = Work time ÷ Ratio (e.g., 60s work ÷ 2.0 ratio = 30s rest)</li>
          <li>• <strong>Fixed mode:</strong> Rest is always the same duration regardless of work time</li>
          <li>• Timer continues until max work time or max rounds is reached</li>
        </ul>
      </div>
    </div>
  );
};
```

### 6. Complex Timer Configuration Component
```tsx
interface ComplexFieldsProps {
  config: Partial<ComplexConfig>;
  onChange: (config: Partial<ComplexConfig>) => void;
}

const ComplexFields = ({
  config,
  onChange,
}: ComplexFieldsProps) => {
  const [phases, setPhases] = useState<ComplexTimerPhase[]>(config.phases || []);
  const [newPhaseType, setNewPhaseType] = useState<'countdown' | 'stopwatch' | 'interval' | 'workrest'>('countdown');
  
  const addPhase = () => {
    const newPhase: ComplexTimerPhase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${phases.length + 1}`,
      type: newPhaseType,
      config: getDefaultConfigForType(newPhaseType),
      order: phases.length,
    };
    
    const updatedPhases = [...phases, newPhase];
    setPhases(updatedPhases);
    onChange({ ...config, phases: updatedPhases });
  };
  
  const updatePhase = (index: number, updatedPhase: ComplexTimerPhase) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = updatedPhase;
    setPhases(updatedPhases);
    onChange({ ...config, phases: updatedPhases });
  };
  
  const removePhase = (index: number) => {
    const updatedPhases = phases.filter((_, i) => i !== index);
    setPhases(updatedPhases);
    onChange({ ...config, phases: updatedPhases });
  };
  
  const movePhase = (index: number, direction: 'up' | 'down') => {
    const newPhases = [...phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < phases.length) {
      [newPhases[index], newPhases[targetIndex]] = [newPhases[targetIndex], newPhases[index]];
      setPhases(newPhases);
      onChange({ ...config, phases: newPhases });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Global complex timer settings */}
      <div className="space-y-4">
        <h4 className="font-semibold">Complex Timer Settings</h4>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.autoProgress ?? true}
              onChange={(e) => onChange({ ...config, autoProgress: e.target.checked })}
            />
            <span>Auto-progress between phases</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.allowSkipPhase ?? true}
              onChange={(e) => onChange({ ...config, allowSkipPhase: e.target.checked })}
            />
            <span>Allow skipping phases</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.showOverallProgress ?? true}
              onChange={(e) => onChange({ ...config, showOverallProgress: e.target.checked })}
            />
            <span>Show overall progress</span>
          </label>
        </div>
        
        {/* Overall time limit settings */}
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!config.overallTimeLimit}
                onChange={(e) => onChange({ 
                  ...config, 
                  overallTimeLimit: e.target.checked ? 3600 : undefined 
                })}
              />
              <span>Enable overall time limit</span>
            </label>
            
            {config.overallTimeLimit && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={config.overallTimeLimit}
                  onChange={(e) => onChange({ 
                    ...config, 
                    overallTimeLimit: parseInt(e.target.value) || 0 
                  })}
                  className="border rounded px-2 py-1 w-20"
                  min="60"
                  max="86400"
                />
                <span className="text-sm text-gray-600">seconds</span>
              </div>
            )}
          </div>
          
          {config.overallTimeLimit && (
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">When limit reached:</label>
              <select
                value={config.overallLimitBehavior || 'prompt'}
                onChange={(e) => onChange({ 
                  ...config, 
                  overallLimitBehavior: e.target.value as 'prompt' | 'continue' | 'stop'
                })}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="prompt">Always ask user</option>
                <option value="continue">Continue until complete</option>
                <option value="stop">Stop immediately</option>
              </select>
            </div>
          )}
          
          {config.overallTimeLimit && (
            <p className="text-xs text-gray-500 italic">
              This is a soft limit. When reached, you'll be prompted to either end the timer or continue until all phases finish.
            </p>
          )}
        </div>
      </div>
      
      {/* Phases list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Phases</h4>
          <div className="flex items-center space-x-2">
            <select
              value={newPhaseType}
              onChange={(e) => setNewPhaseType(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="countdown">Countdown</option>
              <option value="stopwatch">Stopwatch</option>
              <option value="interval">Interval</option>
              <option value="workrest">Work/Rest</option>
            </select>
            <Button onClick={addPhase}>Add Phase</Button>
          </div>
        </div>
        
        {phases.length === 0 ? (
          <p className="text-gray-500 italic">No phases added yet. Add your first phase to get started.</p>
        ) : (
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <PhaseConfigCard
                key={phase.id}
                phase={phase}
                index={index}
                totalPhases={phases.length}
                onUpdate={(updatedPhase) => updatePhase(index, updatedPhase)}
                onRemove={() => removePhase(index)}
                onMoveUp={() => movePhase(index, 'up')}
                onMoveDown={() => movePhase(index, 'down')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get default config for each timer type
const getDefaultConfigForType = (type: TimerType) => {
  const now = new Date();
  const defaultBaseConfig = {
    createdAt: now,
    lastUsed: now,
    // No countdownBeforeStart - only set when user configures it
  };
  
  switch (type) {
    case TimerType.COUNTDOWN:
      return {
        name: 'Countdown',
        type: TimerType.COUNTDOWN,
        duration: 300, // 5 minutes
        ...defaultBaseConfig,
      };
    case TimerType.STOPWATCH:
      return {
        name: 'Stopwatch',
        type: TimerType.STOPWATCH,
        timeLimit: TIMER_CONSTANTS.DEFAULT_STOPWATCH_LIMIT, // 10 minutes
        ...defaultBaseConfig,
      };
    case TimerType.INTERVAL:
      return {
        name: 'Interval',
        type: TimerType.INTERVAL,
        workDuration: TIMER_CONSTANTS.DEFAULT_WORK_DURATION,
        restDuration: TIMER_CONSTANTS.DEFAULT_REST_DURATION,
        intervals: TIMER_CONSTANTS.DEFAULT_INTERVALS,
        workLabel: 'Work',
        restLabel: 'Rest',
        ...defaultBaseConfig,
      };
    case TimerType.WORKREST:
      return {
        name: 'Work/Rest',
        type: TimerType.WORKREST,
        ratio: TIMER_CONSTANTS.DEFAULT_WORKREST_RATIO,
        maxWorkTime: TIMER_CONSTANTS.DEFAULT_MAX_WORK_TIME, // 30 minutes
        maxRounds: TIMER_CONSTANTS.DEFAULT_MAX_ROUNDS,
        restMode: WorkRestMode.RATIO, // Default to ratio-based
        ...defaultBaseConfig,
      };
  }
};
```

### 6. Phase Configuration Card Component
```tsx
interface PhaseConfigCardProps {
  phase: ComplexTimerPhase;
  index: number;
  totalPhases: number;
  onUpdate: (phase: ComplexTimerPhase) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const PhaseConfigCard = ({
  phase,
  index,
  totalPhases,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: PhaseConfigCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updatePhaseName = (name: string) => {
    onUpdate({ ...phase, name });
  };
  
  const updatePhaseConfig = (config: any) => {
    onUpdate({ ...phase, config });
  };
  
  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={index === totalPhases - 1}
            >
              ↓
            </Button>
          </div>
          
          <div>
            <input
              type="text"
              value={phase.name}
              onChange={(e) => updatePhaseName(e.target.value)}
              className="font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-sm text-gray-600 capitalize">{phase.type}</p>
          </div>
          
          <TimerTypeIcon type={phase.type} className="h-6 w-6 text-gray-500" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <PhaseConfigForm
            phase={phase}
            onUpdate={updatePhaseConfig}
          />
        </div>
      )}
    </Card>
  );
};
```

### 7. Predefined Styles Component
```tsx
const PredefinedStyles = ({
  onSelectStyle,
  onStartStyle,
  onEditStyle,
}: PredefinedStylesProps) => {
  const [userStyles, setUserStyles] = useState<PredefinedStyle[]>([]);
  const predefinedStyles = getPredefinedStyles();
  
  // Combine built-in and user styles
  const allStyles = [...predefinedStyles, ...userStyles];
  
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2>Predefined Styles</h2>
        <span className="text-sm text-gray-500">
          {allStyles.length} styles available
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allStyles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            onStart={() => onStartStyle(style)}
            onEdit={() => onEditStyle(style)}
            onSelect={() => onSelectStyle(style)}
            onDelete={!style.isBuiltIn ? () => handleDeleteStyle(style.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
};
```

### 8. Enhanced Style Card Component
```tsx
interface StyleCardProps {
  style: PredefinedStyle;
  onStart: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onDelete?: () => void; // Only for user-saved styles
}

const StyleCard = ({
  style,
  onStart,
  onEdit,
  onSelect,
  onDelete,
}: StyleCardProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart();
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Are you sure you want to delete this timer style?')) {
      onDelete();
    }
  };
  
  const handleCardClick = () => {
    onSelect();
  };
  
  const isUserStyle = !style.isBuiltIn;
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 group relative ${
        isUserStyle ? 'border-blue-200 bg-blue-50' : ''
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* User style indicator */}
      {isUserStyle && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          Your Style
        </div>
      )}
      
      {/* Header with icon and category */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isUserStyle ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <TimerTypeIcon type={style.config.type} className={`h-6 w-6 ${
              isUserStyle ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{style.name}</h3>
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {style.category}
            </span>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {style.description}
      </p>
      
      {/* Configuration preview */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="text-xs font-medium text-gray-700 mb-1">Configuration:</div>
        <div className="text-xs text-gray-600">
          {getConfigSummary(style.config)}
        </div>
      </div>
      
      {/* User style creation date */}
      {isUserStyle && style.createdAt && (
        <div className="text-xs text-gray-500 mb-3">
          Created: {style.createdAt.toLocaleDateString()}
        </div>
      )}
      
      {/* Action buttons */}
      <div className={`flex gap-2 transition-opacity duration-200 ${
        showActions ? 'opacity-100' : 'opacity-70'
      }`}>
        <Button
          size="sm"
          onClick={handleStart}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="h-3 w-3 mr-1" />
          Start
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleEdit}
          className="flex-1"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Quick actions overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStart}
            className="h-8 w-8 p-0"
            title="Start immediately"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
            title="Edit before start"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              // Copy configuration logic
              navigator.clipboard.writeText(JSON.stringify(style.config, null, 2));
            }}
            className="h-8 w-8 p-0"
            title="Copy configuration"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600"
              title="Delete style"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
```

### 9. Edit Style Modal Component
```tsx
interface EditStyleModalProps {
  style: PredefinedStyle;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStyle: PredefinedStyle) => void;
  onStart: (config: TimerConfig) => void;
}

const EditStyleModal = ({
  style,
  isOpen,
  onClose,
  onSave,
  onStart,
}: EditStyleModalProps) => {
  const [editedConfig, setEditedConfig] = useState<TimerConfig>(style.config);
  const [customName, setCustomName] = useState(`${style.name} (Modified)`);
  
  const handleSave = () => {
    const userStyle: PredefinedStyle = {
      ...style,
      id: `user-${Date.now()}`,
      name: customName,
      config: editedConfig,
      category: 'user',
      isBuiltIn: false,
      createdAt: new Date(),
    };
    
    onSave(userStyle);
    onClose();
  };
  
  const handleStart = () => {
    onStart(editedConfig);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Timer Style</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Custom name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Enter style name"
          />
        </div>
        
        {/* Configuration form based on timer type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <TimerConfigForm
            type={editedConfig.type}
            initialConfig={editedConfig}
            onChange={setEditedConfig}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save as Predefined
          </Button>
          <Button onClick={handleStart} className="flex-1 bg-green-600 hover:bg-green-700">
            Start Timer
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};
```

### 10. Enhanced Main Configuration Page Integration
```tsx
export default function ConfigurePage() {
  const [recentTimers, setRecentTimers] = useState<RecentTimer[]>([]);
  const [selectedType, setSelectedType] = useState<TimerType | null>(null);
  const [editingStyle, setEditingStyle] = useState<PredefinedStyle | null>(null);
  const [userPredefinedStyles, setUserPredefinedStyles] = useState<PredefinedStyle[]>([]);
  
  const handleStartStyle = (style: PredefinedStyle) => {
    // Add to recent timers and start immediately
    storage.addRecentTimer(style.config);
    router.push(`/timer/${style.config.type}?config=${encodeURIComponent(JSON.stringify(style.config))}`);
  };
  
  const handleEditStyle = (style: PredefinedStyle) => {
    setEditingStyle(style);
  };
  
  const handleSaveUserStyle = (userStyle: PredefinedStyle) => {
    setUserPredefinedStyles([...userPredefinedStyles, userStyle]);
    storage.saveUserPredefinedStyle(userStyle);
  };
  
  const handleDeleteUserStyle = (id: string) => {
    const updatedStyles = userPredefinedStyles.filter(style => style.id !== id);
    setUserPredefinedStyles(updatedStyles);
    storage.removeUserPredefinedStyle(id);
  };
  
  const handleSaveAsPredefined = (config: TimerConfig) => {
    const userStyle: PredefinedStyle = {
      id: `user-${Date.now()}`,
      name: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Timer`,
      description: `Custom ${config.type} timer configuration`,
      category: 'user',
      config,
      isBuiltIn: false,
      createdAt: new Date(),
    };
    
    setUserPredefinedStyles([...userPredefinedStyles, userStyle]);
    storage.saveUserPredefinedStyle(userStyle);
  };
  
  const handleStartEditedTimer = (config: TimerConfig) => {
    storage.addRecentTimer(config);
    router.push(`/timer/${config.type}?config=${encodeURIComponent(JSON.stringify(config))}`);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <header>
        <h1>Timer Configuration</h1>
        <p>Choose and configure your timer</p>
      </header>
      
      <RecentTimers 
        timers={recentTimers}
        onStartTimer={handleStartTimer}
        onRemoveTimer={handleRemoveTimer}
        onClearAll={handleClearAll}
      />
      
      <TimerTypeSelector 
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />
      
      {selectedType && (
        <TimerConfigForm 
          type={selectedType}
          onSave={handleSaveConfig}
          onSaveAsPredefined={handleSaveAsPredefined}
          onStart={handleStartTimer}
        />
      )}
      
      <PredefinedStyles 
        onSelectStyle={handleSelectStyle}
        onStartStyle={handleStartStyle}
        onEditStyle={handleEditStyle}
      />
      
      {/* Edit modal */}
      {editingStyle && (
        <EditStyleModal
          style={editingStyle}
          isOpen={!!editingStyle}
          onClose={() => setEditingStyle(null)}
          onSave={handleSaveUserStyle}
          onStart={handleStartEditedTimer}
        />
      )}
    </div>
  );
}
```

## Predefined Timer Configurations

### 1. Built-in Presets (`src/lib/configure/presets.ts`)
```typescript
import { TimerType, TimerCategory, TimerConfigHash } from '@/types/configure';

// Define timer configurations separately for maintainability
const TABATA_CONFIG: TimerConfig = {
  id: 'tabata-standard',
  name: 'Tabata',
  type: TimerType.INTERVAL,
  workDuration: 20,
  restDuration: 10,
  intervals: 8,
  workLabel: 'Work',
  restLabel: 'Rest',
  skipLastRest: true,
  countdownBeforeStart: 5,
  // Note: createdAt and lastUsed will be set when timer is actually used
};

const EMOM_CONFIG: TimerConfig = {
  id: 'emom-10min',
  name: 'EMOM (10 min)',
  type: TimerType.INTERVAL,
  workDuration: 60,
  restDuration: 0,
  intervals: 10,
  workLabel: 'Work',
  restLabel: 'Rest',
  skipLastRest: false,
  countdownBeforeStart: 10,
  // Note: createdAt and lastUsed will be set when timer is actually used
};

const E2MOM_CONFIG: TimerConfig = {
  id: 'e2mom-5rounds',
  name: 'E2MOM (5 rounds)',
  type: TimerType.INTERVAL,
  workDuration: 60,
  restDuration: 60,
  intervals: 5,
  workLabel: 'Work',
  restLabel: 'Rest',
  skipLastRest: false,
  countdownBeforeStart: 10,
  // Note: createdAt and lastUsed will be set when timer is actually used
};

export const PREDEFINED_STYLES: PredefinedStyle[] = [
  {
    id: TimerConfigHash.generateTimerId(TABATA_CONFIG),
    name: 'Tabata',
    description: 'High-intensity interval training protocol',
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: TABATA_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(EMOM_CONFIG),
    name: 'EMOM (10 min)',
    description: 'Every Minute On The Minute - 10 minutes',
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: EMOM_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(E2MOM_CONFIG),
    name: 'E2MOM (5 rounds)',
    description: 'Every 2 Minutes On The Minute - 5 rounds',
    category: TimerCategory.STRENGTH,
    isBuiltIn: true,
    config: E2MOM_CONFIG,
  },
  // Add more predefined styles as needed
];
```

### 2. Helper Functions
```tsx
// Get all predefined styles
export const getPredefinedStyles = (): PredefinedStyle[] => {
  return PREDEFINED_STYLES;
};

// Get predefined style by ID
export const getPredefinedStyleById = (id: string): PredefinedStyle | undefined => {
  return PREDEFINED_STYLES.find(style => style.id === id);
};

// Get predefined styles by category
export const getPredefinedStylesByCategory = (category: TimerCategory): PredefinedStyle[] => {
  return PREDEFINED_STYLES.filter(style => style.category === category);
};
```

## Testing and Storybook Requirements

### Testing Standards
Every new component and utility must include comprehensive test coverage:

#### Component Tests (`.spec.ts`)
```typescript jsx
// Example: RecentTimers.spec.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecentTimers } from './RecentTimers';

describe('RecentTimers', () => {
  const mockTimers = [
    { /* mock timer data */ }
  ];
  
  const mockProps = {
    timers: mockTimers,
    onStartTimer: vi.fn(),
    onRemoveTimer: vi.fn(),
    onClearAll: vi.fn(),
  };

  it('renders timer list correctly', () => {
    render(<RecentTimers {...mockProps} />);
    expect(screen.getByText('Recent Timers')).toBeInTheDocument();
  });

  it('handles timer start', () => {
    render(<RecentTimers {...mockProps} />);
    fireEvent.click(screen.getByText('Start'));
    expect(mockProps.onStartTimer).toHaveBeenCalled();
  });
});
```

#### Storybook Stories with Play Functions (`.stories.ts`)
```typescript jsx
// Example: RecentTimers.stories.ts
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";
import { RecentTimers } from './RecentTimers';

const meta = preview.meta({
  title: 'Configure/RecentTimers',
  component: RecentTimers,
  argTypes: {
    timers: { control: "object" },
  },
  args: {
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
});

export const Empty = meta.story({
  args: {
    timers: [],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("No recent timers");
  },
});

export const WithTimers = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: {
          id: 'tabata-standard',
          name: 'Tabata',
          type: 'interval',
          duration: 240,
        },
        startedAt: new Date(),
      }
    ],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("Start Timer");
    expect(canvasElement.textContent).toContain("Remove");
  },
});

export const MultipleTimers = meta.story({
  render: () => {
    const timers = [
      {
        id: 'timer-1',
        config: { name: 'Tabata', type: 'interval', duration: 240 },
        startedAt: new Date(),
      },
      {
        id: 'timer-2', 
        config: { name: 'EMOM', type: 'interval', duration: 600 },
        startedAt: new Date(),
      },
    ];
    return <RecentTimers timers={timers} onStartTimer={fn()} onRemoveTimer={fn()} onClearAll={fn()} />;
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).toContain("Clear All");
  },
});
```

#### Visual Testing with Play Functions
The `play` function provides:
- **Visual assertions**: Test actual rendered content
- **User interactions**: Simulate clicks, hovers, etc.
- **State testing**: Verify component states visually
- **Accessibility testing**: Test screen reader content
- **Performance testing**: Measure render performance

#### Utility Tests
```typescript
// Example: storage.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves timer config', () => {
    const config = { /* mock config */ };
    storage.addRecentTimer(config);
    
    const retrieved = storage.getRecentTimers();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].config).toEqual(config);
  });
});
```

### Required Test Coverage
- **Components**: Render states, user interactions, prop variations
- **Utilities**: Function behavior, edge cases, error handling
- **Storage**: CRUD operations, data persistence, error scenarios
- **Integration**: Component interactions with storage utilities

### Storybook Requirements
- **Stories**: Empty, default, and edge case states with `play` functions
- **Visual Testing**: Use `play` functions for assertions on rendered content
- **Controls**: Interactive props for testing variations
- **Documentation**: Component descriptions and prop documentation
- **Auto-docs**: Generated documentation from component code
- **Modern Pattern**: Use `preview.meta()` and `meta.story()` instead of old Meta/StoryObj pattern

## Implementation Steps

### 1. Navigation Integration
- Add "Configure" link to main navigation
- Update existing timer pages to add to recent timers
- Implement timer state persistence across navigation

### 2. Timer Launch Flow
```tsx
// Unified timer start function for both custom and predefined timers
const handleStartTimer = (config: TimerConfig, isPredefined: boolean = false) => {
  let finalConfig: TimerConfig;
  
  if (isPredefined) {
    // For predefined configs: copy the config and add ID
    // This preserves the original predefined config unchanged
    finalConfig = {
      ...config,
      id: TimerConfigHash.generateTimerId(config), // Generate new ID for this instance
      createdAt: new Date(),
      lastUsed: new Date(),
    };
  } else {
    // For custom configs: ensure ID and timestamps are set
    finalConfig = {
      ...config,
      id: TimerConfigHash.generateTimerId(config),
      createdAt: config.createdAt || new Date(),
      lastUsed: new Date(),
    };
  }
  
  // Add to recent timers
  storage.addRecentTimer(finalConfig);
  
  // Navigate to appropriate timer page
  switch (finalConfig.type) {
    case TimerType.COUNTDOWN:
      router.push(`/timer/countdown?id=${finalConfig.id}`);
      break;
    case TimerType.STOPWATCH:
      router.push(`/timer/stopwatch?id=${finalConfig.id}`);
      break;
    case TimerType.INTERVAL:
      router.push(`/timer/interval?id=${finalConfig.id}`);
      break;
    case TimerType.WORKREST:
      router.push(`/timer/workrest?id=${finalConfig.id}`);
      break;
    case TimerType.COMPLEX:
      router.push(`/timer/complex?id=${finalConfig.id}`);
      break;
  }
};
```

### 3. Component Integration
- Timer components continue to receive config via props (no changes needed)
- Page components handle URL parameter parsing and config loading from storage
- Add "Save as Predefined" functionality to configuration forms

### 4. Storage Management
- Implement automatic cleanup of old timers (24+ hours) - not valid for recent timers and user predefined presets
- Add storage quota management
- Implement backup/restore functionality

## Timer Component Integration

### Component Props Mapping
The existing timer components will continue to receive props as they do now. The configuration system maps from the unified `TimerConfig` to component-specific props:

```tsx
// Page component handles the mapping
export default function TimerPage({ params }: { params: { id: string } }) {
  const config = storage.getTimerById(params.id);
  
  switch (config.type) {
    case TimerType.COUNTDOWN:
      return <Countdown duration={config.duration} completionMessage={config.completionMessage} />;
    case TimerType.STOPWATCH:
      return <Stopwatch timeLimit={config.timeLimit} completionMessage={config.completionMessage} />;
    case TimerType.INTERVAL:
      return <Interval 
        workDuration={config.workDuration} 
        restDuration={config.restDuration} 
        intervals={config.intervals}
        workLabel={config.workLabel}
        restLabel={config.restLabel}
        skipLastRest={config.skipLastRest}
      />;
    case TimerType.WORKREST:
      return <WorkRestTimer 
        ratio={config.ratio}
        maxWorkTime={config.maxWorkTime}
        maxRounds={config.maxRounds}
        restMode={config.restMode}
        fixedRestDuration={config.fixedRestDuration}
      />;
    case TimerType.COMPLEX:
      return <ComplexTimer phases={config.phases} overallTimeLimit={config.overallTimeLimit} />;
  }
}
```

## Implementation Steps

### 1. Navigation Integration
- Add "Configure" link to main navigation
- Update existing timer pages to add to recent timers
- Implement timer state persistence across navigation

### 2. Timer Launch Flow
```tsx
// Unified timer start function for both custom and predefined timers
const handleStartTimer = (config: TimerConfig, isPredefined: boolean = false) => {
  let finalConfig: TimerConfig;
  
  if (isPredefined) {
    // For predefined configs: copy and add runtime timestamps
    // This preserves the original predefined config unchanged
    finalConfig = {
      ...config,
      id: TimerConfigHash.generateTimerId(config), // Generate new ID for this instance
      createdAt: new Date(), // ✅ Set when actually used (not in predefined)
      lastUsed: new Date(),   // ✅ Set when actually used (updates on each use)
    };
  } else {
    // For custom configs: ensure ID exists
    finalConfig = {
      ...config,
      id: config.id || TimerConfigHash.generateTimerId(config), // Generate if missing
      createdAt: config.createdAt || new Date(),
      lastUsed: new Date(),
    };
  }
  
  // Add to recent timers (this handles duplicate detection)
  storage.addRecentTimer(finalConfig);
  
  // Store timer config using its ID
  const timerId = TimerStorage.storeTimerConfig(finalConfig);
  
  // Navigate to appropriate timer page with the ID
  switch (finalConfig.type) {
    case TimerType.COUNTDOWN:
      router.push(`/timer/countdown?id=${timerId}`);
      break;
    case TimerType.STOPWATCH:
      router.push(`/timer/stopwatch?id=${timerId}`);
      break;
    case TimerType.INTERVAL:
      router.push(`/timer/interval?id=${timerId}`);
      break;
    case TimerType.WORKREST:
      router.push(`/timer/workrest?id=${timerId}`);
      break;
    case TimerType.COMPLEX:
      router.push(`/timer/complex?id=${timerId}`);
      break;
  }
};

// Timer configuration form with unified start handling
const TimerConfigForm = ({
  type,
  initialConfig,
  isPredefined = false,
  onSave,
  onSaveAsPredefined,
  onStart,
}: TimerConfigFormProps) => {
  const [config, setConfig] = useState<Partial<TimerConfig>>(initialConfig || {});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config && onStart) {
      // NO HASHING during timer creation/execution
      // Pass config directly to unified start handler
      onStart(config as TimerConfig, isPredefined);
    }
  };
  
  const handleSave = () => {
    if (config && onSaveAsPredefined) {
      // Save predefined style - NO duplicate check needed
      // Users can save multiple variations of similar timers
      const fullConfig: TimerConfig = {
        ...config,
        id: config.id || TimerConfigHash.generateTimerId(config as TimerConfig),
        createdAt: new Date(),
        lastUsed: new Date(),
      } as TimerConfig;
      
      onSaveAsPredefined(fullConfig);
    } else if (config && onSave) {
      onSave(config as TimerConfig);
    }
  };
  
  return (
    <Card>
      <h3>Configure {type} Timer</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}
        <div className="flex gap-2">
          <Button type="submit">Start Timer</Button>
          {!isPredefined && (
            <Button type="button" variant="outline" onClick={handleSave}>
              Save as Predefined
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

// Example usage in configuration page
export default function ConfigurePage() {
  const [selectedPredefined, setSelectedPredefined] = useState<PredefinedStyle | null>(null);
  
  const handleStartCustomTimer = (config: TimerConfig, isPredefined: boolean = false) => {
    handleStartTimer(config, isPredefined);
  };
  
  const handleStartPredefinedTimer = (predefinedStyle: PredefinedStyle) => {
    // User starts predefined timer directly without editing
    handleStartTimer(predefinedStyle.config, true);
  };
  
  const handleEditPredefinedTimer = (predefinedStyle: PredefinedStyle) => {
    // User edits predefined timer - treat as custom
    setSelectedPredefined(predefinedStyle);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Predefined styles section */}
      <PredefinedStyles 
        styles={getPredefinedStyles()}
        onStart={handleStartPredefinedTimer}
        onEdit={handleEditPredefinedTimer}
      />
      
      {/* Custom configuration form */}
      {selectedPredefined && (
        <TimerConfigForm
          type={selectedPredefined.config.type}
          initialConfig={selectedPredefined.config}
          isPredefined={true} // This will hide "Save as Predefined" button
          onStart={handleStartCustomTimer}
        />
      )}
      
      {!selectedPredefined && (
        <TimerTypeSelector
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
        />
      )}
      
      {selectedType && !selectedPredefined && (
        <TimerConfigForm
          type={selectedType}
          onStart={handleStartCustomTimer}
          onSaveAsPredefined={handleSaveAsPredefined}
        />
      )}
    </div>
  );
};

// Timer page retrieves config from storage
const useTimerConfig = (timerId: string): TimerConfig | null => {
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const config = TimerStorage.getTimerConfig(timerId);
    
    if (!config) {
      setError('Timer configuration not found');
      // Show alert and redirect back to config page
      alert('Timer configuration not found. Redirecting to configuration page...');
      router.push('/configure');
      return;
    }
    
    setConfig(config);
  }, [timerId]);
  
  return config;
};

// Example timer page implementation
export default function TimerPage({ params }: { params: { id: string } }) {
  const config = useTimerConfig(params.id);
  
  if (!config) {
    return <div>Loading timer configuration...</div>;
  }
  
  // Render appropriate timer component based on type
  switch (config.type) {
    case TimerType.COUNTDOWN:
      return <Timer duration={config.duration} completionMessage={config.completionMessage} />;
    case TimerType.STOPWATCH:
      return <Stopwatch timeLimit={config.timeLimit} completionMessage={config.completionMessage} />;
    case TimerType.INTERVAL:
      return <Interval intervalConfig={config} />;
    case TimerType.WORKREST:
      return <WorkRestTimer className="timer-workrest" />;
    default:
      return <div>Unknown timer type</div>;
  }
}
```

## Utility Functions and Responsive Design

### Helper Functions for Timer Display
```typescript
// Configuration summary generator
export const getConfigSummary = (config: TimerConfig): string => {
  switch (config.type) {
    case 'countdown':
      return `Duration: ${formatDuration(config.duration)}`;
    case 'stopwatch':
      return config.timeLimit 
        ? `Limit: ${formatDuration(config.timeLimit)}`
        : 'No time limit';
    case 'interval':
      return `${config.intervals} rounds: ${formatDuration(config.workDuration)} work / ${formatDuration(config.restDuration)} rest`;
    case 'workrest':
      return `Ratio: ${config.ratio}x${config.maxWorkTime ? ` (max: ${formatDuration(config.maxWorkTime)})` : ''}`;
    case 'complex':
      const limitText = config.overallTimeLimit 
        ? ` (${formatDuration(config.overallTimeLimit)} limit)` 
        : '';
      return `${config.phases.length} phases: ${config.phases.map(p => p.name).join(' → ')}${limitText}`;
    default:
      return 'Unknown configuration';
  }
};

// Relative time formatter
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};
```
```tsx
// Timer type icons component
const TimerTypeIcon = ({ 
  type, 
  className = "h-6 w-6" 
}: { type: TimerType; className?: string }) => {
  switch (type) {
    case TimerType.COUNTDOWN:
      return <Clock className={className} />;
    case TimerType.STOPWATCH:
      return <Timer className={className} />;
    case TimerType.INTERVAL:
      return <Activity className={className} />;
    case TimerType.WORKREST:
      return <BarChart3 className={className} />;
    case TimerType.COMPLEX:
      return <Layers className={className} />;
    default:
      return <Clock className={className} />;
  }
};
```

### Responsive Design Implementation Details
```typescript
// Custom hook for responsive recent timers
export const useResponsiveRecentTimers = () => {
  const [visibleCount, setVisibleCount] = useState(10); // Default to laptop
  
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCount(10); // Laptop: show all
      } else if (width >= 768) {
        setVisibleCount(6); // Tablet: show 5-6
      } else {
        setVisibleCount(3); // Phone: show 3
      }
    };
    
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);
  
  return visibleCount;
};
```
```tsx
// Enhanced RecentTimers component with responsive behavior
export const RecentTimers: React.FC<RecentTimersProps> = ({
  timers,
  onStartTimer,
  onRemoveTimer,
  onClearAll,
}) => {
  const visibleCount = useResponsiveRecentTimers();
  const hasOverflow = timers.length > visibleCount;
  
  if (timers.length === 0) {
    return <EmptyState message="No recent timers" />;
  }
  
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2>Recent Timers</h2>
        <Button variant="ghost" onClick={onClearAll}>
          Clear All
        </Button>
      </div>
      
      <div className="relative">
        {/* Scroll hint for devices that don't show all timers */}
        {hasOverflow && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none lg:hidden" />
        )}
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {timers.map((timer) => (
            <div 
              key={timer.config.id}
              className="flex-none w-80 snap-start"
            >
              <TimerCard
                timer={timer}
                onStart={() => onStartTimer(timer.config)}
                onRemove={() => onRemoveTimer(timer.config.id)}
                compact={true}
              />
            </div>
          ))}
        </div>
        
        {/* Progress indicators - only show on mobile/tablet */}
        {hasOverflow && (
          <div className="flex justify-center mt-2 gap-1 lg:hidden">
            {Array.from({ length: Math.min(timers.length, visibleCount) }).map((_, index) => (
              <div
                key={index}
                className="h-1 w-8 rounded-full bg-blue-500"
              />
            ))}
            {timers.length > visibleCount && (
              <div className="h-1 w-8 rounded-full bg-gray-300" />
            )}
          </div>
        )}
      </div>
    </section>
  );
};
```

## Complex Timer Runtime Behavior

### Overall Time Limit Handling
When a complex timer has an overall time limit configured, the runtime behavior follows these rules:

#### 1. Time Tracking
- Track total elapsed time across all phases
- Monitor remaining time until overall limit is reached
- Display both phase progress and overall progress when enabled

#### 2. Limit Reached Behavior
```typescript
interface LimitReachedDialog {
  title: "Time Limit Reached";
  message: "Your workout has exceeded the overall time limit. What would you like to do?";
  options: [
    { label: "Continue Workout", action: "continue", description: "Finish all remaining phases" },
    { label: "End Workout", action: "stop", description: "Stop the timer immediately" }
  ];
  timeElapsed: string; // "1h 05m 30s"
  timeLimit: string; // "1h 00m 00s"
  phasesRemaining: number; // 2
}

// Behavior based on configuration
switch (config.overallLimitBehavior) {
  case 'prompt':
    showDialog(LimitReachedDialog);
    break;
  case 'continue':
    // Continue automatically without prompting
    continueWorkout();
    break;
  case 'stop':
    // Stop automatically without prompting
    stopWorkout();
    break;
}
```

#### 3. User Interface Updates
- **Progress Bar**: Show dual progress (current phase + overall)
- **Time Display**: Display both phase time and overall time
- **Warnings**: Visual/audio warning when approaching limit (e.g., 5 minutes before)
- **Limit Indicator**: Clear indication when overall limit is exceeded

#### 4. State Management
```typescript
interface ComplexTimerState {
  currentPhaseIndex: number;
  phaseElapsedTime: number;
  totalElapsedTime: number;
  overallTimeLimit?: number;
  isOverLimit: boolean;
  limitReachedHandled: boolean;
}

// Hook for managing complex timer state
export const useComplexTimer = (config: ComplexConfig) => {
  const [state, setState] = useState<ComplexTimerState>({
    currentPhaseIndex: 0,
    phaseElapsedTime: 0,
    totalElapsedTime: 0,
    overallTimeLimit: config.overallTimeLimit,
    isOverLimit: false,
    limitReachedHandled: false,
  });
  
  // Check for overall limit
  useEffect(() => {
    if (config.overallTimeLimit && 
        state.totalElapsedTime >= config.overallTimeLimit && 
        !state.limitReachedHandled) {
      
      handleLimitReached();
    }
  }, [state.totalElapsedTime, config.overallTimeLimit]);
  
  return { state, actions };
};
```

#### 5. Example Scenarios

**Scenario 1: 1-hour limit with prompt behavior**
- Workout configured for 75 minutes total
- At 60 minutes, dialog appears
- User chooses to continue, finishes remaining 15 minutes
- Total workout time: 75 minutes

**Scenario 2: 45-minute limit with stop behavior**
- Workout configured for 50 minutes total
- At 45 minutes, timer stops automatically
- User can manually restart if desired
- Total workout time: 45 minutes

**Scenario 3: No limit configured**
- Workout runs for full configured duration
- No limit checking or interruptions

## Implementation Steps

### Phase 1: Core Infrastructure
1. **Create type definitions** (`src/types/configure.ts`)
2. **Implement storage utilities** (`src/lib/configure/storage.ts`)
3. **Set up routing** (`src/app/configure/page.tsx`)
4. **Create basic layout components**

### Phase 2: Recent Timers
1. **Implement RecentTimers component**
2. **Create TimerCard component**
3. **Add storage operations for recent timers**
4. **Implement timer tracking in existing timer pages**

### Phase 3: Timer Configuration
1. **Create TimerTypeSelector component**
2. **Implement dynamic TimerConfigForm**
3. **Build type-specific form components**
4. **Add form validation and error handling**

### Phase 4: Predefined Styles
1. **Create predefined styles data**
2. **Implement PredefinedStyles component**
3. **Build StyleCard component**
4. **Add custom preset creation functionality**

### Phase 5: Integration and Polish
1. **Integrate with existing timer components**
2. **Add animations and transitions**
3. **Implement responsive design**
4. **Add accessibility features**
5. **Write comprehensive tests**

## Testing Strategy

### 1. Unit Tests
- Storage utilities
- Configuration validation
- Type-specific form logic
- Recent timer management

### 2. Integration Tests
- Full configuration flow
- Timer launch with configuration
- Storage persistence
- Navigation between pages

### 3. User Experience Tests
- Responsive design
- Accessibility compliance
- Performance with large recent timer lists
- Cross-browser compatibility

## Success Metrics

### Functional Requirements
- ✅ Users can configure all timer types
- ✅ Recent timers persist across sessions
- ✅ Predefined styles work correctly
- ✅ Custom presets can be created and saved
- ✅ Navigation to timer pages works seamlessly

### Non-Functional Requirements
- ✅ Page loads in < 2 seconds
- ✅ Recent timers update in < 100ms
- ✅ Storage uses < 1MB localStorage space
- ✅ Accessibility score 100% (Lighthouse)
- ✅ Mobile responsive design

## Future Enhancements

### Version 2.0
- Timer templates sharing
- Advanced scheduling features
- Statistics and usage analytics
- Timer categories and tags
- Import/export configurations

### Version 3.0
- Cloud sync across devices
- Community preset library
- Integration with fitness platforms
- Advanced analytics and insights
- Timer performance recommendations
