import { afterEach, expect, expectTypeOf, it } from 'vitest';
import {
  ALICE,
  BOB,
  CHARLIE,
  deployAndDeposit,
  devPairs,
  getNonce,
  sleep,
  transferNativeBalance,
  wrapper,
} from './utils';
import { renderHook, waitFor } from '@testing-library/react';
import { useBalance, useBalances, useDeployer, useDeployerTx, usePSP22Balance } from 'typink';
import { numberToHex } from 'dedot/utils';

import { Contract } from 'dedot/contracts';
import { FlipperContractApi } from './contracts/flipper';
import * as psp22 from './contracts/psp22.json';
import * as flipper from './contracts/flipper_v5.json';

// afterEach(async () => {
//   await sleep(1000);
// });

it('[basic client operations] should get current block number', async () => {
  const blockNumber = await client.query.system.number();
  console.log('Current block number:', blockNumber);
  expectTypeOf(blockNumber).toBeNumber();
});

it('[basic client operations] should fetch account balance', async () => {
  const account = await client.query.system.account('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

  console.log('Account balance:', account);

  expect(account.data.free).toBeGreaterThan(0n);
});

it('[basic client operations] should transfer balance successfully', async () => {
  const { alice } = devPairs();

  await transferNativeBalance(alice, BOB, BigInt(1e12));
});

// it('[basic client operations] should transfer balance successfully - 2', async () => {
//   const { alice } = devPairs();
//
//   await transferNativeBalance(alice, CHARLIE, BigInt(1e12));
// });
