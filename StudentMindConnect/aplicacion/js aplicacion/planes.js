/**
 * StudentMind Connect - Sistema de planes (Gratis · Smart · Pro · Elite)
 * - Guarda el plan elegido en localStorage.
 * - Pone <html data-plan="..."> para que planes.css cambie el diseño.
 * - Bloquea las páginas y pestañas que el plan no incluye.
 * Se carga en el <head> de TODAS las páginas (app y encuesta), antes que el resto del JS.
 */
(function () {
  const STORAGE_KEY_PLAN = 'studentmind_plan';
  const ORDER = ['gratis', 'smart', 'pro', 'elite'];

  const PLANS = {
    gratis: {
      id: 'gratis', name: 'Gratis', price: 'S/ 0', period: 'para siempre', icon: 'sprout',
      tagline: 'Lo esencial para empezar a estudiar con orden.',
      features: ['diagnostico', 'planificador', 'guias', 'tutor']
    },
    smart: {
      id: 'smart', name: 'Smart', price: 'S/ 14.90', period: 'al mes', icon: 'brain-circuit',
      tagline: 'La IA se adapta a tu ritmo y refuerza lo que te cuesta.',
      features: ['copiloto', 'adaptativo', 'panel', 'refuerzo']
    },
    pro: {
      id: 'pro', name: 'Pro', price: 'S/ 24.90', period: 'al mes', icon: 'rocket',
      tagline: 'Tu ruta propia, retos, comunidad y radar de conocimiento.',
      features: ['ruta', 'retos', 'comunidad', 'radar']
    },
    elite: {
      id: 'elite', name: 'Elite', price: 'S/ 39.90', period: 'al mes', icon: 'crown',
      tagline: 'Todo el ecosistema IA, predicción de fatiga y analítica total.',
      features: ['ecosistema', 'fatiga', 'calendario', 'analitica']
    }
  };

  // Rutas relativas a /aplicacion/html aplicacion/
  const FEATURES = {
    diagnostico: { label: 'Diagnóstico inicial', short: 'Test<br>diagnóstico', icon: 'clipboard-check', plan: 'gratis', href: '../../encuesta/html%20encuesta/etapa1.html', desc: 'Detecta tus vacíos académicos y hábitos de estudio en 7 etapas.' },
    planificador: { label: 'Planificador semanal', short: 'Planificador<br>semanal', icon: 'calendar-days', plan: 'gratis', href: 'planificador.html', desc: 'Organiza tus bloques de estudio de la semana.' },
    guias: { label: 'Guías y resúmenes', short: 'Guías y<br>resúmenes', icon: 'library', plan: 'gratis', href: 'biblioteca.html', desc: 'Resúmenes, formularios y guías verificadas por curso.' },
    tutor: { label: 'Tutor IA', short: 'Tutor<br>IA', icon: 'messages-square', plan: 'gratis', lumen: true, desc: 'Resuelve dudas puntuales con Lumen, tu tutor IA.' },

    copiloto: { label: 'Copiloto académico IA', short: 'Copiloto<br>IA', icon: 'bot', plan: 'smart', lumen: true, desc: 'Lumen te acompaña de forma proactiva: sugiere qué estudiar, cuándo y cómo.' },
    adaptativo: { label: 'Planificador adaptativo', short: 'Plan<br>adaptativo', icon: 'calendar-sync', plan: 'smart', href: 'planificador.html', desc: 'Tu horario se reorganiza solo según tu avance y tus pendientes.' },
    panel: { label: 'Panel de progreso', short: 'Panel de<br>progreso', icon: 'trending-up', plan: 'smart', href: 'progreso.html', desc: 'Sigue tu evolución semanal por curso y por hábito.' },
    refuerzo: { label: 'Refuerzo de temas débiles', short: 'Refuerzo<br>débil', icon: 'target', plan: 'smart', widget: 'refuerzo', desc: 'Practica justo los temas donde más fallas.' },

    ruta: { label: 'Ruta personalizada', short: 'Ruta<br>personal', icon: 'route', plan: 'pro', href: 'ruta.html', desc: 'Un camino de estudio paso a paso hecho para ti.' },
    retos: { label: 'Retos y logros', short: 'Retos y<br>logros', icon: 'trophy', plan: 'pro', href: 'microretos.html', desc: 'Microretos diarios, rachas, medallas y recompensas.' },
    comunidad: { label: 'Comunidad P2P', short: 'Comunidad<br>P2P', icon: 'users', plan: 'pro', href: 'comunidad.html', desc: 'Estudia con compañeros de tu carrera y comparte apuntes.' },
    radar: { label: 'Radar de conocimiento', short: 'Radar de<br>saber', icon: 'radar', plan: 'pro', widget: 'radar', desc: 'Visualiza tu dominio en cada área de un vistazo.' },

    ecosistema: { label: 'Ecosistema integral IA', short: 'Ecosistema<br>IA', icon: 'orbit', plan: 'elite', widget: 'ecosistema', desc: 'Todas las herramientas conectadas por IA en un solo flujo.' },
    fatiga: { label: 'Predicción de fatiga', short: 'Predicción<br>fatiga', icon: 'battery-medium', plan: 'elite', widget: 'fatiga', desc: 'Anticipa tu cansancio y ajusta tu carga antes de agotarte.' },
    calendario: { label: 'Sincroniza tu calendario', short: 'Sincroniza<br>calendario', icon: 'calendar-check', plan: 'elite', widget: 'calendario', desc: 'Conecta Google Calendar u Outlook con tu planificador.' },
    analitica: { label: 'Analítica total', short: 'Analítica<br>total', icon: 'line-chart', plan: 'elite', widget: 'analitica', desc: 'Todas tus métricas de estudio, bienestar y rendimiento.' }
  };

  // Página → función que la habilita (las que no aparecen son libres)
  const PAGE_FEATURE = {
    'progreso.html': 'panel',
    'ruta.html': 'ruta',
    'microretos.html': 'retos',
    'comunidad.html': 'comunidad'
  };

  function rank(planId) { return Math.max(0, ORDER.indexOf(planId)); }

  function getPlan() {
    const p = localStorage.getItem(STORAGE_KEY_PLAN);
    return PLANS[p] ? p : 'gratis';
  }

  function has(featureId) {
    const f = FEATURES[featureId];
    return !!f && rank(getPlan()) >= rank(f.plan);
  }

  function includedFeatures(planId) {
    const r = rank(planId);
    return ORDER.slice(0, r + 1).flatMap(id => PLANS[id].features);
  }

  function nextPlan(planId) {
    return ORDER[rank(planId) + 1] || null;
  }

  function applyTheme(planId) {
    document.documentElement.setAttribute('data-plan', planId);
  }

  function setPlan(planId) {
    if (!PLANS[planId]) return;
    localStorage.setItem(STORAGE_KEY_PLAN, planId);
    applyTheme(planId);
    document.dispatchEvent(new CustomEvent('smc:planchange', { detail: { plan: planId } }));
    decorateNav();
  }

  // Aplica el tema lo antes posible (evita parpadeo de colores)
  applyTheme(getPlan());

  const inApp = /\/html%20aplicacion\/|\/html aplicacion\//i.test(location.pathname);
  const plansUrl = inApp ? 'plataforma.html#planes' : '../../aplicacion/html%20aplicacion/plataforma.html#planes';
  const currentPage = (location.pathname.split('/').pop() || '').toLowerCase();

  function lockSvg() { return '<i data-lucide="lock"></i>'; }

  // Candado en las pestañas de la barra inferior que el plan no incluye
  function decorateNav() {
    document.querySelectorAll('.app-nav .tab-item').forEach(tab => {
      const page = (tab.getAttribute('href') || '').toLowerCase();
      const feat = PAGE_FEATURE[page];
      const locked = feat && !has(feat);
      tab.classList.toggle('plan-locked', !!locked);
      let badge = tab.querySelector('.tab-lock');
      if (locked && !badge) {
        badge = document.createElement('span');
        badge.className = 'tab-lock';
        badge.innerHTML = lockSvg();
        tab.appendChild(badge);
      } else if (!locked && badge) {
        badge.remove();
      }
      if (locked) tab.title = `${tab.getAttribute('aria-label')} · Plan ${PLANS[FEATURES[feat].plan].name}`;
    });
    if (window.lucide) lucide.createIcons();
  }

  // Pantalla de bloqueo para páginas de un plan superior
  function lockPageIfNeeded() {
    const feat = PAGE_FEATURE[currentPage];
    if (!feat || has(feat)) return;
    const f = FEATURES[feat];
    const plan = PLANS[f.plan];
    const host = document.getElementById('appScreen') || document.body;
    const gate = document.createElement('div');
    gate.className = 'plan-gate';
    gate.setAttribute('data-gate-plan', plan.id);
    gate.innerHTML = `
      <div class="plan-gate-card">
        <div class="plan-gate-icon"><i data-lucide="${f.icon}"></i><span class="plan-gate-lock">${lockSvg()}</span></div>
        <span class="plan-chip" data-chip-plan="${plan.id}"><i data-lucide="${plan.icon}"></i> Plan ${plan.name}</span>
        <h2>${f.label}</h2>
        <p>${f.desc}</p>
        <p class="plan-gate-note">Esta función está incluida desde el plan <strong>${plan.name}</strong> (${plan.price} ${plan.period}). Tu plan actual es <strong>${PLANS[getPlan()].name}</strong>.</p>
        <a class="btn-primary full-width plan-gate-cta" href="${plansUrl}"><span>Ver planes</span><i data-lucide="arrow-right"></i></a>
        <a class="plan-gate-back" href="${inApp ? 'plataforma.html' : '../../aplicacion/html%20aplicacion/plataforma.html'}">Volver al inicio</a>
      </div>`;
    host.appendChild(gate);
  }

  // Banner del planificador adaptativo (Smart+)
  function enhancePlanner() {
    if (currentPage !== 'planificador.html') return;
    const body = document.querySelector('.screen.active .screen-body') || document.querySelector('.screen-body');
    if (!body || body.querySelector('.plan-inline-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'plan-inline-banner';
    if (has('adaptativo')) {
      banner.innerHTML = `<i data-lucide="calendar-sync"></i><div><strong>Planificador adaptativo activo</strong><small>${has('calendario') ? 'Sincronizado con tu calendario · ' : ''}Lumen reordena tus bloques según tu avance.</small></div>`;
    } else {
      banner.classList.add('locked');
      banner.innerHTML = `<i data-lucide="lock"></i><div><strong>Planificador adaptativo</strong><small>Disponible en plan Smart.</small></div><a href="${plansUrl}">Mejorar</a>`;
    }
    body.prepend(banner);
  }

  document.addEventListener('DOMContentLoaded', () => {
    decorateNav();
    lockPageIfNeeded();
    enhancePlanner();
    if (window.lucide) lucide.createIcons();
  });

  window.SMCPlanes = {
    ORDER, PLANS, FEATURES, PAGE_FEATURE,
    getPlan, setPlan, has, rank, includedFeatures, nextPlan, plansUrl
  };
})();
