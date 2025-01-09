import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, BOB, deployPsp22Contract, psp22Metadata, wrapper } from '../utils';
import { numberToHex } from 'dedot/utils';
import { renderHook, waitFor } from '@testing-library/react';
import { useContractQuery, useContractTx, useRawContract } from 'typink';
import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from 'contracts/psp22';

describe('useContractQuery_2', () => {
  let contractAddress: string, contract: Contract<Psp22ContractApi>;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    contractAddress = await deployPsp22Contract(randomSalt);
    console.log('Deployed contract address', contractAddress);
    contract = new Contract<Psp22ContractApi>(client, psp22Metadata, contractAddress, { defaultCaller: ALICE });
  });

  it('should define error when errors occured', async () => {
    const { result: balanceOf } = renderHook(
      () => useContractQuery({ contract, args: ['0x__FAKE'], fn: 'psp22BalanceOf' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(balanceOf.current.error).toBeDefined();
    });

    console.log('Error:', balanceOf.current.error);
  });

  it('should run refresh correctly', async () => {
    const { result: rawContract } = renderHook(() => useRawContract<Psp22ContractApi>(psp22Metadata, contractAddress), {
      wrapper,
    });

    await waitFor(() => {
      expect(rawContract.current.contract).toBeDefined();
      expect(rawContract.current.contract?.client.options.signer).toBeDefined();
    });

    const contract = rawContract.current.contract;

    const { result: balanceOf } = renderHook(
      () => useContractQuery({ contract, fn: 'psp22BalanceOf', args: [ALICE] }),
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
    balanceOf.current.refresh();

    await waitFor(() => {
      expect(balanceOf.current.isRefreshing).toEqual(true);
    });

    await waitFor(() => {
      expect(balanceOf.current.isRefreshing).toEqual(false);
      expect(balanceOf.current.data).toBeDefined();
      expect(balanceOf.current.data).toEqual(beforeTranfer - BigInt(1e12));
    });
  });
});
