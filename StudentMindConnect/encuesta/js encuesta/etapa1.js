/**
 * StudentMind Connect - Prototipo Interactivo Etapa 1 (Diagnóstico Académico)
 * Arquitectura: JavaScript Vanilla + LocalStorage + Validaciones UI/UX
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar íconos Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // ==========================================================================
  // 1. ESTADO DE LA APLICACIÓN Y PERSISTENCIA (LOCALSTORAGE)
  // ==========================================================================
  const STORAGE_KEY_DIAGNOSTIC = 'studentmind_diagnostic_stage1';
  const STORAGE_KEY_USER = 'studentmind_active_user';

  const defaultState = {
    currentStep: 1,
    career: '',
    cycle: '3° - 4° ciclo',
    courses: ['Matemáticas', 'Bases de datos'],
    otherCourseText: '',
    goals: [
      'Aprobar mis cursos',
      'Comprender mejor los temas',
      'Desarrollar habilidades para mi carrera'
    ],
    otherGoalText: '',
    stage1Completed: false
  };

  let appState = loadDiagnosticState();
  let currentUser = loadUserSession();
  let authMode = 'login';

  function loadDiagnosticState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIAGNOSTIC);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
    } catch (e) {
      return { ...defaultState };
    }
  }

  function saveDiagnosticState() {
    localStorage.setItem(STORAGE_KEY_DIAGNOSTIC, JSON.stringify(appState));
  }

  function loadUserSession() {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  }

  // ==========================================================================
  // 2. SISTEMA DE NOTIFICACIONES (TOAST) Y RELOJ DE ESTADO
  // ==========================================================================
  const toastEl = document.getElementById('toastNotification');
  const toastMsgEl = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message, type = 'error') {
    toastMsgEl.textContent = message;
    toastEl.className = `toast-notification show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('statusTime');
    if (timeEl) timeEl.textContent = `${hours}:${mins}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ==========================================================================
  // 3. NAVEGACIÓN ENTRE PANTALLAS (1 A 5)
  // ==========================================================================
  const screens = document.querySelectorAll('.screen');

  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > 5) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`screen-${targetStep}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const isForward = targetStep > appState.currentStep;
      currentScreen.classList.remove('active');
      if (isForward) {
        currentScreen.classList.add('exit-left');
      }

      setTimeout(() => {
        currentScreen.classList.remove('exit-left');
      }, 300);

      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    appState.currentStep = targetStep;
    saveDiagnosticState();
  }

  // Botón "¡Comencemos!" (Pantalla 1 -> 2)
  document.getElementById('btnStartTest').addEventListener('click', () => {
    goToStep(2);
  });

  // Botones "Anterior"
  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
      goToStep(prevStep);
    });
  });

  // Botón home en logo y barra de gestos
  document.getElementById('brandHomeBtn').addEventListener('click', () => goToStep(1));
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStep(1));

  // ==========================================================================
  // 4. PANTALLA 2: SELECTOR DESPLEGABLE DE CARRERA + VALIDACIÓN
  // ==========================================================================
  const selectWrapper = document.getElementById('careerSelectWrapper');
  const selectTrigger = document.getElementById('careerSelectTrigger');
  const selectedLabel = document.getElementById('careerSelectedLabel');
  const optionsItems = document.querySelectorAll('#careerOptionsList li');

  selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = selectWrapper.classList.toggle('open');
    selectTrigger.setAttribute('aria-expanded', isOpen);
  });

  optionsItems.forEach(item => {
    item.addEventListener('click', () => {
      const value = item.getAttribute('data-value');
      appState.career = value;
      saveDiagnosticState();
      syncCareerUI();
      selectWrapper.classList.remove('open');
      selectTrigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!selectWrapper.contains(e.target)) {
      selectWrapper.classList.remove('open');
      selectTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  function syncCareerUI() {
    if (appState.career) {
      selectedLabel.textContent = appState.career;
      selectedLabel.classList.remove('placeholder');
      optionsItems.forEach(li => {
        li.classList.toggle('selected', li.getAttribute('data-value') === appState.career);
      });
    } else {
      selectedLabel.textContent = 'Selecciona tu carrera';
      selectedLabel.classList.add('placeholder');
    }
  }

  document.getElementById('btnNext2').addEventListener('click', () => {
    if (!appState.career) {
      showToast('Por favor, selecciona tu carrera para continuar.', 'error');
      selectWrapper.classList.add('open');
      return;
    }
    goToStep(3);
  });

  // ==========================================================================
  // 5. PANTALLA 3: TARJETAS RADIO DE CICLO ACADÉMICO
  // ==========================================================================
  const cycleCards = document.querySelectorAll('.radio-card');

  cycleCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedCycle = card.getAttribute('data-cycle');
      appState.cycle = selectedCycle;
      saveDiagnosticState();
      syncCycleUI();
    });
  });

  function syncCycleUI() {
    cycleCards.forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-cycle') === appState.cycle);
    });
  }

  document.getElementById('btnNext3').addEventListener('click', () => {
    if (!appState.cycle) {
      showToast('Selecciona el ciclo en el que te encuentras.', 'error');
      return;
    }
    goToStep(4);
  });

  // ==========================================================================
  // 6. PANTALLA 4: CURSOS ACTUALES (SELECCIÓN MÚLTIPLE + CAMPO "OTROS")
  // ==========================================================================
  const courseCheckboxes = document.querySelectorAll('#coursesList input[type="checkbox"]');
  const otherCourseCheck = document.getElementById('otherCourseCheck');
  const otherCourseBox = document.getElementById('otherCourseInputBox');
  const otherCourseText = document.getElementById('otherCourseText');

  courseCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const row = cb.closest('.checkbox-row');
      row.classList.toggle('checked', cb.checked);

      if (cb === otherCourseCheck) {
        otherCourseBox.classList.toggle('hidden', !cb.checked);
        if (cb.checked) otherCourseText.focus();
      }

      appState.courses = Array.from(courseCheckboxes)
        .filter(item => item.checked)
        .map(item => item.value);
      saveDiagnosticState();
    });
  });

  otherCourseText.addEventListener('input', (e) => {
    appState.otherCourseText = e.target.value;
    saveDiagnosticState();
  });

  function syncCoursesUI() {
    courseCheckboxes.forEach(cb => {
      const isChecked = appState.courses.includes(cb.value);
      cb.checked = isChecked;
      cb.closest('.checkbox-row').classList.toggle('checked', isChecked);
    });
    otherCourseText.value = appState.otherCourseText || '';
    otherCourseBox.classList.toggle('hidden', !otherCourseCheck.checked);
  }

  document.getElementById('btnNext4').addEventListener('click', () => {
    if (appState.courses.length === 0) {
      showToast('Selecciona al menos un curso que estés llevando.', 'error');
      return;
    }
    if (otherCourseCheck.checked && !appState.otherCourseText.trim()) {
      showToast('Especifica el nombre en la opción "Otros".', 'error');
      otherCourseText.focus();
      return;
    }
    goToStep(5);
  });

  // ==========================================================================
  // 7. PANTALLA 5: OBJETIVOS ACADÉMICOS (LÍMITE MÁXIMO DE 3 SELECCIONES)
  // ==========================================================================
  const goalCheckboxes = document.querySelectorAll('#goalsList input[type="checkbox"]');
  const goalsCounter = document.getElementById('goalsCounter');
  const otherGoalCheck = document.getElementById('otherGoalCheck');
  const otherGoalBox = document.getElementById('otherGoalInputBox');
  const otherGoalText = document.getElementById('otherGoalText');

  goalCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedGoals = Array.from(goalCheckboxes).filter(item => item.checked);

      // Validar máximo 3 opciones
      if (checkedGoals.length > 3) {
        cb.checked = false;
        showToast('Solo puedes seleccionar hasta 3 objetivos principales.', 'error');
        return;
      }

      const row = cb.closest('.checkbox-row');
      row.classList.toggle('checked', cb.checked);

      if (cb === otherGoalCheck) {
        otherGoalBox.classList.toggle('hidden', !cb.checked);
        if (cb.checked) otherGoalText.focus();
      }

      appState.goals = checkedGoals.map(item => item.value);
      updateGoalsCounter();
      saveDiagnosticState();
    });
  });

  otherGoalText.addEventListener('input', (e) => {
    appState.otherGoalText = e.target.value;
    saveDiagnosticState();
  });

  function updateGoalsCounter() {
    goalsCounter.textContent = `${appState.goals.length}/3`;
  }

  function syncGoalsUI() {
    goalCheckboxes.forEach(cb => {
      const isChecked = appState.goals.includes(cb.value);
      cb.checked = isChecked;
      cb.closest('.checkbox-row').classList.toggle('checked', isChecked);
    });
    otherGoalText.value = appState.otherGoalText || '';
    otherGoalBox.classList.toggle('hidden', !otherGoalCheck.checked);
    updateGoalsCounter();
  }

  // Finalizar Etapa 1 y abrir modal de resumen
  const summaryModal = document.getElementById('summaryModal');
  const summaryDetailsBox = document.getElementById('summaryDetailsBox');

  document.getElementById('btnFinishStage1').addEventListener('click', () => {
    if (appState.goals.length === 0) {
      showToast('Selecciona al menos 1 objetivo académico.', 'error');
      return;
    }
    if (otherGoalCheck.checked && !appState.otherGoalText.trim()) {
      showToast('Especifica tu objetivo en el campo "Otros".', 'error');
      otherGoalText.focus();
      return;
    }

    appState.stage1Completed = true;
    saveDiagnosticState();

    // Formatear cursos y objetivos incluyendo texto personalizado
    const formattedCourses = appState.courses.map(c =>
      c === 'Otros' && appState.otherCourseText ? `Otros (${appState.otherCourseText.trim()})` : c
    );
    const formattedGoals = appState.goals.map(g =>
      g === 'Otros' && appState.otherGoalText ? `Otros (${appState.otherGoalText.trim()})` : g
    );

    summaryDetailsBox.innerHTML = `
      <div class="summary-item">
        <strong>Carrera Universitaria</strong>
        <span>${appState.career}</span>
      </div>
      <div class="summary-item">
        <strong>Ciclo Académico</strong>
        <span>${appState.cycle}</span>
      </div>
      <div class="summary-item">
        <strong>Cursos Actuales (${formattedCourses.length})</strong>
        <span>${formattedCourses.join(', ')}</span>
      </div>
      <div class="summary-item">
        <strong>Objetivos Principales (${formattedGoals.length}/3)</strong>
        <span>${formattedGoals.join(' • ')}</span>
      </div>
    `;

    // Marcar Etapa 1 completada en el stepper superior
    const stage1Node = document.querySelector('.step-node[data-stage="1"]');
    const stage2Node = document.querySelector('.step-node[data-stage="2"]');
    if (stage1Node) {
      stage1Node.classList.remove('active');
      stage1Node.classList.add('completed');
    }
    if (stage2Node) {
      stage2Node.classList.add('active');
    }

    summaryModal.classList.add('open');
  });

  document.getElementById('editStage1Btn').addEventListener('click', () => {
    summaryModal.classList.remove('open');
  });

  document.getElementById('proceedStage2Btn').addEventListener('click', () => {
    summaryModal.classList.remove('open');
    showToast('¡Perfil guardado! Listo para comenzar la Etapa 2.', 'success');
    setTimeout(() => { window.location.href = 'etapa2.html'; }, 900);
  });

  // ==========================================================================
  // 8. MENÚ LATERAL (DRAWER) Y SIMULACIÓN DE LOGIN / REGISTRO
  // ==========================================================================
  const drawerOverlay = document.getElementById('drawerOverlay');
  const authModal = document.getElementById('authModal');
  const userSessionCard = document.getElementById('userSessionCard');

  document.getElementById('openMenuBtn').addEventListener('click', () => {
    renderUserSessionCard();
    drawerOverlay.classList.add('open');
  });

  document.getElementById('closeMenuBtn').addEventListener('click', () => {
    drawerOverlay.classList.remove('open');
  });

  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
  });

  // Navegación directa desde el menú lateral
  document.querySelectorAll('.drawer-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-jump'), 10);
      drawerOverlay.classList.remove('open');
      goToStep(target);
    });
  });

  // Reiniciar diagnóstico completo
  document.getElementById('resetProgressBtn').addEventListener('click', () => {
    appState = { ...defaultState };
    saveDiagnosticState();
    syncAllUI();

    // Restaurar stepper
    document.querySelectorAll('.step-node').forEach(node => {
      node.classList.remove('active', 'completed');
    });
    document.querySelector('.step-node[data-stage="1"]').classList.add('active');

    drawerOverlay.classList.remove('open');
    goToStep(1);
    showToast('Diagnóstico reiniciado correctamente.', 'success');
  });

  // Botón de perfil rápido en header
  document.getElementById('headerProfileBtn').addEventListener('click', () => {
    if (currentUser) {
      renderUserSessionCard();
      drawerOverlay.classList.add('open');
    } else {
      openAuthModal('login');
    }
  });

  function renderUserSessionCard() {
    if (currentUser) {
      const initials = currentUser.name.slice(0, 2).toUpperCase();
      userSessionCard.innerHTML = `
        <div class="session-user-info">
          <div class="session-avatar">${initials}</div>
          <div>
            <div class="session-name">${currentUser.name}</div>
            <div class="session-email">${currentUser.email}</div>
          </div>
        </div>
        <button class="btn-small-logout" id="logoutBtn">Cerrar sesión</button>
      `;
      document.getElementById('logoutBtn').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEY_USER);
        renderUserSessionCard();
        showToast('Sesión cerrada.', 'success');
      });
    } else {
      userSessionCard.innerHTML = `
        <div class="session-user-info">
          <div class="session-avatar"><i data-lucide="user"></i></div>
          <div>
            <div class="session-name">Estudiante Invitado</div>
            <div class="session-email">Inicia sesión para sincronizar</div>
          </div>
        </div>
        <button class="btn-small-auth" id="openAuthFromDrawer">Iniciar sesión / Registrarse</button>
      `;
      if (window.lucide) lucide.createIcons();
      document.getElementById('openAuthFromDrawer').addEventListener('click', () => {
        drawerOverlay.classList.remove('open');
        openAuthModal('login');
      });
    }
  }

  // Modal de Login / Registro
  const authTabs = document.querySelectorAll('.auth-tab');
  const registerNameGroup = document.getElementById('registerNameGroup');
  const authModalTitle = document.getElementById('authModalTitle');

  function openAuthModal(mode = 'login') {
    authMode = mode;
    authTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-auth-mode') === mode));
    registerNameGroup.classList.toggle('hidden', mode === 'login');
    authModalTitle.textContent = mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Estudiantil';
    authModal.classList.add('open');
  }

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      openAuthModal(tab.getAttribute('data-auth-mode'));
    });
  });

  document.getElementById('closeAuthModalBtn').addEventListener('click', () => {
    authModal.classList.remove('open');
  });

  document.getElementById('authForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('authName').value.trim();
    const emailInput = document.getElementById('authEmail').value.trim();
    const passInput = document.getElementById('authPassword').value.trim();

    if (!emailInput || !emailInput.includes('@')) {
      showToast('Ingresa un correo electrónico válido.', 'error');
      return;
    }
    if (passInput.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (authMode === 'register' && nameInput.length < 2) {
      showToast('Ingresa tu nombre completo para registrarte.', 'error');
      return;
    }

    const displayName = authMode === 'register'
      ? nameInput
      : emailInput.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    currentUser = { name: displayName, email: emailInput };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

    authModal.classList.remove('open');
    document.getElementById('authForm').reset();
    showToast(`¡Bienvenido(a), ${currentUser.name}!`, 'success');
  });

  // ==========================================================================
  // 9. SINCRONIZACIÓN INICIAL AL CARGAR LA PÁGINA
  // ==========================================================================
  function syncAllUI() {
    syncCareerUI();
    syncCycleUI();
    syncCoursesUI();
    syncGoalsUI();
  }

  syncAllUI();
  // Restaurar la pantalla donde quedó el usuario
  screens.forEach(s => s.classList.remove('active'));
  const savedScreen = document.getElementById(`screen-${appState.currentStep}`) || document.getElementById('screen-1');
  savedScreen.classList.add('active');
});