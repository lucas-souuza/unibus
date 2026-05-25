import { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BusMarkersLayer } from '../bus/BusMarkersLayer';
import { MapStatusOverlay } from './MapStatusOverlay';
import { useBusPositions } from '../../hooks/useBusPositions';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DEFAULT_CENTER: [number, number] = [-22.94, -43.19];
const DEFAULT_ZOOM = 13;

export interface RastreioMapHandle {
  centerOnUser: () => void;
  setVisibleLines: (lines: Record<string, boolean>) => void;
}

interface RastreioMapProps {
  active: boolean;
}

function MapResizeHandler({ active }: { active: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(timer);
  }, [active, map]);

  return null;
}

function CenterOnUserControl({ onReady }: { onReady: (fn: () => void) => void }) {
  const map = useMap();

  useEffect(() => {
    const center = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
          () => map.setView([-22.9549, -43.1687], 14)
        );
      } else {
        map.setView([-22.9549, -43.1687], 14);
      }
    };
    onReady(center);
  }, [map, onReady]);

  return null;
}

export const RastreioMap = forwardRef<RastreioMapHandle, RastreioMapProps>(
  function RastreioMap({ active }, ref) {
    const { buses, status, error, lastUpdated, retry } = useBusPositions(active);
    const [visibleLines, setVisibleLinesState] = useState<Set<string> | null>(null);
    const [centerFn, setCenterFn] = useState<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
      centerOnUser: () => centerFn?.(),
      setVisibleLines: (lines: Record<string, boolean>) => {
        const activeLines = Object.entries(lines)
          .filter(([, visible]) => visible)
          .map(([linha]) => linha);
        setVisibleLinesState(new Set(activeLines));
      },
    }));

    return (
      <div className="rastreio-map-root">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          className="rastreio-leaflet-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap &copy; CARTO"
            url={TILE_URL}
          />
          <ZoomControl position="bottomright" />
          <MapResizeHandler active={active} />
          <CenterOnUserControl onReady={setCenterFn} />
          <BusMarkersLayer buses={buses} visibleLines={visibleLines} />
        </MapContainer>

        <MapStatusOverlay
          status={status}
          error={error}
          busCount={buses.length}
          lastUpdated={lastUpdated}
          onRetry={retry}
        />
      </div>
    );
  }
);
