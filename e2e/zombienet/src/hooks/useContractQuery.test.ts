import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, BOB, CHARLIE, deployPsp22Contract, psp22Metadata, wrapper } from '../utils';
import { numberToHex } from 'dedot/utils';
import { renderHook, waitFor } from '@testing-library/react';
import { useContractQuery, useContractTx, useRawContract } from 'typink';
import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from 'contracts/psp22';

describe('useContractQuery', () => {
  let contractAddress: string, contract: Contract<Psp22ContractApi>;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    contractAddress = await deployPsp22Contract(randomSalt);
    console.log('Deployed contract address', contractAddress);
    contract = new Contract<Psp22ContractApi>(client, psp22Metadata, contractAddress, { defaultCaller: ALICE });
  });

  it('should load total supply', async () => {
    const { result } = renderHook(() => useContractQuery({ contract, fn: 'psp22TotalSupply' }), {
      wrapper,
    });

    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.data).toBe(BigInt(1e20));
    });
  });

  it('should dry run successfully', async () => {
    const { result } = renderHook(() => useContractQuery({ contract, fn: 'psp22MintableMint', args: [BigInt(1e12)] }), {
      wrapper,
    });

    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.data?.isOk).toBe(true);
    });
  });

  it('should automatically call refresh on new block when watch is enabled', async () => {
    const { result: rawContract } = renderHook(() => useRawContract<Psp22ContractApi>(psp22Metadata, contractAddress), {
      wrapper,
    });

    await waitFor(() => {
      expect(rawContract.current.contract).toBeDefined();
      expect(rawContract.current.contract?.client.options.signer).toBeDefined();
    });

    const contract = rawContract.current.contract;

    const { result: balanceOf } = renderHook(
      () => useContractQuery({ contract, fn: 'psp22BalanceOf', args: [ALICE], watch: true }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(balanceOf.current.data).toBeDefined();
    });

    const beforeTranfer = balanceOf.current.data!;

    console.log('Before transfer:', beforeTranfer);

    const { result: transfer } = renderHook(
      () => useContractTx(contract, 'psp22Transfer'), // prettier-end-here
      {
        wrapper,
      },
    );

    await new Promise<void>((resolve) => {
      transfer.current.signAndSend({
        args: [BOB, BigInt(1e12), '0x'],
        callback: ({ status }) => {
          if (status.type === 'Finalized') {
            resolve();
          }
        },
      });
    });
    console.log('Transfer completed!');

    await waitFor(
      () => {
        expect(balanceOf.current.data).toBeDefined();
        expect(balanceOf.current.data).toEqual(beforeTranfer - BigInt(1e12));
      },
      { timeout: 12000 },
    );
    
    console.log('After transfer:', balanceOf.current.data);
  });

  it('should fail dry-run', async () => {
    const { result } = renderHook(
      () =>
        useContractQuery({
          contract,
          fn: 'psp22Transfer',
          args: [BOB, BigInt(1e12), '0x'],
          options: { caller: CHARLIE },
        }),
      {
        wrapper,
      },
    );

    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.data?.isErr).toBe(true);
      // @ts-ignore
      expect(result.current.data?.err).toEqual({ type: 'InsufficientBalance' });
    });
  });
});
