/// <reference types="vitest" />

import { defineConfig } from "vite";
import { vitestSetupFilePath, getClarinetVitestsArgv } from "@stacks/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    environment: "clarinet",
    pool: "forks",
    singleFork: true,
    setupFiles: [
      vitestSetupFilePath,
    ],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },
    // Increase timeouts for mainnet contract fetching and protocol initialization
    hookTimeout: 180000,
    testTimeout: 180000,
  },
});
