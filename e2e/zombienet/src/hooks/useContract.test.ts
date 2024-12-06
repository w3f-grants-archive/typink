import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployAndDeposit } from '../utils.js';
import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from '../contracts/psp22';
import * as psp22 from '../contracts/psp22.json';

describe('useContract', () => {
  let contract: Contract<Psp22ContractApi>;
  let contractAddress: string;
  beforeAll(async () => {
    contractAddress= await deployAndDeposit();
    console.log('Deployed contract contractAddress', contractAddress);
    contract = new Contract(client, psp22 as any, contractAddress, { defaultCaller: ALICE });
  });

  it('get flipper value', async () => {
    const { data: state } = await contract.query.psp22TotalSupply();

    console.log(`Initial value:`, state);
    // expect(state).toBe(true);
  });

  it('...', () => {
    console.log(contractAddress);
  });
});
