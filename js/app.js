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

  // ── Initialisation ─────────────────────────────────────────────────────────
  function init() {
    // Widget initialisation will be added in subsequent tasks
  }

  document.addEventListener('DOMContentLoaded', init);
})();
