import { useMemo } from 'react';
import { useBalances } from './useBalances.js';

export function useBalance(address?: string) {
  const accounts = useMemo(() => (address ? [address] : []), [address]);
  const balances = useBalances(accounts);

  if (accounts.length === 0) return undefined;

  return balances[accounts[0]]?.free;
}
