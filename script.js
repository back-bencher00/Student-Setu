// Student Setu: interactive front-end features. No account or server required.
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Resource search and category filters
const searchInput = document.getElementById('resourceSearch');
const resourceCards = [...document.querySelectorAll('.resource-card')];
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const noResults = document.getElementById('noResults');
let activeFilter = 'All';
function filterResources() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  resourceCards.forEach(card => {
    const categoryMatches = activeFilter === 'All' || card.dataset.category === activeFilter;
    const searchMatches = (card.dataset.search + ' ' + card.innerText).toLowerCase().includes(query);
    const show = categoryMatches && searchMatches;
    card.hidden = !show;
    if (show) visible++;
  });
  noResults.hidden = visible !== 0;
}
searchInput.addEventListener('input', filterResources);
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  filterResources();
}));

// Three-question quiz
const questions = [
  { q: 'What does CSS mainly control on a website?', options: ['Website styling and layout', 'Database storage', 'Internet speed'], answer: 0, explain: 'Correct! CSS controls visual styling, spacing, colours, and layout.' },
  { q: 'Which HTML element creates a hyperlink?', options: ['<p>', '<a>', '<img>'], answer: 1, explain: 'Correct! The <a> element creates a link to another page or location.' },
  { q: 'Which language adds interactivity to a web page?', options: ['JavaScript', 'Only HTML', 'SQL'], answer: 0, explain: 'Correct! JavaScript can respond to clicks and update page content.' }
];
let questionIndex = 0, score = 0, answered = false;
const questionTitle = document.getElementById('quizQuestion');
const optionsBox = document.getElementById('quizOptions');
const feedback = document.getElementById('quizFeedback');
const nextButton = document.getElementById('nextQuestion');
const questionCount = document.getElementById('questionCount');
const quizScore = document.getElementById('quizScore');
const quizProgressFill = document.getElementById('quizProgressFill');
function renderQuestion() {
  const item = questions[questionIndex];
  answered = false;
  questionTitle.textContent = item.q;
  questionCount.textContent = `QUESTION ${questionIndex + 1} OF ${questions.length}`;
  quizProgressFill.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  feedback.textContent = '';
  quizScore.textContent = `Score: ${score}`;
  nextButton.disabled = true;
  nextButton.textContent = questionIndex === questions.length - 1 ? 'See result →' : 'Next question →';
  optionsBox.innerHTML = '';
  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span>`;
    const text = document.createTextNode(` ${option}`);
    button.appendChild(text);
    button.addEventListener('click', () => chooseAnswer(index, button));
    optionsBox.appendChild(button);
  });
}
function chooseAnswer(index, selectedButton) {
  if (answered) return;
  answered = true;
  const item = questions[questionIndex];
  const buttons = [...optionsBox.querySelectorAll('button')];
  buttons.forEach((button, i) => {
    button.disabled = true;
    if (i === item.answer) button.classList.add('correct');
  });
  if (index === item.answer) {
    score++;
    feedback.textContent = item.explain;
    feedback.style.color = '#16865b';
  } else {
    selectedButton.classList.add('incorrect');
    feedback.textContent = `Not quite. Correct answer: ${item.options[item.answer]}.`;
    feedback.style.color = '#c24d5b';
  }
  quizScore.textContent = `Score: ${score}`;
  nextButton.disabled = false;
}
nextButton.addEventListener('click', () => {
  if (!answered) return;
  if (questionIndex < questions.length - 1) {
    questionIndex++;
    renderQuestion();
  } else {
    questionTitle.textContent = `You scored ${score} out of ${questions.length}!`;
    optionsBox.innerHTML = '';
    feedback.textContent = score === questions.length ? 'Excellent work — you got every answer right.' : 'Nice effort. Review the topics and try again.';
    feedback.style.color = '#6544e8';
    nextButton.textContent = 'Try again ↻';
    nextButton.disabled = false;
    nextButton.onclick = () => {
      questionIndex = 0; score = 0; nextButton.onclick = null; renderQuestion();
    };
  }
});
renderQuestion();

// Study planner uses localStorage on this browser only.
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const plannerEmpty = document.getElementById('plannerEmpty');
const taskCount = document.getElementById('taskCount');
const taskProgress = document.getElementById('taskProgress');
const clearCompleted = document.getElementById('clearCompleted');
let tasks = [];
try { tasks = JSON.parse(localStorage.getItem('studentSetuTasks') || '[]'); } catch (_) { tasks = []; }
function saveTasks() {
  try { localStorage.setItem('studentSetuTasks', JSON.stringify(tasks)); } catch (_) {}
}
function updateTaskStats() {
  const done = tasks.filter(task => task.done).length;
  taskCount.textContent = `${done}/${tasks.length}`;
  taskProgress.style.width = tasks.length ? `${(done / tasks.length) * 100}%` : '0%';
  plannerEmpty.hidden = tasks.length > 0;
}
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' completed' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark ${task.text} complete`);
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      saveTasks(); renderTasks();
    });
    const span = document.createElement('span');
    span.textContent = task.text;
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'delete-task'; remove.textContent = '×';
    remove.setAttribute('aria-label', `Delete ${task.text}`);
    remove.addEventListener('click', () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks(); renderTasks();
    });
    li.append(checkbox, span, remove);
    taskList.appendChild(li);
  });
  updateTaskStats();
}
taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false });
  saveTasks(); renderTasks(); taskInput.value = ''; taskInput.focus();
});
clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks(); renderTasks();
});
renderTasks();
document.getElementById('year').textContent = new Date().getFullYear();
