import { beforeAll, describe, expect, it } from 'vitest';
import { BOB, deployPsp22Contract, psp22Metadata, wrapper } from '../utils';
import { numberToHex } from 'dedot/utils';
import { renderHook, waitFor } from '@testing-library/react';
import { useContractTx, useRawContract } from 'typink';
import { Psp22ContractApi } from 'contracts/psp22';

describe('useContractQueryTx', () => {
  let contractAddress: string;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    contractAddress = await deployPsp22Contract(randomSalt);
    console.log('Deployed contract address', contractAddress);
  });

  it('should mint token successfully', async () => {
    const { result: rawContract } = renderHook(
      () => useRawContract<Psp22ContractApi>(psp22Metadata, psp22Metadata.source.wasm!),
      { wrapper },
    );

    console.log('checkpoint 1');
    await waitFor(() => {
      expect(rawContract.current.contract).toBeDefined();
      expect(rawContract.current.contract?.client.options.signer).toBeDefined();
    });
    console.log('checkpoint 2');

    const contract = rawContract.current.contract;

    const { result } = renderHook(() => useContractTx(contract, 'psp22MintableMint'), {
      wrapper,
    });
    console.log('checkpoint 3');

    expect(result.current.signAndSend).toBeDefined();
    console.log('checkpoint 4');

    // Wait for the contract to be deployed
    await new Promise<void>((resolve) => {
      result.current.signAndSend({
        args: [BigInt(1e12)],
        callback: ({ status }) => {
          if (status.type === 'BestChainBlockIncluded' || status.type === 'Finalized') {
            console.log('Best chain block included');
            resolve();
          }
        },
      });
    });
  });

  // it('should throw an error due to balance insufficient', async () => {
  //   const { result } = renderHook(
  //     () => useContractQuery({ contract, fn: 'psp22Transfer', args: [BOB, BigInt(1e12), '0x'] }),
  //     {
  //       wrapper,
  //     },
  //   );
  //
  //   expect(result.current.data).toBeUndefined();
  //
  //   await waitFor(() => {
  //     expect(result.current.data?.isOk).toBe(true);
  //   });
  // });
});
