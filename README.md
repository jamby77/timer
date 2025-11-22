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
5. **Complex**: Multi-phase timer combinations (coming soon)

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
│   │   └── page.tsx                 # Main configuration page
│   ├── layout.tsx                   # Root layout with navigation
│   └── page.tsx                     # Home page
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
│   ├── Button.tsx                   # Reusable button component
│   ├── Card.tsx                     # Reusable card component
│   ├── Navigation.tsx               # Main navigation
│   └── (existing timer components...)
├── lib/
│   ├── configure/
│   │   ├── types.ts                 # Configuration types
│   │   ├── storage.ts               # Local storage management
│   │   ├── storage.spec.ts          # Tests for storage utilities
│   │   ├── presets.ts               # Predefined timer configurations
│   │   ├── presets.spec.ts          # Tests for presets
│   │   ├── utils.ts                 # Helper functions
│   │   └── utils.spec.ts            # Tests for utils
│   └── timer/
│       ├── TimerConfigHash.ts       # Timer configuration hashing
│       └── (existing timer utilities...)
├── types/
│   └── configure.ts                 # Global type definitions
└── icons/
    └── (existing icon components...)
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

1. Follow the established file structure and naming conventions
2. Create corresponding `.spec.ts` and `.stories.ts` files for new components
3. Use TypeScript interfaces for all props and state
4. Follow the existing styling patterns with Tailwind CSS
5. Ensure all tests pass before submitting changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
