/**
 * Unibus — Home Map
 * Exibe em tempo real apenas os ônibus das linhas que atendem à UNIRIO.
 *
 * Dependências (já carregadas antes deste arquivo):
 *   - Leaflet (L)
 *   - bus-marker.js  → createBusMarkerIcon, createBusPopupContent, animateBusMarkerUpdate
 *
 * Uso:
 *   UnibusHomeMap.mount();
 *
 * NÃO alterar rastreio.js nem window.UnibusRastreio.
 */
window.UnibusHomeMap = (() => {

  // ── Linhas monitoradas ──────────────────────────────────────────────────
  const LINHAS_UNIRIO = new Set(['107', '167', '513', '518', '519']);

  // ── Estado interno ──────────────────────────────────────────────────────
  let map             = null;
  let markers         = [];        // L.Marker ativos
  let timer           = null;
  let hasAutoCentered = false;
  let currentController = null;

  // Centro padrão: UNIRIO
  const DEFAULT_CENTER = [-22.95489809881098, -43.168709766376395];
  const DEFAULT_ZOOM   = 15;

  // ── Utilitários (espelham rastreio.js) ─────────────────────────────────
  function toNumberBR(value) {
    return Number(String(value || '').replace(',', '.').trim());
  }

  function horaAtual() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Info bar ────────────────────────────────────────────────────────────
  function atualizarInfoBar(total) {
    const el = document.getElementById('home-map-info');
    if (!el) return;
    if (total === 0) {
      el.textContent = 'Nenhum ônibus monitorado no momento';
    } else {
      el.textContent = `${total} ônibus monitorado${total > 1 ? 's' : ''} • atualizado às ${horaAtual()}`;
    }
  }

  // ── Lista rápida (#home-buses-list) ────────────────────────────────────
  function renderLista(items) {
    const lista = document.getElementById('home-buses-list');
    if (!lista) return;

    if (items.length === 0) {
      lista.innerHTML = `
        <div class="bus-loading">
          Nenhum ônibus das linhas UNIRIO encontrado.
        </div>`;
      return;
    }

    // Agrupa por linha para exibir uma entrada por linha (não por veículo)
    const porLinha = new Map();
    items.forEach(item => {
      const linha = String(item?.linha || '-').trim();
      if (!porLinha.has(linha)) porLinha.set(linha, []);
      porLinha.get(linha).push(item);
    });

    const html = [...porLinha.entries()].map(([linha, veiculos]) => {
      const palette  = busMarkerPalette(linha);
      const count    = veiculos.length;
      const label    = count === 1 ? '1 ônibus' : `${count} ônibus`;

      // Pega velocidade média se disponível
      const vels = veiculos
        .map(v => parseFloat(String(v?.velocidade || '').replace(',', '.')))
        .filter(v => Number.isFinite(v) && v > 0);
      const velMedia = vels.length
        ? Math.round(vels.reduce((a, b) => a + b, 0) / vels.length)
        : null;
      const velHtml = velMedia !== null
        ? `<span class="bus-list-vel">${velMedia} km/h</span>`
        : '';

      return `
        <div class="bus-list-item" data-linha="${linha}">
          <span class="bus-list-badge"
                style="background:${palette.bg};color:${palette.fg}">
            ${linha}
          </span>
          <span class="bus-list-count">${label}</span>
          ${velHtml}
        </div>`;
    }).join('');

    lista.innerHTML = html;

    // Clique no item da lista: foca no primeiro ônibus daquela linha no mapa
    lista.querySelectorAll('.bus-list-item').forEach(el => {
      el.addEventListener('click', () => {
        const linha = el.dataset.linha;
        const marker = markers.find(m => {
          const el2 = m.getElement();
          return el2 && el2.querySelector(`[aria-label*="${linha}"]`);
        });
        if (marker && map) {
          map.setView(marker.getLatLng(), 16, { animate: true });
          marker.openPopup();
        }
      });
    });
  }

  // ── Renderização de marcadores ──────────────────────────────────────────
  function renderMarkers(items) {
    if (!map) return;

    // Índice dos marcadores atuais por ordem (id do veículo)
    const previousByOrdem = {};
    markers.forEach(m => {
      if (m._ordemId) previousByOrdem[m._ordemId] = m;
    });

    // Remove marcadores que sumiram da API
    const newOrdems = new Set(items.map(i => String(i?.ordem || '')));
    markers.forEach(m => {
      if (!m._ordemId || !newOrdems.has(m._ordemId)) {
        map.removeLayer(m);
      }
    });
    markers = [];

    const bounds = [];

    items.forEach(item => {
      const lat = toNumberBR(item?.latitude);
      const lng = toNumberBR(item?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const ordemId  = String(item?.ordem || '');
      const numero   = String(item?.linha  || '-');
      const existing = previousByOrdem[ordemId];

      let marker;

      if (existing) {
        // Ônibus já no mapa: move e anima, sem recriar
        existing.setLatLng([lat, lng]);
        animateBusMarkerUpdate(existing);
        marker = existing;
      } else {
        // Ônibus novo: cria com ícone do bus-marker.js
        marker = L.marker([lat, lng], {
          icon: createBusMarkerIcon(numero)
        }).addTo(map);

        marker.bindPopup(
          createBusPopupContent({
            numeroLinha: numero,
            nomeLinha:   item?.ordem        || null,
            trajeto:     item?.routeLongName || null,
            velocidade:  item?.velocidade    ? `${item.velocidade} km/h` : null,
          }),
          { className: 'bus-popup', maxWidth: 240, minWidth: 200, closeButton: false }
        );
      }

      marker._ordemId = ordemId;
      markers.push(marker);
      bounds.push([lat, lng]);
    });

    // Centraliza apenas na primeira carga com ônibus; depois o usuário navega livre
    if (!hasAutoCentered && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], DEFAULT_ZOOM);
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      hasAutoCentered = true;
    }

    atualizarInfoBar(markers.length);
  }

  // ── Fetch e filtragem ───────────────────────────────────────────────────
  async function refresh() {
    try {
      if (currentController) currentController.abort();
      currentController = new AbortController();

      const res = await fetch('/api/onibus/posicoes', {
        headers: { Accept: 'application/json' },
        signal: currentController.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Mesmo tratamento do rastreio.js
      const all = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.content)
            ? data.content
            : [];

      // Filtra apenas as linhas da UNIRIO
      const filtrados = all.filter(item =>
        LINHAS_UNIRIO.has(String(item?.linha || '').trim())
      );

      renderMarkers(filtrados);
      renderLista(filtrados);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[HomeMap] Falha ao buscar posições:', err);
      renderMarkers([]);
      renderLista([]);
    } finally {
      currentController = null;
    }
  }

  // ── Inicialização ───────────────────────────────────────────────────────
  function mount() {
    if (map) return; // já montado — idempotente

    const el = document.getElementById('map');
    if (!el) {
      console.error('[HomeMap] Container #map não encontrado');
      return;
    }

    map = L.map(el, { zoomControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO' }
    ).addTo(map);

    // Pin fixo da UNIRIO — Av. Pasteur, 458
    const uniIcon = L.divIcon({
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.25 14 22 14 22S28 23.25 28 14C28 6.27 21.73 0 14 0z"
                fill="#0B0B0B"/>
          <circle cx="14" cy="14" r="6" fill="#F5CF27"/>
        </svg>`,
      className: '',
      iconSize:   [28, 36],
      iconAnchor: [14, 36],
      popupAnchor:[0, -38],
    });

    L.marker(DEFAULT_CENTER, { icon: uniIcon, interactive: true, zIndexOffset: -100 })
      .addTo(map)
      .bindPopup(
        `<div style="font-size:0.88rem;line-height:1.5">
          <strong>UNIRIO</strong><br>
          Av. Pasteur, 458 — Urca<br>
          <span style="color:#888">Rio de Janeiro, RJ</span>
        </div>`,
        { className: 'bus-popup', maxWidth: 200, closeButton: false }
      );

    // Primeira carga + polling a cada 30s
    refresh();
    timer = setInterval(refresh, 30000);

    // Botão "Atualizar"
    const btnRefresh = document.getElementById('home-map-refresh');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        btnRefresh.disabled = true;
        btnRefresh.textContent = 'Atualizando...';
        refresh().finally(() => {
          btnRefresh.disabled = false;
          btnRefresh.textContent = 'Atualizar';
        });
      });
    }
  }

  // API pública (mínima, para não poluir o escopo global)
  return { mount };

})();