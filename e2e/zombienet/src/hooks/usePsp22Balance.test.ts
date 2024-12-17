import { beforeAll, describe, expect, it } from 'vitest';
import { ALICE, deployPsp22Contract, psp22Metadata } from '../utils';
import { numberToHex } from 'dedot/utils';
import { Contract } from 'dedot/contracts';
import { Psp22ContractApi } from '../contracts/psp22';

describe('usePsp22Balance', () => {
  let contract: Contract<Psp22ContractApi>;
  beforeAll(async () => {
    const randomSalt = numberToHex(Date.now());
    const address = await deployPsp22Contract(randomSalt);
    console.log('Deployed contract address', address);
    contract = new Contract<Psp22ContractApi>(client, psp22Metadata, address, { defaultCaller: ALICE });
  });

  it('get total supply', async () => {
    const { data: state } = await contract.query.psp22TotalSupply();

    console.log(`Total supply`, state);
    expect(state).toBeDefined();
  });

  it('get balance of', async () => {
    const { data: state } = await contract.query.psp22BalanceOf(ALICE);

    console.log(`balance of alice`, state);
    expect(state).toBeDefined();
  });
});
