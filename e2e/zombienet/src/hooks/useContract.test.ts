import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployFlipperContract } from '../utils';
import { numberToHex } from 'dedot/utils';
import { Contract } from 'dedot/contracts';
import { FlipperContractApi } from 'contracts/flipper';
import { BOB, deployPSP22Contract, devPairs, mintifyPSP22Balance, wrapper } from '../utils.js';
import { usePSP22Balance } from 'typink';
import * as flipper from '../contracts/flipper_v5.json';
import { renderHook, waitFor } from '@testing-library/react';

describe('useContract', () => {
  let contract: Contract<FlipperContractApi>;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    const address = await deployFlipperContract(randomSalt);
    console.log('Deployed contract address', address);
    contract = new Contract(client, flipper as any, address, { defaultCaller: ALICE });
  });

  it('get flipper value', async () => {
    const { data: state } = await contract.query.get();

    console.log(`Initial value:`, state);
    expect(state).toBe(true);
  });
});

describe('usePSP22Balance', () => {
  let contractAddress: string;
  beforeAll(async () => {
    const { alice, bob } = devPairs();

    const salt = numberToHex(Date.now());
    contractAddress = await deployPSP22Contract(salt);

    await mintifyPSP22Balance(contractAddress, alice, 100);
    await mintifyPSP22Balance(contractAddress, bob, 200);
  });

  it('should load balance properly', async () => {
    const { result } = renderHook(({ address }) => usePSP22Balance({ contractAddress, address }), {
      wrapper,
      initialProps: {
        address: ALICE,
      },
    });

    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current?.data).toBeGreaterThan(0n);
  });

  it('should update balance when address changes', async () => {
    const { result, rerender } = renderHook(({ address }) => usePSP22Balance({ contractAddress, address }), {
      wrapper,
      initialProps: {
        address: ALICE,
      },
    });

    // Wait for ALICE's balance to be fetched
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const aliceBalance = result.current;

    rerender({ address: BOB });

    // Initially, the balance should be undefined again
    expect(result.current.data).toBeUndefined();

    // Wait for BOB's balance to be fetched
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    // BOB's balance should be different from ALICE's
    expect(result.current.data).not.toEqual(aliceBalance);
  });

  it('should return undefined for invalid address', async () => {
    const { result } = renderHook(() => usePSP22Balance({ contractAddress, address: 'invalid_address' }), { wrapper });

    // The balance should remain undefined
    await waitFor(
      () => {
        expect(result.current.data).toBeUndefined();
      },
      { timeout: 5000 },
    );
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
    await mintifyPSP22Balance(contractAddress, alice, 100);

    // Wait for the balance to be updated
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data).not.toEqual(aliceBalance);
    });
  });
});
