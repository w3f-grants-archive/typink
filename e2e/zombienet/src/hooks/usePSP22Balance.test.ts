import { beforeAll, describe } from 'vitest';
import { deployPSP22Contract } from '../utils';
import { numberToHex } from '@dedot/utils';

describe('usePSP22Balance', () => {
  let contractAddress: string;
  beforeAll(async () => {
    const salt = numberToHex(Date.now());
    contractAddress = await deployPSP22Contract(salt);

    console.log('deployed psp22 contract', contractAddress);
  });
});
