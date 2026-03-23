import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import LivePlayground from "../components/LivePlayground.vue";

// Formosaic styles for the live playground — core provides field animation
// and layout CSS, headless provides the default unstyled form styling.
// Other adapters (Fluent, MUI, Ant Design, etc.) use their own framework
// CSS and don't ship additional stylesheets.
import "@formosaic/core/styles.css";
import "@formosaic/headless/styles.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("LivePlayground", LivePlayground);
  },
} satisfies Theme;
