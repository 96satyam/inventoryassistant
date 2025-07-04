import useSWR from "swr";
import { getApiUrl } from "../api-config";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useInventory() {
  const { data, error, isLoading } = useSWR(
    getApiUrl("/inventory"),
    fetcher,
    { refreshInterval: 10_000 } // real‑time every 10 s
  );
  return { data, error, isLoading };
}
