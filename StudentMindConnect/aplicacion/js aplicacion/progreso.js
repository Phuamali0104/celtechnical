/**
 * StudentMind Connect - Tu Progreso, Tus Logros y Comparte tu Progreso (progreso.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const ACHIEVEMENTS_DATA = [
    {
      id: 'maestro-plan',
      category: 'Hábitos',
      icon: 'trophy',
      color: 'gold',
      title: 'Maestro del Plan',
      desc: 'Completa tu planificador semanal por 4 semanas.',
      completed: true,
      progress: 4,
      total: 4
    },
    {
      id: 'racha-imparable',
      category: 'Hábitos',
      icon: 'flame',
      color: 'orange',
      title: 'Racha Imparable',
      desc: 'Mantén una racha de 7 días seguidos.',
      completed: true,
      progress: 7,
      total: 7
    },
    {
      id: 'amante-conocimiento',
      category: 'Académicos',
      icon: 'book-open',
      color: 'purple',
      title: 'Amante del Conocimiento',
      desc: 'Explora 5 recursos en la biblioteca.',
      completed: true,
      progress: 5,
      total: 5
    },
    {
      id: 'retador-constante',
      category: 'Académicos',
      icon: 'star',
      color: 'gold',
      title: 'Retador Constante',
      desc: 'Completa 5 microretos.',
      completed: false,
      progress: 3,
      total: 5
    },
    {
      id: 'conecta-aprende',
      category: 'Especiales',
      icon: 'users',
      color: 'blue',
      title: 'Conecta y Aprende',
      desc: 'Invita a 3 amigos a la comunidad.',
      completed: false,
      progress: 0,
      total: 3
    }
  ];

  let currentScreen = 1;
  let currentAchFilter = 'Todos';

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

  function goToProgScreen(step) {
    if (step < 1 || step > 3) return;
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`prog-screen-${step}`);
    if (target) {
      target.classList.add('active');
      const body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    const rightIcon = document.getElementById('progHeaderRightIcon');
    if (rightIcon) {
      rightIcon.setAttribute('data-lucide', step === 2 ? 'calendar' : 'share-2');
      if (window.lucide) lucide.createIcons();
    }

    currentScreen = step;
  }

  document.getElementById('progBackBtn').addEventListener('click', () => {
    if (currentScreen > 1) {
      goToProgScreen(1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  document.getElementById('progHeaderRightBtn').addEventListener('click', () => {
    if (currentScreen === 2) {
      goToProgScreen(1);
    } else {
      goToProgScreen(3);
    }
  });

  document.getElementById('btnGoToAchievements').addEventListener('click', () => goToProgScreen(2));
  document.getElementById('btnShareAchievements').addEventListener('click', () => goToProgScreen(3));
  document.getElementById('tabProgBack').addEventListener('click', () => goToProgScreen(1));
  document.getElementById('tabProgBack2').addEventListener('click', () => goToProgScreen(1));
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToProgScreen(1));

  // Sincronizar puntos con microretos si el usuario ya interactuó allí
  try {
    const mrData = JSON.parse(localStorage.getItem('studentmind_microretos_data') || 'null');
    if (mrData && typeof mrData.points === 'number') {
      const totalPts = 610 + mrData.points; // Base 850 cuando mrData.points = 240
      document.getElementById('kpiTotalPoints').textContent = totalPts;
    }
  } catch (e) {}

  // ==========================================================================
  // PANTALLA 1: SELECTOR DE PERIODO DEL GRÁFICO
  // ==========================================================================
  document.getElementById('chartPeriodSelect').addEventListener('change', (e) => {
    const isCycle = e.target.value === 'cycle';
    const strokePath = document.getElementById('chartStrokePath');
    const areaPath = document.getElementById('chartAreaPath');
    const peakLabel = document.getElementById('chartPeakLabel');

    if (isCycle) {
      strokePath.setAttribute('d', 'M 48 68 L 125 52 L 202 36 L 272 22');
      areaPath.setAttribute('d', 'M 48 68 L 125 52 L 202 36 L 272 22 L 272 84 L 48 84 Z');
      peakLabel.textContent = '94%';
    } else {
      strokePath.setAttribute('d', 'M 48 62 L 125 40 L 202 26 L 272 34');
      areaPath.setAttribute('d', 'M 48 62 L 125 40 L 202 26 L 272 34 L 272 84 L 48 84 Z');
      peakLabel.textContent = '90%';
    }
  });

  // ==========================================================================
  // PANTALLA 2: RENDERIZADO Y FILTRADO DE LOGROS
  // ==========================================================================
  const achievementsListEl = document.getElementById('achievementsList');

  function renderAchievements() {
    const filtered = currentAchFilter === 'Todos'
      ? ACHIEVEMENTS_DATA
      : ACHIEVEMENTS_DATA.filter(a => a.category === currentAchFilter);

    achievementsListEl.innerHTML = '';

    filtered.forEach(item => {
      const pct = Math.round((item.progress / item.total) * 100);
      const card = document.createElement('div');
      card.className = `ach-item-card ${item.completed ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="ach-badge-circle ${item.color}"><i data-lucide="${item.icon}"></i></div>
        <div class="ach-copy">
          <strong>${item.title}</strong>
          <span>${item.desc}</span>
        </div>
        <div class="ach-status-col">
          ${
            item.completed
              ? `<span class="green-done-tick"><i data-lucide="check"></i></span>
                 <span class="done-text-badge">¡Completado!</span>`
              : `<span class="ach-prog-ratio">${item.progress}/${item.total}</span>
                 <div class="ach-mini-track"><div class="ach-mini-fill" style="width: ${pct}%;"></div></div>`
          }
        </div>
      `;

      card.addEventListener('click', () => {
        showToast(
          item.completed
            ? `Logro "${item.title}" desbloqueado.`
            : `Progreso en "${item.title}": ${item.progress} de ${item.total}.`,
          'success'
        );
      });

      achievementsListEl.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('#achFilterPills .a-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#achFilterPills .a-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentAchFilter = pill.getAttribute('data-cat');
      renderAchievements();
    });
  });

  // ==========================================================================
  // PANTALLA 3: COMPARTIR PROGRESO EN REDES
  // ==========================================================================
  document.querySelectorAll('.soc-circle-btn[data-soc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const net = btn.getAttribute('data-soc');
      showToast(`Generando tarjeta de progreso (75%) para ${net}...`, 'success');
    });
  });

  document.getElementById('btnCopyProgLink').addEventListener('click', () => {
    const url = `${window.location.origin}/progreso.html?progreso=75`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    showToast('¡Enlace de tu progreso copiado al portapapeles!', 'success');
  });

  // Inicializar
  renderAchievements();
});