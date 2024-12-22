import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployPsp22Contract, devPairs, mintPSP22Balance, wrapper } from '../utils';
import { numberToHex } from 'dedot/utils';
import { renderHook, waitFor } from '@testing-library/react';
import { usePSP22Balance } from 'typink';

describe('useContract2', () => {
  let contractAddress: string;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    contractAddress = await deployPsp22Contract(randomSalt);
    console.log('Deployed contract address', contractAddress);
  });

  it('should return undefined for invalid address', async () => {
    const { result } = renderHook(() => usePSP22Balance({ contractAddress, address: 'invalid_address' }), { wrapper });

    // The balance should remain undefined
    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });
  });

  it('should automatic update balance when watch is enabled', async () => {
    const { result } = renderHook(() => usePSP22Balance({ contractAddress, address: ALICE, watch: true }), { wrapper });

    // Wait for ALICE's balance to be fetched
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const aliceBalance = result.current.data;

    // Simulate a transfer event
    const { alice } = devPairs();
    await mintPSP22Balance(contractAddress, alice, BigInt(1e12));

    // Wait for the balance to be updated
    await waitFor(() => {
      expect(result.current.data).toBe(BigInt(1e20) + BigInt(1e12));
      expect(result.current.data).not.toEqual(aliceBalance);
    });
  });
});
