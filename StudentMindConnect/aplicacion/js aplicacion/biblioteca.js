/**
 * StudentMind Connect - Biblioteca Académica, Catálogo de Videos y Reproductor (biblioteca.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_SAVED = 'studentmind_saved_resources';

  const RESOURCES_DATA = [
    {
      id: 'funciones-graficas',
      title: 'Funciones y gráficas paso a paso',
      subject: 'Matemáticas',
      type: 'Video',
      duration: '15 min',
      views: '48.2K',
      rating: '4.9',
      desc: 'Aprende a identificar y graficar funciones con ejemplos claros y sencillos.',
      thumbStyle: 'math',
      thumbContent: '<i data-lucide="line-chart"></i>',
      syllabus: ['Conceptos clave', 'Ejemplos prácticos', 'Ejercicios para practicar'],
      related: { id: 'funciones-avanzadas', title: 'Funciones avanzadas', duration: '18 min' }
    },
    {
      id: 'intro-python',
      title: 'Introducción a Python',
      subject: 'Programación',
      type: 'Video',
      duration: '20 min',
      views: '32.7K',
      rating: '4.7',
      desc: 'Aprende los fundamentos del lenguaje, variables, condicionales y bucles.',
      thumbStyle: 'code',
      thumbContent: '&lt;/&gt;',
      syllabus: ['Sintaxis y tipos de datos', 'Estructuras de control', 'Mini proyecto práctico'],
      related: { id: 'funciones-graficas', title: 'Funciones y gráficas paso a paso', duration: '15 min' }
    },
    {
      id: 'estadistica-basica',
      title: 'Estadística básica',
      subject: 'Gestión',
      type: 'Video',
      duration: '18 min',
      views: '21.9K',
      rating: '4.6',
      desc: 'Comprende los conceptos con casos reales, media, mediana y desviación estándar.',
      thumbStyle: 'stat',
      thumbContent: '<i data-lucide="bar-chart-2"></i>',
      syllabus: ['Medidas de tendencia central', 'Interpretación de gráficos', 'Casos aplicados'],
      related: { id: 'intro-python', title: 'Introducción a Python', duration: '20 min' }
    },
    {
      id: 'organizar-tiempo',
      title: 'Cómo organizar tu tiempo en la universidad',
      subject: 'Gestión',
      type: 'Video',
      duration: '12 min',
      views: '25.4K',
      rating: '4.8',
      desc: 'Aprende técnicas efectivas de planificación con ejemplos prácticos.',
      thumbStyle: 'stat',
      thumbContent: '<i data-lucide="clock"></i>',
      syllabus: ['Bloques de estudio Pomodoro', 'Matriz de prioridades', 'Plan semanal'],
      related: { id: 'estadistica-basica', title: 'Estadística básica', duration: '18 min' }
    },
    {
      id: 'funciones-avanzadas',
      title: 'Funciones avanzadas',
      subject: 'Matemáticas',
      type: 'Video',
      duration: '18 min',
      views: '19.4K',
      rating: '4.8',
      desc: 'Domina funciones compuestas, inversas y transformaciones gráficas.',
      thumbStyle: 'math',
      thumbContent: '<i data-lucide="trending-up"></i>',
      syllabus: ['Composición de funciones', 'Función inversa', 'Gráficas transformadas'],
      related: { id: 'funciones-graficas', title: 'Funciones y gráficas paso a paso', duration: '15 min' }
    }
  ];

  let savedIds = loadSavedIds();
  let currentScreen = 1;
  let activeSubjectFilter = 'Todos';
  let activeResource = RESOURCES_DATA[0];
  let isPlaying = false;

  function loadSavedIds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SAVED) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveIds() {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedIds));
  }

  // Toast
  const toastEl = document.getElementById('toastNotification');
  const toastMsgEl = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg, type = 'success') {
    toastMsgEl.textContent = msg;
    toastEl.className = `toast-notification show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // Navegación entre las 3 pantallas
  const screens = document.querySelectorAll('.screen');

  function goToBibScreen(step) {
    if (step < 1 || step > 3) return;
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`bib-screen-${step}`);
    if (target) {
      target.classList.add('active');
      const body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    const rightIcon = document.getElementById('bibHeaderRightIcon');
    if (rightIcon) {
      rightIcon.setAttribute('data-lucide', step === 3 ? 'share-2' : 'search');
      if (window.lucide) lucide.createIcons();
    }

    if (step !== 3) {
      stopPlayback();
    }

    currentScreen = step;
  }

  document.getElementById('bibBackBtn').addEventListener('click', () => {
    if (currentScreen > 1) {
      goToBibScreen(currentScreen - 1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  document.getElementById('bibHeaderRightBtn').addEventListener('click', () => {
    if (currentScreen === 3) {
      showToast('Enlace del recurso copiado para compartir.', 'success');
    } else {
      goToBibScreen(1);
      document.getElementById('bibSearchInput').focus();
    }
  });

  document.getElementById('tabBibBack')?.addEventListener('click', () => goToBibScreen(1));
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToBibScreen(1));

  // ==========================================================================
  // PANTALLA 1: BUSCADOR, CATEGORÍAS Y DESCARGA PDF
  // ==========================================================================
  document.getElementById('featuredResourceCard').addEventListener('click', () => {
    openResourceDetail('organizar-tiempo');
  });

  document.getElementById('btnSeeAllVideos').addEventListener('click', () => {
    activeSubjectFilter = 'Todos';
    renderVideosCatalog();
    goToBibScreen(2);
  });

  document.getElementById('btnSeeAllPopular').addEventListener('click', () => {
    activeSubjectFilter = 'Todos';
    renderVideosCatalog();
    goToBibScreen(2);
  });

  document.querySelectorAll('.cat-tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-open-cat');
      document.getElementById('catalogHeaderTitle').textContent = cat;
      activeSubjectFilter = 'Todos';
      renderVideosCatalog();
      goToBibScreen(2);
    });
  });

  document.querySelectorAll('#bibTypePills .b-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#bibTypePills .b-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const chosenType = pill.getAttribute('data-type');
      if (chosenType !== 'Todos') {
        document.getElementById('catalogHeaderTitle').textContent = chosenType;
        renderVideosCatalog();
        goToBibScreen(2);
      }
    });
  });

  document.getElementById('bibSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      renderVideosCatalog(query);
      goToBibScreen(2);
    }
  });

  document.getElementById('btnDownloadPdf').addEventListener('click', (e) => {
    e.stopPropagation();
    showToast('Descargando "Resumen: Cálculo Diferencial.pdf" (2.1 MB)...', 'success');
  });

  // ==========================================================================
  // PANTALLA 2: CATÁLOGO DE VIDEOS Y MARCADORES GUARDADOS
  // ==========================================================================
  const videosCatalogList = document.getElementById('videosCatalogList');

  function renderVideosCatalog(searchQuery = '') {
    let list = RESOURCES_DATA.slice(0, 3); // Los 3 videos principales de la vista
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = RESOURCES_DATA.filter(r =>
        r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)
      );
    } else if (activeSubjectFilter !== 'Todos') {
      list = RESOURCES_DATA.filter(r => r.subject === activeSubjectFilter);
    }

    videosCatalogList.innerHTML = '';

    list.forEach(item => {
      const isSaved = savedIds.includes(item.id);
      const card = document.createElement('div');
      card.className = 'video-list-card';
      card.innerHTML = `
        <div class="v-thumb-box ${item.thumbStyle}">
          ${item.thumbContent}
          <span class="duration-badge">▶ ${item.duration}</span>
        </div>
        <div class="v-card-copy">
          <strong>${item.title}</strong>
          <p>${item.desc}</p>
          <div class="feat-stats">
            <span><i data-lucide="eye"></i> ${item.views}</span>
            <span><i data-lucide="thumbs-up"></i> ${item.rating}</span>
          </div>
        </div>
        <button type="button" class="bookmark-btn ${isSaved ? 'saved' : ''}" title="Guardar recurso">
          <i data-lucide="bookmark"></i>
        </button>
      `;

      card.querySelector('.bookmark-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (savedIds.includes(item.id)) {
          savedIds = savedIds.filter(id => id !== item.id);
          showToast('Recurso quitado de guardados.', 'success');
        } else {
          savedIds.push(item.id);
          showToast('Recurso guardado en tu biblioteca.', 'success');
        }
        saveIds();
        renderVideosCatalog(searchQuery);
      });

      card.addEventListener('click', () => {
        openResourceDetail(item.id);
      });

      videosCatalogList.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('#subjectFilterPills .s-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#subjectFilterPills .s-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSubjectFilter = pill.getAttribute('data-subject');
      renderVideosCatalog();
    });
  });

  document.getElementById('btnAskLumenFromBib').addEventListener('click', () => {
    showToast('Abriendo copiloto IA Lumen para recomendarte material...', 'success');
  });

  // ==========================================================================
  // PANTALLA 3: DETALLE Y REPRODUCTOR INTERACTIVO
  // ==========================================================================
  function openResourceDetail(resourceId) {
    const found = RESOURCES_DATA.find(r => r.id === resourceId) || RESOURCES_DATA[0];
    activeResource = found;
    stopPlayback();

    document.getElementById('detailDurationPill').textContent = `▶ ${found.duration}`;
    document.getElementById('detailTitle').textContent = found.title;
    document.getElementById('detailTypeBadge').textContent = found.type;
    document.getElementById('detailDesc').textContent = found.desc;

    const syllabusEl = document.getElementById('detailSyllabusList');
    syllabusEl.innerHTML = found.syllabus
      .map(s => `<li><i data-lucide="check-circle-2"></i> ${s}</li>`)
      .join('');

    const relCard = document.getElementById('relatedVideoCard');
    relCard.querySelector('strong').textContent = found.related.title;
    relCard.querySelector('span').textContent = found.related.duration;
    relCard.onclick = () => openResourceDetail(found.related.id);

    if (window.lucide) lucide.createIcons();
    goToBibScreen(3);
  }

  function togglePlayback() {
    isPlaying = !isPlaying;
    const label = document.getElementById('btnPlayVideoLabel');
    const timeline = document.getElementById('playerTimelineBar');
    const centerIcon = document.getElementById('stagePlayIcon');

    if (isPlaying) {
      label.textContent = 'Pausar video';
      timeline.classList.remove('hidden');
      centerIcon.setAttribute('data-lucide', 'pause');
      showToast(`Reproduciendo: "${activeResource.title}"`, 'success');
    } else {
      label.textContent = 'Reproducir video';
      timeline.classList.add('hidden');
      centerIcon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) lucide.createIcons();
  }

  function stopPlayback() {
    isPlaying = false;
    const label = document.getElementById('btnPlayVideoLabel');
    const timeline = document.getElementById('playerTimelineBar');
    if (label) label.textContent = 'Reproducir video';
    if (timeline) timeline.classList.add('hidden');
  }

  document.getElementById('btnPlayVideoMain').addEventListener('click', togglePlayback);
  document.getElementById('stageCenterPlayBtn').addEventListener('click', togglePlayback);

  document.getElementById('btnDownloadDetail').addEventListener('click', () => {
    showToast(`Descargando "${activeResource.title}" para ver sin conexión...`, 'success');
  });

  document.getElementById('btnShareDetail').addEventListener('click', () => {
    showToast('Enlace del video copiado para compartir con compañeros.', 'success');
  });

  // Inicialización
  renderVideosCatalog();
});