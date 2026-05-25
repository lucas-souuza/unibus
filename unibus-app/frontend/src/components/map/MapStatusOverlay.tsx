import type { BusLoadState } from '../../hooks/useBusPositions';

interface MapStatusOverlayProps {
  status: BusLoadState;
  error: string | null;
  busCount: number;
  lastUpdated: Date | null;
  onRetry: () => void;
}

export function MapStatusOverlay({
  status,
  error,
  busCount,
  lastUpdated,
  onRetry,
}: MapStatusOverlayProps) {
  if (status === 'loading' && busCount === 0) {
    return (
      <div className="map-status map-status--loading" role="status">
        Carregando ônibus em tempo real…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="map-status map-status--error" role="alert">
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (status === 'ready' && busCount === 0) {
    return (
      <div className="map-status map-status--empty" role="status">
        Nenhum ônibus encontrado no intervalo recente.
      </div>
    );
  }

  return (
    <div className="map-status map-status--meta" aria-live="polite">
      <span>{busCount} ônibus no mapa</span>
      {lastUpdated && (
        <span> · Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}</span>
      )}
      {status === 'loading' && <span> · Atualizando…</span>}
    </div>
  );
}
