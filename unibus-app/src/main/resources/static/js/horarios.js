// ─────────────────────────────────────────────
//  Section: Horários
//  Depende dos IDs:
//    schedule-line-search, schedule-line-results,
//    schedule-title, schedule-loading,
//    schedule-content, schedule-empty,
//    schedule-error, schedule-placeholder
// ─────────────────────────────────────────────

(function () {
  // ── Referências do DOM ──────────────────────
  const searchInput     = document.getElementById('schedule-line-search');
  const searchResults   = document.getElementById('schedule-line-results');
  const scheduleTitle   = document.getElementById('schedule-title');
  const schedulePlaceholder = document.getElementById('schedule-placeholder');
  const scheduleLoading = document.getElementById('schedule-loading');
  const scheduleContent = document.getElementById('schedule-content');
  const scheduleEmpty   = document.getElementById('schedule-empty');
  const scheduleError   = document.getElementById('schedule-error');

  // Aborta se a section não estiver na página
  if (!searchInput) return;

  // ── Debounce helper ─────────────────────────
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ── Formata "07:5:3" → "07:05" ──────────────
  function formatarHorario(horario) {
    if (!horario) return '—';
    const partes = horario.split(':');
    if (partes.length < 2) return horario;
    const h = partes[0].padStart(2, '0');
    const m = partes[1].padStart(2, '0');
    return `${h}:${m}`;
  }

  // ── Controle de estados ──────────────────────
  function limparEstados() {
    schedulePlaceholder && (schedulePlaceholder.hidden = true);
    scheduleLoading     && (scheduleLoading.hidden     = true);
    scheduleContent     && (scheduleContent.hidden     = true);
    scheduleEmpty       && (scheduleEmpty.hidden       = true);
    scheduleError       && (scheduleError.hidden       = true);
    if (scheduleContent) scheduleContent.innerHTML = '';
  }

  function mostrarEstado(estado) {
    limparEstados();
    const mapa = {
      placeholder: schedulePlaceholder,
      loading:     scheduleLoading,
      content:     scheduleContent,
      empty:       scheduleEmpty,
      error:       scheduleError,
    };
    const el = mapa[estado];
    if (el) el.hidden = false;
  }

  // ── Dropdown de busca ─────────────────────────
  function fecharDropdown() {
    if (searchResults) searchResults.hidden = true;
    if (searchInput)   searchInput.setAttribute('aria-expanded', 'false');
  }

  function abrirDropdown() {
    if (searchResults) searchResults.hidden = false;
    if (searchInput)   searchInput.setAttribute('aria-expanded', 'true');
  }

  function renderizarResultados(linhas) {
    if (!searchResults) return;

    searchResults.innerHTML = '';

    if (!linhas || linhas.length === 0) {
      const li = document.createElement('li');
      li.className = 'schedule-result-item schedule-result-empty';
      li.textContent = 'Nenhuma linha encontrada.';
      li.setAttribute('role', 'option');
      searchResults.appendChild(li);
      abrirDropdown();
      return;
    }

    linhas.forEach(linha => {
      const li = document.createElement('li');
      li.className = 'schedule-result-item';
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '0');
      li.dataset.numero = linha.numero;

      // Monta label: "302 · Terminal Integrado" ou só "302"
      const label = linha.nome && linha.nome.trim()
        ? `<strong>${linha.numero}</strong> · <span>${linha.nome}</span>`
        : `<strong>${linha.numero}</strong>`;
      li.innerHTML = label;

      const selecionar = () => {
        searchInput.value = linha.numero;
        fecharDropdown();
        carregarHorariosLinha(linha.numero);
      };

      li.addEventListener('click', selecionar);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selecionar();
        }
      });

      searchResults.appendChild(li);
    });

    abrirDropdown();
  }

  // ── Busca de linhas (autocomplete) ───────────
  const buscarLinhas = debounce(async (termo) => {
    if (!termo || termo.trim().length < 1) {
      fecharDropdown();
      return;
    }

    try {
      const url = `/api/linhas?q=${encodeURIComponent(termo.trim())}&limit=8`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        fecharDropdown();
        return;
      }

      const linhas = await res.json();
      renderizarResultados(linhas);
    } catch (err) {
      console.error('Erro ao buscar linhas:', err);
      fecharDropdown();
    }
  }, 300);

  searchInput.addEventListener('input', (e) => {
    buscarLinhas(e.target.value);
  });

  searchInput.addEventListener('focus', (e) => {
    if (e.target.value.trim().length >= 1) {
      buscarLinhas(e.target.value);
    }
  });

  // Fecha dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    const dentroDoSearch = searchInput.contains(e.target) ||
                           (searchResults && searchResults.contains(e.target));
    if (!dentroDoSearch) fecharDropdown();
  });

  // Navegação por teclado no dropdown (↑ ↓ Esc)
  searchInput.addEventListener('keydown', (e) => {
    if (!searchResults || searchResults.hidden) return;

    const itens = Array.from(searchResults.querySelectorAll('.schedule-result-item[tabindex]'));
    if (!itens.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      itens[0].focus();
    } else if (e.key === 'Escape') {
      fecharDropdown();
    }
  });

  if (searchResults) {
    searchResults.addEventListener('keydown', (e) => {
      const itens = Array.from(searchResults.querySelectorAll('.schedule-result-item[tabindex]'));
      const atual = document.activeElement;
      const idx   = itens.indexOf(atual);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        itens[Math.min(idx + 1, itens.length - 1)]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx <= 0) searchInput.focus();
        else itens[idx - 1]?.focus();
      } else if (e.key === 'Escape') {
        fecharDropdown();
        searchInput.focus();
      }
    });
  }

  // ── Renderização dos horários ────────────────
  function renderizarHorarios(data) {
    limparEstados();

    const linhaLabel = data.nomeLinha && data.nomeLinha.trim()
      ? `${data.linha} · ${data.nomeLinha}`
      : data.linha;

    if (scheduleTitle) scheduleTitle.textContent = linhaLabel;

    if (!data.itinerarios || data.itinerarios.length === 0) {
      mostrarEstado('empty');
      return;
    }

    const html = data.itinerarios.map((itinerario, index) => {
      const horarios = itinerario.horarios || [];
      const marginTop = index === 0 ? '18px' : '24px';

      if (horarios.length === 0) {
        return `
          <div class="schedule-itinerary-block" style="margin-top:${marginTop};">
            <div class="card-top" style="margin-bottom:12px;">
              <div>
                <div class="eyebrow">Itinerário</div>
                <h4 style="margin:6px 0 0;font-size:1rem;font-weight:800;">${escapeHtml(itinerario.itinerario)}</h4>
              </div>
            </div>
            <div class="trip-row">
              <div>
                <p>Horários</p>
                <strong>Nenhum horário disponível</strong>
              </div>
            </div>
          </div>`;
      }

      const primeiro  = horarios[0];
      const restantes = horarios.slice(1);

      return `
        <div class="schedule-itinerary-block" style="margin-top:${marginTop};">
          <div class="card-top" style="margin-bottom:12px;">
            <div>
              <div class="eyebrow">Itinerário</div>
              <h4 style="margin:6px 0 0;font-size:1rem;font-weight:800;">${escapeHtml(itinerario.itinerario)}</h4>
            </div>
          </div>

          <div class="trip-featured">
            <div>
              <p>Próxima saída</p>
              <strong>${formatarHorario(primeiro)}</strong>
            </div>
            <div>
              <p>Sentido</p>
              <strong>${escapeHtml(itinerario.itinerario)}</strong>
            </div>
            <span class="tag-next">Próximo</span>
          </div>

          ${restantes.map(h => `
            <div class="trip-row">
              <div>
                <p>Saída</p>
                <strong>${formatarHorario(h)}</strong>
              </div>
              <div style="text-align:right;">
                <p>Itinerário</p>
                <strong>${escapeHtml(itinerario.itinerario)}</strong>
              </div>
            </div>`).join('')}
        </div>`;
    }).join('');

    scheduleContent.innerHTML = html;
    mostrarEstado('content');
  }

  // XSS guard mínimo
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Carrega horários de uma linha ─────────────
  async function carregarHorariosLinha(numeroLinha) {
    limparEstados();
    mostrarEstado('loading');
    if (scheduleTitle) scheduleTitle.textContent = numeroLinha;

    try {
      const res = await fetch(
        `/api/linhas/${encodeURIComponent(numeroLinha)}/horarios`,
        { headers: { Accept: 'application/json' } }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      renderizarHorarios(data);
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
      limparEstados();
      mostrarEstado('error');
    }
  }

  // ── Estado inicial ────────────────────────────
  mostrarEstado('placeholder');
})();