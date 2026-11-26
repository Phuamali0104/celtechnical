/**
 * StudentMind Connect - Etapa 5: Estrés, Confianza y Bienestar Académico (etapa5.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_E5 = 'studentmind_diagnostic_stage5';

  const defaultStateE5 = {
    currentStep: 1,
    stressFrequency: 'Muy frecuentemente',
    motivationScore: 4,
    sleepHabit: 'Duermo 7–9 horas (descanso bien)',
    confidenceScore: 3,
    copingActivities: [
      'Hacer ejercicio / deporte',
      'Escuchar música',
      'Pasar tiempo con amigos/familia'
    ],
    stage5Completed: false
  };

  let stateE5 = loadStateE5();

  function loadStateE5() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_E5);
      return saved ? { ...defaultStateE5, ...JSON.parse(saved) } : { ...defaultStateE5 };
    } catch (e) {
      return { ...defaultStateE5 };
    }
  }

  function saveStateE5() {
    localStorage.setItem(STORAGE_KEY_E5, JSON.stringify(stateE5));
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

  // Navegación entre las 6 pantallas de Etapa 5
  const screens = document.querySelectorAll('.screen');

  function goToStepE5(step) {
    if (step < 1 || step > 6) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`e5-screen-${step}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = step > stateE5.currentStep;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');

      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    stateE5.currentStep = step;
    saveStateE5();
  }

  document.getElementById('btnE5Start').addEventListener('click', () => goToStepE5(2));

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE5(parseInt(btn.getAttribute('data-next'), 10)));
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE5(parseInt(btn.getAttribute('data-prev'), 10)));
  });

  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });
  document.querySelectorAll('.step-node.nav-stage').forEach(node => {
    node.addEventListener('click', () => {
      window.location.href = node.getAttribute('data-href');
    });
  });
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStepE5(1));

  // ==========================================================================
  // PANTALLAS 2 Y 4: GRUPOS RADIO (ESTRÉS Y SUEÑO)
  // ==========================================================================
  function bindRadioCards(containerId, stateKey) {
    const cards = document.querySelectorAll(`#${containerId} .e5-radio-card`);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        stateE5[stateKey] = card.getAttribute('data-value');
        saveStateE5();
        syncRadioCards(containerId, stateKey);
      });
    });
  }

  function syncRadioCards(containerId, stateKey) {
    const cards = document.querySelectorAll(`#${containerId} .e5-radio-card`);
    cards.forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-value') === stateE5[stateKey]);
    });
  }

  bindRadioCards('stressFreqList', 'stressFrequency');
  bindRadioCards('sleepHabitList', 'sleepHabit');

  // ==========================================================================
  // PANTALLAS 3 Y 5: ESCALAS LIKERT (MOTIVACIÓN Y CONFIANZA)
  // ==========================================================================
  function bindLikertScale(containerId, stateKey) {
    const buttons = document.querySelectorAll(`#${containerId} .likert-btn`);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        stateE5[stateKey] = parseInt(btn.getAttribute('data-score'), 10);
        saveStateE5();
        syncLikertScale(containerId, stateKey);
      });
    });
  }

  function syncLikertScale(containerId, stateKey) {
    const buttons = document.querySelectorAll(`#${containerId} .likert-btn`);
    buttons.forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.getAttribute('data-score'), 10) === stateE5[stateKey]);
    });
  }

  bindLikertScale('motivationScale', 'motivationScore');
  bindLikertScale('confidenceScale', 'confidenceScore');

  // ==========================================================================
  // PANTALLA 6: ACTIVIDADES DE MANEJO DEL ESTRÉS (CON EXCLUSIÓN EN "NINGUNA")
  // ==========================================================================
  const activityCheckboxes = document.querySelectorAll('#copingActivitiesList input[type="checkbox"]');
  const noneActivityCheck = document.getElementById('noneActivityCheck');

  activityCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb === noneActivityCheck && cb.checked) {
        // Si marca "Ninguna", desmarcar todas las demás actividades
        activityCheckboxes.forEach(other => {
          if (other !== noneActivityCheck) {
            other.checked = false;
            other.closest('.checkbox-row').classList.remove('checked');
          }
        });
      } else if (cb !== noneActivityCheck && cb.checked) {
        // Si marca una actividad, desmarcar "Ninguna"
        noneActivityCheck.checked = false;
        noneActivityCheck.closest('.checkbox-row').classList.remove('checked');
      }

      cb.closest('.checkbox-row').classList.toggle('checked', cb.checked);
      stateE5.copingActivities = Array.from(activityCheckboxes)
        .filter(item => item.checked)
        .map(item => item.value);
      saveStateE5();
    });
  });

  function syncActivitiesUI() {
    activityCheckboxes.forEach(cb => {
      const active = stateE5.copingActivities.includes(cb.value);
      cb.checked = active;
      cb.closest('.checkbox-row').classList.toggle('checked', active);
    });
  }

  // Finalizar Etapa 5 y abrir modal de resumen
  const summaryModalE5 = document.getElementById('summaryModalE5');
  const summaryDetailsE5 = document.getElementById('summaryDetailsE5');

  document.getElementById('btnFinishStage5').addEventListener('click', () => {
    if (stateE5.copingActivities.length === 0) {
      showToast('Selecciona al menos una opción sobre cómo manejas el estrés.', 'error');
      return;
    }

    stateE5.stage5Completed = true;
    saveStateE5();

    summaryDetailsE5.innerHTML = `
      <div class="summary-item">
        <strong>Frecuencia de Estrés</strong>
        <span>${stateE5.stressFrequency}</span>
      </div>
      <div class="summary-item">
        <strong>Motivación con la Carrera</strong>
        <span>${stateE5.motivationScore} de 5</span>
      </div>
      <div class="summary-item">
        <strong>Descanso Semanal</strong>
        <span>${stateE5.sleepHabit}</span>
      </div>
      <div class="summary-item">
        <strong>Seguridad en Evaluaciones</strong>
        <span>${stateE5.confidenceScore} de 5</span>
      </div>
      <div class="summary-item">
        <strong>Actividades de Bienestar</strong>
        <span>${stateE5.copingActivities.join(' • ')}</span>
      </div>
    `;

    summaryModalE5.classList.add('open');
  });

  document.getElementById('editStage5Btn').addEventListener('click', () => {
    summaryModalE5.classList.remove('open');
  });

  document.getElementById('proceedStage6Btn').addEventListener('click', () => {
    summaryModalE5.classList.remove('open');
    showToast('¡Etapa 5 guardada! Listo para continuar a la Etapa 6.', 'success');
    setTimeout(() => { window.location.href = 'etapa6.html'; }, 900);
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
      goToStepE5(target);
    });
  });

  document.getElementById('resetE5Btn').addEventListener('click', () => {
    stateE5 = { ...defaultStateE5 };
    saveStateE5();
    syncAllE5();
    drawerOverlay.classList.remove('open');
    goToStepE5(1);
    showToast('Etapa 5 reiniciada.', 'success');
  });

  // Sincronización inicial
  function syncAllE5() {
    syncRadioCards('stressFreqList', 'stressFrequency');
    syncLikertScale('motivationScale', 'motivationScore');
    syncRadioCards('sleepHabitList', 'sleepHabit');
    syncLikertScale('confidenceScale', 'confidenceScore');
    syncActivitiesUI();
  }

  syncAllE5();
  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`e5-screen-${stateE5.currentStep}`) || document.getElementById('e5-screen-1');
  saved.classList.add('active');
});