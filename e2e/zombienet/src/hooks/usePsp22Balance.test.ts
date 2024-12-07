import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployAndDeposit, wrapper } from '../utils.js';
import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from '../contracts/psp22';
import * as psp22 from '../contracts/psp22.json';
import { renderHook, waitFor } from '@testing-library/react';
import { usePSP22Balance } from 'typink';

describe('usePsp22Balance', () => {
  let contract: Contract<Psp22ContractApi>;
  let contractAddress: string;
  beforeAll(async () => {
    contractAddress = await deployAndDeposit();
    console.log('Deployed contract contractAddress', contractAddress);
    contract = new Contract(client, psp22 as any, contractAddress, { defaultCaller: ALICE });
  });

  it('should load balance properly x', async () => {
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

  // it('should update balance when address changes', async () => {
  //   const { result, rerender } = renderHook(({ address }) => usePSP22Balance({ contractAddress, address }), {
  //     wrapper,
  //     initialProps: {
  //       address: ALICE,
  //     },
  //   });
  //
  //   // Wait for ALICE's balance to be fetched
  //   await waitFor(() => {
  //     expect(result.current.data).toBeDefined();
  //   });
  //
  //   const aliceBalance = result.current;
  //
  //   rerender({ address: BOB });
  //
  //   // Initially, the balance should be undefined again
  //   expect(result.current.data).toBeUndefined();
  //
  //   // Wait for BOB's balance to be fetched
  //   await waitFor(() => {
  //     expect(result.current.data).toBeDefined();
  //   });
  //
  //   // BOB's balance should be different from ALICE's
  //   expect(result.current.data).not.toEqual(aliceBalance);
  // });
  //
  // it('should return undefined for invalid address', async () => {
  //   const { result } = renderHook(() => usePSP22Balance({ contractAddress, address: 'invalid_address' }), { wrapper });
  //
  //   // The balance should remain undefined
  //   await waitFor(
  //     () => {
  //       expect(result.current.data).toBeUndefined();
  //     },
  //     { timeout: 5000 },
  //   );
  // });
  //
  // it('should automatic update balance when watch is enabled', async () => {
  //   const { result } = renderHook(() => usePSP22Balance({ contractAddress, address: ALICE, watch: true }), { wrapper });
  //
  //   // Wait for ALICE's balance to be fetched
  //   await waitFor(() => {
  //     expect(result.current.data).toBeDefined();
  //   });
  //
  //   const aliceBalance = result.current.data;
  //
  //   // Simulate a transfer event
  //   const { alice } = devPairs();
  //   await mintifyPSP22Balance(contractAddress, alice, 100);
  //
  //   // Wait for the balance to be updated
  //   await waitFor(() => {
  //     expect(result.current.data).toBeDefined();
  //     expect(result.current.data).not.toEqual(aliceBalance);
  //   });
  // });

  it('get flipper value', async () => {
    const { data: state } = await contract.query.psp22TotalSupply();

    console.log(`Initial value:`, state);
    // expect(state).toBe(true);
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

    console.log('Current value: ' + result.current.data);
  });

  it('should load balance properly 2', async () => {
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

    console.log('Current value: ' + result.current.data);
  });

  it('should load balance properly 3', async () => {
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

    console.log('Current value: ' + result.current.data);
  });
});
