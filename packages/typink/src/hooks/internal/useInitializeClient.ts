import { useState } from 'react';
import { useAsync, useToggle } from 'react-use';
import { JsonRpcApi, NetworkInfo } from '../../types.js';
import { DedotClient, ISubstrateClient, JsonRpcProvider, LegacyClient, WsProvider } from 'dedot';
import { SubstrateApi } from 'dedot/chaintypes';
import { RpcVersion } from 'dedot/types';

export type CompatibleSubstrateClient = ISubstrateClient<SubstrateApi[RpcVersion]>;

export type UseClient = {
  ready: boolean;
  client?: CompatibleSubstrateClient;
};

export type UseClientOptions = {
  cacheMetadata: boolean;
};

export function useInitializeClient(network?: NetworkInfo, options?: UseClientOptions): UseClient {
  const { cacheMetadata = false } = options || {};

  const [ready, setReady] = useToggle(false);
  const [client, setClient] = useState<CompatibleSubstrateClient>();

  useAsync(async () => {
    if (!network) {
      setClient(undefined);
      setReady(false);
      return;
    }

    if (client) {
      try {
        // TODO check this again if the network is not available
        await client.disconnect();
      } catch (e) {
        console.error(e);
      }
    }

    setReady(false);

    // TODO support light-client
    const provider: JsonRpcProvider = new WsProvider(network.provider);

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
