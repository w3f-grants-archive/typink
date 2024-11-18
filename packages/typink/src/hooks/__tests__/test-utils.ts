import { act } from '@testing-library/react';

export const waitForNextUpdate = async (then?: () => Promise<void>) => {
  await act(async () => {
    then && (await then());
    await sleep();
  });
};

export const sleep = (ms: number = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
