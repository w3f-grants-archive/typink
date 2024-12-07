import { DedotClient } from 'dedot';

declare global {
  var client: DedotClient;
  var firstTransfer: boolean;
}

export {};
