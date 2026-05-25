import { useMemo } from 'react';
import { DivIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { BusPosition } from '../../types/bus';
import { getLineColor } from '../../utils/lineColors';

interface BusMarkerProps {
  bus: BusPosition;
}

function buildRouteLabel(bus: BusPosition): string {
  if (bus.pontoPartida && bus.pontoFinal) {
    return `${bus.pontoPartida} → ${bus.pontoFinal}`;
  }
  return bus.routeLongName || 'Rota não identificada';
}

function createBusIcon(linha: string): DivIcon {
  const color = getLineColor(linha);
  return new DivIcon({
    className: '',
    html: `<div class="bus-marker-dot" style="--bus-color:${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function BusMarker({ bus }: BusMarkerProps) {
  const routeLabel = buildRouteLabel(bus);
  const icon = useMemo(() => createBusIcon(bus.linha), [bus.linha]);

  return (
    <Marker position={[bus.latitude, bus.longitude]} icon={icon}>
      <Popup>
        <div className="bus-popup">
          <strong>Linha {bus.linha}</strong>
          <p>{routeLabel}</p>
          <small>Veículo {bus.ordem}</small>
        </div>
      </Popup>
    </Marker>
  );
}
