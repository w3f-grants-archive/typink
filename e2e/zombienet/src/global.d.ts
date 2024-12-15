import { DedotClient } from 'dedot';

declare global {
  var client: DedotClient;
  var initialTransfer: boolean;
}

export {};
