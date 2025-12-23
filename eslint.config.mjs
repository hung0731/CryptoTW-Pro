import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import localRules from "./tools/eslint-local-rules.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "consistency": localRules
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      // ✅ 型別安全
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unused-vars": "off",

      // ✅ 錯誤處理
      "no-empty": ["error", { "allowEmptyCatch": false }],

      // ✅ 禁止 console.log（除了 warn/error）
      "no-console": "off",

      // ✅ 檔案大小限制
      "max-lines": "off",

      // ✅ 設計系統一致性
      "consistency/no-hardcoded-colors": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  },
  // ✅ Tools Configuration (No Type Checking)
  {
    files: ["tools/**/*.{js,ts}"],
    languageOptions: {
      parserOptions: {
        project: null
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  // ✅ Script files (Clean parser options)
  {
    files: ["scripts/**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      parserOptions: {
        project: null
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },

  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      parserOptions: {
        project: null
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);

export default eslintConfig;
