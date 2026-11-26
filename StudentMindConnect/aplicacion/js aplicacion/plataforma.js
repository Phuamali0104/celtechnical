/**
 * StudentMind Connect - Plataforma Principal (plataforma.html)
 * Gestiona Acceso, Registro Freemium, Dashboard Home (según el plan) y la pantalla de Planes.
 * Requiere planes.js (window.SMCPlanes) cargado antes.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_USER = 'studentmind_platform_user';
  const STORAGE_KEY_VIEW = 'studentmind_platform_view';

  const Planes = window.SMCPlanes;
  const P = Planes.PLANS;
  const F = Planes.FEATURES;

  let userProfile = loadUserProfile();
  let currentView = parseInt(localStorage.getItem(STORAGE_KEY_VIEW) || '1', 10);

  function loadUserProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveUserProfile(profile) {
    userProfile = profile;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
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

  // Navegación entre las 4 vistas de plataforma.html
  const screens = document.querySelectorAll('.screen');

  function goToView(viewNum) {
    if (viewNum < 1 || viewNum > 4) return;
    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`plat-screen-${viewNum}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = viewNum > currentView;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');
      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
    }

    if (viewNum === 3) hydrateDashboard();
    if (viewNum === 4) renderPlansScreen();

    currentView = viewNum;
    localStorage.setItem(STORAGE_KEY_VIEW, String(viewNum));
  }

  // ==========================================================================
  // PANTALLA 1: ACCESO SOCIAL / CORREO
  // ==========================================================================
  document.getElementById('btnGoogleLogin').addEventListener('click', () => {
    saveUserProfile({
      fullName: 'María Fernanda López',
      firstName: 'María',
      email: 'maria.lopez@gmail.com',
      university: 'Universidad Nacional del Sur',
      career: 'Psicología',
      cycle: '6.º semestre',
      stageLevel: 'Mitad de carrera',
      provider: 'Google'
    });
    showToast('Sesión iniciada con Google.', 'success');
    goToView(3);
  });

  document.getElementById('btnAppleLogin').addEventListener('click', () => {
    saveUserProfile({
      fullName: 'María Fernanda López',
      firstName: 'María',
      email: 'maria.lopez@icloud.com',
      university: 'Universidad Nacional del Sur',
      career: 'Psicología',
      cycle: '6.º semestre',
      stageLevel: 'Mitad de carrera',
      provider: 'Apple'
    });
    showToast('Sesión iniciada con Apple ID.', 'success');
    goToView(3);
  });

  document.getElementById('btnEmailRegister').addEventListener('click', () => {
    prefillFromDiagnostic();
    goToView(2);
  });

  // ==========================================================================
  // PANTALLA 2: REGISTRO FREEMIUM
  // ==========================================================================
  document.getElementById('btnBackToWelcome').addEventListener('click', () => goToView(1));

  // Mostrar / ocultar contraseña
  const regPassInput = document.getElementById('regPassword');
  document.getElementById('togglePassBtn').addEventListener('click', () => {
    const isPass = regPassInput.type === 'password';
    regPassInput.type = isPass ? 'text' : 'password';
  });

  // Selector de 3 tarjetas de etapa
  let selectedStageLevel = 'Mitad de carrera';
  const stageCards = document.querySelectorAll('.stage-choice-card');
  stageCards.forEach(card => {
    card.addEventListener('click', () => {
      selectedStageLevel = card.getAttribute('data-stage-level');
      stageCards.forEach(c => c.classList.toggle('selected', c === card));
    });
  });

  // Precargar carrera si el usuario ya completó Etapa 1
  function prefillFromDiagnostic() {
    try {
      const e1 = JSON.parse(localStorage.getItem('studentmind_diagnostic_stage1') || 'null');
      if (e1 && e1.career) {
        const careerSelect = document.getElementById('regCareer');
        Array.from(careerSelect.options).forEach(opt => {
          if (opt.value === e1.career) careerSelect.value = e1.career;
        });
      }
    } catch (e) {}
  }

  document.getElementById('freemiumRegisterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = regPassInput.value.trim();
    const university = document.getElementById('regUniversity').value;
    const career = document.getElementById('regCareer').value;
    const cycle = document.getElementById('regCycle').value;
    const acceptedTerms = document.getElementById('acceptTermsCheck').checked;

    if (fullName.length < 3) {
      showToast('Ingresa tus nombres y apellidos completos.', 'error');
      return;
    }
    if (!email || !email.includes('@')) {
      showToast('Ingresa un correo electrónico válido.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (!acceptedTerms) {
      showToast('Debes aceptar los Términos de uso y Política de privacidad.', 'error');
      return;
    }

    const firstName = fullName.split(' ')[0];
    saveUserProfile({
      fullName,
      firstName,
      email,
      university,
      career,
      cycle,
      stageLevel: selectedStageLevel,
      provider: 'Freemium Email'
    });
    Planes.setPlan('gratis');

    showToast(`¡Cuenta Freemium creada para ${firstName}!`, 'success');
    goToView(3);
    setTimeout(() => { window.location.href = 'registro-perfil.html'; }, 900);
  });

  // ==========================================================================
  // PANTALLA 3: DASHBOARD HOME PRINCIPAL
  // ==========================================================================
  function hydrateDashboard() {
    const firstName = userProfile?.firstName || 'María';
    document.getElementById('dashGreetingTitle').textContent = `¡Hola, ${firstName}!`;

    // Sincronizar métricas con resultados de Etapas 2, 3 y 5 si existen
    try {
      const e2 = JSON.parse(localStorage.getItem('studentmind_diagnostic_stage2') || 'null');
      const e3 = JSON.parse(localStorage.getItem('studentmind_diagnostic_stage3') || 'null');
      const e5 = JSON.parse(localStorage.getItem('studentmind_diagnostic_stage5') || 'null');

      const org = e2?.planningHabit === 'Sí, siempre' ? 88 : 72;
      const comp = e3?.effectivenessScore ? Math.min(92, 44 + e3.effectivenessScore * 6) : 68;
      const constancia = e3?.practiceFrequency?.startsWith('Siempre') ? 85 : 60;
      const bienestar = e5?.sleepHabit?.includes('7–9') ? 75 : 58;

      document.getElementById('dashBarOrg').style.width = `${org}%`;
      document.getElementById('dashValOrg').textContent = `${org} %`;

      document.getElementById('dashBarComp').style.width = `${comp}%`;
      document.getElementById('dashValComp').textContent = `${comp} %`;

      document.getElementById('dashBarConst').style.width = `${constancia}%`;
      document.getElementById('dashValConst').textContent = `${constancia} %`;

      document.getElementById('dashBarBien').style.width = `${bienestar}%`;
      document.getElementById('dashValBien').textContent = `${bienestar} %`;
    } catch (e) {}

    renderDashboardPlan();
  }

  // Modal de módulos / funciones bloqueadas
  const modulePreviewModal = document.getElementById('modulePreviewModal');
  const modPlansBtn = document.getElementById('modModalPlansBtn');
  const modCloseBtn = document.getElementById('closeModuleModalBtn');

  function openModuleModal(title, desc, body, locked) {
    document.getElementById('modModalTitle').textContent = title;
    document.getElementById('modModalDesc').textContent = desc;
    document.getElementById('modModalBody').innerHTML = body;
    document.getElementById('modModalIcon').innerHTML = `<i data-lucide="${locked ? 'lock' : 'sparkles'}"></i>`;
    modPlansBtn.hidden = !locked;
    modCloseBtn.className = `${locked ? 'btn-secondary' : 'btn-primary'} full-width`;
    modCloseBtn.querySelector('span').textContent = locked ? 'Ahora no' : 'Entendido';
    if (window.lucide) lucide.createIcons();
    modulePreviewModal.classList.add('open');
  }

  modPlansBtn.addEventListener('click', () => {
    modulePreviewModal.classList.remove('open');
    goToView(4);
  });

  modCloseBtn.addEventListener('click', () => {
    modulePreviewModal.classList.remove('open');
  });

  document.getElementById('notifBellBtn').addEventListener('click', () => {
    const MSG = {
      gratis: 'Tienes 1 nueva sugerencia de tu Tutor IA.',
      smart: 'Tu copiloto reorganizó tu plan de esta semana.',
      pro: 'Nuevo reto disponible en tu Ruta personalizada.',
      elite: 'Alerta de fatiga: Lumen ajustó tu carga del jueves.'
    };
    showToast(MSG[Planes.getPlan()], 'success');
  });

  document.getElementById('dashProfileBtn').addEventListener('click', () => {
    const name = userProfile?.fullName || 'María Fernanda López';
    const career = userProfile?.career || 'Psicología';
    showToast(`${name} (${career}) · Plan ${P[Planes.getPlan()].name}`, 'success');
  });

  document.getElementById('habitsInfoBtn').addEventListener('click', () => {
    showToast('Métricas calculadas a partir de tu Test de Diagnóstico.', 'success');
  });

  // ==========================================================================
  // PLANES: dashboard según el plan
  // ==========================================================================
  function featureTile(id, locked) {
    const f = F[id];
    const tag = locked ? `<span class="tile-plan-tag">${P[f.plan].name}</span>` : '';
    const lock = locked ? '<span class="tile-lock"><i data-lucide="lock"></i></span>' : '';
    const inner = `${lock}<div class="tile-icon-box"><i data-lucide="${f.icon}"></i></div><span>${f.short}</span>${tag}`;
    if (!locked && f.href) {
      return `<a href="${f.href}" class="module-tile" data-feature-tile="${id}">${inner}</a>`;
    }
    return `<button type="button" class="module-tile${locked ? ' is-locked' : ''}" data-feature-tile="${id}">${inner}</button>`;
  }

  function onFeatureTile(id) {
    const f = F[id];
    if (!Planes.has(id)) {
      const plan = P[f.plan];
      openModuleModal(
        f.label,
        f.desc,
        `<div class="summary-item"><strong>Incluido en plan ${plan.name}</strong><span>${plan.price} ${plan.period} · ${plan.tagline}</span></div>`,
        true
      );
      return;
    }
    if (f.lumen) {
      if (window.StudentMindLumen) window.StudentMindLumen.open();
      return;
    }
    if (f.widget) {
      const w = document.querySelector(`.plan-widget[data-feature="${f.widget}"]`);
      if (w) {
        w.scrollIntoView({ behavior: 'smooth', block: 'center' });
        w.classList.remove('pw-flash');
        void w.offsetWidth;
        w.classList.add('pw-flash');
      }
    }
  }

  document.getElementById('dashModulesGrid').addEventListener('click', (e) => {
    const tile = e.target.closest('[data-feature-tile]');
    if (!tile || tile.tagName === 'A') return;
    onFeatureTile(tile.getAttribute('data-feature-tile'));
  });

  function getHabitScores() {
    const val = id => parseInt(document.getElementById(id).textContent, 10) || 0;
    return {
      org: val('dashValOrg'),
      comp: val('dashValComp'),
      constancia: val('dashValConst'),
      bienestar: val('dashValBien')
    };
  }

  const BUBBLE = {
    gratis: 'Soy tu tutor IA.<br>¿Qué duda resolvemos?',
    smart: 'Soy tu copiloto.<br>Hoy toca reforzar 3 temas.',
    pro: 'Tu ruta va al 64 %.<br>¿Seguimos con el reto?',
    elite: 'Todo sincronizado.<br>Tu energía está bien hoy.'
  };

  function renderDashboardPlan() {
    const planId = Planes.getPlan();
    const plan = P[planId];
    const next = Planes.nextPlan(planId);
    const included = Planes.includedFeatures(planId);
    const total = Object.keys(F).length;

    // Tarjeta del plan actual
    document.getElementById('planHeroCard').setAttribute('data-hero-plan', planId);
    const chip = document.getElementById('planHeroChip');
    chip.setAttribute('data-chip-plan', planId);
    chip.innerHTML = `<i data-lucide="${plan.icon}"></i> ${plan.name.toUpperCase()}`;
    document.getElementById('planHeroTitle').textContent = `Plan ${plan.name}`;
    document.getElementById('planHeroDesc').textContent = plan.tagline;
    document.getElementById('planHeroMeter').style.width = `${Math.round(included.length / total * 100)}%`;
    document.getElementById('planHeroMeterLabel').textContent = `${included.length} de ${total} funciones activas`;
    const upBtn = document.getElementById('planHeroUpgrade');
    upBtn.hidden = !next;
    if (next) upBtn.innerHTML = `<i data-lucide="${P[next].icon}"></i> Mejorar a ${P[next].name} · ${P[next].price}`;

    // Herramientas incluidas + vista previa bloqueada del siguiente plan
    const lockedPreview = next ? P[next].features : [];
    document.getElementById('dashModulesGrid').innerHTML =
      included.map(id => featureTile(id, false)).join('') +
      lockedPreview.map(id => featureTile(id, true)).join('');
    document.getElementById('dashToolsCount').textContent = `${included.length} activas`;

    // Widgets exclusivos de cada plan
    document.querySelectorAll('.plan-widget[data-feature]').forEach(w => {
      w.hidden = !Planes.has(w.getAttribute('data-feature'));
    });

    document.querySelector('.owl-speech-bubble').innerHTML = BUBBLE[planId];

    // Tarjeta del siguiente plan
    const upsell = document.getElementById('dashUpsell');
    upsell.hidden = !next;
    if (next) {
      const np = P[next];
      upsell.setAttribute('data-upsell-plan', next);
      upsell.innerHTML = `
        <div class="up-head">
          <span class="plan-chip" data-chip-plan="${next}"><i data-lucide="${np.icon}"></i> ${np.name}</span>
          <span class="up-price">${np.price} <small>${np.period}</small></span>
        </div>
        <p>${np.tagline}</p>
        <ul>${np.features.map(id => `<li><i data-lucide="${F[id].icon}"></i>${F[id].label}</li>`).join('')}</ul>
        <button type="button" class="up-btn" data-go-plans>Ver plan ${np.name}</button>`;
    }

    if (Planes.has('refuerzo')) renderWeakTopics();
    if (Planes.has('radar')) renderRadar();
    if (Planes.has('fatiga')) renderFatigue();
    if (Planes.has('calendario')) renderCalendar();
    if (Planes.has('analitica')) renderSpark();

    if (window.lucide) lucide.createIcons();
  }

  // ---- SMART: Refuerzo de temas débiles ----
  function renderWeakTopics() {
    let topics = [
      { name: 'Integrales dobles', course: 'Cálculo II', pct: 42 },
      { name: 'Estadística inferencial', course: 'Estadística', pct: 51 },
      { name: 'Redacción académica', course: 'Comunicación', pct: 58 }
    ];
    try {
      const e1 = JSON.parse(localStorage.getItem('studentmind_diagnostic_stage1') || 'null');
      if (e1 && Array.isArray(e1.difficultCourses) && e1.difficultCourses.length) {
        topics = e1.difficultCourses.slice(0, 3).map((c, i) => ({ name: c, course: 'Según tu diagnóstico', pct: 40 + i * 8 }));
      }
    } catch (e) {}
    document.getElementById('weakTopicsList').innerHTML = topics.map(t => `
      <div class="weak-row">
        <div class="weak-info">
          <strong>${t.name}</strong>
          <small>${t.course} · dominio ${t.pct} %</small>
          <div class="weak-track"><div class="weak-fill" style="width:${t.pct}%"></div></div>
        </div>
        <button type="button" class="weak-btn" data-weak="${t.name}">Reforzar</button>
      </div>`).join('');
  }

  document.getElementById('weakTopicsList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-weak]');
    if (b) showToast(`Lumen preparó 5 ejercicios de "${b.getAttribute('data-weak')}".`, 'success');
  });

  // ---- PRO: Radar de conocimiento ----
  function renderRadar() {
    const h = getHabitScores();
    const axes = [
      { label: 'Organización', v: h.org },
      { label: 'Comprensión', v: h.comp },
      { label: 'Constancia', v: h.constancia },
      { label: 'Bienestar', v: h.bienestar },
      { label: 'Práctica', v: Math.round((h.comp + h.constancia) / 2) }
    ];
    const cx = 120, cy = 104, R = 70, n = axes.length;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
    };
    let svg = '';
    [0.25, 0.5, 0.75, 1].forEach(k => {
      svg += `<polygon class="radar-grid" points="${axes.map((_, i) => pt(i, R * k).join(',')).join(' ')}"/>`;
    });
    axes.forEach((a, i) => {
      const [x, y] = pt(i, R);
      svg += `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      const [lx, ly] = pt(i, R + 15);
      svg += `<text class="radar-label" x="${lx}" y="${ly + 3}" text-anchor="middle">${a.label}</text>`;
    });
    svg += `<polygon class="radar-area" points="${axes.map((a, i) => pt(i, R * a.v / 100).join(',')).join(' ')}"/>`;
    axes.forEach((a, i) => {
      const [x, y] = pt(i, R * a.v / 100);
      svg += `<circle class="radar-dot" cx="${x}" cy="${y}" r="3.5"><title>${a.label}: ${a.v} %</title></circle>`;
    });
    document.getElementById('radarSvg').innerHTML = svg;
    const avg = Math.round(axes.reduce((s, a) => s + a.v, 0) / n);
    document.getElementById('radarAvg').textContent = `Promedio ${avg} %`;
  }

  // ---- ELITE: Predicción de fatiga ----
  function renderFatigue() {
    const h = getHabitScores();
    const fatigue = Math.max(12, Math.min(92, 100 - h.bienestar + 8));
    document.getElementById('fatigueArc').setAttribute('stroke-dasharray', `${fatigue} 100`);
    document.getElementById('fatigueNum').textContent = `${fatigue}%`;
    const level = fatigue < 40 ? 'bajo' : fatigue < 65 ? 'medio' : 'alto';
    const lv = document.getElementById('fatigueLevel');
    lv.textContent = `Riesgo ${level}`;
    lv.setAttribute('data-level', level);
    document.getElementById('fatigueTip').textContent = {
      alto: 'Lumen recomienda bajar tu carga hoy y dormir 8 h.',
      medio: 'Mueve el repaso pesado al miércoles por la tarde.',
      bajo: 'Buen momento para los temas más difíciles.'
    }[level];
  }

  // ---- ELITE: Sincroniza tu calendario ----
  const CAL_KEY = 'studentmind_calendar_sync';
  function loadCal() {
    try { return JSON.parse(localStorage.getItem(CAL_KEY) || '{}'); } catch (e) { return {}; }
  }
  function renderCalendar() {
    const state = loadCal();
    document.querySelectorAll('[data-cal]').forEach(input => {
      const k = input.getAttribute('data-cal');
      input.checked = !!state[k];
      document.querySelector(`[data-cal-status="${k}"]`).textContent = state[k] ? 'Sincronizado · hace 1 min' : 'Sin conectar';
    });
  }
  document.querySelectorAll('[data-cal]').forEach(input => {
    input.addEventListener('change', () => {
      const state = loadCal();
      const k = input.getAttribute('data-cal');
      state[k] = input.checked;
      localStorage.setItem(CAL_KEY, JSON.stringify(state));
      renderCalendar();
      const name = k === 'google' ? 'Google Calendar' : 'Outlook';
      showToast(input.checked ? `${name} conectado con tu planificador.` : `${name} desconectado.`, 'success');
    });
  });

  // ---- ELITE: Analítica total ----
  function renderSpark() {
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const hours = [2.5, 1.5, 3, 2, 1, 3.5, 1];
    const max = Math.max(...hours);
    document.getElementById('sparkBars').innerHTML = hours.map((h, i) =>
      `<div class="spark-col" title="${h} h"><div class="spark-bar" style="height:${Math.round(h / max * 100)}%"></div><small>${days[i]}</small></div>`
    ).join('');
  }

  // ==========================================================================
  // PANTALLA 4: PLANES
  // ==========================================================================
  function renderPlansScreen() {
    const current = Planes.getPlan();
    document.getElementById('plansList').innerHTML = Planes.ORDER.map((id, idx) => {
      const p = P[id];
      const isCurrent = id === current;
      const prev = idx > 0 ? P[Planes.ORDER[idx - 1]] : null;
      return `
        <article class="plan-card${isCurrent ? ' is-current' : ''}" data-card-plan="${id}" id="planCard-${id}">
          ${id === 'pro' ? '<span class="plan-ribbon">Más elegido</span>' : ''}
          <div class="pc-head">
            <span class="pc-icon"><i data-lucide="${p.icon}"></i></span>
            <div class="pc-name"><strong>${p.name}</strong><small>${p.tagline}</small></div>
          </div>
          <div class="pc-price"><strong>${p.price}</strong><small>${p.period}</small></div>
          ${prev ? `<p class="pc-inherit"><i data-lucide="plus"></i> Todo lo del plan ${prev.name}, y además:</p>` : ''}
          <ul class="pc-features">
            ${p.features.map(f => `
              <li>
                <span class="pc-check"><i data-lucide="${F[f].icon}"></i></span>
                <div><strong>${F[f].label}</strong><small>${F[f].desc}</small></div>
              </li>`).join('')}
          </ul>
          <button type="button" class="pc-btn" data-choose-plan="${id}" ${isCurrent ? 'disabled' : ''}>
            ${isCurrent ? '<i data-lucide="check"></i> Plan actual' : `Elegir ${p.name}`}
          </button>
        </article>`;
    }).join('');

    document.querySelectorAll('[data-plan-tab]').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-plan-tab') === current);
    });
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('plansTabs').addEventListener('click', (e) => {
    const t = e.target.closest('[data-plan-tab]');
    if (!t) return;
    document.querySelectorAll('[data-plan-tab]').forEach(x => x.classList.toggle('active', x === t));
    const card = document.getElementById(`planCard-${t.getAttribute('data-plan-tab')}`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('plansList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-choose-plan]');
    if (!b) return;
    const id = b.getAttribute('data-choose-plan');
    Planes.setPlan(id);
    showToast(`¡Plan ${P[id].name} activado! La app se adaptó a tu plan.`, 'success');
    renderPlansScreen();
    setTimeout(() => goToView(3), 700);
  });

  document.getElementById('btnBackFromPlans').addEventListener('click', () => goToView(userProfile ? 3 : 1));

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-go-plans]')) goToView(4);
  });

  // ==========================================================================
  // MENÚ LATERAL (DRAWER)
  // ==========================================================================
  const drawerOverlay = document.getElementById('drawerOverlay');
  document.getElementById('openDashMenuBtn').addEventListener('click', () => drawerOverlay.classList.add('open'));
  document.getElementById('closeMenuBtn').addEventListener('click', () => drawerOverlay.classList.remove('open'));
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
  });

  document.querySelectorAll('.drawer-nav-item[data-view-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-view-jump'), 10);
      drawerOverlay.classList.remove('open');
      goToView(target);
    });
  });

  document.getElementById('logoutPlatformBtn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    userProfile = null;
    drawerOverlay.classList.remove('open');
    goToView(1);
    showToast('Sesión cerrada correctamente.', 'success');
  });

  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToView(1));

  // Inicialización
  if (location.hash === '#planes') {
    currentView = 4;
    history.replaceState(null, '', location.pathname + location.search);
  }
  screens.forEach(s => s.classList.remove('active'));
  const savedScreen = document.getElementById(`plat-screen-${currentView}`) || document.getElementById('plat-screen-1');
  savedScreen.classList.add('active');
  if (currentView === 3) hydrateDashboard();
  if (currentView === 4) renderPlansScreen();
});
