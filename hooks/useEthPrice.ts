"use client";

import { useState, useEffect } from "react";
import { getEthUsdPrice } from "@/lib/utils/price";

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const price = await getEthUsdPrice();

        if (isMounted) {
          setEthPrice(price);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch ETH price")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPrice();

    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { ethPrice, isLoading, error };
}
