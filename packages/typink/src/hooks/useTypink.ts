import { useContext } from 'react';
import { TypinkContext } from '../providers/index.js';

export const useTypink = () => {
  return useContext(TypinkContext);
};