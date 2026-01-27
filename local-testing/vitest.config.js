/// <reference types="vitest" />

import { defineConfig } from "vite";
import { vitestSetupFilePath, getClarinetVitestsArgv } from "@stacks/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    environment: "clarinet",
    pool: "forks",
    poolOptions: {
      threads: { singleThread: true },
      forks: { singleFork: true },
    },
    setupFiles: [
      vitestSetupFilePath,
    ],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },
    // Increase hook timeout for protocol initialization
    hookTimeout: 60000,
    testTimeout: 60000,
  },
});
