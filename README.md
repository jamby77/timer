# Timer Application

A responsive timer application built with Next.js and React, featuring smooth animations and precise timing control.

## Features

- Countdown timer with visual feedback
- Smooth animations during the final countdown seconds
- Clean, modern UI built with Tailwind CSS
- Type-safe development with TypeScript
- Component development with Storybook

## Tech Stack

- **Framework**: Next.js 
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Development**: TypeScript, ESLint, Prettier
- **Testing**: Storybook

## Project Structure

```
src/
├── app/                  # Next.js app directory
│   └── page.tsx          # Main page component
├── components/           # Reusable components
│   └── timer/            # Timer related components
│       ├── useTimer.ts   # Timer hook implementation
│       ├── utilities.ts  # Helper functions
│       └── index.d.ts    # Type definitions
├── public/               # Static assets
└── styles/               # Global styles
```

## Custom Timer Implementation

The application features a custom timer implementation using `requestAnimationFrame` for smooth updates. The timer supports:

- Precise timing control
- Multiple event listeners
- Play/pause/stop functionality
- Countdown and stopwatch modes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
