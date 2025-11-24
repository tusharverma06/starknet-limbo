import { useEffect, useRef } from "react";

/**
 * Hook to automatically process referral codes from URL
 */
export function useReferralProcessor(
  userFid: string | null,
  processReferral: (params: {
    fid: string;
    referrerFid: string;
  }) => Promise<void>
) {
  const processedRef = useRef(false);

  useEffect(() => {
    if (!userFid || processedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode && refCode !== userFid) {
      processedRef.current = true;

      processReferral({ fid: userFid, referrerFid: refCode })
        .then(() => {
          // Clear ref param from URL
          window.history.replaceState({}, "", window.location.pathname);
        })
        .catch(() => {
          // Silently fail
          processedRef.current = false;
        });
    }
  }, [userFid, processReferral]);
}
