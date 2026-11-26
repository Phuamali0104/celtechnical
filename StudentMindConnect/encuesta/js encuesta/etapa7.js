/**
 * StudentMind Connect - Etapa 7: Resultados Personalizados y Ruta de Mejora (etapa7.html)
 * Integra datos almacenados en LocalStorage de las Etapas 1 a 6.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_E7 = 'studentmind_diagnostic_stage7';
  let currentStep = parseInt(localStorage.getItem(STORAGE_KEY_E7) || '1', 10);

  // Leer datos previos de Etapas 1..6 si existen en LocalStorage
  function getSavedJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  const dataE1 = getSavedJSON('studentmind_diagnostic_stage1');
  const dataE2 = getSavedJSON('studentmind_diagnostic_stage2');
  const dataE3 = getSavedJSON('studentmind_diagnostic_stage3');
  const dataE4 = getSavedJSON('studentmind_diagnostic_stage4');
  const dataE5 = getSavedJSON('studentmind_diagnostic_stage5');
  const dataE6 = getSavedJSON('studentmind_diagnostic_stage6');

  // Toast
  const toastEl = document.getElementById('toastNotification');
  const toastMsgEl = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg, type = 'success') {
    toastMsgEl.textContent = msg;
    toastEl.className = `toast-notification show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  // Navegación entre las 6 pantallas de Resultados
  const screens = document.querySelectorAll('.screen');

  function goToStepE7(step) {
    if (step < 1 || step > 6) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`e7-screen-${step}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = step > currentStep;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');

      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    currentStep = step;
    localStorage.setItem(STORAGE_KEY_E7, String(step));
  }

  document.getElementById('btnE7ViewResults').addEventListener('click', () => goToStepE7(2));

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE7(parseInt(btn.getAttribute('data-next'), 10)));
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE7(parseInt(btn.getAttribute('data-prev'), 10)));
  });

  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });
  document.querySelectorAll('.step-node.nav-stage').forEach(node => {
    node.addEventListener('click', () => {
      window.location.href = node.getAttribute('data-href');
    });
  });
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStepE7(1));

  // ==========================================================================
  // CÁLCULO DINÁMICO DE RESULTADOS A PARTIR DE ETAPAS PREVIAS
  // ==========================================================================
  function hydratePersonalizedResults() {
    // 1. Panorama general (Pantalla 2)
    let overallPct = 68;
    if (dataE3 && typeof dataE3.effectivenessScore === 'number') {
      overallPct = Math.min(92, Math.max(48, 44 + dataE3.effectivenessScore * 6));
    }
    document.getElementById('overallScorePercent').textContent = `${overallPct}%`;

    // Ajustar arco SVG (360 es el arco completo de 270 grados)
    const arcLength = Math.round((overallPct / 100) * 360);
    const arcEl = document.getElementById('radialProgressArc');
    if (arcEl) {
      arcEl.setAttribute('stroke-dasharray', `${arcLength} 480`);
    }

    document.getElementById('overallLevelLabel').textContent =
      overallPct >= 80 ? 'Avanzado' : overallPct >= 60 ? 'En progreso' : 'Inicial';

    const strengthsCount = dataE3?.studyMethods?.length || 3;
    const improveCount = dataE4?.difficultTopics?.length || 2;
    const oppCount = dataE1?.goals?.length || 3;

    document.getElementById('kpiStrengthsCount').textContent = strengthsCount;
    document.getElementById('kpiImproveCount').textContent = improveCount;
    document.getElementById('kpiOpportunitiesCount').textContent = oppCount;

    // 2. Hábitos de estudio (Pantalla 3)
    const orgMap = {
      'Sí, siempre': 88,
      'A veces': 62,
      'Casi nunca': 42,
      'Solo antes de exámenes': 35
    };
    const orgPct = dataE2?.planningHabit ? (orgMap[dataE2.planningHabit] || 62) : 62;
    const methodsPct = dataE3?.effectivenessScore ? Math.min(95, 30 + dataE3.effectivenessScore * 10) : 70;

    const sleepMap = {
      'Duermo 7–9 horas (descanso bien)': 85,
      'Duermo 5–6 horas (me alcanza, pero podría mejorar)': 55,
      'Duermo menos de 5 horas (suelo estar cansado(a))': 35,
      'Tengo un horario irregular de sueño': 45
    };
    const restPct = dataE5?.sleepHabit ? (sleepMap[dataE5.sleepHabit] || 55) : 55;

    document.getElementById('barOrgTime').style.width = `${orgPct}%`;
    document.getElementById('pctOrgTime').textContent = `${orgPct}%`;

    document.getElementById('barStudyMethods').style.width = `${methodsPct}%`;
    document.getElementById('pctStudyMethods').textContent = `${methodsPct}%`;

    document.getElementById('barRestEnergy').style.width = `${restPct}%`;
    document.getElementById('pctRestEnergy').textContent = `${restPct}%`;

    // 3. Vacíos de conocimiento y Ruta de 4 semanas (Pantallas 4 y 5)
    const primaryCourse = (dataE4?.selectedCourses && dataE4.selectedCourses[0]) || 'Cálculo II';
    const secondCourse = (dataE4?.selectedCourses && dataE4.selectedCourses[1]) || 'Estadística';
    const thirdCourse = (dataE4?.selectedCourses && dataE4.selectedCourses[2]) || 'Física';

    if (dataE4?.selectedCourses && dataE4.selectedCourses.length > 0) {
      const listContainer = document.getElementById('priorityCoursesList');
      listContainer.innerHTML = `
        <div class="priority-course-card high">
          <div class="p-course-left">
            <div class="p-course-icon red"><i data-lucide="target"></i></div>
            <span class="p-course-name">${primaryCourse}</span>
          </div>
          <span class="priority-pill high">Prioridad alta</span>
        </div>
        <div class="priority-course-card medium">
          <div class="p-course-left">
            <div class="p-course-icon orange"><i data-lucide="settings"></i></div>
            <span class="p-course-name">${secondCourse}</span>
          </div>
          <span class="priority-pill medium">Prioridad media</span>
        </div>
        <div class="priority-course-card low">
          <div class="p-course-left">
            <div class="p-course-icon yellow"><i data-lucide="box"></i></div>
            <span class="p-course-name">${thirdCourse}</span>
          </div>
          <span class="priority-pill low">Prioridad media</span>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }

    document.getElementById('priorityRecommendText').innerHTML =
      `Te recomendamos enfocarte primero en <strong>${primaryCourse}</strong> para mejorar tu rendimiento general.`;

    const mainTopics = (dataE4?.difficultTopics && dataE4.difficultTopics.length > 0)
      ? dataE4.difficultTopics.slice(0, 2).join(' y ').toLowerCase()
      : 'integrales y derivadas';

    document.getElementById('week1Desc').textContent =
      `Reforzar bases de ${primaryCourse} (${mainTopics}).`;
  }

  // ==========================================================================
  // PANTALLA 6: ACCIONES FINALES Y MODAL DE REPORTE INTEGRAL
  // ==========================================================================
  const fullReportModal = document.getElementById('fullReportModal');
  const fullReportDetails = document.getElementById('fullReportDetails');

  document.getElementById('btnExplorePlatform').addEventListener('click', () => {
    const career = dataE1?.career || 'Ingeniería de Sistemas de Información';
    const cycle = dataE1?.cycle || '3° - 4° ciclo';
    const weeklyTime = dataE2?.weeklyTime || '5–10 horas';
    const mainCourse = (dataE4?.selectedCourses && dataE4.selectedCourses[0]) || 'Cálculo II';
    const collabScore = dataE6?.collaborationScore || 4;

    fullReportDetails.innerHTML = `
      <div class="summary-item">
        <strong>Perfil Académico (Etapa 1)</strong>
        <span>${career} • ${cycle}</span>
      </div>
      <div class="summary-item">
        <strong>Disponibilidad Semanal (Etapa 2)</strong>
        <span>${weeklyTime} por semana</span>
      </div>
      <div class="summary-item">
        <strong>Curso Prioritario (Etapa 4)</strong>
        <span>${mainCourse} (Prioridad alta)</span>
      </div>
      <div class="summary-item">
        <strong>Aprendizaje Colaborativo (Etapa 6)</strong>
        <span>Disposición ${collabScore}/5 en comunidad P2P</span>
      </div>
    `;
    fullReportModal.classList.add('open');
  });

  document.getElementById('btnLater').addEventListener('click', () => {
    showToast('Tu diagnóstico quedó guardado localmente para cuando vuelvas.', 'success');
  });

  document.getElementById('closeReportModalBtn').addEventListener('click', () => {
    fullReportModal.classList.remove('open');
    showToast('¡Plan activado en StudentMind Connect!', 'success');
    setTimeout(() => { window.location.href = '../../aplicacion/html%20aplicacion/plataforma.html'; }, 900);
  });

  document.getElementById('restartFromStartBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
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
      goToStepE7(target);
    });
  });

  document.getElementById('resetAllTestBtn').addEventListener('click', () => {
    [
      'studentmind_diagnostic_stage1',
      'studentmind_diagnostic_stage2',
      'studentmind_diagnostic_stage3',
      'studentmind_diagnostic_stage4',
      'studentmind_diagnostic_stage5',
      'studentmind_diagnostic_stage6',
      'studentmind_diagnostic_stage7'
    ].forEach(k => localStorage.removeItem(k));

    window.location.href = 'etapa1.html';
  });

  // Inicializar
  hydratePersonalizedResults();
  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`e7-screen-${currentStep}`) || document.getElementById('e7-screen-1');
  saved.classList.add('active');
});