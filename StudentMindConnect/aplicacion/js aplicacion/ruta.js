/**
 * StudentMind Connect - Tu Ruta Personalizada, Semana 1 y Progreso (ruta.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_RUTA = 'studentmind_personalized_route';

  const defaultRutaState = {
    step: 1,
    completedTasks: [1] // Por defecto "Revisar 2 temas prioritarios." marcada (2 de 5 en visual base)
  };

  let state = loadRutaState();

  function loadRutaState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RUTA);
      return saved ? { ...defaultRutaState, ...JSON.parse(saved) } : { ...defaultRutaState };
    } catch (e) {
      return { ...defaultRutaState };
    }
  }

  function saveRutaState() {
    localStorage.setItem(STORAGE_KEY_RUTA, JSON.stringify(state));
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

  // Cargar nombre del estudiante desde perfil guardado si existe
  try {
    const onboarding = JSON.parse(localStorage.getItem('studentmind_onboarding_profile') || 'null');
    const platUser = JSON.parse(localStorage.getItem('studentmind_platform_user') || 'null');
    const studentName = onboarding?.studentName || platUser?.firstName || 'Valeria';
    document.getElementById('rutaStudentName').textContent = studentName;
  } catch (e) {}

  // Navegación entre las 3 pantallas de Ruta
  const screens = document.querySelectorAll('.screen');

  function goToRutaStep(stepNum) {
    if (stepNum < 1 || stepNum > 3) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`ruta-screen-${stepNum}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = stepNum > state.step;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');
      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
    }

    if (stepNum === 3) {
      updateProgressDashboard();
    }

    state.step = stepNum;
    saveRutaState();
  }

  document.getElementById('rutaBackBtn').addEventListener('click', () => {
    if (state.step > 1) {
      goToRutaStep(state.step - 1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  document.getElementById('btnViewWeekPlan').addEventListener('click', () => goToRutaStep(2));

  document.getElementById('btnSaveWeekProgress').addEventListener('click', () => {
    saveRutaState();
    showToast('¡Avance semanal actualizado!', 'success');
    goToRutaStep(3);
  });

  document.getElementById('btnNextStepContinue').addEventListener('click', () => goToRutaStep(2));

  // Bottom tab bar
  document.querySelectorAll('[data-tab-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      goToRutaStep(parseInt(btn.getAttribute('data-tab-jump'), 10));
    });
  });

  document.getElementById('tabLumenBtn')?.addEventListener('click', () => {
    showToast('IA Lumen: "¡Vas muy bien! Completa tu bloque de 45 min hoy."', 'success');
  });

  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToRutaStep(1));

  // ==========================================================================
  // PANTALLA 2: CHECKLIST INTERACTIVO DE SEMANA 1
  // ==========================================================================
  const taskRows = document.querySelectorAll('#weekTasksList .week-task-row');

  function syncTasksUI() {
    taskRows.forEach(row => {
      const id = parseInt(row.getAttribute('data-task-id'), 10);
      const cb = row.querySelector('input[type="checkbox"]');
      const isDone = state.completedTasks.includes(id);
      cb.checked = isDone;
      row.classList.toggle('completed', isDone);
    });

    const total = taskRows.length;
    const doneCount = state.completedTasks.length;
    const pct = Math.round((doneCount / total) * 100);

    document.getElementById('weekProgressFill').style.width = `${pct}%`;
    document.getElementById('weekProgressCount').textContent = `${doneCount} de ${total}`;
  }

  taskRows.forEach(row => {
    const cb = row.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', () => {
      const id = parseInt(row.getAttribute('data-task-id'), 10);
      if (cb.checked) {
        if (!state.completedTasks.includes(id)) state.completedTasks.push(id);
      } else {
        state.completedTasks = state.completedTasks.filter(item => item !== id);
      }
      saveRutaState();
      syncTasksUI();
    });
  });

  // ==========================================================================
  // PANTALLA 3: MEDIDOR CIRCULAR VERDE Y EVOLUCIÓN POR ÁREAS
  // ==========================================================================
  function updateProgressDashboard() {
    const total = taskRows.length;
    const doneCount = state.completedTasks.length;
    const pct = Math.round((doneCount / total) * 100);

    document.getElementById('routePercentLabel').textContent = `${pct}%`;
    document.getElementById('routeActionsStat').textContent = `${doneCount} de ${total} acciones`;

    // Circunferencia del círculo r=48 -> 2 * PI * 48 ≈ 301.6
    const circumference = 302;
    const dash = Math.round((pct / 100) * circumference);
    document.getElementById('greenProgressCircle').setAttribute('stroke-dasharray', `${dash} ${circumference}`);

    // Ajustar ligeramente barras de evolución según acciones marcadas
    const orgPct = Math.min(100, 60 + doneCount * 5);
    const compPct = Math.min(100, 70 + doneCount * 5);
    const constPct = Math.min(100, 50 + doneCount * 5);

    document.getElementById('areaOrgFill').style.width = `${orgPct}%`;
    document.getElementById('areaOrgPct').textContent = `${orgPct}%`;

    document.getElementById('areaCompFill').style.width = `${compPct}%`;
    document.getElementById('areaCompPct').textContent = `${compPct}%`;

    document.getElementById('areaConstFill').style.width = `${constPct}%`;
    document.getElementById('areaConstPct').textContent = `${constPct}%`;
  }

  // Inicialización
  syncTasksUI();
  updateProgressDashboard();
  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`ruta-screen-${state.step}`) || document.getElementById('ruta-screen-1');
  saved.classList.add('active');
});