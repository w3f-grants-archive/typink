import { Unsub } from 'dedot/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { Props } from '../types.js';
import { useClient } from './ClientProvider.js';
import type { FrameSystemEventRecord } from 'dedot/chaintypes';

export type EventListener = (events: FrameSystemEventRecord[]) => void;

export interface ListenersContextProps {
  sub: (listener: EventListener) => Unsub | undefined;
  listeners: EventListener[];
}

export const ListenersContext = createContext<ListenersContextProps>({} as any);

export const useListeners = () => {
  return useContext(ListenersContext);
};

export function ListenersProvider({ children }: Props) {
  const { client } = useClient();
  const [listeners, setListeners] = useState<EventListener[]>([]);

  useEffect(() => {
    if (!client) return;

    let unsub: Unsub | undefined;

    (async () => {
      unsub = await client.query.system.events((events) => {
        listeners.forEach((callback) => callback(events));
      });
    })();

    return () => {
      unsub && unsub();
    };
  }, [client, listeners]);

  const sub = (listener: EventListener): Unsub | undefined => {
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
