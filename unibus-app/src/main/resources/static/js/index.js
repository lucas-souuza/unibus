lucide.createIcons();

const tabs = document.querySelectorAll('.tab-btn');
const pages = document.querySelectorAll('.page');

let map;
const linhasVisiveis = {};
let currentPage = 'home';

window.addEventListener('load', () => {
  const title = document.getElementById('logo-title');
  const line = document.getElementById('logo-line');

  if (title) {
    title.style.opacity = '0';
    title.style.transform = 'translateY(6px)';
    title.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      if (title) {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }
    }, 120);

    setTimeout(() => {
      if (line) {
        line.style.width = '54px';
      }
    }, 420);
  });

  setTimeout(() => {
    showPage('home');
  }, 180);
});

function showPage(target) {
  if (currentPage === 'rastreio' && target !== 'rastreio') {
    window.UnibusRastreio?.setActive(false);
  }

  document.body.dataset.page = target;

  pages.forEach(page => page.classList.remove('active'));
  const page = document.getElementById(target);
  if (page) page.classList.add('active');

  tabs.forEach(tab => tab.classList.remove('is-active'));
  const activeTab = document.querySelector(`.tab-btn[data-target="${target}"]`);
  if (activeTab) activeTab.classList.add('is-active');

  if (target === 'home') {
    setTimeout(() => {
      initMap();
      if (map) map.invalidateSize();
    }, 150);
  }

  if (target === 'rastreio') {
    setTimeout(() => {
      initMapRastreio();
      window.UnibusRastreio?.centerMap?.();
    }, 180);
  }

  currentPage = target;
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    showPage(btn.dataset.target);
  });
});

function initMap() {
  if (map) return;

  map = L.map('map', { zoomControl: false }).setView(
    [-22.95489809881098, -43.168709766376395],
    15
  );

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);

  L.marker([-22.95489809881098, -43.168709766376395])
    .addTo(map)
    .bindPopup('<b>UNIRIO</b><br>Av. Pasteur, 458 — Botafogo')
    .openPopup();
}

function initMapRastreio() {
  if (!window.UnibusRastreio) return;
  window.UnibusRastreio.mount();
  window.UnibusRastreio.setActive(true);
  syncLinhasVisiveisRastreio();
}

function syncLinhasVisiveisRastreio() {
  window.UnibusRastreio?.setVisibleLines({ ...linhasVisiveis });
}

