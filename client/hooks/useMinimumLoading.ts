import { useEffect, useState } from 'react';

export function useMinimumLoading(loading: boolean, minDelay = 300): boolean {
  const [showLoading, setShowLoading] = useState(loading);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!loading) {
      timeout = setTimeout(() => {
        setShowLoading(false);
      }, minDelay);
    } else {
      setShowLoading(true);
    }

    return () => clearTimeout(timeout);
  }, [loading, minDelay]);

  return showLoading;
}
