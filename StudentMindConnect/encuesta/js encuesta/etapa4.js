/**
 * StudentMind Connect - Etapa 4: Vacíos de Conocimiento y Mini Evaluación (etapa4.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const STORAGE_KEY_E4 = 'studentmind_diagnostic_stage4';

  // Banco de temas y mini-evaluaciones por curso
  const COURSE_CATALOG = {
    'Cálculo II': {
      topics: [
        'Integrales dobles y triples',
        'Cambio de coordenadas (cilíndricas / esféricas)',
        'Superficies y cuádricas',
        'Series de Fourier',
        'Aplicaciones de la integral'
      ],
      strengths: ['Integrales simples', 'Conceptos básicos'],
      questions: [
        {
          prompt: '¿Cuál es el resultado de la siguiente integral?',
          formula: '∫ x dx = ?',
          options: ['x² + C', 'x² / 2 + C', '2x + C', 'ln(x) + C'],
          correctIndex: 1
        },
        {
          prompt: '¿Qué representa geométricamente una integral definida positiva ∫ₐᵇ f(x) dx?',
          formula: 'A = ∫ₐᵇ f(x) dx',
          options: [
            'La pendiente de la recta tangente',
            'El área bajo la curva entre a y b',
            'El punto de inflexión de f(x)',
            'La derivada segunda en el intervalo'
          ],
          correctIndex: 1
        },
        {
          prompt: 'En coordenadas polares, ¿a qué equivale x² + y²?',
          formula: 'x = r·cos(θ),  y = r·sen(θ)',
          options: ['r', 'r²', '2r·cos(θ)', 'tan(θ)'],
          correctIndex: 1
        }
      ]
    },
    'Física': {
      topics: [
        'Dinámica rotacional y torque',
        'Conservación de la energía mecánica',
        'Campos eléctricos y Ley de Gauss',
        'Movimiento armónico simple',
        'Termodinámica y entropía'
      ],
      strengths: ['Cinemática lineal', 'Análisis vectorial básico'],
      questions: [
        {
          prompt: 'Según la segunda ley de Newton, ¿cómo se calcula la fuerza neta?',
          formula: 'F = ?',
          options: ['m / a', 'm · a', 'm · v²', '½ m · a'],
          correctIndex: 1
        },
        {
          prompt: '¿Cuál es la unidad de trabajo y energía en el Sistema Internacional?',
          formula: 'W = F · d · cos(θ)',
          options: ['Watt (W)', 'Joule (J)', 'Pascal (Pa)', 'Newton (N)'],
          correctIndex: 1
        },
        {
          prompt: 'En un movimiento rectilíneo uniforme (MRU), la aceleración es:',
          formula: 'v = constante',
          options: ['Positiva y constante', 'Igual a cero', 'Igual a la gravedad', 'Variable en el tiempo'],
          correctIndex: 1
        }
      ]
    },
    'Default': {
      topics: [
        'Resolución de problemas aplicados',
        'Comprensión de fundamentos teóricos',
        'Interpretación de modelos y fórmulas',
        'Análisis de casos complejos',
        'Síntesis para evaluaciones'
      ],
      strengths: ['Conceptos introductorios', 'Identificación de variables'],
      questions: [
        {
          prompt: '¿Cuál es el primer paso recomendado al resolver un problema técnico?',
          formula: 'Datos → Planteamiento → Solución',
          options: [
            'Aplicar una fórmula al azar',
            'Identificar variables conocidas e incógnitas',
            'Omitir las unidades de medida',
            'Memorizar el resultado final'
          ],
          correctIndex: 1
        },
        {
          prompt: '¿Qué estrategia ayuda más a detectar vacíos de conocimiento?',
          formula: 'Autoevaluación activa',
          options: [
            'Releer sin practicar',
            'Resolver ejercicios sin mirar el solucionario',
            'Subrayar todo el texto',
            'Estudiar solo el día anterior'
          ],
          correctIndex: 1
        },
        {
          prompt: 'Cuando un tema resulta complejo, lo más efectivo es:',
          formula: 'Divide y vencerás',
          options: [
            'Abandonar el tema',
            'Dividirlo en subtemas y practicar paso a paso',
            'Memorizar sin comprender',
            'Saltar directamente al examen'
          ],
          correctIndex: 1
        }
      ]
    }
  };

  const defaultStateE4 = {
    currentStep: 1,
    selectedCourses: ['Cálculo II'],
    otherCourseText: '',
    difficultTopics: ['Integrales dobles y triples', 'Superficies y cuádricas'],
    quizAnswers: [1, 1, 1], // Por defecto preselecciona la opción 2 en pregunta 1 como en la imagen
    currentQuizIndex: 0,
    stage4Completed: false
  };

  let stateE4 = loadStateE4();

  function loadStateE4() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_E4);
      return saved ? { ...defaultStateE4, ...JSON.parse(saved) } : { ...defaultStateE4 };
    } catch (e) {
      return { ...defaultStateE4 };
    }
  }

  function saveStateE4() {
    localStorage.setItem(STORAGE_KEY_E4, JSON.stringify(stateE4));
  }

  function getActiveCourseName() {
    const first = stateE4.selectedCourses[0] || 'Cálculo II';
    if (first === 'Otro' && stateE4.otherCourseText.trim()) {
      return stateE4.otherCourseText.trim();
    }
    return first;
  }

  function getCourseData() {
    const name = getActiveCourseName();
    return COURSE_CATALOG[name] || COURSE_CATALOG['Default'];
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

  // Navegación entre pantallas
  const screens = document.querySelectorAll('.screen');

  function goToStepE4(step) {
    if (step < 1 || step > 6) return;

    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(`e4-screen-${step}`);

    if (currentScreen && nextScreen && currentScreen !== nextScreen) {
      const forward = step > stateE4.currentStep;
      currentScreen.classList.remove('active');
      if (forward) currentScreen.classList.add('exit-left');

      setTimeout(() => currentScreen.classList.remove('exit-left'), 300);
      nextScreen.classList.add('active');
      const body = nextScreen.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
    }

    if (step === 3) renderTopicsScreen();
    if (step === 4) renderQuizQuestion();
    if (step === 5) renderResultScreen();
    if (step === 6) renderDoneScreen();

    stateE4.currentStep = step;
    saveStateE4();
  }

  document.getElementById('btnE4Start').addEventListener('click', () => goToStepE4(2));

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE4(parseInt(btn.getAttribute('data-next'), 10)));
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => goToStepE4(parseInt(btn.getAttribute('data-prev'), 10)));
  });

  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    window.location.href = 'etapa1.html';
  });
  document.querySelectorAll('.step-node.nav-stage').forEach(node => {
    node.addEventListener('click', () => {
      window.location.href = node.getAttribute('data-href');
    });
  });
  document.getElementById('gestureHomeBtn').addEventListener('click', () => goToStepE4(1));

  // ==========================================================================
  // PANTALLA 2: SELECCIÓN DE CURSO(S)
  // ==========================================================================
  const diagCourseCheckboxes = document.querySelectorAll('#diagCoursesList input[type="checkbox"]');
  const otherDiagCourseCheck = document.getElementById('otherDiagCourseCheck');
  const otherDiagCourseBox = document.getElementById('otherDiagCourseBox');
  const otherDiagCourseText = document.getElementById('otherDiagCourseText');

  diagCourseCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.checkbox-row').classList.toggle('checked', cb.checked);
      if (cb === otherDiagCourseCheck) {
        otherDiagCourseBox.classList.toggle('hidden', !cb.checked);
        if (cb.checked) otherDiagCourseText.focus();
      }

      const prevCourse = getActiveCourseName();
      stateE4.selectedCourses = Array.from(diagCourseCheckboxes)
        .filter(item => item.checked)
        .map(item => item.value);

      // Si cambió el curso principal, reiniciar temas difíciles al set del nuevo curso
      if (getActiveCourseName() !== prevCourse) {
        const newData = getCourseData();
        stateE4.difficultTopics = [newData.topics[0], newData.topics[2]];
        stateE4.quizAnswers = [null, null, null];
        stateE4.currentQuizIndex = 0;
      }
      saveStateE4();
    });
  });

  otherDiagCourseText.addEventListener('input', (e) => {
    stateE4.otherCourseText = e.target.value;
    saveStateE4();
  });

  function syncCoursesE4UI() {
    diagCourseCheckboxes.forEach(cb => {
      const active = stateE4.selectedCourses.includes(cb.value);
      cb.checked = active;
      cb.closest('.checkbox-row').classList.toggle('checked', active);
    });
    otherDiagCourseText.value = stateE4.otherCourseText || '';
    otherDiagCourseBox.classList.toggle('hidden', !otherDiagCourseCheck.checked);
  }

  document.getElementById('btnNextE4_2').addEventListener('click', () => {
    if (stateE4.selectedCourses.length === 0) {
      showToast('Selecciona al menos un curso para diagnosticar.', 'error');
      return;
    }
    if (otherDiagCourseCheck.checked && !stateE4.otherCourseText.trim()) {
      showToast('Escribe el nombre del curso en "Otro".', 'error');
      otherDiagCourseText.focus();
      return;
    }
    goToStepE4(3);
  });

  // ==========================================================================
  // PANTALLA 3: TEMAS DIFÍCILES DEL CURSO (MÁXIMO 3)
  // ==========================================================================
  const topicsTitleEl = document.getElementById('topicsQuestionTitle');
  const topicsListEl = document.getElementById('difficultTopicsList');
  const topicsCounterEl = document.getElementById('topicsCounter');

  function renderTopicsScreen() {
    const courseName = getActiveCourseName();
    const courseData = getCourseData();

    topicsTitleEl.textContent = `¿Qué temas de ${courseName} te resultan más difíciles?`;
    topicsListEl.innerHTML = '';

    courseData.topics.forEach(topic => {
      const isChecked = stateE4.difficultTopics.includes(topic);
      const label = document.createElement('label');
      label.className = `checkbox-row ${isChecked ? 'checked' : ''}`;
      label.innerHTML = `
        <input type="checkbox" value="${topic}" ${isChecked ? 'checked' : ''} />
        <span class="custom-checkbox"><i data-lucide="check"></i></span>
        <span class="checkbox-label">${topic}</span>
      `;

      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        const checkedInputs = Array.from(topicsListEl.querySelectorAll('input:checked'));
        if (checkedInputs.length > 3) {
          input.checked = false;
          showToast('Puedes seleccionar hasta 3 temas difíciles.', 'error');
          return;
        }
        label.classList.toggle('checked', input.checked);
        stateE4.difficultTopics = checkedInputs.map(i => i.value);
        topicsCounterEl.textContent = `${stateE4.difficultTopics.length}/3`;
        saveStateE4();
      });

      topicsListEl.appendChild(label);
    });

    topicsCounterEl.textContent = `${stateE4.difficultTopics.length}/3`;
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('btnNextE4_3').addEventListener('click', () => {
    if (stateE4.difficultTopics.length === 0) {
      showToast('Selecciona al menos un tema que te resulte difícil.', 'error');
      return;
    }
    stateE4.currentQuizIndex = 0;
    goToStepE4(4);
  });

  // ==========================================================================
  // PANTALLA 4: MINI EVALUACIÓN INTERACTIVA (3 PREGUNTAS)
  // ==========================================================================
  const quizCourseBadge = document.getElementById('quizCourseBadge');
  const quizProgressText = document.getElementById('quizProgressText');
  const quizQuestionText = document.getElementById('quizQuestionText');
  const quizFormulaBox = document.getElementById('quizFormulaBox');
  const quizOptionsList = document.getElementById('quizOptionsList');

  function renderQuizQuestion() {
    const courseName = getActiveCourseName();
    const questions = getCourseData().questions;
    const idx = stateE4.currentQuizIndex;
    const currentQ = questions[idx];

    quizCourseBadge.textContent = `Mini evaluación: ${courseName}`;
    quizProgressText.textContent = `Pregunta ${idx + 1} de ${questions.length}`;
    quizQuestionText.textContent = currentQ.prompt;
    quizFormulaBox.textContent = currentQ.formula;

    quizOptionsList.innerHTML = '';
    currentQ.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = stateE4.quizAnswers[idx] === optIdx;
      btn.className = `quiz-option-btn ${isSelected ? 'selected' : ''}`;
      btn.innerHTML = `
        <span class="quiz-radio-circle"></span>
        <span>${optText}</span>
      `;
      btn.addEventListener('click', () => {
        stateE4.quizAnswers[idx] = optIdx;
        saveStateE4();
        renderQuizQuestion();
      });
      quizOptionsList.appendChild(btn);
    });
  }

  document.getElementById('btnQuizPrev').addEventListener('click', () => {
    if (stateE4.currentQuizIndex > 0) {
      stateE4.currentQuizIndex--;
      saveStateE4();
      renderQuizQuestion();
    } else {
      goToStepE4(3);
    }
  });

  document.getElementById('btnQuizNext').addEventListener('click', () => {
    const idx = stateE4.currentQuizIndex;
    const questions = getCourseData().questions;

    if (stateE4.quizAnswers[idx] === null || stateE4.quizAnswers[idx] === undefined) {
      showToast('Selecciona una alternativa para continuar.', 'error');
      return;
    }

    if (idx < questions.length - 1) {
      stateE4.currentQuizIndex++;
      saveStateE4();
      renderQuizQuestion();
    } else {
      goToStepE4(5);
    }
  });

  // ==========================================================================
  // PANTALLA 5: RESULTADO EN EL CURSO
  // ==========================================================================
  function renderResultScreen() {
    const courseName = getActiveCourseName();
    const courseData = getCourseData();
    const questions = courseData.questions;

    let correctCount = 0;
    questions.forEach((q, i) => {
      if (stateE4.quizAnswers[i] === q.correctIndex) correctCount++;
    });

    // Calcular porcentaje realista (68% cuando acierta 2 de 3 o base inicial)
    const percentMap = { 0: 34, 1: 52, 2: 68, 3: 92 };
    const scorePercent = percentMap[correctCount] ?? 68;

    document.getElementById('resultCourseTitle').textContent = `Resultado en ${courseName}`;
    document.getElementById('scoreProgressFill').style.width = `${scorePercent}%`;
    document.getElementById('scorePercentLabel').textContent = `${scorePercent}%`;

    const strengthsEl = document.getElementById('strengthsList');
    strengthsEl.innerHTML = courseData.strengths.map(s => `<li>${s}</li>`).join('');

    const reinforceEl = document.getElementById('reinforceList');
    reinforceEl.innerHTML = stateE4.difficultTopics.map(t => `<li>${t}</li>`).join('');
  }

  // ==========================================================================
  // PANTALLA 6: CIERRE ETAPA 4 (!LISTO!)
  // ==========================================================================
  function renderDoneScreen() {
    const courseName = getActiveCourseName();
    document.getElementById('doneCourseSubtitle').textContent =
      `Ya identificamos tus principales dificultades y tu nivel en ${courseName}.`;
  }

  document.getElementById('btnContinueStage5').addEventListener('click', () => {
    stateE4.stage4Completed = true;
    saveStateE4();
    showToast('¡Etapa 4 guardada! Listo para continuar a la Etapa 5.', 'success');
    setTimeout(() => { window.location.href = 'etapa5.html'; }, 900);
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
      goToStepE4(target);
    });
  });

  document.getElementById('resetE4Btn').addEventListener('click', () => {
    stateE4 = { ...defaultStateE4 };
    saveStateE4();
    syncCoursesE4UI();
    renderTopicsScreen();
    renderQuizQuestion();
    drawerOverlay.classList.remove('open');
    goToStepE4(1);
    showToast('Etapa 4 reiniciada.', 'success');
  });

  // Sincronización inicial
  syncCoursesE4UI();
  renderTopicsScreen();
  renderQuizQuestion();
  renderResultScreen();
  renderDoneScreen();

  screens.forEach(s => s.classList.remove('active'));
  const saved = document.getElementById(`e4-screen-${stateE4.currentStep}`) || document.getElementById('e4-screen-1');
  saved.classList.add('active');
});