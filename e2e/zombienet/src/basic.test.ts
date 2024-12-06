import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import { ALICE, BOB, CHARLIE, deployAndDeposit, devPairs, transferNativeBalance, wrapper } from './utils';
import { renderHook, waitFor } from '@testing-library/react';
import { useBalance, useBalances, useDeployer, useDeployerTx, usePSP22Balance } from 'typink';
import { numberToHex } from 'dedot/utils';

import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from './contracts/psp22';
import { FlipperContractApi } from './contracts/flipper';
import * as psp22 from './contracts/psp22.json';
import * as flipper from './contracts/flipper_v5.json';

describe('basic client operations', () => {
  it('should get current block number', async () => {
    const blockNumber = await client.query.system.number();
    console.log('Current block number:', blockNumber);
    expectTypeOf(blockNumber).toBeNumber();
  });

  it('should fetch account balance', async () => {
    const account = await client.query.system.account('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

    console.log('Account balance:', account);

    expect(account.data.free).toBeGreaterThan(0n);
  });

  it('should transfer balance successfully', async () => {
    const { alice } = devPairs();

    await transferNativeBalance(alice, BOB, BigInt(1e12));
  });
});

describe('useBalance', () => {
  it('should load balance properly', async () => {
    const { result } = renderHook(() => useBalance(ALICE), { wrapper });

    // Initially, the balance should be undefined
    expect(result.current).toBeUndefined();

    // Wait for the balance to be fetched
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // After fetching, the free balance should be a positive bigint
    expect(result.current?.free).toBeGreaterThan(0n);
  });

  it('should update balance when address changes', async () => {
    const { result, rerender } = renderHook(({ address }) => useBalance(address), {
      wrapper,
      initialProps: { address: ALICE },
    });

    // Wait for ALICE's balance to be fetched
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const aliceBalance = result.current;

    const address = '5DFdEZVVJyT7Bz1XMznaXxPeRUTfNn2mhbKmzMnKdMfFpECD';
    rerender({ address });

    // Initially, the balance should be undefined again
    expect(result.current).toBeUndefined();

    // Wait for BOB's balance to be fetched
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // BOB's balance should be different from ALICE's
    expect(result.current?.free).toEqual(0n);
    expect(result.current).not.toEqual(aliceBalance);
  });

  it('should return undefined for invalid address', async () => {
    const { result } = renderHook(() => useBalance('invalid_address'), { wrapper });

    // The balance should remain undefined
    await waitFor(
      () => {
        expect(result.current).toBeUndefined();
      },
      { timeout: 5000 },
    );
  });

  it('should return correct balance properties', async () => {
    const { result } = renderHook(() => useBalance(ALICE), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    expect(result.current).toHaveProperty('free');
    expect(result.current).toHaveProperty('reserved');
    expect(result.current).toHaveProperty('frozen');

    expect(typeof result.current?.free).toBe('bigint');
    expect(typeof result.current?.reserved).toBe('bigint');
    expect(typeof result.current?.frozen).toBe('bigint');
  });
});

describe('useBalances', () => {
  it('should load balances properly', async () => {
    const addresses = [ALICE, BOB];
    const { result } = renderHook(() => useBalances(addresses), { wrapper });

    // Initially, the balances should be an empty object
    expect(result.current).toEqual({});

    // Wait for the balances to be fetched
    await waitFor(() => {
      expect(Object.keys(result.current).length).toBe(2);
    });

    // After fetching, both addresses should have positive free balances
    expect(result.current[ALICE].free).toBeGreaterThan(0n);
    expect(result.current[BOB].free).toBeGreaterThan(0n);
  });

  it('should update balances when addresses change', async () => {
    const { result, rerender } = renderHook(({ addresses }) => useBalances(addresses), {
      wrapper,
      initialProps: { addresses: [ALICE, BOB] },
    });

    // Wait for initial balances to be fetched
    await waitFor(() => {
      expect(Object.keys(result.current).length).toBe(2);
    });

    // Change addresses
    rerender({ addresses: [ALICE, BOB, CHARLIE] });

    // Wait for new balances to be fetched
    await waitFor(() => {
      expect(Object.keys(result.current).length).toBe(3);
    });

    expect(result.current[ALICE]).toBeDefined();
    expect(result.current[BOB]).toBeDefined();
    expect(result.current[CHARLIE]).toBeDefined();
  });

  it('should return correct balance properties for multiple addresses', async () => {
    const addresses = [ALICE, BOB, CHARLIE];
    const { result } = renderHook(() => useBalances(addresses), { wrapper });

    await waitFor(() => {
      expect(Object.keys(result.current).length).toBe(3);
    });

    for (const address of addresses) {
      expect(result.current[address]).toHaveProperty('free');
      expect(result.current[address]).toHaveProperty('reserved');
      expect(result.current[address]).toHaveProperty('frozen');

      expect(typeof result.current[address].free).toBe('bigint');
      expect(typeof result.current[address].reserved).toBe('bigint');
      expect(typeof result.current[address].frozen).toBe('bigint');
    }
  });
});

describe('useContract', () => {
  let contract: Contract<Psp22ContractApi>;
  let contractAddress: string;
  beforeAll(async () => {
    contractAddress = await deployAndDeposit();
    console.log('Deployed contract contractAddress', contractAddress);
    contract = new Contract(client, psp22 as any, contractAddress, { defaultCaller: ALICE });
  });

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
});

describe('useDeployer', () => {
  it('should load deployer properly', async () => {
    const { result } = renderHook(() => useDeployer<FlipperContractApi>(flipper as any, flipper.source.wasm!), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.deployer).toBeDefined();
    });

    // Try run to dry-run
    const salt = '0xdeadbeef';
    const dryRunResult = await result.current.deployer!.query.new(false, { salt });

    expect(dryRunResult.address).toBeDefined();
    expect(dryRunResult.raw.gasRequired).toBeDefined();
  });

  it('should update deployer when defaultCaller changes', async () => {
    const { result, rerender } = renderHook(
      ({ address }) => useDeployer(flipper as any, flipper.source.hash, { defaultCaller: address }),
      {
        wrapper,
        initialProps: { address: ALICE },
      },
    );

    await waitFor(() => {
      expect(result.current.deployer).toBeDefined();
    });

    const aliceDeployer = result.current.deployer;

    rerender({ address: BOB });

    await waitFor(() => {
      expect(result.current.deployer).toBeDefined();
    });

    // Check if the deployer has been updated
    expect(result.current.deployer?.options?.defaultCaller).not.toEqual(aliceDeployer?.options?.defaultCaller);
  });
});

