import "../src/app/globals.css";

import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
// Replace your-framework with the framework you are using (e.g., react-vite, nextjs, nextjs-vite)
import { definePreview } from "@storybook/nextjs-vite";

//
// const preview: Preview = {
//   parameters: {
//     controls: {
//       matchers: {
//         color: /(background|color)$/i,
//         date: /Date$/,
//       },
//     },
//
//     a11y: {
//       // 'todo' - show a11y violations in the test UI only
//       // 'error' - fail CI on a11y violations
//       // 'off' - skip a11y checks entirely
//       test: "todo",
//     },
//   },
// };

// export default preview;

export default definePreview({
  // 👇 Add your addons here
  addons: [addonA11y(), addonDocs()],
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  // parameters: {
  //   // type-safe!
  //   a11y: {
  //     options: { xpath: true },
  //   },
  // },
});
