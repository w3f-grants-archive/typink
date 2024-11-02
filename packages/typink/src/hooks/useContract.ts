import { useState } from 'react';
import { useAsync } from 'react-use';
import { useTypink } from '../hooks/index.js';
import { Contract, ExecutionOptions, GenericContractApi } from 'dedot/contracts';
import { TypinkError } from '../utils/index.js';

export type UseContract<T extends GenericContractApi = GenericContractApi> = {
  contract?: Contract<T>;
};

export function useContract<T extends GenericContractApi = GenericContractApi>(
  contractId: string,
  options: ExecutionOptions = {},
): UseContract<T> {
  const { deployments, client, network, selectedAccount, defaultCaller } = useTypink();
  const [contract, setContract] = useState<Contract<T>>();

  useAsync(async () => {
    if (!client || !network) {
      setContract(undefined);
      return;
    }

    const deployment = deployments.find((d) => d.id === contractId && d.network === network.id);
    if (!deployment) {
      throw new TypinkError(`Contract deployment with id: ${contractId} not found on network: ${network.id}`);
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
  }, [client, network, selectedAccount]);

  return {
    contract,
  };
}
