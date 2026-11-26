/**
 * StudentMind Connect - Etapa 3: Métodos y Estrategias de Estudio (etapa3.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_E3 = 'studentmind_diagnostic_stage3';

  const defaultStateE3 = {
    currentStep: 1,
    studyMethods: ['Resúmenes', 'Ejercicios o práctica'],
    otherMethodText: '',
    examPreparation: 'Estudio unos días antes.',
    practiceFrequency: 'Frecuentemente (2–3 veces por semana)',
    effectivenessScore: 4,
    improvements: [
      'Ser más constante',
      'Aplicar mejores técnicas',
      'Retener la información por más tiempo'
    ],
    otherImproveText: '',
    stage3Completed: false
  };

  let stateE3 = loadStateE3();

  function loadStateE3() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_E3);
      return saved ? { ...defaultStateE3, ...JSON.parse(saved) } : { ...defaultStateE3 };
    } catch (e) {
      return { ...defaultStateE3 };
    }
  }

  function saveStateE3() {
    localStorage.setItem(STORAGE_KEY_E3, JSON.stringify(stateE3));
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

  // Navegación entre las 6 pantallas de Etapa 3
  const screens = document.querySelectorAll('.screen');

  function goToStepE3(step) {
    if (step < 1 || step > 6) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`e3-screen-${step}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = step > stateE3.currentStep;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');

      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    stateE3.currentStep = step;
    saveStateE3();
  }

  document.getElementById('btnE3Start').addEventListener('click', () => goToStepE3(2));

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStepE3(parseInt(btn.getAttribute('data-next'), 10));
    });
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStepE3(parseInt(btn.getAttribute('data-prev'), 10));
    });
  });

  // Navegación a etapas anteriores desde stepper o logo
  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });
  document.querySelectorAll('.step-node.nav-stage').forEach(node => {
    node.addEventListener('click', () => {
      window.location.href = node.getAttribute('data-href');
    });
  });
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStepE3(1));

  // ==========================================================================
  // PANTALLA 2: MÉTODOS DE ESTUDIO (MÁXIMO 3)
  // ==========================================================================
  const methodCheckboxes = document.querySelectorAll('#methodsList input[type="checkbox"]');
  const methodsCounter = document.getElementById('methodsCounter');
  const otherMethodCheck = document.getElementById('otherMethodCheck');
  const otherMethodBox = document.getElementById('otherMethodInputBox');
  const otherMethodText = document.getElementById('otherMethodText');

  methodCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(methodCheckboxes).filter(item => item.checked);
      if (checked.length > 3) {
        cb.checked = false;
        showToast('Puedes seleccionar hasta 3 métodos de estudio.', 'error');
        return;
      }

      cb.closest('.checkbox-row').classList.toggle('checked', cb.checked);
      if (cb === otherMethodCheck) {
        otherMethodBox.classList.toggle('hidden', !cb.checked);
        if (cb.checked) otherMethodText.focus();
      }

      stateE3.studyMethods = checked.map(item => item.value);
      methodsCounter.textContent = `${stateE3.studyMethods.length}/3`;
      saveStateE3();
    });
  });

  otherMethodText.addEventListener('input', (e) => {
    stateE3.otherMethodText = e.target.value;
    saveStateE3();
  });

  function syncMethodsUI() {
    methodCheckboxes.forEach(cb => {
      const active = stateE3.studyMethods.includes(cb.value);
      cb.checked = active;
      cb.closest('.checkbox-row').classList.toggle('checked', active);
    });
    otherMethodText.value = stateE3.otherMethodText || '';
    otherMethodBox.classList.toggle('hidden', !otherMethodCheck.checked);
    methodsCounter.textContent = `${stateE3.studyMethods.length}/3`;
  }

  document.getElementById('btnNextE3_2').addEventListener('click', () => {
    if (stateE3.studyMethods.length === 0) {
      showToast('Selecciona al menos un método de estudio.', 'error');
      return;
    }
    if (otherMethodCheck.checked && !stateE3.otherMethodText.trim()) {
      showToast('Especifica el método en el campo "Otros".', 'error');
      otherMethodText.focus();
      return;
    }
    goToStepE3(3);
  });

  // ==========================================================================
  // PANTALLAS 3 Y 4: TARJETAS RADIO DOBLE INDICADOR
  // ==========================================================================
  function bindDualRadio(containerId, stateKey) {
    const cards = document.querySelectorAll(`#${containerId} .dual-radio-card`);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        stateE3[stateKey] = card.getAttribute('data-value');
        saveStateE3();
        syncDualRadio(containerId, stateKey);
      });
    });
  }

  function syncDualRadio(containerId, stateKey) {
    const cards = document.querySelectorAll(`#${containerId} .dual-radio-card`);
    cards.forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-value') === stateE3[stateKey]);
    });
  }

  bindDualRadio('examPrepList', 'examPreparation');
  bindDualRadio('practiceFreqList', 'practiceFrequency');

  // ==========================================================================
  // PANTALLA 5: ESCALA DE EFECTIVIDAD (1 AL 5)
  // ==========================================================================
  const likertBtns = document.querySelectorAll('#effectivenessScale .likert-btn');

  likertBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stateE3.effectivenessScore = parseInt(btn.getAttribute('data-score'), 10);
      saveStateE3();
      syncEffectivenessUI();
    });
  });

  function syncEffectivenessUI() {
    likertBtns.forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.getAttribute('data-score'), 10) === stateE3.effectivenessScore);
    });
  }

  // ==========================================================================
  // PANTALLA 6: ASPECTOS A MEJORAR (MÁXIMO 3) + FINALIZAR ETAPA 3
  // ==========================================================================
  const improveCheckboxes = document.querySelectorAll('#improveList input[type="checkbox"]');
  const improveCounter = document.getElementById('improveCounter');
  const otherImproveCheck = document.getElementById('otherImproveCheck');
  const otherImproveBox = document.getElementById('otherImproveInputBox');
  const otherImproveText = document.getElementById('otherImproveText');

  improveCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(improveCheckboxes).filter(item => item.checked);
      if (checked.length > 3) {
        cb.checked = false;
        showToast('Puedes seleccionar hasta 3 aspectos a mejorar.', 'error');
        return;
      }

      cb.closest('.checkbox-row').classList.toggle('checked', cb.checked);
      if (cb === otherImproveCheck) {
        otherImproveBox.classList.toggle('hidden', !cb.checked);
        if (cb.checked) otherImproveText.focus();
      }

      stateE3.improvements = checked.map(item => item.value);
      improveCounter.textContent = `${stateE3.improvements.length}/3`;
      saveStateE3();
    });
  });

  otherImproveText.addEventListener('input', (e) => {
    stateE3.otherImproveText = e.target.value;
    saveStateE3();
  });

  function syncImproveUI() {
    improveCheckboxes.forEach(cb => {
      const active = stateE3.improvements.includes(cb.value);
      cb.checked = active;
      cb.closest('.checkbox-row').classList.toggle('checked', active);
    });
    otherImproveText.value = stateE3.otherImproveText || '';
    otherImproveBox.classList.toggle('hidden', !otherImproveCheck.checked);
    improveCounter.textContent = `${stateE3.improvements.length}/3`;
  }

  // Modal Resumen Etapa 3
  const summaryModalE3 = document.getElementById('summaryModalE3');
  const summaryDetailsE3 = document.getElementById('summaryDetailsE3');

  document.getElementById('btnFinishStage3').addEventListener('click', () => {
    if (stateE3.improvements.length === 0) {
      showToast('Selecciona al menos un aspecto que te gustaría mejorar.', 'error');
      return;
    }
    if (otherImproveCheck.checked && !stateE3.otherImproveText.trim()) {
      showToast('Especifica qué aspecto deseas mejorar en "Otro".', 'error');
      otherImproveText.focus();
      return;
    }

    stateE3.stage3Completed = true;
    saveStateE3();

    const formattedMethods = stateE3.studyMethods.map(m =>
      m === 'Otros' && stateE3.otherMethodText ? `Otros (${stateE3.otherMethodText.trim()})` : m
    );
    const formattedImprove = stateE3.improvements.map(i =>
      i === 'Otro' && stateE3.otherImproveText ? `Otro (${stateE3.otherImproveText.trim()})` : i
    );

    summaryDetailsE3.innerHTML = `
      <div class="summary-item">
        <strong>Métodos Frecuentes</strong>
        <span>${formattedMethods.join(', ')}</span>
      </div>
      <div class="summary-item">
        <strong>Preparación ante Evaluaciones</strong>
        <span>${stateE3.examPreparation}</span>
      </div>
      <div class="summary-item">
        <strong>Frecuencia de Práctica</strong>
        <span>${stateE3.practiceFrequency}</span>
      </div>
      <div class="summary-item">
        <strong>Efectividad Percibida</strong>
        <span>${stateE3.effectivenessScore} de 5</span>
      </div>
      <div class="summary-item">
        <strong>Prioridades de Mejora</strong>
        <span>${formattedImprove.join(' • ')}</span>
      </div>
    `;

    summaryModalE3.classList.add('open');
  });

  document.getElementById('editStage3Btn').addEventListener('click', () => {
    summaryModalE3.classList.remove('open');
  });

  document.getElementById('proceedStage4Btn').addEventListener('click', () => {
    summaryModalE3.classList.remove('open');
    showToast('¡Etapa 3 guardada! Listo para continuar a la Etapa 4.', 'success');
    setTimeout(() => { window.location.href = 'etapa4.html'; }, 900);
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
      goToStepE3(target);
    });
  });

  document.getElementById('resetE3Btn').addEventListener('click', () => {
    stateE3 = { ...defaultStateE3 };
    saveStateE3();
    syncAllE3();
    drawerOverlay.classList.remove('open');
    goToStepE3(1);
    showToast('Etapa 3 reiniciada.', 'success');
  });

  // Sincronización inicial
  function syncAllE3() {
    syncMethodsUI();
    syncDualRadio('examPrepList', 'examPreparation');
    syncDualRadio('practiceFreqList', 'practiceFrequency');
    syncEffectivenessUI();
    syncImproveUI();
  }

  syncAllE3();
  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`e3-screen-${stateE3.currentStep}`) || document.getElementById('e3-screen-1');
  saved.classList.add('active');
});