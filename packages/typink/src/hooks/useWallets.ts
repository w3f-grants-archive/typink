import { ExtensionWallet, Wallet } from '../wallets/index.js';

const WALLETS: Wallet[] = [
  new ExtensionWallet({
    name: 'SubWallet',
    id: 'subwallet-js',
    logo: '/subwallet-logo.svg',
    installUrl: 'https://www.subwallet.app/download.html',
    websiteUrl: 'https://www.subwallet.app',
  }),
  new ExtensionWallet({
    name: 'Talisman',
    id: 'talisman',
    logo: '/talisman-logo.svg',
    installUrl: 'https://talisman.xyz/download',
    websiteUrl: 'https://talisman.xyz',
  }),
  new ExtensionWallet({
    name: 'Polkadot{.js}',
    id: 'polkadot-js',
    logo: '/polkadot-js-logo.svg',
    installUrl: 'https://polkadot.js.org/extension',
    websiteUrl: 'https://polkadot.js.org',
  }),
];

// TODO add more wallets (Enkrypt, PolkaGate,...)
// TODO allow to add custom wallets outside of the supported list

type UseWallets = {
  wallets: Wallet[];
  installedWallets: Wallet[];
};

export function useWallets(): UseWallets {
  const wallets = WALLETS;
  const installedWallets = wallets.filter((w) => w.installed);

  return { wallets, installedWallets };
}
