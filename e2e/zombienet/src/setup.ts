import { DedotClient, WsProvider } from 'dedot';
import { BOB, devPairs, transferNativeBalance } from './utils';

const CONTRACTS_NODE_ENDPOINT = 'ws://127.0.0.1:9944';

const getConst = (pallet: string, name: string) => {
  try {
    return client.consts[pallet][name];
  } catch {
    // ignore this on purpose
  }

  return undefined;
};

export async function setup() {
  console.log(`Connect to ${CONTRACTS_NODE_ENDPOINT}`);
  global.client = await DedotClient.new(new WsProvider(CONTRACTS_NODE_ENDPOINT));

  console.log('system.blockHashCount', getConst('system', 'blockHashCount'));
  console.log('babe.expectedBlockTime', getConst('babe', 'expectedBlockTime'));
  console.log('aura.slotDuration', getConst('aura', 'slotDuration'));
  console.log('timestamp.minimumPeriod', getConst('timestamp', 'minimumPeriod'));

  await new Promise<void>((resolve) => {
    global.client.rpc.chain_subscribeFinalizedHeads((head) => {
      console.log('Current finalized block number:', head.number);

      if (head.number > 3) {
        resolve();
      }
    });
  });

  console.log('Trigger first transfer');
  const { alice } = devPairs();
  await transferNativeBalance(alice, BOB, BigInt(1e12));
}

export async function teardown() {
  await global.client.disconnect();
  console.log(`Disconnected from ${CONTRACTS_NODE_ENDPOINT}`);
}
