import { useState } from 'react';
import { useAsync } from 'react-use';
import { useTypink } from './useTypink.js';
import { Contract, ContractMetadata, ExecutionOptions, GenericContractApi } from 'dedot/contracts';

export function useRawContract<T extends GenericContractApi = GenericContractApi>(
  metadata?: string | ContractMetadata,
  address?: string,
  options: ExecutionOptions = {},
) {
  const { client, defaultCaller, connectedAccount } = useTypink();
  const [contract, setContract] = useState<Contract<T>>();

  useAsync(async () => {
    if (!client || !metadata || !address) {
      if (contract) {
        setContract(undefined);
      }

      return;
    }

    setContract(
      new Contract<T>(
        client,
        metadata as any,
        address, // prettier-end-here
        {
          defaultCaller: connectedAccount?.address || defaultCaller,
          ...options,
        },
      ),
    );
  }, [client, metadata, address, connectedAccount?.address, defaultCaller]);

  return {
    contract,
  };
}
