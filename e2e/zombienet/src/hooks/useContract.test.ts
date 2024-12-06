import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployAndDeposit } from '../utils.js';
import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from '../contracts/psp22';
import * as psp22 from '../contracts/psp22.json';

describe('useContract', () => {
  let contract: Contract<Psp22ContractApi>;
  beforeAll(async () => {
    const address = await deployAndDeposit();
    console.log('Deployed contract address', address);
    contract = new Contract(client, psp22 as any, address, { defaultCaller: ALICE });
  });

  it('get flipper value', async () => {
    const { data: state } = await contract.query.psp22TotalSupply();

    console.log(`Initial value:`, state);
    // expect(state).toBe(true);
  });
});