function centerMap() {
  if (!window.UnibusRastreio || typeof window.UnibusRastreio.centerMap !== 'function') {
    initMapRastreio();
    setTimeout(() => {
      window.UnibusRastreio?.centerMap?.();
    }, 120);
    return;
  }
  window.UnibusRastreio.centerMap();
}
    const rastreioBuscaToggle = document.getElementById('rastreio-busca-toggle');
    const rastreioBuscaPanel = document.getElementById('rastreio-busca-panel');
    const rastreioBuscaFechar = document.getElementById('rastreio-busca-fechar');
    const rastreioBuscaInput = document.getElementById('rastreio-linha-busca');
    const rastreioResultadosEl = document.getElementById('rastreio-linha-resultados');
    const rastreioStatusEl = document.getElementById('rastreio-linha-status');
    const rastreioSelecionadasEl = document.getElementById('rastreio-linhas-selecionadas');

    let rastreioBuscaTimer;
    let rastreioBuscaSeq = 0;

    function normalizarLinhaApiRastreio(linha) {
      return {
        idLinha: linha.idLinha ?? linha.id,
        numeroLinha: String(linha.numeroLinha ?? '').trim(),
        nomeLinha: linha.nomeLinha,
        origem: linha.origem,
        destino: linha.destino,
        trajeto: linha.trajeto
      };
    }

    function tituloLinhaBusca(linha) {
      const nome = linha.nomeLinha?.trim();
      return nome ? `Linha ${linha.numeroLinha} · ${nome}` : `Linha ${linha.numeroLinha}`;
    }

    async function buscarLinhasApiRastreio(termo, limit = 12) {
      const q = termo?.trim();
      if (!q) return [];

      const params = new URLSearchParams({ q, limit: String(limit) });
      const response = await fetch(`/api/linhas?${params.toString()}`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const linhas = await response.json();
      return Array.isArray(linhas) ? linhas.map(normalizarLinhaApiRastreio) : [];
    }

    function definirStatusRastreio(msg) {
      if (rastreioStatusEl) rastreioStatusEl.textContent = msg;
    }

    function abrirBuscaRastreio() {
      if (!rastreioBuscaPanel) return;
      rastreioBuscaPanel.hidden = false;
      rastreioBuscaToggle?.setAttribute('aria-expanded', 'true');
      setTimeout(() => rastreioBuscaInput?.focus(), 60);
    }

    function fecharBuscaRastreio() {
      if (!rastreioBuscaPanel) return;
      rastreioBuscaPanel.hidden = true;
      rastreioBuscaToggle?.setAttribute('aria-expanded', 'false');
      if (rastreioResultadosEl) rastreioResultadosEl.hidden = true;
    }

    function numeroLinhaAtivo(numeroLinha) {
      return !!linhasVisiveis[String(numeroLinha).trim()];
    }

    function renderizarLinhasSelecionadasRastreio() {
      if (!rastreioSelecionadasEl) return;

      const selecionadas = Object.keys(linhasVisiveis);

      if (!selecionadas.length) {
        rastreioSelecionadasEl.innerHTML = `
          <div class="rastreio-linhas-vazio">Nenhuma linha ativa</div>
        `;
        return;
      }

      rastreioSelecionadasEl.innerHTML = selecionadas.map(numero => `
        <div class="rastreio-chip" data-linha-ativa="${numero}">
          <span class="rastreio-chip-numero">${numero}</span>
          <button
            type="button"
            class="rastreio-chip-remove"
            data-remove-linha="${numero}"
            aria-label="Remover linha ${numero}">
            <i data-lucide="x"></i>
          </button>
        </div>
      `).join('');

      rastreioSelecionadasEl.querySelectorAll('[data-remove-linha]').forEach(btn => {
        btn.addEventListener('click', () => removerLinhaRastreio(btn.dataset.removeLinha));
      });

      lucide.createIcons();
    }

    function adicionarLinhaRastreio(linha) {
      const numero = String(linha.numeroLinha).trim();
      linhasVisiveis[numero] = true;
      renderizarLinhasSelecionadasRastreio();
      syncLinhasVisiveisRastreio();
      definirStatusRastreio(`Linha ${numero} adicionada ao mapa.`);

      if (rastreioBuscaInput) rastreioBuscaInput.value = '';
      if (rastreioResultadosEl) rastreioResultadosEl.hidden = true;
    }
    function adicionarLinhaRastreio(linha) {
      const numero = String(linha.numeroLinha).trim();
      linhasVisiveis[numero] = true;
      renderizarLinhasSelecionadasRastreio();
      syncLinhasVisiveisRastreio();
      definirStatusRastreio(`Linha ${numero} adicionada ao mapa.`);

      if (rastreioBuscaInput) {
        rastreioBuscaInput.value = '';
        rastreioBuscaInput.setAttribute('aria-expanded', 'false');
      }

      if (rastreioResultadosEl) {
        rastreioResultadosEl.hidden = true;
        rastreioResultadosEl.innerHTML = '';
      }
    }
    function removerLinhaRastreio(numeroLinha) {
      delete linhasVisiveis[String(numeroLinha).trim()];
      renderizarLinhasSelecionadasRastreio();
      syncLinhasVisiveisRastreio();
      definirStatusRastreio(
        Object.keys(linhasVisiveis).length
          ? 'Filtro atualizado.'
          : 'Nenhuma linha selecionada.'
      );
    }

    function renderizarResultadosRastreio(linhas) {
      if (!rastreioResultadosEl) return;

      const disponiveis = linhas.filter(l => !numeroLinhaAtivo(l.numeroLinha));

      if (!disponiveis.length) {
        rastreioResultadosEl.innerHTML =
          '<div class="ocorrencia-linha-resultado-vazio">Nenhuma linha disponível para adicionar.</div>';
      } else {
        rastreioResultadosEl.innerHTML = disponiveis.map((linha, index) => `
          <button
            type="button"
            class="rastreio-linha-opcao${index === 0 ? ' is-highlighted' : ''}"
            role="option"
            data-numero-linha="${linha.numeroLinha}">
            <span class="rastreio-linha-badge">${linha.numeroLinha}</span>
            <span class="rastreio-linha-copy">
              <strong>${tituloLinhaBusca(linha)}</strong>
              <span>${linha.trajeto || 'Trajeto não informado'}</span>
            </span>
          </button>
        `).join('');

        rastreioResultadosEl.querySelectorAll('.rastreio-linha-opcao').forEach(btn => {
          btn.addEventListener('click', () => {
            const linha = disponiveis.find(item => item.numeroLinha === btn.dataset.numeroLinha);
            if (linha) adicionarLinhaRastreio(linha);
          });
        });
      }

      rastreioResultadosEl.hidden = false;
      rastreioBuscaInput?.setAttribute('aria-expanded', 'true');
    }

    async function buscarLinhasRastreio(termo) {
      const seq = ++rastreioBuscaSeq;

      if (!termo) {
        definirStatusRastreio('Digite para buscar uma linha no rastreio.');
        if (rastreioResultadosEl) rastreioResultadosEl.hidden = true;
        return;
      }

      definirStatusRastreio('Buscando linhas...');

      try {
        const linhas = await buscarLinhasApiRastreio(termo, 12);
        if (seq !== rastreioBuscaSeq) return;

        definirStatusRastreio(
          linhas.length
            ? `${linhas.length} resultado(s). Clique para adicionar ao mapa.`
            : 'Nenhuma linha encontrada.'
        );

        renderizarResultadosRastreio(linhas);
      } catch (err) {
        if (seq !== rastreioBuscaSeq) return;
        definirStatusRastreio(`Não foi possível buscar linhas (${err.message}).`);
        if (rastreioResultadosEl) rastreioResultadosEl.hidden = true;
      }
    }

    function agendarBuscaLinhaRastreio() {
      clearTimeout(rastreioBuscaTimer);
      const termo = rastreioBuscaInput?.value.trim() || '';
      rastreioBuscaTimer = setTimeout(() => buscarLinhasRastreio(termo), 280);
    }

    rastreioBuscaToggle?.addEventListener('click', () => {
      if (rastreioBuscaPanel?.hidden) abrirBuscaRastreio();
      else fecharBuscaRastreio();
    });

    rastreioBuscaFechar?.addEventListener('click', fecharBuscaRastreio);
    rastreioBuscaInput?.addEventListener('input', agendarBuscaLinhaRastreio);

    document.addEventListener('click', event => {
      const panel = document.getElementById('rastreio-busca-panel');
      const toggle = document.getElementById('rastreio-busca-toggle');

      if (
        panel &&
        !panel.hidden &&
        !panel.contains(event.target) &&
        toggle &&
        !toggle.contains(event.target)
      ) {
        fecharBuscaRastreio();
      }
    });

    renderizarLinhasSelecionadasRastreio();
    // Reviews
    const reviewsData = {
      '302': {
        nota: '4.0',
        total: '24',
        titulo: 'Linha 302 · Centro',
        reviews: [
          { nome: 'Ana Lima', nota: 5, texto: 'Sempre pontual, ônibus limpo. Recomendo!' },
          { nome: 'Pedro Silva', nota: 4, texto: 'Boa linha, às vezes lota no horário de pico.' },
          { nome: 'Carla M.', nota: 3, texto: 'Atrasa um pouco nos dias de chuva.' }
        ]
      },
           '415': {
        nota: '3.5',
        total: '17',
        titulo: 'Linha 415 · Tijuca',
        reviews: [
          { nome: 'João R.', nota: 4, texto: 'Conveniente para quem vem da Tijuca.' },
          { nome: 'Marta F.', nota: 3, texto: 'Poderia ter mais horários disponíveis.' }
        ]
      },
      '108': {
        nota: '3.2',
        total: '11',
        titulo: 'Linha 108 · Zona Norte',
        reviews: [
          { nome: 'Rafael T.', nota: 3, texto: 'Trajeto longo mas cobre bem a Zona Norte.' },
          { nome: 'Bianca O.', nota: 3, texto: 'Sempre lotado no final da tarde.' }
        ]
      }
    };

    function abrirReviews(linha) {
      const d = reviewsData[linha];
      const sheet = document.getElementById('reviews-sheet');
      const overlay = document.getElementById('reviews-overlay');
      const panel = document.getElementById('reviews-panel');

      document.getElementById('reviews-titulo').textContent = d.titulo;
      document.getElementById('reviews-nota').textContent = d.nota;
      document.getElementById('reviews-total').textContent = d.total + ' avaliações';

      const estrelas = document.getElementById('reviews-estrelas');
      estrelas.textContent =
        '⭐'.repeat(Math.round(parseFloat(d.nota))) +
        '☆'.repeat(5 - Math.round(parseFloat(d.nota)));

      document.getElementById('reviews-lista').innerHTML = d.reviews.map(r => `
        <div class="review-item">
          <div class="top">
            <span class="name">${r.nome}</span>
            <span class="muted-soft">${'⭐'.repeat(r.nota)}${'☆'.repeat(5 - r.nota)}</span>
          </div>
          <p class="text">${r.texto}</p>
        </div>
      `).join('');

      sheet.classList.remove('pointer-events-none');
      overlay.style.pointerEvents = 'auto';

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        panel.style.transform = 'translateX(0)';
      });
    }

    function fecharReviews() {
      const sheet = document.getElementById('reviews-sheet');
      const overlay = document.getElementById('reviews-overlay');
      const panel = document.getElementById('reviews-panel');

      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      panel.style.transform = 'translateX(112%)';

      setTimeout(() => {
        sheet.classList.add('pointer-events-none');
      }, 300);
    }

    // Tutorial
    function abrirTutorial() {
      const modal = document.getElementById('tutorial-modal');
      const overlay = document.getElementById('tutorial-overlay');
      const panel = document.getElementById('tutorial-panel');

      modal.classList.remove('pointer-events-none');
      overlay.style.pointerEvents = 'auto';
      panel.style.pointerEvents = 'auto';

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        panel.style.opacity = '1';
        panel.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    }

    function fecharTutorial() {
      const modal = document.getElementById('tutorial-modal');
      const overlay = document.getElementById('tutorial-overlay');
      const panel = document.getElementById('tutorial-panel');

      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      panel.style.opacity = '0';
      panel.style.transform = 'translate(-50%, -50%) scale(0.96)';
      panel.style.pointerEvents = 'none';

      setTimeout(() => {
        modal.classList.add('pointer-events-none');
      }, 300);
    }
    function toggleProfileMenu(event) {
      event.stopPropagation();
      const menu = document.getElementById('profile-menu');
      if (!menu) return;
      menu.classList.toggle('open');
    }

    document.addEventListener('click', function (event) {
      const wrap = document.querySelector('.profile-menu-wrap');
      const menu = document.getElementById('profile-menu');

      if (!wrap || !menu) return;

      if (!wrap.contains(event.target)) {
        menu.classList.remove('open');
      }
    });

    // Ocorrências
    const ocorrenciasTipos = {
      superlotacao: { label: 'Superlotação', icon: 'users' },
      atraso: { label: 'Atraso', icon: 'clock-3' },
      acidente: { label: 'Acidente', icon: 'triangle-alert' },
      interrupcao: { label: 'Interrupção de trajeto', icon: 'route-off' }
    };

    const ocorrenciasSection = document.getElementById('ocorrencias');
    const usuarioLogadoOcorrencias = ocorrenciasSection?.dataset.usuarioLogado === 'true';
    const linhaBuscaInput = document.getElementById('ocorrencia-linha-busca');
    const linhaResultadosEl = document.getElementById('ocorrencia-linha-resultados');
    const linhaStatusEl = document.getElementById('ocorrencia-linha-status');
    const linhaSelecionadaEl = document.getElementById('ocorrencia-linha-selecionada');

    let ocorrenciaLinhaSelecionada = null;
    let ocorrenciaTipoSelecionado = null;
    let ocorrenciaToastTimer;
    let ocorrenciaBuscaTimer;
    let ocorrenciaBuscaSeq = 0;
    let ocorrenciaResultadosAtuais = [];

    function normalizarLinhaApi(linha) {
      return {
        idLinha: linha.idLinha ?? linha.id,
        numeroLinha: String(linha.numeroLinha ?? '').trim(),
        nomeLinha: linha.nomeLinha,
        origem: linha.origem,
        destino: linha.destino,
        trajeto: linha.trajeto
      };
    }

    function tituloLinhaOcorrencia(linha) {
      const nome = linha.nomeLinha?.trim();
      if (nome) {
        return `Linha ${linha.numeroLinha} · ${nome}`;
      }
      return `Linha ${linha.numeroLinha}`;
    }

    function corBadgeLinha(numero) {
      const cores = [
        { bg: '#F5CF27', color: '#000' },
        { bg: '#27F5EB', color: '#000' },
        { bg: '#111', color: '#fff' }
      ];
      let hash = 0;
      for (let i = 0; i < numero.length; i++) {
        hash = (hash + numero.charCodeAt(i)) % cores.length;
      }
      return cores[hash];
    }

    function atualizarResumoOcorrencia() {
      const resumoLinha = document.getElementById('ocorrencia-resumo-linha');
      const resumoTrajeto = document.getElementById('ocorrencia-resumo-trajeto');
      const resumoTipo = document.getElementById('ocorrencia-resumo-tipo');
      const resumoDescricao = document.getElementById('ocorrencia-resumo-descricao');
      const descricaoInput = document.getElementById('ocorrencia-descricao');
      const enviarBtn = document.getElementById('ocorrencia-enviar');

      if (resumoLinha && resumoTrajeto) {
        if (ocorrenciaLinhaSelecionada) {
          resumoLinha.textContent = tituloLinhaOcorrencia(ocorrenciaLinhaSelecionada);
          resumoTrajeto.textContent = ocorrenciaLinhaSelecionada.trajeto || 'Trajeto não informado';
          resumoTrajeto.classList.remove('muted');
        } else {
          resumoLinha.textContent = 'Nenhuma linha selecionada';
          resumoTrajeto.textContent = 'Busque e escolha uma linha ao lado.';
          resumoTrajeto.classList.add('muted');
        }
      }

      if (resumoTipo) {
        if (ocorrenciaTipoSelecionado && ocorrenciasTipos[ocorrenciaTipoSelecionado]) {
          const tipo = ocorrenciasTipos[ocorrenciaTipoSelecionado];
          resumoTipo.classList.add('is-ready');
          resumoTipo.innerHTML = `<i data-lucide="${tipo.icon}" class="w-4 h-4"></i><span>${tipo.label}</span>`;
        } else {
          resumoTipo.classList.remove('is-ready');
          resumoTipo.innerHTML = '<i data-lucide="clipboard-list" class="w-4 h-4"></i><span>Selecione um tipo de ocorrência</span>';
        }
        lucide.createIcons();
      }

      if (resumoDescricao && descricaoInput) {
        const texto = descricaoInput.value.trim();
        resumoDescricao.textContent = texto || 'Nenhuma descrição adicionada.';
        resumoDescricao.classList.toggle('muted', !texto);
      }

      if (enviarBtn) {
        enviarBtn.disabled = !ocorrenciaTipoSelecionado || !ocorrenciaLinhaSelecionada;
      }
    }

    function renderizarLinhaSelecionada() {
      if (!linhaSelecionadaEl) return;

      if (!ocorrenciaLinhaSelecionada) {
        linhaSelecionadaEl.hidden = true;
        if (linhaBuscaInput) {
          linhaBuscaInput.disabled = false;
        }
        return;
      }

      const linha = ocorrenciaLinhaSelecionada;
      const badge = document.getElementById('ocorrencia-linha-badge');
      const titulo = document.getElementById('ocorrencia-linha-titulo');
      const trajeto = document.getElementById('ocorrencia-linha-trajeto');

      if (badge) {
        const cor = corBadgeLinha(linha.numeroLinha);
        badge.textContent = linha.numeroLinha;
        badge.style.background = cor.bg;
        badge.style.color = cor.color;
      }
      if (titulo) titulo.textContent = tituloLinhaOcorrencia(linha);
      if (trajeto) trajeto.textContent = linha.trajeto || 'Trajeto não informado';

      linhaSelecionadaEl.hidden = false;
      if (linhaBuscaInput) {
        linhaBuscaInput.value = '';
        linhaBuscaInput.disabled = true;
      }
      fecharResultadosLinha();
      atualizarResumoOcorrencia();
    }

    function fecharResultadosLinha() {
      if (!linhaResultadosEl || !linhaBuscaInput) return;
      linhaResultadosEl.hidden = true;
      linhaBuscaInput.setAttribute('aria-expanded', 'false');
      ocorrenciaResultadosAtuais = [];
    }

    function definirStatusLinha(mensagem) {
      if (linhaStatusEl) linhaStatusEl.textContent = mensagem;
    }

    function renderizarResultadosLinha(linhas) {
      if (!linhaResultadosEl) return;

      ocorrenciaResultadosAtuais = linhas.map(normalizarLinhaApi);

      if (!ocorrenciaResultadosAtuais.length) {
        linhaResultadosEl.innerHTML = '<div class="ocorrencia-linha-resultado-vazio">Nenhuma linha encontrada.</div>';
      } else {
        linhaResultadosEl.innerHTML = ocorrenciaResultadosAtuais.map((linha, index) => {
          const cor = corBadgeLinha(linha.numeroLinha);
          const titulo = tituloLinhaOcorrencia(linha);
          const trajeto = linha.trajeto || 'Trajeto não informado';
          return `
            <button
              type="button"
              class="ocorrencia-linha-opcao${index === 0 ? ' is-highlighted' : ''}"
              role="option"
              data-numero-linha="${linha.numeroLinha}">
              <span class="linha-badge" style="background:${cor.bg};color:${cor.color};">${linha.numeroLinha}</span>
              <span class="ocorrencia-linha-opcao-copy">
                <strong>${titulo}</strong>
                <span>${trajeto}</span>
              </span>
            </button>
          `;
        }).join('');

        linhaResultadosEl.querySelectorAll('.ocorrencia-linha-opcao').forEach(btn => {
          btn.addEventListener('click', () => {
            const linha = ocorrenciaResultadosAtuais.find(
              item => item.numeroLinha === btn.dataset.numeroLinha
            );
            if (linha) selecionarLinhaOcorrencia(linha);
          });
        });
      }

      linhaResultadosEl.hidden = false;
      if (linhaBuscaInput) linhaBuscaInput.setAttribute('aria-expanded', 'true');
      lucide.createIcons();
    }

    async function buscarLinhasOcorrencia(termo) {
      const seq = ++ocorrenciaBuscaSeq;

      if (!usuarioLogadoOcorrencias) {
        definirStatusLinha('Faça login para buscar linhas cadastradas.');
        fecharResultadosLinha();
        return;
      }

      if (!termo) {
        definirStatusLinha('Digite para buscar nas linhas cadastradas no sistema.');
        fecharResultadosLinha();
        return;
      }

      definirStatusLinha('Buscando linhas...');

      try {
        const params = new URLSearchParams({ q: termo, limit: '12' });
        const response = await fetch(`/api/linhas?${params.toString()}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });

        if (seq !== ocorrenciaBuscaSeq) return;

        if (response.status === 401 || response.status === 403) {
          definirStatusLinha('Faça login para buscar linhas cadastradas.');
          fecharResultadosLinha();
          return;
        }

        if (!response.ok) {
          definirStatusLinha('Não foi possível buscar linhas. Tente novamente.');
          fecharResultadosLinha();
          return;
        }

        const linhas = await response.json();
        definirStatusLinha(linhas.length
          ? `${linhas.length} resultado(s). Clique para selecionar.`
          : 'Nenhuma linha encontrada para essa busca.');
        renderizarResultadosLinha(linhas);
      } catch (err) {
        if (seq !== ocorrenciaBuscaSeq) return;
        definirStatusLinha('Erro de conexão ao buscar linhas.');
        fecharResultadosLinha();
      }
    }

    function agendarBuscaLinha() {
      clearTimeout(ocorrenciaBuscaTimer);
      const termo = linhaBuscaInput?.value.trim() || '';
      ocorrenciaBuscaTimer = setTimeout(() => buscarLinhasOcorrencia(termo), 280);
    }

    function selecionarLinhaOcorrencia(linha) {
      ocorrenciaLinhaSelecionada = normalizarLinhaApi(linha);
      renderizarLinhaSelecionada();
      definirStatusLinha('Linha selecionada. Você pode trocar a qualquer momento.');
    }

    function limparLinhaOcorrencia() {
      ocorrenciaLinhaSelecionada = null;
      renderizarLinhaSelecionada();
      definirStatusLinha(usuarioLogadoOcorrencias
        ? 'Digite para buscar nas linhas cadastradas no sistema.'
        : 'Faça login para buscar linhas cadastradas.');
      if (linhaBuscaInput) {
        linhaBuscaInput.focus();
      }
    }

    function selecionarTipoOcorrencia(tipo, btn) {
      ocorrenciaTipoSelecionado = tipo;
      document.querySelectorAll('.ocorrencia-tipo-btn').forEach(el => {
        const ativo = el === btn;
        el.classList.toggle('is-active', ativo);
        el.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      atualizarResumoOcorrencia();
    }

    function csrfHeadersJson() {
      const token = document.getElementById('csrf-token')?.content;
      const header = document.getElementById('csrf-header')?.content;
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      if (token && header) {
        headers[header] = token;
      }
      return headers;
    }

    function resetarFormularioOcorrencia() {
      ocorrenciaTipoSelecionado = null;
      document.querySelectorAll('.ocorrencia-tipo-btn').forEach(el => {
        el.classList.remove('is-active');
        el.setAttribute('aria-pressed', 'false');
      });
      const descricaoInput = document.getElementById('ocorrencia-descricao');
      if (descricaoInput) descricaoInput.value = '';
      limparLinhaOcorrencia();
    }

    function mostrarToastOcorrencia(mensagem) {
      const toast = document.getElementById('ocorrencia-toast');
      const texto = document.getElementById('ocorrencia-toast-text');
      if (!toast || !texto) return;

      texto.textContent = mensagem;
      toast.hidden = false;
      toast.classList.add('is-visible');
      lucide.createIcons();

      clearTimeout(ocorrenciaToastTimer);
      ocorrenciaToastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => {
          toast.hidden = true;
        }, 220);
      }, 3200);
    }

    async function enviarOcorrencia() {
      if (!ocorrenciaTipoSelecionado || !ocorrenciaLinhaSelecionada) return;

      const linha = ocorrenciaLinhaSelecionada;
      const tipo = ocorrenciasTipos[ocorrenciaTipoSelecionado];
      const descricao = document.getElementById('ocorrencia-descricao')?.value.trim() || '';
      const enviarBtn = document.getElementById('ocorrencia-enviar');
      const textoOriginal = enviarBtn?.textContent;

      if (!usuarioLogadoOcorrencias) {
        mostrarToastOcorrencia('Faça login para registrar uma ocorrência.');
        return;
      }

      if (enviarBtn) {
        enviarBtn.disabled = true;
        enviarBtn.textContent = 'Registrando...';
      }

      try {
        const response = await fetch('/api/ocorrencias', {
          method: 'POST',
          credentials: 'same-origin',
          headers: csrfHeadersJson(),
          body: JSON.stringify({
            numeroLinha: linha.numeroLinha,
            tipo: ocorrenciaTipoSelecionado,
            descricao: descricao || null
          })
        });

        if (response.status === 401 || response.status === 403) {
          mostrarToastOcorrencia('Faça login para registrar uma ocorrência.');
          return;
        }

        if (!response.ok) {
          let mensagem = 'Não foi possível registrar a ocorrência.';
          try {
            const erro = await response.json();
            if (erro?.message) mensagem = erro.message;
          } catch (_) { /* resposta sem JSON */ }
          mostrarToastOcorrencia(mensagem);
          return;
        }

        mostrarToastOcorrencia(
          `${tipo.label} registrada na ${tituloLinhaOcorrencia(linha)}.`
        );
        resetarFormularioOcorrencia();
      } catch (_) {
        mostrarToastOcorrencia('Erro de conexão ao registrar a ocorrência.');
      } finally {
        if (enviarBtn) {
          enviarBtn.textContent = textoOriginal || 'Registrar ocorrência';
          atualizarResumoOcorrencia();
        }
      }
    }

    linhaBuscaInput?.addEventListener('input', agendarBuscaLinha);
    linhaBuscaInput?.addEventListener('focus', () => {
      const termo = linhaBuscaInput.value.trim();
      if (termo) agendarBuscaLinha();
    });

    document.getElementById('ocorrencia-linha-limpar')?.addEventListener('click', limparLinhaOcorrencia);

    document.addEventListener('click', event => {
      const wrap = document.querySelector('.ocorrencia-linha-search-wrap');
      if (wrap && !wrap.contains(event.target)) {
        fecharResultadosLinha();
      }
    });

    document.querySelectorAll('.ocorrencia-tipo-btn').forEach(btn => {
      btn.addEventListener('click', () => selecionarTipoOcorrencia(btn.dataset.tipo, btn));
    });

    document.getElementById('ocorrencia-descricao')?.addEventListener('input', atualizarResumoOcorrencia);
    document.getElementById('ocorrencia-enviar')?.addEventListener('click', enviarOcorrencia);

    if (!usuarioLogadoOcorrencias && linhaBuscaInput) {
      linhaBuscaInput.disabled = true;
      linhaBuscaInput.placeholder = 'Faça login para buscar linhas';
      definirStatusLinha('Faça login para buscar linhas cadastradas.');
    }

    atualizarResumoOcorrencia();

    // Rotas
    const rotasSection = document.getElementById('rotas');
    const usuarioLogadoRotas = rotasSection?.dataset.usuarioLogado === 'true';
    const rotaOrigemInput = document.getElementById('rota-origem');
    const rotaDestinoInput = document.getElementById('rota-destino');
    const rotaDescricaoInput = document.getElementById('rota-descricao-input');
    const rotaOrigemSugestoes = document.getElementById('rota-origem-sugestoes');
    const rotaDestinoSugestoes = document.getElementById('rota-destino-sugestoes');
    const rotaCompartilharBtn = document.getElementById('rota-compartilhar');

    let rotaOrigemTimer;
    let rotaDestinoTimer;
    let rotaOrigemSeq = 0;
    let rotaDestinoSeq = 0;
    let rotaToastTimer;

    function obterValoresRota() {
      return {
        origem: rotaOrigemInput?.value.trim() || '',
        destino: rotaDestinoInput?.value.trim() || '',
        descricao: rotaDescricaoInput?.value.trim() || ''
      };
    }

    function atualizarResumoRota() {
      const { origem, destino, descricao } = obterValoresRota();
      const resumoOrigem = document.getElementById('rota-resumo-origem');
      const resumoDestino = document.getElementById('rota-resumo-destino');
      const resumoDescricao = document.getElementById('rota-resumo-descricao');

      if (resumoOrigem) resumoOrigem.textContent = origem || '—';
      if (resumoDestino) resumoDestino.textContent = destino || '—';
      if (resumoDescricao) {
        resumoDescricao.textContent = descricao || 'Descreva acima como você faz esse trajeto no dia a dia.';
        resumoDescricao.classList.toggle('muted', !descricao);
        resumoDescricao.classList.toggle('is-ready', !!descricao);
      }

      if (rotaCompartilharBtn) {
        rotaCompartilharBtn.disabled = !origem || !destino || !descricao;
      }
    }

    function fecharSugestoesRota(tipo) {
      const isOrigem = tipo === 'origem';
      const sugestoes = isOrigem ? rotaOrigemSugestoes : rotaDestinoSugestoes;
      const input = isOrigem ? rotaOrigemInput : rotaDestinoInput;
      if (sugestoes) sugestoes.hidden = true;
      if (input) input.setAttribute('aria-expanded', 'false');
    }

    function renderizarSugestoesRota(tipo, localidades) {
      const isOrigem = tipo === 'origem';
      const sugestoes = isOrigem ? rotaOrigemSugestoes : rotaDestinoSugestoes;
      const input = isOrigem ? rotaOrigemInput : rotaDestinoInput;
      if (!sugestoes) return;

      sugestoes.innerHTML = '';

      if (!localidades.length) {
        sugestoes.hidden = true;
        return;
      }

      localidades.forEach(local => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rota-local-opcao';
        btn.setAttribute('role', 'option');
        btn.textContent = local;
        btn.addEventListener('click', () => {
          if (input) input.value = local;
          fecharSugestoesRota(tipo);
          atualizarResumoRota();
          input?.focus();
        });
        sugestoes.appendChild(btn);
      });

      sugestoes.hidden = false;
      if (input) input.setAttribute('aria-expanded', 'true');
    }

    async function buscarSugestoesRota(tipo, termo) {
      const seq = tipo === 'origem' ? ++rotaOrigemSeq : ++rotaDestinoSeq;

      if (!termo) {
        fecharSugestoesRota(tipo);
        return;
      }

      try {
        const params = new URLSearchParams({ q: termo, tipo });
        const response = await fetch(`/api/rotas/localidades?${params.toString()}`, {
          headers: { Accept: 'application/json' }
        });

        if ((tipo === 'origem' && seq !== rotaOrigemSeq) || (tipo === 'destino' && seq !== rotaDestinoSeq)) {
          return;
        }

        if (!response.ok) {
          fecharSugestoesRota(tipo);
          return;
        }

        const localidades = await response.json();
        renderizarSugestoesRota(tipo, localidades);
      } catch (_) {
        fecharSugestoesRota(tipo);
      }
    }

    function agendarSugestoesRota(tipo) {
      const input = tipo === 'origem' ? rotaOrigemInput : rotaDestinoInput;
      if (tipo === 'origem') {
        clearTimeout(rotaOrigemTimer);
        rotaOrigemTimer = setTimeout(() => {
          buscarSugestoesRota('origem', input?.value.trim() || '');
        }, 280);
      } else {
        clearTimeout(rotaDestinoTimer);
        rotaDestinoTimer = setTimeout(() => {
          buscarSugestoesRota('destino', input?.value.trim() || '');
        }, 280);
      }
      atualizarResumoRota();
    }

    function mostrarToastRota(mensagem) {
      const toast = document.getElementById('rota-toast');
      const texto = document.getElementById('rota-toast-text');
      if (!toast || !texto) return;

      texto.textContent = mensagem;
      toast.hidden = false;
      toast.classList.add('is-visible');
      lucide.createIcons();

      clearTimeout(rotaToastTimer);
      rotaToastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => {
          toast.hidden = true;
        }, 220);
      }, 3200);
    }

    function resetarFormularioRota() {
      if (rotaOrigemInput) rotaOrigemInput.value = '';
      if (rotaDestinoInput) rotaDestinoInput.value = '';
      if (rotaDescricaoInput) rotaDescricaoInput.value = '';
      fecharSugestoesRota('origem');
      fecharSugestoesRota('destino');
      atualizarResumoRota();
    }

    async function compartilharRota() {
      const { origem, destino, descricao } = obterValoresRota();
      if (!origem || !destino || !descricao) return;

      if (!usuarioLogadoRotas) {
        mostrarToastRota('Faça login para compartilhar uma rota.');
        return;
      }

      const textoOriginal = rotaCompartilharBtn?.textContent;
      if (rotaCompartilharBtn) {
        rotaCompartilharBtn.disabled = true;
        rotaCompartilharBtn.textContent = 'Salvando...';
      }

      try {
        const response = await fetch('/api/rotas', {
          method: 'POST',
          credentials: 'same-origin',
          headers: csrfHeadersJson(),
          body: JSON.stringify({ origem, destino, descricao })
        });

        if (response.status === 401 || response.status === 403) {
          mostrarToastRota('Faça login para compartilhar uma rota.');
          return;
        }

        if (!response.ok) {
          let mensagem = 'Não foi possível salvar a rota.';
          try {
            const erro = await response.json();
            if (erro?.message) mensagem = erro.message;
          } catch (_) { /* ignore */ }
          mostrarToastRota(mensagem);
          return;
        }

        mostrarToastRota('Rota compartilhada com sucesso.');
        resetarFormularioRota();
      } catch (_) {
        mostrarToastRota('Erro de conexão ao salvar a rota.');
      } finally {
        if (rotaCompartilharBtn) {
          rotaCompartilharBtn.textContent = textoOriginal || 'Compartilhar rota';
          atualizarResumoRota();
        }
      }
    }

    rotaOrigemInput?.addEventListener('input', () => agendarSugestoesRota('origem'));
    rotaDestinoInput?.addEventListener('input', () => agendarSugestoesRota('destino'));
    rotaDescricaoInput?.addEventListener('input', atualizarResumoRota);
    rotaCompartilharBtn?.addEventListener('click', compartilharRota);

    document.addEventListener('click', event => {
      const origemWrap = rotaOrigemInput?.closest('.rota-local-search-wrap');
      const destinoWrap = rotaDestinoInput?.closest('.rota-local-search-wrap');
      if (origemWrap && !origemWrap.contains(event.target)) fecharSugestoesRota('origem');
      if (destinoWrap && !destinoWrap.contains(event.target)) fecharSugestoesRota('destino');
    });

    if (!usuarioLogadoRotas && rotaCompartilharBtn) {
      rotaCompartilharBtn.title = 'Faça login para compartilhar';
    }

    atualizarResumoRota();