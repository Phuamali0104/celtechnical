/**
 * StudentMind Connect - Microretos, Recompensas e Invita a tus amigos (microretos.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_MR = 'studentmind_microretos_data';

  const defaultState = {
    step: 1,
    points: 240,
    invitedCount: 2,
    bgRedeemed: false,
    challenges: [
      {
        id: 'c1',
        category: 'Académico',
        due: 'Hoy',
        dueIcon: 'clock',
        icon: 'target',
        iconColor: 'pink',
        title: 'Estudia 25 min sin distracciones',
        desc: 'Dedica 25 minutos de estudio sin revisar el celular.',
        done: true
      },
      {
        id: 'c2',
        category: 'Organización',
        due: 'Vie. 31',
        dueIcon: 'calendar',
        icon: 'calendar-check',
        iconColor: 'purple',
        title: 'Planifica tus tareas de la semana',
        desc: 'Anota al menos 3 tareas importantes en tu planificador.',
        done: false
      },
      {
        id: 'c3',
        category: 'Aprendizaje',
        due: 'Sáb. 1',
        dueIcon: 'lock',
        icon: 'book-open',
        iconColor: 'blue',
        title: 'Aprende algo nuevo',
        desc: 'Descubre un tema nuevo de tu carrera o interés personal.',
        done: false
      }
    ]
  };

  let state = loadState();
  let activeTabFilter = 'active';

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MR);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
    } catch (e) {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY_MR, JSON.stringify(state));
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

  // Cargar nombre del estudiante
  try {
    const onboarding = JSON.parse(localStorage.getItem('studentmind_onboarding_profile') || 'null');
    const platUser = JSON.parse(localStorage.getItem('studentmind_platform_user') || 'null');
    const name = onboarding?.studentName || platUser?.firstName || 'Valeria';
    document.getElementById('rewardsUserName').textContent = `${name}, llevas`;
    document.getElementById('referralLinkLabel').textContent = `studentmind.app/invita/${name.toUpperCase()}`;
  } catch (e) {}

  // Navegación entre las 3 pantallas
  const screens = document.querySelectorAll('.screen');

  function goToMrScreen(step) {
    if (step < 1 || step > 3) return;
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`mr-screen-${step}`);
    if (target) {
      target.classList.add('active');
      const body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }
    state.step = step;
    saveState();
  }

  document.getElementById('mrBackBtn').addEventListener('click', () => {
    if (state.step > 1) {
      goToMrScreen(1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  document.getElementById('headerTrophyBtn').addEventListener('click', () => goToMrScreen(2));
  document.getElementById('tabToRewards').addEventListener('click', () => goToMrScreen(2));
  document.getElementById('btnGoRewardsFromBanner').addEventListener('click', () => goToMrScreen(2));
  document.getElementById('btnGoInviteFromBanner').addEventListener('click', () => goToMrScreen(3));
  document.getElementById('earnGoChallenges').addEventListener('click', () => goToMrScreen(1));
  document.getElementById('earnGoInvite').addEventListener('click', () => goToMrScreen(3));
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToMrScreen(1));

  // ==========================================================================
  // PANTALLA 1: RENDERIZADO Y TOGGLE DE MICRORETOS
  // ==========================================================================
  const challengesStack = document.getElementById('challengesStack');

  function renderChallenges() {
    const filtered = activeTabFilter === 'history'
      ? state.challenges.filter(c => c.done)
      : state.challenges;

    challengesStack.innerHTML = '';

    filtered.forEach(ch => {
      const card = document.createElement('div');
      card.className = `challenge-card ${ch.done ? 'done' : ''}`;
      card.innerHTML = `
        <div class="ch-badge-icon ${ch.iconColor}"><i data-lucide="${ch.icon}"></i></div>
        <div class="ch-card-body">
          <div class="ch-meta-top">
            <span class="ch-cat-tag">${ch.category}</span>
            <span class="ch-due-tag"><i data-lucide="${ch.dueIcon}"></i> ${ch.due}</span>
          </div>
          <strong>${ch.title}</strong>
          <p>${ch.desc}</p>
          <div class="ch-mini-prog">
            <div class="ch-mini-track">
              <div class="ch-mini-fill" style="width: ${ch.done ? '100%' : '0%'};"></div>
            </div>
            <span class="ch-ratio">${ch.done ? '✓ 1/1' : '0/1'}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        ch.done = !ch.done;
        state.points += ch.done ? 30 : -30;
        saveState();
        renderChallenges();
        updatePointsUI();
        showToast(
          ch.done ? '¡Microreto completado! +30 puntos ganados ⭐' : 'Microreto marcado como pendiente.',
          'success'
        );
      });

      challengesStack.appendChild(card);
    });

    // Actualizar progreso semanal (base 5 retos en visual)
    const completedCount = state.challenges.filter(c => c.done).length + 1; // +1 reto previo de la semana
    const pct = Math.min(100, Math.round((completedCount / 5) * 100));
    document.getElementById('mrProgressCount').textContent = `${completedCount} / 5 retos completados`;
    document.getElementById('mrProgressPct').textContent = `${pct}%`;
    document.getElementById('mrProgressFill').style.width = `${pct}%`;

    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('.mr-tab-pill[data-mr-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mr-tab-pill[data-mr-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTabFilter = tab.getAttribute('data-mr-tab');
      renderChallenges();
    });
  });

  // ==========================================================================
  // PANTALLA 2: PUNTOS Y RECOMPENSAS
  // ==========================================================================
  function updatePointsUI() {
    document.getElementById('rewardsPointsDisplay').textContent = `${state.points} puntos`;
    const nextGoal = 300;
    const remaining = Math.max(0, nextGoal - state.points);
    const pct = Math.min(100, Math.round((state.points / nextGoal) * 100));

    document.getElementById('nextRewardText').innerHTML = remaining > 0
      ? `Próxima recompensa en <strong>${remaining} pts</strong>`
      : `<strong>¡Recompensa desbloqueada!</strong>`;
    document.getElementById('nextRewardFill').style.width = `${pct}%`;
    document.getElementById('nextRewardRatio').textContent = `${state.points} / ${nextGoal} pts`;
  }

  document.querySelectorAll('.btn-rw-action[data-reward]').forEach(btn => {
    btn.addEventListener('click', () => {
      const rwName = btn.getAttribute('data-reward');
      showToast(`"${rwName}" activada en tu cuenta.`, 'success');
    });
  });

  const btnRedeemBg = document.getElementById('btnRedeemBg');
  btnRedeemBg.addEventListener('click', () => {
    if (state.bgRedeemed) {
      showToast('Este fondo exclusivo ya está activo en tu planner.', 'success');
      return;
    }
    state.bgRedeemed = true;
    btnRedeemBg.textContent = 'Activo ✓';
    saveState();
    showToast('¡Fondo exclusivo canjeado y aplicado a tu planificador!', 'success');
  });

  // ==========================================================================
  // PANTALLA 3: INVITA A TUS AMIGOS
  // ==========================================================================
  const inviteTextarea = document.getElementById('inviteMessageText');
  document.getElementById('toggleEditInviteBtn').addEventListener('click', () => {
    const isReadOnly = inviteTextarea.hasAttribute('readonly');
    if (isReadOnly) {
      inviteTextarea.removeAttribute('readonly');
      inviteTextarea.focus();
      showToast('Ahora puedes personalizar tu mensaje de invitación.', 'success');
    } else {
      inviteTextarea.setAttribute('readonly', true);
      showToast('Mensaje de invitación guardado.', 'success');
    }
  });

  function copyInviteUrl() {
    const urlText = document.getElementById('referralLinkLabel').textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://${urlText}`).catch(() => {});
    }
    showToast('¡Enlace de invitación copiado al portapapeles!', 'success');
  }

  document.getElementById('btnCopyInviteUrl').addEventListener('click', copyInviteUrl);
  document.getElementById('copyReferralBar').addEventListener('click', copyInviteUrl);

  document.querySelectorAll('.inv-ch-btn[data-inv-ch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ch = btn.getAttribute('data-inv-ch');
      showToast(`Abriendo invitación para compartir en ${ch}...`, 'success');
    });
  });

  document.getElementById('btnSendFriendInvite').addEventListener('click', () => {
    state.invitedCount += 1;
    state.points += 20;
    saveState();
    document.getElementById('invitedFriendsCount').textContent = `${state.invitedCount} amigos invitados`;
    updatePointsUI();
    showToast('¡Invitación enviada! Ganaste +20 puntos bonus.', 'success');
  });

  // Inicialización
  renderChallenges();
  updatePointsUI();
  if (state.bgRedeemed) btnRedeemBg.textContent = 'Activo ✓';
  document.getElementById('invitedFriendsCount').textContent = `${state.invitedCount} amigos invitados`;
});