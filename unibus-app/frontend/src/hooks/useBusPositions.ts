import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBusPositions } from '../services/busApiService';
import type { BusPosition } from '../types/bus';
import { mergeBusPositions } from '../utils/markerRegistry';

const POLL_INTERVAL_MS = 30_000;

export type BusLoadState = 'idle' | 'loading' | 'ready' | 'error';

export function useBusPositions(enabled: boolean) {
  const [positions, setPositions] = useState<Map<string, BusPosition>>(new Map());
  const [status, setStatus] = useState<BusLoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const registryRef = useRef<Map<string, BusPosition>>(new Map());

  const load = useCallback(async (isInitial: boolean) => {
    if (!enabled) {
      return;
    }

    setStatus((current) => (isInitial && current === 'idle' ? 'loading' : current));
    setError(null);

    try {
      const data = await fetchBusPositions();
      registryRef.current = mergeBusPositions(registryRef.current, data);
      setPositions(new Map(registryRef.current));
      setStatus('ready');
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setStatus('error');
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void load(true);
    const intervalId = window.setInterval(() => void load(false), POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [enabled, load]);

  const retry = useCallback(() => {
    void load(true);
  }, [load]);

  const list = Array.from(positions.values());

  return { buses: list, status, error, lastUpdated, retry };
}
