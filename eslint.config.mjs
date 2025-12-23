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
    rules: {
      // ✅ 型別安全
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // ✅ 錯誤處理
      "no-empty": ["error", { "allowEmptyCatch": false }],

      // ✅ 禁止 console.log（除了 warn/error）
      "no-console": ["warn", { "allow": ["warn", "error"] }],

      // ✅ 檔案大小限制
      "max-lines": ["warn", {
        "max": 500,
        "skipBlankLines": true,
        "skipComments": true
      }],

      // ✅ 設計系統一致性
      "consistency/no-hardcoded-colors": "warn"
    }
  },
  // ✅ 特定資料夾規則
  {
    files: ["src/lib/integrations/**/*.ts"],
    rules: {
      "max-lines": ["error", { "max": 300 }]
    }
  },
  {
    files: ["src/components/**/*.tsx"],
    rules: {
      "max-lines": ["warn", { "max": 400 }]
    }
  }
]);

export default eslintConfig;
