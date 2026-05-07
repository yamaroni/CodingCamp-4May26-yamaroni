(function () {
  // ── State ──────────────────────────────────────────────────────────────────
  let tasks = [];
  let links = [];
  let timerSeconds = 1500;
  let timerInterval = null;

  // ── localStorage Persistence Helpers ──────────────────────────────────────

  function loadTasks() {
    try {
      const raw = localStorage.getItem('tld_tasks');
      return JSON.parse(raw) || [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem('tld_tasks', JSON.stringify(tasks));
  }

  function loadLinks() {
    try {
      const raw = localStorage.getItem('tld_links');
      return JSON.parse(raw) || [];
    } catch (e) {
      return [];
    }
  }

  function saveLinks(links) {
    localStorage.setItem('tld_links', JSON.stringify(links));
  }

  // ── Greeting Widget ────────────────────────────────────────────────────────

  /**
   * Pure function: maps an hour (0–23) to a greeting string.
   * @param {number} hour - Integer 0–23
   * @returns {string}
   */
  function getGreetingMessage(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 20) return 'Good Evening';
    return 'Good Night'; // 21–23 and 0–4
  }

  /**
   * Reads the current time, formats it, and writes greeting/time/date to the DOM.
   */
  function updateGreeting() {
    var now = new Date();
    var hour = now.getHours();
    var minutes = now.getMinutes();

    // Zero-padded HH:MM
    var timeString =
      String(hour).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');

    // Human-readable date, e.g. "Monday, 2 June 2025"
    var dayName = now.toLocaleDateString('en-GB', { weekday: 'long' });
    var day = now.getDate();
    var monthName = now.toLocaleDateString('en-GB', { month: 'long' });
    var year = now.getFullYear();
    var dateString = dayName + ', ' + day + ' ' + monthName + ' ' + year;

    var greetingEl = document.getElementById('greeting-text');
    var timeEl = document.getElementById('time-display');
    var dateEl = document.getElementById('date-display');

    if (greetingEl) greetingEl.textContent = getGreetingMessage(hour);
    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
  }

  // ── Focus Timer ────────────────────────────────────────────────────────────

  /**
   * Formats `timerSeconds` as MM:SS (zero-padded) and writes it to #timer-display.
   */
  function renderTimer() {
    var minutes = Math.floor(timerSeconds / 60);
    var seconds = timerSeconds % 60;
    var display =
      String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    var el = document.getElementById('timer-display');
    if (el) el.textContent = display;
  }

  /**
   * Resets timerSeconds to 1500 (25 min), clears any running interval, and renders.
   */
  function initTimer() {
    timerSeconds = 1500;
    clearInterval(timerInterval);
    timerInterval = null;
    renderTimer();
  }

  /**
   * Starts the countdown. If already running, returns immediately.
   */
  function startTimer() {
    if (timerInterval !== null) return;
    timerInterval = setInterval(tickTimer, 1000);
  }

  /**
   * Called every second: decrements timerSeconds, re-renders, and fires timerComplete at 0.
   */
  function tickTimer() {
    timerSeconds -= 1;
    renderTimer();
    if (timerSeconds === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerComplete();
    }
  }

  /**
   * Pauses the countdown by clearing the interval.
   */
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  /**
   * Stops and resets the timer back to 25:00.
   */
  function resetTimer() {
    stopTimer();
    initTimer();
  }

  /**
   * Called when the timer reaches zero.
   * Attempts to play a short beep via AudioContext; falls back to showing #timer-banner.
   */
  function timerComplete() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw new Error('AudioContext unavailable');
      var ctx = new AudioCtx();
      var oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
      var banner = document.getElementById('timer-banner');
      if (banner) banner.classList.remove('hidden');
    }
  }

  // ── To-Do List Rendering ───────────────────────────────────────────────────

  /**
   * Clears and re-renders the #todo-list from the current `tasks` array.
   * Each <li> contains a checkbox, a text span, an edit button, and a delete button.
   */
  function renderTasks() {
    var list = document.getElementById('todo-list');
    if (!list) return;

    // Clear existing items
    list.innerHTML = '';

    tasks.forEach(function (task) {
      var li = document.createElement('li');

      // ── Checkbox ──────────────────────────────────────────────────────────
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', function () {
        toggleTask(task.id);
      });

      // ── Text span ─────────────────────────────────────────────────────────
      var span = document.createElement('span');
      span.textContent = task.text;
      if (task.completed) {
        span.classList.add('completed');
      }

      // ── Edit button ───────────────────────────────────────────────────────
      var editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', function () {
        // Replace the span with an inline text input pre-filled with the task text
        var inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = task.text;

        // Confirm button saves the edit
        var confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Save';
        confirmBtn.addEventListener('click', function () {
          editTask(task.id, inputEl.value);
        });

        // Swap span → input and edit button → confirm button
        li.replaceChild(inputEl, span);
        li.replaceChild(confirmBtn, editBtn);
        inputEl.focus();
      });

      // ── Delete button ─────────────────────────────────────────────────────
      var deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', function () {
        deleteTask(task.id);
      });

      // ── Assemble <li> ─────────────────────────────────────────────────────
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

      list.appendChild(li);
    });
  }

  // ── To-Do List Mutations ───────────────────────────────────────────────────

  /**
   * Adds a new task to the list.
   * @param {string} text - The raw text from the input field.
   */
  function addTask(text) {
    var trimmed = text.trim();
    if (!trimmed) {
      var inputEl = document.getElementById('todo-input');
      if (inputEl) inputEl.focus();
      return;
    }
    tasks.push({ id: Date.now(), text: trimmed, completed: false });
    saveTasks(tasks);
    renderTasks();
    var inputEl = document.getElementById('todo-input');
    if (inputEl) inputEl.value = '';
  }

  /**
   * Toggles the completed state of a task by id.
   * @param {number} id - The task id.
   */
  function toggleTask(id) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (task) {
      task.completed = !task.completed;
      saveTasks(tasks);
      renderTasks();
    }
  }

  /**
   * Updates the text of a task by id.
   * If newText is empty after trimming, restores the original by re-rendering.
   * @param {number} id - The task id.
   * @param {string} newText - The new text value.
   */
  function editTask(id, newText) {
    var trimmed = newText.trim();
    if (!trimmed) {
      renderTasks();
      return;
    }
    var task = tasks.find(function (t) { return t.id === id; });
    if (task) {
      task.text = trimmed;
      saveTasks(tasks);
      renderTasks();
    }
  }

  /**
   * Removes a task from the list by id.
   * @param {number} id - The task id.
   */
  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks(tasks);
    renderTasks();
  }

  // ── Quick Links Rendering ─────────────────────────────────────────────────

  /**
   * Clears and re-renders the #links-container from the current `links` array.
   * Each card contains an anchor link and a delete button.
   */
  function renderLinks() {
    var container = document.getElementById('links-container');
    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';

    links.forEach(function (link) {
      var card = document.createElement('div');
      card.className = 'link-card';

      // ── Anchor ────────────────────────────────────────────────────────────
      var anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.label;

      // ── Delete button ─────────────────────────────────────────────────────
      var deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', function () {
        deleteLink(link.id);
      });

      // ── Assemble card ─────────────────────────────────────────────────────
      card.appendChild(anchor);
      card.appendChild(deleteBtn);

      container.appendChild(card);
    });
  }

  // ── Quick Links Mutations ─────────────────────────────────────────────────

  /**
   * Adds a new quick link.
   * Validates that both label and url are non-empty; marks fields with .error if not.
   * @param {string} label - The raw label from the input field.
   * @param {string} url   - The raw URL from the input field.
   */
  function addLink(label, url) {
    var trimmedLabel = label.trim();
    var trimmedUrl = url.trim();

    var labelInput = document.getElementById('link-label-input');
    var urlInput = document.getElementById('link-url-input');

    if (!trimmedLabel) {
      if (labelInput) labelInput.classList.add('error');
      return;
    }

    if (!trimmedUrl) {
      if (urlInput) urlInput.classList.add('error');
      return;
    }

    // Both fields are valid — clear any error states
    if (labelInput) labelInput.classList.remove('error');
    if (urlInput) urlInput.classList.remove('error');

    links.push({ id: Date.now(), label: trimmedLabel, url: trimmedUrl });
    saveLinks(links);
    renderLinks();

    // Clear input fields
    if (labelInput) labelInput.value = '';
    if (urlInput) urlInput.value = '';
  }

  /**
   * Removes a quick link by id.
   * @param {number} id - The link id.
   */
  function deleteLink(id) {
    links = links.filter(function (l) { return l.id !== id; });
    saveLinks(links);
    renderLinks();
  }

  // ── Initialisation ─────────────────────────────────────────────────────────
  function init() {
    // Greeting widget
    updateGreeting();
    setInterval(updateGreeting, 1000);

    // Focus Timer widget
    initTimer();
    var startBtn = document.getElementById('timer-start');
    var stopBtn = document.getElementById('timer-stop');
    var resetBtn = document.getElementById('timer-reset');
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    // To-Do List widget
    tasks = loadTasks();
    renderTasks();
    var addBtn = document.getElementById('todo-add-btn');
    var todoInput = document.getElementById('todo-input');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        addTask(document.getElementById('todo-input').value);
      });
    }
    if (todoInput) {
      todoInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          addTask(e.target.value);
        }
      });
    }

    // Quick Links widget
    links = loadLinks();
    renderLinks();
    var linkAddBtn = document.getElementById('link-add-btn');
    var linkUrlInput = document.getElementById('link-url-input');
    if (linkAddBtn) {
      linkAddBtn.addEventListener('click', function () {
        addLink(
          document.getElementById('link-label-input').value,
          document.getElementById('link-url-input').value
        );
      });
    }
    if (linkUrlInput) {
      linkUrlInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          addLink(
            document.getElementById('link-label-input').value,
            e.target.value
          );
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
