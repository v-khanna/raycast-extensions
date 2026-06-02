import { useExec } from "@raycast/utils";
import { useMemo } from "react";
import { getSparkPath, parseAccounts, type Account } from "./spark";

/**
 * Fetch the user's Spark accounts (cached). Exposes the raw list plus helpers
 * to check whether a given account has triage (write) access — Spark gates all
 * write operations behind a Pro "Triage" access level, so the UI hides write
 * actions for accounts that only have read access.
 */
export function useAccounts() {
  const { data, isLoading } = useExec(getSparkPath(), ["accounts"], {
    keepPreviousData: true,
  });

  const accounts = useMemo<Account[]>(
    () => (data ? parseAccounts(data) : []),
    [data],
  );

  const accessByEmail = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts) map.set(a.email.toLowerCase(), a.access);
    return map;
  }, [accounts]);

  const hasTriage = (email?: string) =>
    !!email && accessByEmail.get(email.toLowerCase()) === "triage";

  const triageAccounts = useMemo(
    () => accounts.filter((a) => a.access === "triage"),
    [accounts],
  );

  return { accounts, triageAccounts, hasTriage, isLoading };
}
