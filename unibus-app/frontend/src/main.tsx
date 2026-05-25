import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RastreioMap, type RastreioMapHandle } from './components/map/RastreioMap';
import './styles/rastreio.css';

declare global {
  interface Window {
    UnibusRastreio?: {
      mount: () => void;
      setActive: (active: boolean) => void;
      centerMap: () => void;
      setVisibleLines: (lines: Record<string, boolean>) => void;
    };
  }
}

function Bootstrap() {
  const [active, setActive] = useState(false);
  const mapRef = useRef<RastreioMapHandle>(null);

  useEffect(() => {
    window.UnibusRastreio = {
      mount: () => setActive(true),
      setActive,
      centerMap: () => mapRef.current?.centerOnUser(),
      setVisibleLines: (lines) => mapRef.current?.setVisibleLines(lines),
    };
    return () => {
      delete window.UnibusRastreio;
    };
  }, []);

  return <RastreioMap ref={mapRef} active={active} />;
}

const container = document.getElementById('map-rastreio');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Bootstrap />
    </StrictMode>
  );
}
