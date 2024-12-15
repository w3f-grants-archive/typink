import { afterAll, beforeAll } from 'vitest';
import { DedotClient, PinnedBlock, WsProvider } from 'dedot';
import { BOB, devPairs, transferNativeBalance } from './utils';

const CONTRACTS_NODE_ENDPOINT = 'ws://127.0.0.1:9944';

beforeAll(async () => {
  console.log(`Connect to ${CONTRACTS_NODE_ENDPOINT}`);
  global.client = await DedotClient.new(new WsProvider(CONTRACTS_NODE_ENDPOINT));

  await new Promise((resolve) => {
    global.client.chainHead.on('finalizedBlock', (x: PinnedBlock) => {
      console.log('Current finalized block number:', x.number);

      if (x.number > 0) {
        resolve(x);
      }
    });
  });

  if (!global.initialTransfer) {
    console.log('initial transfer started');
    global.initialTransfer = true;

    const { alice } = devPairs();
    await transferNativeBalance(alice, BOB, BigInt(1e12));
    console.log('initial transfer done');
  }
}, 240_000);

afterAll(async () => {
  await global.client.disconnect();
  console.log(`Disconnected from ${CONTRACTS_NODE_ENDPOINT}`);
});
