// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Oracle Helper Functions
 * Utilities for fetching Pyth price feeds and updating DIA oracle for testing
 */

import { Cl } from '@stacks/transactions';

// DIA Oracle constants
const DIA_ORACLE = 'SP1G48FZ4Y7JY8G2Z0N51QTCYGBQ6F4J43J77BQC0.dia-oracle';
const DIA_ORACLE_OWNER = 'SP1G48FZ4Y7JY8G2Z0N51QTCYGBQ6F4J43J77BQC0';

// Pyth price feed IDs
const PYTH_ASSET_IDS: Record<string, string> = {
  btc: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  stx: 'ec7a775f46379b5e943c3526b1c8d54cd49749176b0b98e02dde68d1bd335c17',
  usdc: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
};

/**
 * Fetches a Pyth price feed VAA for a given asset and timestamp
 * @param timestamp Unix timestamp to fetch price for
 * @param asset Asset to fetch price for ('btc', 'stx', or 'usdc')
 * @returns Object containing VAA hex string, price, and publish time
 */
export async function getOraclePriceFeed(
  timestamp: number,
  asset: 'btc' | 'stx' | 'usdc'
): Promise<{ vaa: string; price: number; publishTime?: number }> {
  const selectedAssetId = PYTH_ASSET_IDS[asset];

  if (!selectedAssetId) {
    throw new Error(
      `Invalid asset: ${asset}. Valid options: ${Object.keys(PYTH_ASSET_IDS).join(', ')}`
    );
  }

  // Check if timestamp is in the future
  const currentTime = Math.floor(Date.now() / 1000);
  if (timestamp > currentTime) {
    throw new Error(
      `Timestamp ${timestamp} is in the future (current: ${currentTime}). Oracle data is not available for future timestamps.`
    );
  }

  const timestampURL = `https://hermes.pyth.network/api/get_price_feed?id[]=${selectedAssetId}&publish_time=${timestamp}&binary=true`;

  // Retry with exponential backoff
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(timestampURL);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          `Invalid content type. Expected JSON, got: ${contentType}. Response: ${text.substring(0, 200)}`
        );
      }

      const data = (await response.json()) as {
        vaa: string;
        price: { price: number; publish_time?: number };
      };

      if (!data.vaa || !data.price) {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }

      const vaa = Buffer.from(data.vaa, 'base64').toString('hex');
      return {
        vaa,
        price: data.price.price,
        publishTime: data.price.publish_time,
      };
    } catch (error) {
      retryCount++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (retryCount >= maxRetries) {
        console.log(`\n  ORACLE FETCH FAILED - Manual Debug Info:`);
        console.log(`  Asset: ${asset}`);
        console.log(`  Asset ID: ${selectedAssetId}`);
        console.log(`  Timestamp: ${timestamp}`);
        console.log(`  Full URL: ${timestampURL}`);
        console.log(`  You can test this URL manually in your browser or curl`);
        throw new Error(
          `Failed to fetch oracle data after ${maxRetries} attempts. Last error: ${errorMessage}`
        );
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.pow(2, retryCount - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unexpected end of function');
}

/**
 * Gets the current Unix timestamp
 * @returns Current Unix timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Gets the simnet's current block timestamp
 * This is the timestamp that the simnet uses for contract execution
 * @returns Simnet block timestamp in seconds
 */
export function getSimnetBlockTimestamp(): number {
  const blockTime = Number(simnet.getBlockTime());
  return blockTime;
}

/**
 * Converts a hex VAA string to a Uint8Array for use with Cl.buffer()
 * @param vaaHex Hex string of the VAA
 * @returns Uint8Array of the VAA bytes
 */
export function vaaToBuffer(vaaHex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(vaaHex, 'hex'));
}

/**
 * Updates the DIA oracle with fresh price data
 * @param blockTimeSeconds Block time in seconds (Unix timestamp)
 * @returns Result of the oracle update call
 */
export function updateDiaOracle(blockTimeSeconds: number) {
  const diaTimestamp = blockTimeSeconds * 1000; // DIA uses milliseconds

  const result = simnet.callPublicFn(
    DIA_ORACLE,
    'set-multiple-values',
    [
      Cl.list([
        Cl.tuple({
          key: Cl.stringAscii('USDh/USD'),
          timestamp: Cl.uint(diaTimestamp),
          value: Cl.uint(100000000), // $1.00 with 8 decimals
        }),
      ]),
    ],
    DIA_ORACLE_OWNER
  );
  return result;
}
