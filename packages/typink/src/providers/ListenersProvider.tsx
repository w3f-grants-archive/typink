import { Contract, GenericContractApi } from 'dedot/contracts';
import { Unsub } from 'dedot/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { UseContractEvent } from 'src/hooks';
import { Props } from 'src/types';
import { useClient } from './ClientProvider.js';

export type ContractEventListener<
  T extends GenericContractApi = GenericContractApi,
  M extends keyof UseContractEvent<T> = keyof UseContractEvent<T>,
> = {
  contract: Contract<T>;
  event: M;
  callback: (events: ReturnType<T['events'][M]['filter']>) => void;
};

export interface ListenersContextProps {
  sub: (listener: ContractEventListener) => Unsub | undefined;
  listeners: ContractEventListener[];
}

export const ListenersContext = createContext<ListenersContextProps>({} as any);

export const useListeners = () => {
  return useContext(ListenersContext);
};

export function ListenersProvider({ children }: Props) {
  const { client } = useClient();
  const [listeners, setListeners] = useState<ContractEventListener[]>([]);

  useEffect(() => {
    if (!client) return;

    let unsub: Unsub | undefined;

    (async () => {
      unsub = await client.query.system.events((events) => {
        listeners.forEach((listener) => {
          const contractEvents = listener.contract.events[listener.event].filter(events);
          if (contractEvents.length === 0) return;

          listener.callback(contractEvents);
        });
      });
    })();

    return () => {
      unsub && unsub();
    };
  }, [client, listeners]);

  const sub = (listener: ContractEventListener): Unsub | undefined => {
    if (!client) {
      return;
    }

    setListeners((prev) => [...prev, listener]);

    // TODO! Improve remove listener logic and async here just to avoid create another Unsub type
    return async () => {
      setListeners((prev) => prev.filter((l) => l !== listener));
    };
  };

  return <ListenersContext.Provider value={{ sub, listeners }}>{children}</ListenersContext.Provider>;
}
