/**
 * StudentMind Connect - Etapa 6: Apoyo Académico y Aprendizaje Colaborativo (etapa6.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_E6 = 'studentmind_diagnostic_stage6';

  const defaultStateE6 = {
    currentStep: 1,
    askHelpFrequency: 'Siempre, no tengo problema.',
    solveDoubtsMethod: 'Pregunto a mis compañeros.',
    otherDoubtText: '',
    collaborationScore: 4,
    receiveSupport: [
      'Resolución de dudas.',
      'Intercambio de apuntes y resúmenes.',
      'Explicaciones de temas difíciles.'
    ],
    otherReceiveText: '',
    contributeCommunity: [
      'Compartir mis apuntes o resúmenes.',
      'Resolver dudas de otros.'
    ],
    otherContributeText: '',
    stage6Completed: false
  };

  let stateE6 = loadStateE6();

  function loadStateE6() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_E6);
      return saved ? { ...defaultStateE6, ...JSON.parse(saved) } : { ...defaultStateE6 };
    } catch (e) {
      return { ...defaultStateE6 };
    }
  }

  function saveStateE6() {
    localStorage.setItem(STORAGE_KEY_E6, JSON.stringify(stateE6));
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

  // Navegación entre las 6 pantallas de Etapa 6
  const screens = document.querySelectorAll('.screen');

  function goToStepE6(step) {
    if (step < 1 || step > 6) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`e6-screen-${step}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = step > stateE6.currentStep;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');

      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    stateE6.currentStep = step;
    saveStateE6();
  }

  document.getElementById('btnE6Start').addEventListener('click', () => goToStepE6(2));

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE6(parseInt(btn.getAttribute('data-next'), 10)));
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE6(parseInt(btn.getAttribute('data-prev'), 10)));
  });

  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });
  document.querySelectorAll('.step-node.nav-stage').forEach(node => {
    node.addEventListener('click', () => {
      window.location.href = node.getAttribute('data-href');
    });
  });
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStepE6(1));

  // ==========================================================================
  // PANTALLA 2: FRECUENCIA AL PEDIR AYUDA (RADIO)
  // ==========================================================================
  const askHelpCards = document.querySelectorAll('#askHelpFreqList .e6-radio-card');
  askHelpCards.forEach(card => {
    card.addEventListener('click', () => {
      stateE6.askHelpFrequency = card.getAttribute('data-value');
      saveStateE6();
      syncAskHelpUI();
    });
  });

  function syncAskHelpUI() {
    askHelpCards.forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-value') === stateE6.askHelpFrequency);
    });
  }

  // ==========================================================================
  // PANTALLA 3: RESOLUCIÓN DE DUDAS (RADIO + CAMPO "OTRAS.")
  // ==========================================================================
  const solveCards = document.querySelectorAll('#solveDoubtsList .e6-radio-card');
  const otherDoubtBox = document.getElementById('otherDoubtInputBox');
  const otherDoubtText = document.getElementById('otherDoubtText');

  solveCards.forEach(card => {
    card.addEventListener('click', () => {
      stateE6.solveDoubtsMethod = card.getAttribute('data-value');
      saveStateE6();
      syncSolveDoubtsUI();
      if (stateE6.solveDoubtsMethod === 'Otras.') otherDoubtText.focus();
    });
  });

  otherDoubtText.addEventListener('input', (e) => {
    stateE6.otherDoubtText = e.target.value;
    saveStateE6();
  });

  function syncSolveDoubtsUI() {
    solveCards.forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-value') === stateE6.solveDoubtsMethod);
    });
    otherDoubtText.value = stateE6.otherDoubtText || '';
    otherDoubtBox.classList.toggle('hidden', stateE6.solveDoubtsMethod !== 'Otras.');
  }

  document.getElementById('btnNextE6_3').addEventListener('click', () => {
    if (stateE6.solveDoubtsMethod === 'Otras.' && !stateE6.otherDoubtText.trim()) {
      showToast('Especifica cómo resuelves tus dudas en "Otras."', 'error');
      otherDoubtText.focus();
      return;
    }
    goToStepE6(4);
  });

  // ==========================================================================
  // PANTALLA 4: DISPOSICIÓN A COLABORAR (1 AL 5)
  // ==========================================================================
  const collabBtns = document.querySelectorAll('#collabScale .likert-btn');

  collabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stateE6.collaborationScore = parseInt(btn.getAttribute('data-score'), 10);
      saveStateE6();
      syncCollabScaleUI();
    });
  });

  function syncCollabScaleUI() {
    collabBtns.forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.getAttribute('data-score'), 10) === stateE6.collaborationScore);
    });
  }

  // ==========================================================================
  // PANTALLAS 5 Y 6: CHECKBOXES CON LÍMITE MÁXIMO DE 3 + CAMPO "OTROS."
  // ==========================================================================
  function setupMaxThreeCheckboxes(listId, stateKey, counterId, otherCheckId, otherBoxId, otherInputId, otherTextKey, maxErrorMsg) {
    const checkboxes = document.querySelectorAll(`#${listId} input[type="checkbox"]`);
    const counterEl = document.getElementById(counterId);
    const otherCheck = document.getElementById(otherCheckId);
    const otherBox = document.getElementById(otherBoxId);
    const otherInput = document.getElementById(otherInputId);

    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(checkboxes).filter(item => item.checked);
        if (checked.length > 3) {
          cb.checked = false;
          showToast(maxErrorMsg, 'error');
          return;
        }

        cb.closest('.checkbox-row').classList.toggle('checked', cb.checked);
        if (cb === otherCheck) {
          otherBox.classList.toggle('hidden', !cb.checked);
          if (cb.checked) otherInput.focus();
        }

        stateE6[stateKey] = checked.map(item => item.value);
        counterEl.textContent = `${stateE6[stateKey].length}/3`;
        saveStateE6();
      });
    });

    otherInput.addEventListener('input', (e) => {
      stateE6[otherTextKey] = e.target.value;
      saveStateE6();
    });

    return () => {
      checkboxes.forEach(cb => {
        const active = stateE6[stateKey].includes(cb.value);
        cb.checked = active;
        cb.closest('.checkbox-row').classList.toggle('checked', active);
      });
      otherInput.value = stateE6[otherTextKey] || '';
      otherBox.classList.toggle('hidden', !otherCheck.checked);
      counterEl.textContent = `${stateE6[stateKey].length}/3`;
    };
  }

  const syncReceiveUI = setupMaxThreeCheckboxes(
    'receiveSupportList',
    'receiveSupport',
    'receiveCounter',
    'otherReceiveCheck',
    'otherReceiveInputBox',
    'otherReceiveText',
    'otherReceiveText',
    'Puedes seleccionar hasta 3 tipos de apoyo.'
  );

  const syncContributeUI = setupMaxThreeCheckboxes(
    'contributeList',
    'contributeCommunity',
    'contributeCounter',
    'otherContributeCheck',
    'otherContributeInputBox',
    'otherContributeText',
    'otherContributeText',
    'Puedes seleccionar hasta 3 formas de aportar.'
  );

  document.getElementById('btnNextE6_5').addEventListener('click', () => {
    if (stateE6.receiveSupport.length === 0) {
      showToast('Selecciona al menos un tipo de apoyo que te gustaría recibir.', 'error');
      return;
    }
    if (document.getElementById('otherReceiveCheck').checked && !stateE6.otherReceiveText.trim()) {
      showToast('Especifica el apoyo en el campo "Otros."', 'error');
      document.getElementById('otherReceiveText').focus();
      return;
    }
    goToStepE6(6);
  });

  // Finalizar Etapa 6 y abrir modal de resumen
  const summaryModalE6 = document.getElementById('summaryModalE6');
  const summaryDetailsE6 = document.getElementById('summaryDetailsE6');

  document.getElementById('btnFinishStage6').addEventListener('click', () => {
    if (stateE6.contributeCommunity.length === 0) {
      showToast('Selecciona al menos un aporte para la comunidad estudiantil.', 'error');
      return;
    }
    if (document.getElementById('otherContributeCheck').checked && !stateE6.otherContributeText.trim()) {
      showToast('Especifica tu aporte en el campo "Otros."', 'error');
      document.getElementById('otherContributeText').focus();
      return;
    }

    stateE6.stage6Completed = true;
    saveStateE6();

    const doubtMethodFormatted = stateE6.solveDoubtsMethod === 'Otras.' && stateE6.otherDoubtText
      ? `Otras (${stateE6.otherDoubtText.trim()})`
      : stateE6.solveDoubtsMethod;

    const receiveFormatted = stateE6.receiveSupport.map(r =>
      r === 'Otros.' && stateE6.otherReceiveText ? `Otros (${stateE6.otherReceiveText.trim()})` : r
    );

    const contributeFormatted = stateE6.contributeCommunity.map(c =>
      c === 'Otros.' && stateE6.otherContributeText ? `Otros (${stateE6.otherContributeText.trim()})` : c
    );

    summaryDetailsE6.innerHTML = `
      <div class="summary-item">
        <strong>Frecuencia al Pedir Ayuda</strong>
        <span>${stateE6.askHelpFrequency}</span>
      </div>
      <div class="summary-item">
        <strong>Resolución de Dudas</strong>
        <span>${doubtMethodFormatted}</span>
      </div>
      <div class="summary-item">
        <strong>Disposición Colaborativa</strong>
        <span>${stateE6.collaborationScore} de 5</span>
      </div>
      <div class="summary-item">
        <strong>Apoyo a Recibir</strong>
        <span>${receiveFormatted.join(' • ')}</span>
      </div>
      <div class="summary-item">
        <strong>Aporte a la Comunidad</strong>
        <span>${contributeFormatted.join(' • ')}</span>
      </div>
    `;

    summaryModalE6.classList.add('open');
  });

  document.getElementById('editStage6Btn').addEventListener('click', () => {
    summaryModalE6.classList.remove('open');
  });

  document.getElementById('proceedStage7Btn').addEventListener('click', () => {
    summaryModalE6.classList.remove('open');
    showToast('¡Etapa 6 guardada! Listo para avanzar a la Etapa 7 (Final).', 'success');
    setTimeout(() => { window.location.href = 'etapa7.html'; }, 900);
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
      goToStepE6(target);
    });
  });

  document.getElementById('resetE6Btn').addEventListener('click', () => {
    stateE6 = { ...defaultStateE6 };
    saveStateE6();
    syncAllE6();
    drawerOverlay.classList.remove('open');
    goToStepE6(1);
    showToast('Etapa 6 reiniciada.', 'success');
  });

  // Sincronización inicial
  function syncAllE6() {
    syncAskHelpUI();
    syncSolveDoubtsUI();
    syncCollabScaleUI();
    syncReceiveUI();
    syncContributeUI();
  }

  syncAllE6();
  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`e6-screen-${stateE6.currentStep}`) || document.getElementById('e6-screen-1');
  saved.classList.add('active');
});