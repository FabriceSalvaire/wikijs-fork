import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";

export default defineConfig([
  // Base config for all JavaScript files
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"]
  },

  // Source code rules
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node
      // globals: {
      //   ...globals.node
      // }
    },
    rules: {
      // Allow unused variables if they are prefixed with _
      "no-unused-vars": ["error", {
          "argsIgnorePattern": "^_.+",
          "varsIgnorePattern": "^_.+",
          "caughtErrorsIgnorePattern": "^_.+"
      }]
    }
  },

  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"]
  },

  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"]
  },

  // Ignore patterns
  {
    ignores: [
      "node_modules/",
    ]
  }
]);
