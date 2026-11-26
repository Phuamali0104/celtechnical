/**
 * StudentMind Connect - Barra de navegación inferior común + Chat de IA Lumen
 * Reemplaza cada <nav class="bottom-tab-bar"> por la barra estándar:
 * 3 iconos | búho Lumen (chat) | 3 iconos
 * Debe cargarse ANTES del JS propio de cada página.
 */
(function () {
  const NAV_LEFT = [
    { href: 'plataforma.html', icon: 'home', label: 'Inicio' },
    { href: 'planificador.html', icon: 'calendar-days', label: 'Planificador' },
    { href: 'microretos.html', icon: 'trophy', label: 'Microretos' }
  ];
  const NAV_RIGHT = [
    { href: 'progreso.html', icon: 'trending-up', label: 'Progreso' },
    { href: 'comunidad.html', icon: 'users', label: 'Comunidad' },
    { href: 'biblioteca.html', icon: 'library', label: 'Biblioteca' }
  ];

  const OWL_SVG = `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 18L10 6L24 14Z" fill="#6D28D9"/>
      <path d="M50 18L54 6L40 14Z" fill="#6D28D9"/>
      <rect x="10" y="12" width="44" height="44" rx="20" fill="#7C3AED"/>
      <ellipse cx="32" cy="44" rx="13" ry="10" fill="#EDE9FE"/>
      <circle cx="23" cy="29" r="9" fill="#FAF5FF" stroke="#4C1D95" stroke-width="2"/>
      <circle cx="41" cy="29" r="9" fill="#FAF5FF" stroke="#4C1D95" stroke-width="2"/>
      <circle cx="23" cy="29" r="5" fill="#0F172A"/>
      <circle cx="41" cy="29" r="5" fill="#0F172A"/>
      <circle cx="24.5" cy="27.5" r="1.6" fill="#FFFFFF"/>
      <circle cx="42.5" cy="27.5" r="1.6" fill="#FFFFFF"/>
      <path d="M28.5 36L32 41L35.5 36H28.5Z" fill="#F59E0B"/>
    </svg>`;

  const currentPage = (location.pathname.split('/').pop() || 'plataforma.html').toLowerCase();

  function tabHtml(item) {
    const active = item.href === currentPage ? ' active' : '';
    return `<a href="${item.href}" class="tab-item${active}" aria-label="${item.label}" title="${item.label}">
              <i data-lucide="${item.icon}"></i>
            </a>`;
  }

  const NAV_HTML =
    NAV_LEFT.map(tabHtml).join('') +
    `<button type="button" class="lumen-owl-btn" data-open-lumen aria-label="Chat con IA Lumen" title="IA Lumen">${OWL_SVG}</button>` +
    NAV_RIGHT.map(tabHtml).join('');

  document.querySelectorAll('nav.bottom-tab-bar').forEach(nav => {
    nav.classList.add('app-nav');
    nav.setAttribute('aria-label', 'Navegación principal');
    nav.innerHTML = NAV_HTML;
  });

  // ------------------------------------------------------------------------
  // Chat de Lumen
  // ------------------------------------------------------------------------
  const host = document.getElementById('appScreen') || document.querySelector('.phone-frame') || document.body;
  const overlay = document.createElement('div');
  overlay.className = 'lumen-chat-overlay';
  overlay.innerHTML = `
    <div class="lumen-chat-sheet" role="dialog" aria-label="Chat con IA Lumen">
      <div class="lumen-chat-header">
        <div class="lumen-chat-avatar">${OWL_SVG}</div>
        <div class="lumen-chat-title">
          <strong>IA Lumen</strong>
          <span>● Tu copiloto de estudio</span>
        </div>
        <button type="button" class="lumen-chat-close" aria-label="Cerrar chat"><i data-lucide="x"></i></button>
      </div>
      <div class="lumen-chat-messages"></div>
      <form class="lumen-chat-input">
        <input type="text" placeholder="Escribe tu pregunta..." aria-label="Mensaje para Lumen" />
        <button type="submit" aria-label="Enviar"><i data-lucide="send"></i></button>
      </form>
    </div>`;
  host.appendChild(overlay);

  const messagesEl = overlay.querySelector('.lumen-chat-messages');
  const inputEl = overlay.querySelector('input');

  function addMessage(text, who) {
    const msg = document.createElement('div');
    msg.className = `lumen-msg ${who}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function firstName() {
    try {
      const user = JSON.parse(localStorage.getItem('studentmind_platform_user') || 'null');
      return user?.firstName || '';
    } catch (e) { return ''; }
  }

  // Rol de Lumen según el plan (planes.js)
  const LUMEN_ROLE = {
    gratis: { sub: '● Tutor IA · Plan Gratis', hello: 'Soy Lumen, tu tutor IA. Pregúntame cualquier duda de tus cursos.' },
    smart: { sub: '● Copiloto académico IA · Smart', hello: 'Soy Lumen, tu copiloto académico. Ya revisé tu semana: hoy conviene reforzar tus temas débiles.' },
    pro: { sub: '● Copiloto IA + Ruta · Pro', hello: 'Soy Lumen, tu copiloto. Tu ruta personalizada va al 64 % y tienes un reto pendiente.' },
    elite: { sub: '● Ecosistema integral IA · Elite', hello: 'Soy Lumen, tu ecosistema IA. Tu calendario está sincronizado y tu nivel de fatiga es bajo hoy.' }
  };
  function currentPlan() {
    return (window.SMCPlanes && window.SMCPlanes.getPlan()) || 'gratis';
  }
  function applyLumenRole() {
    overlay.querySelector('.lumen-chat-title span').textContent = LUMEN_ROLE[currentPlan()].sub;
  }
  applyLumenRole();
  document.addEventListener('smc:planchange', () => {
    applyLumenRole();
    messagesEl.innerHTML = '';
  });

  function openChat() {
    if (!messagesEl.children.length) {
      const name = firstName();
      addMessage(`¡Hola${name ? ', ' + name : ''}! ${LUMEN_ROLE[currentPlan()].hello} ¿En qué te ayudo hoy?`, 'bot');
    }
    overlay.classList.add('open');
    setTimeout(() => inputEl.focus(), 300);
  }

  function closeChat() { overlay.classList.remove('open'); }

  const REPLIES = [
    { k: ['plan', 'horario', 'organiz', 'semana'], r: 'Te sugiero bloques de 45 min con 10 de descanso. Puedes armarlos en el Planificador semanal.' },
    { k: ['estres', 'estrés', 'ansiedad', 'cansad'], r: 'Respira profundo 1 minuto y divide la tarea en pasos pequeños. Un paso a la vez 💜' },
    { k: ['examen', 'prueba', 'parcial'], r: 'Para tu examen: repasa con preguntas de práctica y explícale el tema a alguien. ¿Hacemos un mini quiz?' },
    { k: ['reto', 'racha'], r: 'Completa un microreto de 5 minutos hoy para mantener tu racha.' },
    { k: ['fatiga', 'agotad', 'energía', 'energia'], r: 'Con el plan Elite predigo tu fatiga y ajusto tu carga antes de que te agotes.' },
    { k: ['calendario', 'google', 'outlook'], r: 'En el plan Elite puedes sincronizar Google Calendar u Outlook con tu planificador.' },
    { k: ['débil', 'debil', 'reforzar', 'refuerzo'], r: 'El plan Smart detecta tus temas débiles y te prepara ejercicios para reforzarlos.' },
    { k: ['hola', 'buenas'], r: '¡Hola! Cuéntame qué curso o tema quieres reforzar.' }
  ];

  function replyTo(text) {
    const t = text.toLowerCase();
    const hit = REPLIES.find(x => x.k.some(k => t.includes(k)));
    return hit ? hit.r : 'Buena pregunta. Pronto podré responderte con más detalle; mientras, revisa tu Ruta personalizada para ver tus próximos pasos.';
  }

  overlay.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    inputEl.value = '';
    setTimeout(() => addMessage(replyTo(text), 'bot'), 600);
  });

  overlay.querySelector('.lumen-chat-close').addEventListener('click', closeChat);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeChat(); });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-lumen]')) openChat();
  });

  window.StudentMindLumen = { open: openChat, close: closeChat };

  if (window.lucide) lucide.createIcons();
})();
