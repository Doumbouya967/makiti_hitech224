import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Load `lovable-tagger` optionally so dev server doesn't crash when it's not installed
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
let componentTagger: any = undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  componentTagger = require('lovable-tagger').componentTagger
} catch (e) {
  // package not installed — skip the plugin silently
  componentTagger = undefined
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger ? componentTagger() : null].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
