import { useState } from 'react';
import { useAsync, useLocalStorage, useToggle } from 'react-use';
import { JsonRpcApi, NetworkInfo } from '../types.js';
import { DedotClient, ISubstrateClient, JsonRpcProvider, LegacyClient, WsProvider } from 'dedot';
import { SubstrateApi } from 'dedot/chaintypes';
import { RpcVersion } from 'dedot/types';

export type CompatibleSubstrateClient = ISubstrateClient<SubstrateApi[RpcVersion]>;

export type UseApi = {
  ready: boolean;
  client?: CompatibleSubstrateClient;
};

export function useClient(network?: NetworkInfo): UseApi {
  // TODO review this again, we should expose & let end-user customize this
  const [cacheMetadata] = useLocalStorage<boolean>('TYPINK/SETTINGS/CACHE_METADATA', true);

  const [ready, setReady] = useToggle(false);
  const [client, setClient] = useState<CompatibleSubstrateClient>();

  useAsync(async () => {
    if (!network) {
      setClient(undefined);
      setReady(false);
      return;
    }

    if (client) {
      await client.disconnect();
    }

    setReady(false);

    const provider: JsonRpcProvider = new WsProvider(network.provider);

    // Using LegacyClient for now in development mode
    if (network.jsonRpcApi === JsonRpcApi.LEGACY) {
      setClient(await LegacyClient.new({ provider, cacheMetadata }));
    } else {
      setClient(await DedotClient.new({ provider, cacheMetadata }));
    }

    setReady(true);

    // TODO emit connected event or smt?
  }, [network?.provider]);

  return { ready, client };
}
