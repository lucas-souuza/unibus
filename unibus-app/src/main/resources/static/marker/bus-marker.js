/**
 * Unibus — Bus Marker Factory
 * Substitui o pin padrão do Leaflet por um L.divIcon
 * com identidade visual própria, consistente com o design system.
 *
 * Dependências: Leaflet já carregado, Inter disponível, bus-marker.css importado.
 */

// ─────────────────────────────────────────────
//  Paleta (mesma lógica de corBadgeLinha já existente)
// ─────────────────────────────────────────────
const BUS_MARKER_PALETTES = [
  { bg: '#F5CF27', fg: '#0B0B0B' }, // amarelo
  { bg: '#27F5EB', fg: '#0B0B0B' }, // ciano
  { bg: '#0B0B0B', fg: '#FFFFFF' }, // grafite
];

/**
 * Retorna { bg, fg } deterministicamente para um número de linha.
 * Mantém consistência com corBadgeLinha() do index.js.
 * @param {string} numeroLinha
 */
function busMarkerPalette(numeroLinha) {
  const s = String(numeroLinha).trim();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash + s.charCodeAt(i)) % BUS_MARKER_PALETTES.length;
  }
  return BUS_MARKER_PALETTES[hash];
}

// ─────────────────────────────────────────────
//  SVG do ônibus (minimalista, 12×12)
// ─────────────────────────────────────────────
const BUS_SVG = `
<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1.5" width="10" height="7" rx="2"/>
  <rect x="2" y="9.2" width="2" height="1.5" rx="0.5"/>
  <rect x="8" y="9.2" width="2" height="1.5" rx="0.5"/>
  <rect x="2" y="3"   width="3.6" height="2.4" rx="0.7" fill="rgba(255,255,255,0.28)"/>
  <rect x="6.4" y="3" width="3.6" height="2.4" rx="0.7" fill="rgba(255,255,255,0.28)"/>
  <line x1="1" y1="6.6" x2="11" y2="6.6" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>
</svg>`.trim();

// ─────────────────────────────────────────────
//  Factory principal
// ─────────────────────────────────────────────
/**
 * Cria um L.divIcon estilizado para marcadores de ônibus.
 *
 * @param {string|number} numeroLinha  Número/código da linha (ex.: "302", "415C")
 * @param {object}        [opts]
 * @param {string}        [opts.bg]    Cor de fundo (sobrescreve a paleta automática)
 * @param {string}        [opts.fg]    Cor do texto/ícone (sobrescreve a paleta automática)
 * @param {boolean}       [opts.selected=false]  Aplica estilo de seleção
 * @returns {L.DivIcon}
 */
function createBusMarkerIcon(numeroLinha, opts = {}) {
  const palette = busMarkerPalette(String(numeroLinha));
  const bg = opts.bg ?? palette.bg;
  const fg = opts.fg ?? palette.fg;
  const selected = opts.selected ?? false;

  const html = `
    <div
      class="bus-marker${selected ? ' bus-marker--selected' : ''}"
      role="img"
      aria-label="Ônibus linha ${numeroLinha}"
      style="--bm-bg:${bg};--bm-fg:${fg}"
    >
      <div class="bus-marker__pill">
        <span class="bus-marker__pulse"></span>
        <span class="bus-marker__icon">${BUS_SVG}</span>
        <span class="bus-marker__num">${numeroLinha}</span>
      </div>
      <div class="bus-marker__tail"></div>
    </div>
  `.trim();

  // iconAnchor: centraliza horizontalmente na base da cauda
  // A largura é dinâmica (depende do número de dígitos);
  // usamos um valor generoso que funciona para 3–5 chars.
  return L.divIcon({
    html,
    className: 'bus-marker-wrap',   // classe para o container do Leaflet
    iconSize:   [72, 42],           // área de clique (largura estimada + cauda)
    iconAnchor: [36, 42],           // ancora na ponta da cauda
    popupAnchor:[0, -44],           // popup sobe acima do marcador
  });
}

// ─────────────────────────────────────────────
//  Helper: dispara animação de update em marcador existente
// ─────────────────────────────────────────────
/**
 * Anima o marcador quando sua posição é atualizada (pulso sutil).
 * Chame imediatamente após marker.setLatLng(novaPos).
 *
 * @param {L.Marker} marker  Instância do marcador Leaflet
 */
function animateBusMarkerUpdate(marker) {
  const el = marker.getElement();
  if (!el) return;

  const inner = el.querySelector('.bus-marker');
  if (!inner) return;

  // Remove classe para poder re-adicionar (reinicia animação)
  inner.classList.remove('bus-marker--updated');

  // Forçar reflow para reiniciar a animação CSS
  void inner.offsetWidth;

  inner.classList.add('bus-marker--updated');

  // Limpa após a animação para não acumular classes
  inner.addEventListener('animationend', () => {
    inner.classList.remove('bus-marker--updated');
  }, { once: true });
}

// ─────────────────────────────────────────────
//  Helper: cria popup padronizado para o marcador
// ─────────────────────────────────────────────
/**
 * Gera o HTML do popup do ônibus.
 *
 * @param {object} info
 * @param {string} info.numeroLinha
 * @param {string} [info.nomeLinha]
 * @param {string} [info.trajeto]
 * @param {string} [info.velocidade]   ex.: "32 km/h"
 * @param {string} [info.atualizadoEm] ex.: "há 12s"
 */
function createBusPopupContent(info) {
  const palette = busMarkerPalette(String(info.numeroLinha));
  const nome    = info.nomeLinha ? ` · ${info.nomeLinha}` : '';
  const trajeto = info.trajeto   ?? 'Trajeto não informado';
  const vel     = info.velocidade    ? `<div class="bus-popup__row"><span>Velocidade</span><strong>${info.velocidade}</strong></div>` : '';
  const upd     = info.atualizadoEm  ? `<div class="bus-popup__row"><span>Atualizado</span><strong>${info.atualizadoEm}</strong></div>` : '';

  return `
    <div>
      <div class="bus-popup__header">
        <span class="bus-popup__badge" style="background:${palette.bg};color:${palette.fg}">
          ${info.numeroLinha}
        </span>
        <span class="bus-popup__title">Linha ${info.numeroLinha}${nome}</span>
      </div>
      <div class="bus-popup__body">
        <div class="bus-popup__row"><span>Trajeto</span><strong>${trajeto}</strong></div>
        ${vel}${upd}
      </div>
    </div>
  `.trim();
}

