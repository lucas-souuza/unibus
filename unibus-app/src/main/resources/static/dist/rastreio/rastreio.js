window.UnibusRastreio = (() => {
  let map = null;
  let active = false;
  let visibleLines = null;
  let markers = [];
  let timer = null;
  let hasAutoCentered = false;
  let lastItems = [];
  let currentController = null;

  function clearMarkers() {
    if (!map) return;
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
  }

  function toNumberBR(value) {
    return Number(String(value || '').replace(',', '.').trim());
  }

  function normalizeLinha(value) {
    return String(value || '').trim().replace(/\D/g, '');
  }

  function renderMarkers(items) {
    if (!map) return;

    clearMarkers();

    const bounds = [];

    items.forEach(item => {
      const lat = toNumberBR(item?.latitude);
      const lng = toNumberBR(item?.longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`
        <strong>Linha ${item?.linha || '-'}</strong><br>
        Veículo: ${item?.ordem || '-'}
      `);

      markers.push(marker);
      bounds.push([lat, lng]);
    });

    if (!hasAutoCentered && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      hasAutoCentered = true;
    }
  }

  function filterLines(items) {
    if (!Array.isArray(items)) return [];

    if (visibleLines === null) return items;

    if (visibleLines.size === 0) return [];

    return items.filter(item => {
      const linhaOriginal = String(item?.linha || '').trim();
      const linhaNormalizada = normalizeLinha(item?.linha);

      return (
        visibleLines.has(linhaOriginal) ||
        visibleLines.has(linhaNormalizada)
      );
    });
  }
  function applyFilterAndRender() {
    const filtered = filterLines(lastItems);
    renderMarkers(filtered);
  }

  function mount() {
    if (map) return;

    const el = document.getElementById('map-rastreio');
    if (!el) {
      console.error('[Rastreio] Container #map-rastreio não encontrado');
      return;
    }

    map = L.map(el, { zoomControl: false }).setView(
      [-22.95489809881098, -43.168709766376395],
      15
    );

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO' }
    ).addTo(map);
  }

  function setActive(value) {
    active = !!value;
    if (active) start();
    else stop();
  }

  function setVisibleLines(obj) {
    if (!obj) {
      visibleLines = null;
      applyFilterAndRender();
      return;
    }

    visibleLines = new Set(
      Object.entries(obj)
        .filter(([, on]) => on)
        .map(([line]) => String(line).trim())
    );

    // filtra instantaneamente, sem novo fetch
    applyFilterAndRender();
  }

  function centerMap() {
    if (!map) return;

    const points = markers.map(marker => {
      const ll = marker.getLatLng();
      return [ll.lat, ll.lng];
    });

    map.invalidateSize();

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    } else {
      map.setView([-22.95489809881098, -43.168709766376395], 14);
    }
  }

  function start() {
    stop();
    refresh();
    timer = setInterval(refresh, 15000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;

    if (currentController) {
      currentController.abort();
      currentController = null;
    }
  }

  async function refresh() {
    try {
      if (currentController) currentController.abort();
      currentController = new AbortController();

      const res = await fetch('/api/onibus/posicoes', {
        headers: { Accept: 'application/json' },
        signal: currentController.signal
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      lastItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.content)
        ? data.content
        : [];

      applyFilterAndRender();
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[Rastreio] Falha no rastreio:', err);
      lastItems = [];
      renderMarkers([]);
    } finally {
      currentController = null;
    }
  }

  return { mount, setActive, setVisibleLines, centerMap };
})();