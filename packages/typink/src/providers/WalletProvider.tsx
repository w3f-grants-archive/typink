import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { useWallets } from '../hooks/index.js';
import { InjectedAccount, Props } from '../types.js';
import { Wallet } from '../wallets/index.js';
import { assert } from 'dedot/utils';
import type { Signer as InjectedSigner } from '@polkadot/api/types';

// Split these into 2 separate context (one for setup & one for signer & connected account)
export interface WalletContextProps {
  // for setting up wallets
  connectWallet: (id: string) => void;
  disconnect: () => void;

  connectedWalletId?: string;
  connectedWallet?: Wallet;

  setConnectedAccount: (account: InjectedAccount) => void;
  accounts: InjectedAccount[];

  // Important
  signer?: InjectedSigner;
  connectedAccount?: InjectedAccount;
}

export const WalletContext = createContext<WalletContextProps>({
  accounts: [],
  connectWallet: () => {},
  disconnect: () => {},
  setConnectedAccount: () => {},
});

export const useWalletContext = () => {
  return useContext(WalletContext);
};

export interface WalletProviderProps extends Props {}

export function WalletProvider({ children }: WalletProviderProps) {
  const { wallets } = useWallets();
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [signer, setSigner] = useState<InjectedSigner>();

  const [connectedWalletId, setConnectedWalletId, removeConnectedWalletId] =
    useLocalStorage<string>('TYPINK::CONNECTED_WALLET');
  const [connectedAccount, setConnectedAccount, removeConnectedAccount] =
    useLocalStorage<InjectedAccount>('TYPINK::CONNECTED_ACCOUNT');

  const getWallet = (id?: string): Wallet => wallets.find((one) => one.id === id)!;

  const connectedWallet = useMemo(() => getWallet(connectedWalletId), [connectedWalletId]);

  useEffect(() => {
    if (!connectedWalletId) return;

    let unsub: () => void;

    (async () => {
      const targetWallet: Wallet = getWallet(connectedWalletId);

      assert(targetWallet, `Wallet Id Not Found ${connectedWalletId}`);

      await targetWallet.waitUntilReady();
      const injectedProvider = targetWallet.injectedProvider;

      assert(injectedProvider?.enable, `Invalid Wallet: ${targetWallet.id}`);

      const injected = await injectedProvider.enable('Sample Dapp');

      unsub = injected.accounts.subscribe(setAccounts);

      setSigner(injected.signer);
    })();

    return () => unsub && unsub();
  }, [connectedWalletId]);

  const connectWallet = async (walletId: string) => {
    setConnectedWalletId(walletId);
  };

  const disconnect = () => {
    removeConnectedWalletId();
    setSigner(undefined);
    removeConnectedAccount();
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        connectWallet,
        signer,
        disconnect,
        connectedWalletId,
        connectedWallet,
        connectedAccount,
        setConnectedAccount,
      }}>
      {children}
    </WalletContext.Provider>
  );
}
