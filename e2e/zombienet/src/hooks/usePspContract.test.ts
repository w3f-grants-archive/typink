import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployPSP22Contract } from '../utils';
import { numberToHex } from 'dedot/utils';
import { Contract } from 'dedot/contracts';
import * as psp22 from '../contracts/psp22.json';
import { Psp22ContractApi } from '../contracts/psp22';

describe('usePspContract', () => {
  let contract: Contract<Psp22ContractApi>;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    const address = await deployPSP22Contract(randomSalt);
    console.log('Deployed psp22 contract address', address);
    contract = new Contract<Psp22ContractApi>(client, psp22 as any, address, { defaultCaller: ALICE });
  });

  it('get total supply', async () => {
    const { data: state } = await contract.query.psp22TotalSupply();

    console.log(`total value:`, state);
    expect(state).toBeDefined();
  });
});
