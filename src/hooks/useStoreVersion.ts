import { useEffect, useState } from 'react';
import { subscribeStore } from '../data/store';

export function useStoreVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return subscribeStore(() => {
      setVersion(current => current + 1);
    });
  }, []);

  return version;
}