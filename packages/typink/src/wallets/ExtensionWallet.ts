import { Wallet, WalletOptions } from './Wallet.js';

export interface ExtensionWalletOptions extends WalletOptions {
  installUrl: string;
  websiteUrl?: string;
}

export class ExtensionWallet extends Wallet<ExtensionWalletOptions> {
  get installUrl() {
    return this.options.installUrl;
  }

  get websiteUrl() {
    return this.options.websiteUrl;
  }

  get installed() {
    return this.ready;
  }
}
