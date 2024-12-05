import { SubstrateAddress } from 'src/types';
import { useRawContract } from '../useRawContract.js';
// @ts-ignore
import * as psp22 from './contracts/psp22.json';
import { Psp22ContractApi } from './contracts/psp22';
import { useContractQuery } from '../useContractQuery.js';
import { useTypink } from '../useTypink.js';
import { useWatchContractEvent } from '../useWatchContractEvent.js';
import { useCallback } from 'react';

export function usePSP22Balance(parameters: {
  contractAddress: SubstrateAddress;
  address?: SubstrateAddress;
  watch?: boolean;
}) {
  const { defaultCaller, connectedAccount } = useTypink();
  const { contractAddress, address = connectedAccount?.address || defaultCaller, watch = false } = parameters;
  const { contract } = useRawContract<Psp22ContractApi>(psp22 as any, contractAddress);

  const result = useContractQuery({
    contract,
    fn: 'psp22BalanceOf',
    args: [address],
  });

  useWatchContractEvent(
    contract,
    'Transfer',
    useCallback(
      (events) => {
        if (!watch || events.length === 0) return;

        if (events.some(({ data }) => data.from?.eq(address) || data.to?.eq(address))) {
          result.refresh();
        }
      },
      [watch, address],
    ),
  );

  return result;
}
