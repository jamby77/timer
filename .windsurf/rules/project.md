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

## Tooling

For any file related tasks, try JetBrains MCP server first before resorting to other means.

## Changelog

After completing a major bugfix or feature update, propose changelog message.

Let's walk through adding a changeset. But first, what is a changeset?

#### What is a changeset?

A changeset is a piece of information about changes made in a branch or commit. It holds three bits of information:

- What we need to release
- What version we are releasing packages at (using a [semver bump type](https://semver.org/))
- A changelog entry for the released packages

#### How to add changeset

1. Run the command line script `pnpm changeset` or `pnpn dlx @changesets/cli`.
2. Select an appropriate bump type for the changes made. See [here](https://semver.org/) for information on semver versioning.
3. Your final prompt will be to provide a message to go alongside the changeset. This will be written into the changelog when the next release occurs.

After this, a new changeset will be added which is a markdown file with YAML front matter.

```
-| .changeset/
-|-| UNIQUE_ID.md
```

The message you typed can be found in the markdown file. If you want to expand on it, you can write as much markdown as you want, which will all be added to the changelog on publish. If you want to change the bump type for the changeset, that's also fine.

While not every changeset is going to need a huge amount of detail, a good idea of what should be in a changeset is:

- WHAT the change is
- WHY the change was made
- HOW a consumer should update their code

4. Once you are happy with the changeset, commit the file to your branch.

#### Tips on adding changesets

##### You can add more than one changeset to a pull request

Changesets are designed to stack, so there's no problem with adding multiple. You might want to add more than one changeset when:

- You want to release multiple packages with different changelog entries
- You have made multiple changes to a package that should each be called out separately