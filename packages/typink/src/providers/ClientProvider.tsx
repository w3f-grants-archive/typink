import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { useInitializeClient } from '../hooks/internal/index.js';
import { useWalletContext } from './WalletProvider.js';
import { NetworkInfo, Props } from '../types.js';
import { NetworkId, SUPPORTED_NETWORKS } from '../utils/index.js';
import { ISubstrateClient } from 'dedot';
import { SubstrateApi } from 'dedot/chaintypes';
import { RpcVersion } from 'dedot/types';

export interface ClientContextProps extends Props {
  client?: ISubstrateClient<SubstrateApi[RpcVersion]>;
  ready: boolean;
  network: NetworkInfo;
  networkId: NetworkId;
  setNetworkId: (one: NetworkId) => void;
  cacheMetadata?: boolean;
}

const DEFAULT_NETWORK = NetworkId.POP_TESTNET;

export const ClientContext = createContext<ClientContextProps>({
  ready: false,
  network: SUPPORTED_NETWORKS[NetworkId.POP_TESTNET],
  networkId: NetworkId.POP_TESTNET,
  setNetworkId: () => {},
});

export const useClientContext = () => {
  return useContext(ClientContext);
};

export interface ClientProviderProps extends Props {
  defaultNetworkId?: NetworkId;
  cacheMetadata?: boolean;
}

export function ClientProvider({
  children,
  defaultNetworkId = DEFAULT_NETWORK,
  cacheMetadata = false,
}: ClientProviderProps) {
  const { injectedApi } = useWalletContext();
  const [networkId, setNetworkId] = useLocalStorage<string>('SELECTED_NETWORK_ID', defaultNetworkId);
  const network = useMemo(() => SUPPORTED_NETWORKS[networkId!], [networkId]);

  // TODO supports multi clients
  const { ready, client } = useInitializeClient(network, { cacheMetadata });

  useEffect(() => {
    client?.setSigner(injectedApi?.signer);
  }, [injectedApi, client]);

  return (
    <ClientContext.Provider
      key={networkId}
      value={{
        client,
        ready,
        network,
        networkId: networkId as NetworkId,
        setNetworkId,
        cacheMetadata,
      }}>
      {children}
    </ClientContext.Provider>
  );
}
