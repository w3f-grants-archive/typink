import { useState } from 'react';
import { useBoolean, useDeepCompareEffect } from 'react-use';
import { useRefresher } from './useRefresher.js';
import { useTypink } from '../hooks/index.js';
import { Args, OmitNever, Pop } from '../types.js';
import { Contract, ContractCallOptions, GenericContractApi } from 'dedot/contracts';

type ContractQuery<A extends GenericContractApi = GenericContractApi> = OmitNever<{
  [K in keyof A['query']]: K extends string ? (K extends `${infer Literal}` ? Literal : never) : never;
}>;

type UseContractQueryReturnType<
  T extends GenericContractApi = GenericContractApi,
  M extends keyof ContractQuery<T> = keyof ContractQuery<T>,
> = {
  isLoading: boolean;
  refresh: () => void;
} & Partial<Awaited<ReturnType<T['query'][M]>>>;

export function useContractQuery<
  T extends GenericContractApi = GenericContractApi,
  M extends keyof ContractQuery<T> = keyof ContractQuery<T>,
>(
  parameters: {
    contract: Contract<T> | undefined;
    fn: M;
    options?: ContractCallOptions
  } & Args<Pop<Parameters<T['query'][M]>>>,
): UseContractQueryReturnType<T, M> {
  // TODO replace loading tracking state with tanstack
  const [isLoading, setIsLoading] = useBoolean(true);
  const [result, setResult] = useState<any>();
  const { refresh, refreshCounter } = useRefresher();

  const { contract, fn, args = [], options } = parameters;

  useDeepCompareEffect(() => {
    (async () => {
      if (!contract || !fn || !args) return;

      const result = await contract.query[fn](...args, options);
      setResult(result);
      setIsLoading(false);
    })();
  }, [contract, fn, args, refreshCounter]);

  return {
    isLoading,
    refresh,
    ...(result || {}),
  } as any;
}
