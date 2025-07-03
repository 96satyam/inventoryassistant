import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useInventory() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:8000/inventory",
    fetcher,
    { refreshInterval: 10_000 } // real‑time every 10 s
  );
  return { data, error, isLoading };
}
