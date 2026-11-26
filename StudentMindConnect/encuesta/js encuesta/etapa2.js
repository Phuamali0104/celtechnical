/**
 * StudentMind Connect - Etapa 2: Hábitos y Organización de Estudio (etapa2.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_E2 = 'studentmind_diagnostic_stage2';

  const defaultStateE2 = {
    currentStep: 1,
    weeklyTime: '5–10 horas',
    planningHabit: 'A veces',
    taskOrganization: 'Agenda o planner',
    obstacles: ['Falta de tiempo', 'Distracciones', 'Cansancio o estrés'],
    stage2Completed: false
  };

  let stateE2 = loadStateE2();

  function loadStateE2() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_E2);
      return saved ? { ...defaultStateE2, ...JSON.parse(saved) } : { ...defaultStateE2 };
    } catch (e) {
      return { ...defaultStateE2 };
    }
  }

  function saveStateE2() {
    localStorage.setItem(STORAGE_KEY_E2, JSON.stringify(stateE2));
  }

  // Toast
  const toastEl = document.getElementById('toastNotification');
  const toastMsgEl = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg, type = 'error') {
    toastMsgEl.textContent = msg;
    toastEl.className = `toast-notification show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // Navegación entre las 6 pantallas de Etapa 2
  const screens = document.querySelectorAll('.screen');

  function goToStepE2(step) {
    if (step < 1 || step > 6) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`e2-screen-${step}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = step > stateE2.currentStep;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');

      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    if (step === 6) {
      updateSummaryCards();
    }

    stateE2.currentStep = step;
    saveStateE2();
  }

  // Botón Comenzar (Pantalla 1 -> 2)
  document.getElementById('btnE2Start').addEventListener('click', () => goToStepE2(2));

  // Botones Siguiente y Atrás
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.getAttribute('data-next'), 10);
      goToStepE2(next);
    });
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = parseInt(btn.getAttribute('data-prev'), 10);
      goToStepE2(prev);
    });
  });

  // Volver a Etapa 1 al tocar logo o nodo 1 del stepper
  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });
  document.querySelector('.step-node[data-stage="1"]').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });

  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStepE2(1));

  // ==========================================================================
  // MANEJO DE GRUPOS DE RADIO (PANTALLAS 2, 3 Y 4)
  // ==========================================================================
  function bindRadioGroup(containerId, stateKey) {
    const buttons = document.querySelectorAll(`#${containerId} .option-row-btn`);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        stateE2[stateKey] = btn.getAttribute('data-value');
        saveStateE2();
        syncRadioGroup(containerId, stateKey);
      });
    });
  }

  function syncRadioGroup(containerId, stateKey) {
    const buttons = document.querySelectorAll(`#${containerId} .option-row-btn`);
    buttons.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-value') === stateE2[stateKey]);
    });
  }

  bindRadioGroup('weeklyTimeList', 'weeklyTime');
  bindRadioGroup('planningList', 'planningHabit');
  bindRadioGroup('organizationList', 'taskOrganization');

  // ==========================================================================
  // PANTALLA 5: CHECKBOXES DE OBSTÁCULOS
  // ==========================================================================
  const obstacleInputs = document.querySelectorAll('#obstaclesList input[type="checkbox"]');

  obstacleInputs.forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.option-check-row').classList.toggle('checked', cb.checked);
      stateE2.obstacles = Array.from(obstacleInputs)
        .filter(item => item.checked)
        .map(item => item.value);
      saveStateE2();
    });
  });

  function syncObstaclesUI() {
    obstacleInputs.forEach(cb => {
      const active = stateE2.obstacles.includes(cb.value);
      cb.checked = active;
      cb.closest('.option-check-row').classList.toggle('checked', active);
    });
  }

  document.getElementById('btnToSummaryE2').addEventListener('click', () => {
    if (stateE2.obstacles.length === 0) {
      showToast('Selecciona al menos un obstáculo según tu experiencia.', 'error');
      return;
    }
    stateE2.stage2Completed = true;
    saveStateE2();
    goToStepE2(6);
  });

  // ==========================================================================
  // PANTALLA 6: ACTUALIZAR TARJETAS RESUMEN DINÁMICAMENTE
  // ==========================================================================
  function updateSummaryCards() {
    document.getElementById('summaryTimeText').textContent =
      `${stateE2.weeklyTime} disponibles cada semana.`;
    document.getElementById('summaryPlanText').textContent =
      `Planificas sesiones: ${stateE2.planningHabit} (${stateE2.taskOrganization}).`;
    document.getElementById('summaryObstaclesText').textContent =
      stateE2.obstacles.length > 0
        ? `${stateE2.obstacles.join(', ')}.`
        : 'Sin obstáculos críticos seleccionados.';
  }

  document.getElementById('btnContinueStage3').addEventListener('click', () => {
    stateE2.stage2Completed = true;
    saveStateE2();
    showToast('¡Etapa 2 guardada! Avanzando a la Etapa 3...', 'success');
    setTimeout(() => { window.location.href = 'etapa3.html'; }, 900);
  });

  // ==========================================================================
  // MENÚ LATERAL (DRAWER)
  // ==========================================================================
  const drawerOverlay = document.getElementById('drawerOverlay');
  document.getElementById('openMenuBtn').addEventListener('click', () => drawerOverlay.classList.add('open'));
  document.getElementById('closeMenuBtn').addEventListener('click', () => drawerOverlay.classList.remove('open'));
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
  });

  document.querySelectorAll('.drawer-nav-item[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-jump'), 10);
      drawerOverlay.classList.remove('open');
      goToStepE2(target);
    });
  });

  document.getElementById('resetE2Btn').addEventListener('click', () => {
    stateE2 = { ...defaultStateE2 };
    saveStateE2();
    syncAllE2();
    drawerOverlay.classList.remove('open');
    goToStepE2(1);
    showToast('Etapa 2 reiniciada.', 'success');
  });

  // Sincronización inicial
  function syncAllE2() {
    syncRadioGroup('weeklyTimeList', 'weeklyTime');
    syncRadioGroup('planningList', 'planningHabit');
    syncRadioGroup('organizationList', 'taskOrganization');
    syncObstaclesUI();
    updateSummaryCards();
  }

  syncAllE2();
  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`e2-screen-${stateE2.currentStep}`) || document.getElementById('e2-screen-1');
  saved.classList.add('active');
});