describe('useDeployerTx', () => {
  it('should load deployerTx properly', async () => {
    const { result: resultDeployer } = renderHook(
      () => useDeployer<FlipperContractApi>(flipper as any, flipper.source.wasm!),
      { wrapper },
    );

    await waitFor(() => {
      expect(resultDeployer.current.deployer).toBeDefined();
    });

    const { result: resultDeployerTx } = renderHook(() => useDeployerTx(resultDeployer.current.deployer, 'new'), {
      wrapper,
    });

    await waitFor(() => {
      expect(resultDeployerTx.current.signAndSend).toBeDefined();
    });

    expect(resultDeployerTx.current.inProgress).toEqual(false);
    expect(resultDeployerTx.current.inBestBlockProgress).toEqual(false);
  });

  it('should sign and send tx', async () => {
    const { result: resultDeployer } = renderHook(
      () => useDeployer<FlipperContractApi>(flipper as any, flipper.source.wasm!),
      { wrapper },
    );

    await waitFor(() => {
      expect(resultDeployer.current.deployer).toBeDefined();
    });

    const { result: resultDeployerTx } = renderHook(() => useDeployerTx(resultDeployer.current.deployer, 'new'), {
      wrapper,
    });

    await waitFor(() => {
      expect(resultDeployerTx.current.signAndSend).toBeDefined();
    });

    const salt = numberToHex(Date.now());

    // Wait for the contract to be deployed
    const contractAddress: string = await new Promise((resolve) => {
      resultDeployerTx.current.signAndSend({
        args: [true],
        // @ts-ignore
        txOptions: { salt },
        callback: ({ status }, contractAddress) => {
          if (status.type === 'BestChainBlockIncluded') {
            console.log('Best chain block included');
          }

          if (contractAddress) {
            resolve(contractAddress);
          }
        },
      });
    });

    expect(contractAddress).toBeDefined();
    console.log('Contract is deployed at address', contractAddress);
  });
});
