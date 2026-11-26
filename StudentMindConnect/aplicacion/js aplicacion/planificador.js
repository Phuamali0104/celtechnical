/**
 * StudentMind Connect - Planificador Semanal, Nueva Tarea y Compartir (planificador.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_TASKS = 'studentmind_weekly_planner_tasks';

  const defaultTasks = [
    {
      id: 1,
      day: 'Lunes, 27 de octubre',
      title: 'Leer capítulo 5 de Matemáticas',
      tag: 'Matemáticas',
      color: 'lavender',
      time: '9:00 AM',
      type: 'Lectura',
      done: false
    },
    {
      id: 2,
      day: 'Lunes, 27 de octubre',
      title: 'Avanzar en proyecto de Sistemas',
      tag: 'Sistemas',
      color: 'blue',
      time: '2:00 PM',
      type: 'Entrega',
      done: false
    },
    {
      id: 3,
      day: 'Lunes, 27 de octubre',
      title: 'Repasar apuntes de Redes',
      tag: 'Redes',
      color: 'green',
      time: '7:00 PM',
      type: 'Estudio',
      done: false
    },
    {
      id: 4,
      day: 'Martes, 28 de octubre',
      title: 'Estudiar para el examen de Base de Datos',
      tag: 'BD',
      color: 'amber',
      time: '10:00 AM',
      type: 'Examen',
      done: false
    },
    {
      id: 5,
      day: 'Martes, 28 de octubre',
      title: 'Completar lectura de la semana',
      tag: 'Lectura',
      color: 'lavender',
      time: '5:00 PM',
      type: 'Lectura',
      done: false
    },
    {
      id: 6,
      day: 'Miércoles, 29 de octubre',
      title: 'Resolver ejercicios de Programación',
      tag: 'Prog.',
      color: 'emerald',
      time: '3:00 PM',
      type: 'Estudio',
      done: false
    }
  ];

  let tasks = loadTasks();
  let currentStep = 1;
  let selectedPriority = 'Alta';
  let selectedType = 'Entrega';

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : [...defaultTasks];
    } catch (e) {
      return [...defaultTasks];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
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

  // Navegación entre las 3 pantallas del Planificador
  const screens = document.querySelectorAll('.screen');

  function goToPlanScreen(step) {
    if (step < 1 || step > 3) return;
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`plan-screen-${step}`);
    if (target) {
      target.classList.add('active');
      const body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    // Cambiar ícono derecho del header según pantalla
    const headerIcon = document.getElementById('headerRightIcon');
    if (headerIcon) {
      headerIcon.setAttribute('data-lucide', step === 2 ? 'calendar' : 'share-2');
      if (window.lucide) lucide.createIcons();
    }

    if (step === 3) {
      updateShareMetrics();
    }

    currentStep = step;
  }

  document.getElementById('planBackBtn').addEventListener('click', () => {
    if (currentStep > 1) {
      goToPlanScreen(1);
    } else {
      window.location.href = 'plataforma.html';
    }
  });

  document.getElementById('headerRightActionBtn').addEventListener('click', () => {
    if (currentStep === 2) {
      goToPlanScreen(1);
    } else {
      goToPlanScreen(3);
    }
  });

  document.getElementById('btnOpenNewTask').addEventListener('click', () => goToPlanScreen(2));
  document.getElementById('btnGoToShare').addEventListener('click', () => goToPlanScreen(3));
  document.getElementById('tabPlanBack').addEventListener('click', () => goToPlanScreen(1));
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToPlanScreen(1));

  // Selector de días de la semana
  const dayChips = document.querySelectorAll('.day-chip');
  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dayChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const chosenDay = chip.getAttribute('data-day');
      document.getElementById('ntDay').value = chosenDay;
    });
  });

  // ==========================================================================
  // RENDERIZADO DE TAREAS AGRUPADAS POR DÍA + PROGRESO
  // ==========================================================================
  const dailyGroupsStack = document.getElementById('dailyGroupsStack');

  function renderPlannerTasks() {
    const dayOrder = [
      'Lunes, 27 de octubre',
      'Martes, 28 de octubre',
      'Miércoles, 29 de octubre',
      'Jueves, 30 de octubre',
      'Viernes, 31 de octubre',
      'Sábado, 1 de noviembre',
      'Domingo, 2 de noviembre'
    ];

    dailyGroupsStack.innerHTML = '';

    dayOrder.forEach(dayName => {
      const dayTasks = tasks.filter(t => t.day === dayName);
      if (dayTasks.length === 0) return;

      const card = document.createElement('div');
      card.className = 'day-tasks-card';

      const countLabel = dayTasks.length === 1 ? '1 tarea' : `${dayTasks.length} tareas`;
      card.innerHTML = `
        <div class="day-card-header">
          <strong>${dayName}</strong>
          <span class="task-count-pill">${countLabel}</span>
        </div>
        <div class="day-task-items"></div>
      `;

      const listEl = card.querySelector('.day-task-items');

      dayTasks.forEach(task => {
        const row = document.createElement('div');
        row.className = `planner-task-row ${task.done ? 'done' : ''}`;
        row.innerHTML = `
          <button type="button" class="task-check-circle" aria-label="Completar tarea">
            <i data-lucide="check"></i>
          </button>
          <span class="p-task-title" title="${task.title}">${task.title}</span>
          <span class="subject-tag ${task.color}">${task.tag}</span>
          <span class="p-task-time">${task.time}</span>
          <button type="button" class="delete-task-btn" title="Eliminar tarea">
            <i data-lucide="more-vertical"></i>
          </button>
        `;

        row.querySelector('.task-check-circle').addEventListener('click', () => {
          task.done = !task.done;
          saveTasks();
          renderPlannerTasks();
        });

        row.querySelector('.delete-task-btn').addEventListener('click', () => {
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
          renderPlannerTasks();
          showToast('Tarea eliminada del planificador.', 'success');
        });

        listEl.appendChild(row);
      });

      dailyGroupsStack.appendChild(card);
    });

    // Actualizar porcentaje semanal
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('weekCirclePct').textContent = `${pct}%`;

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================================
  // PANTALLA 2: CREAR NUEVA TAREA
  // ==========================================================================
  const priorityPills = document.querySelectorAll('#priorityPills .nt-pill');
  priorityPills.forEach(pill => {
    pill.addEventListener('click', () => {
      selectedPriority = pill.getAttribute('data-priority');
      priorityPills.forEach(p => p.classList.toggle('selected', p === pill));
    });
  });

  const typePills = document.querySelectorAll('#typePills .nt-type-pill');
  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      selectedType = pill.getAttribute('data-type');
      typePills.forEach(p => p.classList.toggle('selected', p === pill));
    });
  });

  document.getElementById('newTaskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = document.getElementById('ntTitle').value.trim();
    if (!titleVal) {
      showToast('Escribe un título para la tarea.', 'error');
      return;
    }

    const courseRaw = document.getElementById('ntCourse').value.split('|');
    const tag = courseRaw[1] || 'Curso';
    const color = courseRaw[2] || 'purple';
    const day = document.getElementById('ntDay').value;
    const time = document.getElementById('ntTime').value;

    tasks.push({
      id: Date.now(),
      day,
      title: titleVal,
      tag,
      color,
      time,
      type: selectedType,
      priority: selectedPriority,
      done: false
    });

    saveTasks();
    renderPlannerTasks();
    showToast('¡Tarea agregada a tu planificador!', 'success');
    goToPlanScreen(1);
  });

  // ==========================================================================
  // PANTALLA 3: COMPARTIR PLANIFICACIÓN
  // ==========================================================================
  function updateShareMetrics() {
    const examsCount = tasks.filter(t => t.type === 'Examen').length || 2;
    const regularCount = Math.max(tasks.length, 8);
    document.getElementById('shareSummaryMetrics').innerHTML =
      `Esta semana completaré<br><strong>${regularCount} tareas y ${examsCount} exámenes.</strong>`;
  }

  document.querySelectorAll('.channel-tile[data-channel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ch = btn.getAttribute('data-channel');
      showToast(`Preparando invitación para compartir por ${ch}...`, 'success');
    });
  });

  document.getElementById('btnCopyPlanLink').addEventListener('click', () => {
    const shareUrl = `${window.location.origin}/planificador.html?ref=studentmind`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    showToast('¡Enlace de planificación copiado al portapapeles!', 'success');
  });

  document.getElementById('btnSendInvite').addEventListener('click', () => {
    showToast('¡Invitación enviada! Ganarás una plantilla bonus al registrarse.', 'success');
  });

  // Inicializar
  renderPlannerTasks();
  updateShareMetrics();
});