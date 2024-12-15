import { development, InjectedSigner, Props, SignerPayloadJSON, TypinkProvider } from 'typink';
import Keyring from '@polkadot/keyring';
import { FlipperContractApi } from './contracts/flipper';
// @ts-ignore
import * as flipper from './contracts/flipper_v5.json';
// @ts-ignore
import * as psp22 from './contracts/psp22.json';
import { Contract, ContractDeployer, parseRawMetadata } from 'dedot/contracts';
import { assert, deferred, numberToHex } from 'dedot/utils';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';
import { TypeRegistry } from '@polkadot/types';
import { Psp22ContractApi } from './contracts/psp22';

await cryptoWaitReady();
export const KEYRING = new Keyring({ type: 'sr25519' });
export const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
export const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
export const CHARLIE = '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y';

export const flipperMetadata = parseRawMetadata(JSON.stringify(flipper));
export const mockSigner = {
  signPayload: async (payloadJSON: SignerPayloadJSON) => {
    const { alice } = devPairs();

    const registry = new TypeRegistry();
    registry.setSignedExtensions(payloadJSON.signedExtensions);

    // https://github.com/polkadot-js/extension/blob/master/packages/extension-base/src/background/RequestExtrinsicSign.ts#L18-L22
    const payload = registry.createType('ExtrinsicPayload', payloadJSON, { version: payloadJSON.version });
    const result = payload.sign(alice);

    return {
      id: Date.now(),
      ...result,
    };
  },
} as InjectedSigner;

export const wrapper = ({ children }: Props) => (
  <TypinkProvider
    supportedNetworks={[development]}
    defaultNetworkId={development.id}
    deployments={[]}
    defaultCaller={ALICE}
    signer={mockSigner}
    connectedAccount={{ address: ALICE }}>
    {children}
  </TypinkProvider>
);

export const transferNativeBalance = async (from: KeyringPair, to: string, value: bigint): Promise<void> => {
  console.log('[transferNativeBalance]');

  const defer = deferred<void>();
  await logNonce(from.address);

  await client.tx.balances
    .transferKeepAlive(to, value) // prettier-end-here
    .signAndSend(from, async ({ status }) => {
      console.log(`Transaction status:`, status.type);

      if (status.type === 'BestChainBlockIncluded') {
        defer.resolve();
      }
    });

  return defer.promise;
};

export const deployPSP22Contract = async (salt?: string): Promise<string> => {
  console.log('[deployPSP22Contract]');
  await logNonce(ALICE);

  const { alice } = devPairs();

  const caller = alice.address;

  const wasm = psp22.source.wasm!;
  const deployer = new ContractDeployer<Psp22ContractApi>(client, psp22 as any, wasm);

  // Dry-run to estimate gas fee
  const {
    raw: { gasRequired },
  } = await deployer.query.new(2000n, 'USDT Coin', 'USDT', 0, {
    caller,
    salt,
  });

  console.log('Estimated gas required: ', gasRequired);

  const defer = deferred<string>();

  await deployer.tx
    .new(2000n, 'USDT Coin', 'USDT', 0, { gasLimit: gasRequired, salt }) // prettier-end-here;
    .signAndSend(alice, async ({ status, events }) => {
      console.log('Transaction status:', status.type);

      if (status.type === 'BestChainBlockIncluded') {
        const instantiatedEvent = client.events.contracts.Instantiated.find(events);

        assert(instantiatedEvent, 'Event Contracts.Instantiated should be available');

        const contractAddress = instantiatedEvent.palletEvent.data.contract.address();
        defer.resolve(contractAddress);
      }
    });

  return defer.promise;
};

export const mintifyPSP22Balance = async (psp22Address: string, pair: KeyringPair, amount: number): Promise<void> => {
  console.log('[mintifyPSP22Balance]', psp22Address, amount);
  await logNonce(pair.address);

  const contract = new Contract<Psp22ContractApi>(client, psp22 as any, psp22Address);

  const {
    raw: { gasRequired },
  } = await contract.query.psp22MintableMint(BigInt(100 * Math.pow(10, 6)));

  const defer = deferred<void>();
  await contract.tx
    .psp22MintableMint(BigInt(amount * Math.pow(10, 6)), {
      gasLimit: gasRequired,
    })
    .signAndSend(pair, ({ status }) => {
      console.log('Transaction status:', status.type);

      if (status.type === 'BestChainBlockIncluded') {
        defer.resolve();
      }
    });

  return defer.promise;
};

export const deployFlipperContract = async (salt?: string): Promise<string> => {
  console.log('[deployFlipperContract]');
  await logNonce(ALICE);

  const { alice } = devPairs();

  const caller = alice.address;

  const wasm = flipper.source.wasm!;
  const deployer = new ContractDeployer<FlipperContractApi>(client, flipper as any, wasm);

  // Dry-run to estimate gas fee
  const {
    raw: { gasRequired },
  } = await deployer.query.new(true, {
    caller,
    salt,
  });

  console.log('Estimated gas required: ', gasRequired);

  const defer = deferred<string>();

  await deployer.tx
    .new(true, { gasLimit: gasRequired, salt }) // prettier-end-here;
    .signAndSend(alice, async ({ status, events }) => {
      console.log('Transaction status:', status.type);

      if (status.type === 'BestChainBlockIncluded') {
        const instantiatedEvent = client.events.contracts.Instantiated.find(events);

        assert(instantiatedEvent, 'Event Contracts.Instantiated should be available');

        const contractAddress = instantiatedEvent.palletEvent.data.contract.address();
        defer.resolve(contractAddress);
      }
    });

  return defer.promise;
};

export const devPairs = () => {
  const alice = KEYRING.addFromUri('//Alice');
  const bob = KEYRING.addFromUri('//Bob');
  return { alice, bob };
};

export const deployAndDeposit = async (): Promise<string> => {
  console.log('[deployAndDeposit]');

  const { alice, bob } = devPairs();

  const salt = numberToHex(Date.now());
  const contractAddress = await deployPSP22Contract(salt);

  await mintifyPSP22Balance(contractAddress, alice, 100);
  await mintifyPSP22Balance(contractAddress, bob, 200);

  return contractAddress;
};

const logNonce = async (address: string) => {
  console.log(`[logNonce] ${address}: ${await getNonce(address)}`);
};

const getNonce = async (signerAddress: string) => {
  try {
    return (await client.query.system.account(signerAddress)).nonce;
  } catch {}

  try {
    return await client.call.accountNonceApi.accountNonce(signerAddress);
  } catch {}

  return 0;
};
