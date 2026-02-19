import { defineConfig, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";

const VALID_VARIANTS: readonly string[] = ["core", "client", "provider", "admin"];

function validateAppVariant() {
  return {
    name: "validate-app-variant",
    configResolved(config: ResolvedConfig) {
      if (config.command !== "build") return;
      const v = process.env.VITE_APP_VARIANT;
      const valid = v && VALID_VARIANTS.includes(v);
      if (!valid) {
        throw new Error(
          `[Vite] VITE_APP_VARIANT must be set for production build. ` +
            `Expected one of: ${VALID_VARIANTS.join(", ")}. Got: "${v ?? "(undefined)"}"`
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [validateAppVariant(), react()],
  server: {
    port: 3000,
    strictPort: true,
  },
});
