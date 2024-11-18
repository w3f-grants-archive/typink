import { useEffect, useState } from 'react';
import { useTypink } from './useTypink.js';
import { Contract, ExecutionOptions, GenericContractApi } from 'dedot/contracts';
import { TypinkError } from '../utils/index.js';

export type UseContract<T extends GenericContractApi = GenericContractApi> = {
  contract?: Contract<T>;
};

export function useContract<T extends GenericContractApi = GenericContractApi>(
  contractId: string,
  options: ExecutionOptions = {},
): UseContract<T> {
  const { deployments, client, networkId, selectedAccount, defaultCaller } = useTypink();
  const [contract, setContract] = useState<Contract<T>>();

  useEffect(() => {
    if (!client || !networkId) {
      setContract(undefined);
      return;
    }

    const deployment = deployments.find((d) => d.id === contractId && d.network === networkId);
    if (!deployment) {
      throw new TypinkError(`Contract deployment with id: ${contractId} not found on network: ${networkId}`);
    }

    const contract = new Contract<T>(
      client,
      deployment.metadata,
      deployment.address, // prettier-end-here
      {
        defaultCaller: selectedAccount?.address || defaultCaller,
        ...options,
      },
    );

    setContract(contract);
  }, [client, networkId, selectedAccount?.address, defaultCaller]);

  return {
    contract,
  };
}
