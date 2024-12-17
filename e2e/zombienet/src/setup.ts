import { afterAll, beforeAll } from 'vitest';
import { DedotClient, PinnedBlock, WsProvider } from 'dedot';
import { BOB, devPairs, transferNativeBalance } from './utils';

const CONTRACTS_NODE_ENDPOINT = 'ws://127.0.0.1:9944';

export const sleep = (ms: number = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const kickOff = async () => {
  const { alice } = devPairs();

  while (true) {
    const nonce = (await client.query.system.account(alice.address)).nonce;
    console.log('current none', nonce);
    if (nonce > 0) {
      break;
    }

    try {
      await transferNativeBalance(alice, BOB, BigInt(1e12));
    } catch (e) {
      console.log(e);
      await sleep(5000);
    }
  }
};

beforeAll(async () => {
  console.log(`Connect to ${CONTRACTS_NODE_ENDPOINT}`);
  global.client = await DedotClient.new(new WsProvider(CONTRACTS_NODE_ENDPOINT));

  await new Promise((resolve) => {
    global.client.chainHead.on('finalizedBlock', (x: PinnedBlock) => {
      console.log('Current finalized block number:', x.number);

      if (x.number > 2) {
        resolve(x);
      }
    });
  });

  await kickOff();
}, 300_000);

afterAll(async () => {
  await global.client.disconnect();
  console.log(`Disconnected from ${CONTRACTS_NODE_ENDPOINT}`);
});
