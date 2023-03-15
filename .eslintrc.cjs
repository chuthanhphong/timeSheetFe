module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2020,
    sourceType: "module"
  },
  extends: ["plugin:react/recommended", "prettier"],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "no-console": ["error", { allow: ["error"] }],
    "no-alert": ["error"],
    "comma-dangle": ["error", "never"],
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "object-curly-spacing": ["error", "always"],
    "max-len": ["error", { code: 140 }],
    "require-await": "error",
    "react/prop-types": "off",
    "prettier/prettier": ["error"]
  }
};
