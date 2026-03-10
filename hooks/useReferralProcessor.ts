import { useEffect, useRef } from "react";

/**
 * Hook to automatically process referral codes from URL
 */
export function useReferralProcessor(
  address: string | null,
  processReferral: (params: {
    address: string;
    referrerAddress: string;
  }) => Promise<void>
) {
  const processedRef = useRef(false);

  useEffect(() => {
    if (!address || processedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode && refCode.toLowerCase() !== address.toLowerCase()) {
      processedRef.current = true;

      processReferral({ address, referrerAddress: refCode })
        .then(() => {
          // Clear ref param from URL
          window.history.replaceState({}, "", window.location.pathname);
        })
        .catch(() => {
          // Silently fail
          processedRef.current = false;
        });
    }
  }, [address, processReferral]);
}
