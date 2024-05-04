module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module"
  },
  ignorePatterns: [
    "/lib/**/*" // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  rules: {
    "comma-dangle": ["error", "never"],
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "import/no-unresolved": 0,
    indent: ["error", 2],
    "max-len": ["error", { code: 160, tabWidth: 2, ignoreUrls: true }],
    "prettier/prettier": ["error", { printWidth: 160, singleQuote: false, tabWidth: 2, useTabs: false, semi: true, trailingComma: "none" }],
    "object-curly-spacing": ["error", "always"],
    "require-jsdoc": "off" // This disables the require-jsdoc rule
  }
};
