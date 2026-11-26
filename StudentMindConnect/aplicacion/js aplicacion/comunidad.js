/**
 * StudentMind Connect - Comunidad P2P, Grupo IA, Estudio Colaborativo y Apuntes (comunidad.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_NOTES = 'studentmind_shared_group_notes';

  const defaultNotes = [
    {
      id: 'n1',
      format: 'PDF',
      badgeClass: 'pdf',
      title: 'Resumen de Machine Learning',
      author: 'Por Carlos R. • hace 2 días',
      likes: 24,
      saves: 12
    },
    {
      id: 'n2',
      format: 'Notas',
      badgeClass: 'link',
      title: 'Mapa conceptual: Algoritmos de ML',
      author: 'Por Ana G. • hace 3 días',
      likes: 18,
      saves: 9
    },
    {
      id: 'n3',
      format: 'PDF',
      badgeClass: 'pdf',
      title: 'Guía de repaso (Temas 1–4)',
      author: 'Por Miguel T. • hace 5 días',
      likes: 30,
      saves: 21
    }
  ];

  let sharedNotes = loadNotes();
  let currentScreen = 1;
  let joinedGroup = false;
  let anaLikes = 12;
  let anaLiked = false;

  function loadNotes() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : [...defaultNotes];
    } catch (e) {
      return [...defaultNotes];
    }
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(sharedNotes));
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

  // Navegación entre las 6 pantallas de Comunidad
  const screens = document.querySelectorAll('.screen');

  function goToComScreen(step) {
    if (step < 1 || step > 6) return;
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`com-screen-${step}`);
    if (target) {
      target.classList.add('active');
      const body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    // Actualizar header según si estamos en Feed (1) o subpantallas (2..6)
    const leftIcon = document.getElementById('comLeftNavIcon');
    const rays = document.getElementById('comBrandRays');
    const rightBox = document.getElementById('comHeaderRightBox');

    if (step === 1) {
      leftIcon.setAttribute('data-lucide', 'menu');
      rays.classList.add('hidden');
      rightBox.style.visibility = 'visible';
    } else {
      leftIcon.setAttribute('data-lucide', 'chevron-left');
      rays.classList.remove('hidden');
      rightBox.style.visibility = (step === 3 || step === 5) ? 'visible' : 'hidden';
    }

    if (window.lucide) lucide.createIcons();
    currentScreen = step;
  }

  document.getElementById('comLeftNavBtn').addEventListener('click', () => {
    if (currentScreen > 1) {
      if (currentScreen === 6) goToComScreen(5);
      else if (currentScreen === 5 || currentScreen === 4 || currentScreen === 3) goToComScreen(2);
      else goToComScreen(1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  document.querySelectorAll('[data-open-screen]').forEach(el => {
    el.addEventListener('click', () => {
      goToComScreen(parseInt(el.getAttribute('data-open-screen'), 10));
    });
  });

  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToComScreen(1));

  // ==========================================================================
  // PANTALLA 1: FEED COMUNIDAD P2P
  // ==========================================================================
  document.getElementById('likePostAna').addEventListener('click', function () {
    anaLiked = !anaLiked;
    anaLikes += anaLiked ? 1 : -1;
    this.classList.toggle('liked', anaLiked);
    document.getElementById('anaLikesCount').textContent = anaLikes;
  });

  document.getElementById('btnJoinGroupCard').addEventListener('click', () => {
    goToComScreen(2);
  });

  document.getElementById('comBellBtn').addEventListener('click', () => {
    showToast('Ana G. publicó una pregunta en Grupo de Estudio IA.', 'success');
  });

  // ==========================================================================
  // PANTALLA 2: UNIRSE AL GRUPO DE ESTUDIO IA
  // ==========================================================================
  document.getElementById('btnConfirmJoinGroup').addEventListener('click', () => {
    if (!joinedGroup) {
      joinedGroup = true;
      document.getElementById('groupMembersCount').textContent = '6';
      document.getElementById('groupSpotsCount').textContent = '1';
      showToast('¡Te has unido al Grupo de Estudio IA!', 'success');
    }
    goToComScreen(3);
  });

  // ==========================================================================
  // PANTALLA 3: TABLERO COMPARTIDO Y CHAT DEL GRUPO
  // ==========================================================================
  document.querySelectorAll('#sharedBoardTasks .sb-task-row').forEach(row => {
    const cb = row.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', () => {
      row.classList.toggle('checked', cb.checked);
      if (cb.checked) {
        showToast('Actividad marcada como completada para el equipo.', 'success');
      }
    });
  });

  document.getElementById('btnEditGroupGoal').addEventListener('click', () => {
    const newGoal = prompt('Actualiza la meta de estudio del grupo:', document.getElementById('groupStudyGoalText').textContent);
    if (newGoal && newGoal.trim()) {
      document.getElementById('groupStudyGoalText').textContent = newGoal.trim();
      showToast('Meta de estudio actualizada.', 'success');
    }
  });

  document.getElementById('btnQuickChatReply').addEventListener('click', () => {
    const reply = prompt('Escribe un mensaje rápido para el grupo:');
    if (reply && reply.trim()) {
      document.getElementById('latestGroupMsg').textContent = `Tú: ${reply.trim()}`;
      showToast('Mensaje enviado al chat del grupo.', 'success');
    }
  });

  // ==========================================================================
  // PANTALLA 4: SESIÓN DE ESTUDIO COLABORATIVA
  // ==========================================================================
  document.getElementById('btnStartLiveRoom').addEventListener('click', () => {
    showToast('Conectando a la sala en vivo "Repaso: Machine Learning"...', 'success');
  });

  document.querySelectorAll('.btn-join-outline[data-session]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-session');
      btn.classList.toggle('joined');
      const isJoined = btn.classList.contains('joined');
      btn.textContent = isJoined ? 'Inscrito ✓' : 'Unirme';
      showToast(
        isJoined ? `Te inscribiste a la sesión de ${name}.` : `Cancelaste tu lugar en ${name}.`,
        'success'
      );
    });
  });

  // ==========================================================================
  // PANTALLA 5: INTERCAMBIO DE APUNTES + SUBIR APUNTE
  // ==========================================================================
  const sharedNotesListEl = document.getElementById('sharedNotesList');
  let activeNoteFilter = 'Todos';

  function renderSharedNotes() {
    const filtered = activeNoteFilter === 'Todos'
      ? sharedNotes
      : sharedNotes.filter(n => n.format === activeNoteFilter);

    sharedNotesListEl.innerHTML = '';

    filtered.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-share-card';
      card.innerHTML = `
        <div class="nsc-top">
          <div class="file-badge ${note.badgeClass}">${note.format}</div>
          <div class="nsc-info">
            <strong>${note.title}</strong>
            <span>${note.author}</span>
          </div>
          <i data-lucide="more-horizontal" class="fp-dots"></i>
        </div>
        <div class="nsc-footer">
          <div class="fp-actions">
            <button type="button" class="fp-stat-btn note-like-btn"><i data-lucide="thumbs-up"></i> <span>${note.likes}</span></button>
            <button type="button" class="fp-stat-btn note-save-btn"><i data-lucide="bookmark"></i> <span>${note.saves}</span></button>
          </div>
          <button type="button" class="btn-view-res-sm">Ver recurso &rarr;</button>
        </div>
      `;

      card.querySelector('.note-like-btn').addEventListener('click', () => {
        note.likes += 1;
        saveNotes();
        renderSharedNotes();
      });

      card.querySelector('.btn-view-res-sm').addEventListener('click', () => {
        goToComScreen(6);
      });

      sharedNotesListEl.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('#notesFilterPills .n-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#notesFilterPills .n-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeNoteFilter = pill.getAttribute('data-n-type');
      renderSharedNotes();
    });
  });

  const uploadModal = document.getElementById('uploadNoteModal');
  document.getElementById('btnOpenUploadNoteModal').addEventListener('click', () => uploadModal.classList.add('open'));
  document.getElementById('closeUploadModalBtn').addEventListener('click', () => uploadModal.classList.remove('open'));

  document.getElementById('uploadNoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('noteTitleInput').value.trim();
    const format = document.getElementById('noteFormatSelect').value;
    if (!title) return;

    sharedNotes.unshift({
      id: `n-${Date.now()}`,
      format,
      badgeClass: format === 'PDF' ? 'pdf' : 'link',
      title,
      author: 'Por Ti • justo ahora',
      likes: 1,
      saves: 1
    });

    saveNotes();
    renderSharedNotes();
    uploadModal.classList.remove('open');
    document.getElementById('uploadNoteForm').reset();
    showToast('¡Apunte publicado en el grupo!', 'success');
  });

  // ==========================================================================
  // PANTALLA 6: RECURSOS DE ESTUDIO DEL GRUPO
  // ==========================================================================
  document.querySelectorAll('#groupResFilterPills .gr-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#groupResFilterPills .gr-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-gr-cat');
      document.querySelectorAll('#groupFilesList .gr-file-card').forEach(card => {
        const match = cat === 'Todos' || card.getAttribute('data-cat') === cat;
        card.style.display = match ? 'flex' : 'none';
      });
    });
  });

  document.getElementById('groupResSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#groupFilesList .gr-file-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? 'flex' : 'none';
    });
  });

  document.querySelectorAll('.file-dl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const file = btn.getAttribute('data-file');
      showToast(`Descargando "${file}"...`, 'success');
    });
  });

  document.getElementById('btnRequestResource').addEventListener('click', () => {
    showToast('Solicitud enviada a la comunidad y al Copiloto IA Lumen.', 'success');
  });

  // Inicializar
  renderSharedNotes();
});