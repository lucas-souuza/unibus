import { useMemo } from 'react';
import type { BusPosition } from '../../types/bus';
import { BusMarker } from './BusMarker';

interface BusMarkersLayerProps {
  buses: BusPosition[];
  visibleLines: Set<string> | null;
}

function filterBuses(buses: BusPosition[], visibleLines: Set<string> | null): BusPosition[] {
  if (visibleLines == null || visibleLines.size === 0) {
    return buses;
  }

  const matched = buses.filter((bus) => visibleLines.has(bus.linha));
  // Painel demo (302/415/108): se nenhuma linha ao vivo bater, exibe todas as posições SPPO
  if (matched.length === 0 && buses.length > 0) {
    return buses;
  }

  return matched;
}

export function BusMarkersLayer({ buses, visibleLines }: BusMarkersLayerProps) {
  const filtered = useMemo(
    () => filterBuses(buses, visibleLines),
    [buses, visibleLines]
  );

  return (
    <>
      {filtered.map((bus) => (
        <BusMarker key={bus.ordem} bus={bus} />
      ))}
    </>
  );
}
