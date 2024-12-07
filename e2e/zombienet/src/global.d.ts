import { LegacyClient } from 'dedot';

declare global {
  var client: LegacyClient;
  var firstTransfer: boolean;
}

export {};
