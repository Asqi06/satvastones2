import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Legacy codebase intentionally uses `any` in admin panels and API routes.
      "@typescript-eslint/no-explicit-any": "off",
      // Apostrophes/quotes in product copy trigger this; not a correctness issue.
      "react/no-unescaped-entities": "off",
      // Server component / route modules declare helpers after usage; common Next pattern.
      "@typescript-eslint/no-use-before-define": "off",
      // New react-hooks v6 rules are stricter than legacy code warrants.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
