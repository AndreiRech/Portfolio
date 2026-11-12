import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture boundaries (docs/frontend-architecture.md).
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/layouts/*", "@/app/*"],
              message: "shared/ stays independent of features and layouts.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/features/**/model/**/*.{ts,tsx,mts}",
      "src/features/**/services/**/*.{ts,tsx,mts}",
      "src/features/**/data/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/components/*",
                "**/pages/*",
                "**/hooks/*",
                "@/layouts/*",
                "@/shared/ui/*",
              ],
              message: "Models, services and data do not depend on the UI.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/features/**/{pages,components,hooks}/**/*.{ts,tsx}",
      "src/layouts/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "HTTP calls belong in a feature's services/.",
        },
      ],
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
