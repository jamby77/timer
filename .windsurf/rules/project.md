---
trigger: always_on
description:
globs:
---

# Project Rules

For any oprations that you want to perform on the project first check if there are available JetBrains tools in the MCP server
If you need to use external tools, plan in advance whch ones you need and combine in single execution if possible

This project uses `pnpm` package manager, if any commands related to packages need to be executed, use pnpm

## Testing Rules

### NO MOCKING WITHOUT EXPLICIT PERMISSION

- **NEVER mock any functionality without asking first**
- Always test real functionality when possible
- Only mock when absolutely necessary and with explicit approval
- This includes: requestAnimationFrame, performance.now, setTimeout, setInterval, fetch, etc.
- Test actual behavior, not simulated behavior

### General Development

- Prefer real functionality over mocks
- Test the actual implementation, not artificial scenarios
- If mocking is needed, justify it and get approval first

## Code Quality

- Follow TypeScript best practices
- Use descriptive variable and function names
- Write comprehensive tests for all functionality
- Keep tests simple and focused on real behavior
