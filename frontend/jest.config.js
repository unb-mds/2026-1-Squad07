// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  coverageThreshold: {
    global: { lines: 90, functions: 90, branches: 90, statements: 90 },
  },
  collectCoverageFrom: [
    "src/lib/api/client.ts",
    "src/components/ui/utils.ts",
    "src/components/ui/button.tsx",
    "src/components/ui/input.tsx",
    "src/components/ui/badge.tsx",
  ],
};

module.exports = createJestConfig(config);
