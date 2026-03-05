// src/hooks/useRoxFlag.js
import { useEffect, useState } from 'react';
import { getFlagsSnapshot, subscribeFlags } from '../flags';

/**
 * React hook returning the current boolean value of a flag key from flags.js.
 * Example: const isOn = useRoxFlag('adminHealth');
 */
export default function useRoxFlag(key) {
  const [val, setVal] = useState(() => !!getFlagsSnapshot()[key]);
  useEffect(() => {
    return subscribeFlags((_reason, snap) => setVal(!!snap[key]));
  }, [key]);
  return val;
}