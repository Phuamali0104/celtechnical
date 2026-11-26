/**
 * StudentMind Connect - Onboarding de 4 Pasos (registro-perfil.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_ONBOARDING = 'studentmind_onboarding_profile';

  const defaultOnboarding = {
    step: 2,
    studentName: 'Valeria',
    university: 'UPC',
    career: 'Ingeniería Industrial',
    cycle: '7mo ciclo',
    modality: 'Presencial',
    mainGoal: 'Organizarme mejor',
    studyHours: '5 a 10',
    mainStruggle: 'Gestionar mi tiempo',
    firstImprovements: ['Plan de estudio', 'Bienestar y enfoque'],
    avatarDataUrl: ''
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ONBOARDING);
      return saved ? { ...defaultOnboarding, ...JSON.parse(saved) } : { ...defaultOnboarding };
    } catch (e) {
      return { ...defaultOnboarding };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(state));
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

  // Navegación entre pasos 2, 3 y 4 del Stepper
  const screens = document.querySelectorAll('.screen');

  function goToStep(stepNum) {
    if (stepNum < 2 || stepNum > 4) return;

    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`rp-screen-${stepNum}`);
    if (target) {
      target.classList.add('active');
      const body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    // Actualizar nodos del stepper superior
    document.querySelectorAll('.rp-step-item').forEach(item => {
      const s = parseInt(item.getAttribute('data-rp-step'), 10);
      item.classList.remove('active', 'completed');
      if (s < stepNum) item.classList.add('completed');
      if (s === stepNum) item.classList.add('active');
    });

    document.getElementById('conn-2-3').classList.toggle('active', stepNum >= 3);
    document.getElementById('conn-3-4').classList.toggle('active', stepNum >= 4);

    if (stepNum === 4) {
      hydrateCompletedScreen();
    }

    state.step = stepNum;
    saveState();
  }

  // Botón atrás superior
  document.getElementById('rpBackBtn').addEventListener('click', () => {
    if (state.step > 2) {
      goToStep(state.step - 1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  // ==========================================================================
  // PASO 2: PERFIL ACADÉMICO
  // ==========================================================================
  const nameInput = document.getElementById('rpStudentName');
  const uniSelect = document.getElementById('rpUniversity');
  const careerSelect = document.getElementById('rpCareer');
  const cycleSelect = document.getElementById('rpCycle');
  const avatarImg = document.getElementById('studentAvatarImg');

  // Subida de foto de perfil local
  document.getElementById('avatarFileInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.avatarDataUrl = reader.result;
      avatarImg.src = reader.result;
      saveState();
    };
    reader.readAsDataURL(file);
  });

  // Modalidad de estudio
  const modalityCards = document.querySelectorAll('.modality-card');
  modalityCards.forEach(card => {
    card.addEventListener('click', () => {
      state.modality = card.getAttribute('data-modality');
      modalityCards.forEach(c => c.classList.toggle('selected', c === card));
      saveState();
    });
  });

  // Meta principal
  const goalRows = document.querySelectorAll('.meta-radio-row');
  goalRows.forEach(row => {
    row.addEventListener('click', () => {
      state.mainGoal = row.getAttribute('data-goal');
      goalRows.forEach(r => r.classList.toggle('selected', r === row));
      saveState();
    });
  });

  document.getElementById('btnNextStep2').addEventListener('click', () => {
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      showToast('Ingresa el nombre del estudiante.', 'error');
      nameInput.focus();
      return;
    }
    state.studentName = nameVal;
    state.university = uniSelect.value;
    state.career = careerSelect.value;
    state.cycle = cycleSelect.value;
    saveState();
    goToStep(3);
  });

  // ==========================================================================
  // PASO 3: HÁBITOS Y NECESIDADES
  // ==========================================================================
  const hourCards = document.querySelectorAll('#studyHoursGrid .square-choice-card');
  hourCards.forEach(card => {
    card.addEventListener('click', () => {
      state.studyHours = card.getAttribute('data-hours');
      hourCards.forEach(c => c.classList.toggle('selected', c === card));
      saveState();
    });
  });

  const struggleCards = document.querySelectorAll('#struggleGrid .square-choice-card');
  struggleCards.forEach(card => {
    card.addEventListener('click', () => {
      state.mainStruggle = card.getAttribute('data-struggle');
      struggleCards.forEach(c => c.classList.toggle('selected', c === card));
      saveState();
    });
  });

  const improvePills = document.querySelectorAll('#firstImproveGrid input[type="checkbox"]');
  improvePills.forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.blue-check-pill').classList.toggle('checked', cb.checked);
      state.firstImprovements = Array.from(improvePills)
        .filter(i => i.checked)
        .map(i => i.value);
      saveState();
    });
  });

  document.getElementById('btnNextStep3').addEventListener('click', () => {
    if (state.firstImprovements.length === 0) {
      showToast('Elige al menos un aspecto que te gustaría mejorar primero.', 'error');
      return;
    }
    goToStep(4);
  });

  // ==========================================================================
  // PASO 4: ¡REGISTRO COMPLETADO!
  // ==========================================================================
  function hydrateCompletedScreen() {
    document.getElementById('summaryStudentName').textContent = state.studentName;
    document.getElementById('summaryUni').textContent = state.university;
    document.getElementById('summaryCareer').textContent = state.career;
    document.getElementById('summaryCycle').textContent = state.cycle;
    document.getElementById('summaryAvatarImg').src = state.avatarDataUrl || avatarImg.src;
  }

  document.getElementById('btnEditProfile').addEventListener('click', () => goToStep(2));

  const proModal = document.getElementById('proPlanModal');
  document.getElementById('btnOpenProModal').addEventListener('click', () => proModal.classList.add('open'));
  document.getElementById('closeProModalBtn').addEventListener('click', () => proModal.classList.remove('open'));

  document.getElementById('btnStartNow').addEventListener('click', () => {
    // Sincronizar con la sesión activa del Dashboard de plataforma.html
    localStorage.setItem('studentmind_platform_user', JSON.stringify({
      fullName: state.studentName,
      firstName: state.studentName.split(' ')[0],
      university: state.university,
      career: state.career,
      cycle: state.cycle,
      stageLevel: state.modality
    }));
    localStorage.setItem('studentmind_platform_view', '3');
    window.location.href = 'plataforma.html';
  });

  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStep(2));

  // Sincronización inicial al cargar
  nameInput.value = state.studentName;
  uniSelect.value = state.university;
  careerSelect.value = state.career;
  cycleSelect.value = state.cycle;
  if (state.avatarDataUrl) avatarImg.src = state.avatarDataUrl;

  modalityCards.forEach(c => c.classList.toggle('selected', c.getAttribute('data-modality') === state.modality));
  goalRows.forEach(r => r.classList.toggle('selected', r.getAttribute('data-goal') === state.mainGoal));
  hourCards.forEach(c => c.classList.toggle('selected', c.getAttribute('data-hours') === state.studyHours));
  struggleCards.forEach(c => c.classList.toggle('selected', c.getAttribute('data-struggle') === state.mainStruggle));
  improvePills.forEach(cb => {
    const active = state.firstImprovements.includes(cb.value);
    cb.checked = active;
    cb.closest('.blue-check-pill').classList.toggle('checked', active);
  });

  goToStep(state.step);
});