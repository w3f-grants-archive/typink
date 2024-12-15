import { afterAll, beforeAll } from 'vitest';
import { DedotClient, PinnedBlock, WsProvider } from 'dedot';

const CONTRACTS_NODE_ENDPOINT = 'ws://127.0.0.1:9944';

beforeAll(async () => {
  console.log(`Connect to ${CONTRACTS_NODE_ENDPOINT}`);
  global.client = await DedotClient.new(new WsProvider(CONTRACTS_NODE_ENDPOINT));

  return new Promise((resolve) => {
    global.client.chainHead.on('finalizedBlock', (x: PinnedBlock) => {
      console.log('Current finalized block number:', x.number);

      if (x.number > 2) {
        resolve(x);
      }
    });
  });
}, 120_000);

afterAll(async () => {
  await global.client.disconnect();
  console.log(`Disconnected from ${CONTRACTS_NODE_ENDPOINT}`);
});
