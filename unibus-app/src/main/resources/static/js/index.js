lucide.createIcons();

    window.addEventListener('load', () => {
      const title = document.getElementById('logo-title');
      const line = document.getElementById('logo-line');
      title.style.opacity = '0';
      title.style.transform = 'translateY(6px)';
      title.style.transition = 'opacity 0.55s ease, transform 0.55s ease';

      requestAnimationFrame(() => {
        setTimeout(() => {
          title.style.opacity = '1';
          title.style.transform = 'translateY(0)';
        }, 120);
        setTimeout(() => {
          line.style.width = '54px';
        }, 420);
      });
    });

    const tabs = document.querySelectorAll('.tab-btn');
    const pages = document.querySelectorAll('.page');

    let map;
    const linhasVisiveis = { '302': true, '415': true, '108': true };

    let currentPage = 'home';

    function showPage(target) {
      if (currentPage === 'rastreio' && target !== 'rastreio') {
        window.UnibusRastreio?.setActive(false);
      }

      pages.forEach(page => page.classList.remove('active'));
      const page = document.getElementById(target);
      if (page) page.classList.add('active');

      tabs.forEach(tab => tab.classList.remove('is-active'));
      const activeTab = document.querySelector(`.tab-btn[data-target="${target}"]`);
      if (activeTab) activeTab.classList.add('is-active');

      if (target === 'home') {
        setTimeout(() => {
          initMap();
          map && map.invalidateSize();
        }, 150);
      }

      if (target === 'rastreio') {
        setTimeout(() => {
          initMapRastreio();
        }, 150);
      }

      currentPage = target;
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => showPage(btn.dataset.target));
    });

    function initMap() {
      if (map) return;

      map = L.map('map', { zoomControl: false }).setView([-22.95489809881098, -43.168709766376395], 15);

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

    function toggleLinha(linha, btn) {
      linhasVisiveis[linha] = !linhasVisiveis[linha];
      const ativo = linhasVisiveis[linha];
      btn.classList.toggle('is-active', ativo);
      syncLinhasVisiveisRastreio();
    }

    function centerMap() {
      window.UnibusRastreio?.centerMap();
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        showPage(initialPage || 'home');
      }, 180);
    });

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