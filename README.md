# Timer Application

A versatile timer application built with Next.js 16, TypeScript, and Tailwind CSS, featuring comprehensive timer configuration and management.

## Features

### Timer Configuration System
- **Predefined Styles**: Built-in timer configurations for common workout patterns
- **Custom Timers**: Create personalized countdown, stopwatch, interval, and work/rest timers
- **Recent Timers**: Quick access to recently used timer configurations
- **Category Filtering**: Organize timers by Cardio, Strength, Flexibility, Sports, and Custom categories

### Timer Types
1. **Countdown**: Simple countdown timer with optional completion message
2. **Stopwatch**: Count-up timer with optional time limit
3. **Interval**: Work/rest cycles with customizable intervals
4. **Work/Rest**: Ratio-based or fixed-rest duration timers
5. **Complex**: Multi-phase timer combining different timer types in sequence

### Built-in Predefined Styles
- **Tabata**: 8 rounds of 20s work / 10s rest
- **EMOM**: Every Minute On The Minute (10 minutes)
- **E2MOM**: Every 2 Minutes On The Minute (5 rounds)
- **HIIT**: High-intensity interval training
- **Countdown**: Simple 5-minute countdown
- **Stopwatch**: 10-minute limited stopwatch
- **Work/Rest Ratio**: 1:1 and fixed rest configurations

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Storybook with play functions
- **Storage**: LocalStorage for timer persistence
- **Development**: ESLint, Prettier

## Project Structure

```
src/
├── app/
│   ├── configure/
│   │   ├── page.tsx                 # Main configuration page
│   │   └── complex/
│   │       └── page.tsx             # Complex timer configuration
│   ├── layout.tsx                   # Root layout with navigation
│   ├── page.tsx                     # Home page (timer display)
│   └── manifest.ts                  # PWA manifest
├── components/
│   ├── configure/
│   │   ├── PredefinedStyles.tsx      # Predefined timer styles
│   │   ├── RecentTimers.tsx          # Recent timers section
│   │   ├── TimerConfig.tsx           # Timer config wrapper
│   │   ├── TimerTypeSelector.tsx     # Timer type selection
│   │   └── components/
│   │       ├── shared/               # Shared form components
│   │       │   ├── CountdownFields.tsx
│   │       │   ├── IntervalFields.tsx
│   │       │   ├── StopwatchFields.tsx
│   │       │   ├── WorkRestFields.tsx
│   │       │   ├── TimePicker.tsx
│   │       │   ├── CountdownSelector.tsx
│   │       │   └── FormErrors.tsx
│   │       ├── timer-config-form/    # Main config form
│   │       │   ├── TimerConfigForm.tsx
│   │       │   └── CommonFields.tsx
│   │       └── complex-fields-form/  # Complex timer form
│   │           ├── ComplexFieldsForm.tsx
│   │           └── components/
│   │               ├── ComplexBody.tsx
│   │               ├── ComplexFields.tsx
│   │               ├── ComplexPhaseAdd.tsx
│   │               ├── ComplexPhaseEdit.tsx
│   │               └── PhaseSummary.tsx
│   ├── display/
│   │   ├── Timer.tsx                 # Countdown timer display
│   │   ├── Stopwatch.tsx             # Stopwatch display
│   │   ├── Interval.tsx              # Interval timer display
│   │   ├── WorkRestTimer.tsx         # Work/rest timer display
│   │   ├── ComplexTimer.tsx          # Complex multi-phase timer
│   │   ├── TimerCard.tsx             # Shared timer card
│   │   ├── TimerContainer.tsx        # Timer layout container
│   │   ├── TimerProgressIndicator.tsx
│   │   └── LapHistory.tsx
│   ├── ui/                           # Radix-based UI primitives
│   │   └── timer-buttons/            # Timer action buttons
│   ├── Navigation.tsx
│   ├── InstallPrompt.tsx             # PWA install prompt
│   └── PageContainer.tsx
├── contexts/
│   └── TimerContext.tsx              # Timer active state context
├── hooks/
│   ├── useTimer.ts                   # Countdown timer hook
│   ├── useStopwatch.ts               # Stopwatch hook
│   ├── useIntervalTimer.ts           # Interval timer hook
│   ├── useWorkRestTimer.ts           # Work/rest timer hook
│   ├── usePreStartCountdown.ts       # Pre-start countdown hook
│   ├── useSoundManager.ts            # Sound playback hook
│   ├── useLapHistory.ts              # Lap history hook
│   ├── useWakeLock.ts                # Screen wake lock hook
│   └── useTouchDevice.ts             # Touch detection hook
├── lib/
│   ├── configure/
│   │   ├── storage.ts                # LocalStorage management
│   │   ├── presets.ts                # Predefined timer styles
│   │   └── utils.ts                  # Validation, formatting, config utils
│   ├── timer/
│   │   ├── Timer.ts                  # Timer class
│   │   ├── Stopwatch.ts              # Stopwatch class
│   │   ├── TimerManager.ts           # Multi-step timer manager
│   │   ├── TimerConfigHash.ts        # Config hashing for IDs
│   │   ├── types.ts                  # Runtime timer types
│   │   └── utils.ts                  # Time formatting utilities
│   ├── sound/
│   │   ├── SoundManager.ts           # Sound playback manager
│   │   ├── SoundEngine.ts            # Audio engine
│   │   ├── AirHorn.ts                # Air horn sound effect
│   │   └── cues.ts                   # Sound cue definitions
│   └── enums.ts                      # Shared enums
├── types/
│   └── configure.ts                  # Timer config types & type guards
├── icons/                            # Custom SVG icon components
├── providers/
│   └── theme-provider.tsx
└── testing/
    ├── utils.ts                      # Test helpers (sleep, mock configs)
    ├── mocks.ts                      # localStorage mock
    └── storybook-mocks.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run Storybook
pnpm storybook
```

## Usage

1. **Configure Timer**: Navigate to `/configure` to create custom timers or choose from predefined styles
2. **Start Timer**: Select a timer type and configure settings, then click "Start Timer"
3. **Recent Timers**: Access recently used timers from the configure page for quick restart
4. **Save Predefined**: Save custom configurations as reusable predefined styles

## Component Architecture

### Server Components
- Layout and routing components use Next.js 16 App Router
- Data fetching and server-side logic

### Client Components
- Interactive timer components (`'use client'`)
- Form handling and state management
- Local storage operations

### Testing Strategy
- **Unit Tests**: Component logic and utility functions
- **Visual Tests**: Storybook stories with play functions
- **Integration Tests**: Component interactions and storage
- **Coverage**: Comprehensive test coverage for all new components

## Contributing

1. Follow the established file structure and naming conventions (camelCase for hooks)
2. Create corresponding `.test.ts` and `.stories.tsx` files for new components
3. Use TypeScript interfaces for all props and state; avoid `any`
4. Follow the existing styling patterns with Tailwind CSS
5. Ensure all tests pass before submitting changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
