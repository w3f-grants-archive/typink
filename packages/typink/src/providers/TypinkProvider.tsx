import { createContext, useContext } from 'react';
import {
  ClientContextProps,
  ClientProvider,
  ClientProviderProps,
  useClientContext,
} from '../providers/ClientProvider.js';
import { useWalletContext, WalletContextProps, WalletProvider } from '../providers/WalletProvider.js';
import { ContractDeployment, SubstrateAddress } from '../types.js';

interface TypinkContextProps extends ClientContextProps, WalletContextProps {
  deployments: ContractDeployment[];
  // TODO validate substrate address
  defaultCaller: SubstrateAddress;


  // TODO list of networks to connect
  // TODO lazy options
}

export const TypinkContext = createContext<TypinkContextProps>({} as any);

export const useTypink = () => {
  return useContext(TypinkContext);
};

export interface TypinkProviderProps extends ClientProviderProps {
  deployments: ContractDeployment[];
  defaultCaller: string;
}

function TypinkProviderWrapper({ children, deployments, defaultCaller }: TypinkProviderProps) {
  const clientContext = useClientContext();
  const walletContext = useWalletContext();

  return (
    <TypinkContext.Provider value={{ ...clientContext, ...walletContext, deployments, defaultCaller }}>
      {children}
    </TypinkContext.Provider>
  );
}

export function TypinkProvider({ children, deployments, defaultCaller, defaultNetworkId }: TypinkProviderProps) {
  return (
    <WalletProvider>
      <ClientProvider defaultNetworkId={defaultNetworkId}>
        <TypinkProviderWrapper deployments={deployments} defaultCaller={defaultCaller}>
          {children}
        </TypinkProviderWrapper>
      </ClientProvider>
    </WalletProvider>
  );
}
