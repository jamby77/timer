import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { default as addonThemes, withThemeByClassName } from '@storybook/addon-themes'
import { definePreview, ReactRenderer } from '@storybook/nextjs-vite'
import { themes } from 'storybook/theming'

import '../src/app/globals.css'

export default definePreview({
  // 👇 Add your addons here
  addons: [addonA11y(), addonDocs(), addonThemes()],
  tags: ['autodocs'],
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'dark',
      parentSelector: 'html',
    }),
    (Story) => {
      return (
        <main className="bg-background text-foreground rounded-lg p-10">
          <Story />
        </main>
      )
    },
  ],
  parameters: {
    docs: {
      theme: themes.normal,
    },
    layout: 'centered',
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
})
