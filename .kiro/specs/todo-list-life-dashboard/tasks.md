# Implementation Plan: Todo List Life Dashboard

## Overview

Build the entire dashboard as three files: `index.html`, `css/style.css`, and `js/app.js`. The implementation follows a bottom-up order — HTML structure first, then CSS layout and styles, then the full JavaScript IIFE with all widget logic and localStorage persistence.

## Tasks

- [x] 1. Create `index.html` — full page structure with all four widget shells
  - [x] 1.1 Write the HTML document skeleton and link assets
    - Create `index.html` at the project root with `<!DOCTYPE html>`, `<html lang="en">`, `<head>`, and `<body>` tags
    - Add `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, and `<title>Life Dashboard</title>`
    - Add `<link rel="stylesheet" href="css/style.css">` in `<head>`
    - Add `<script src="js/app.js" defer></script>` before `</body>`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 1.2 Add the dashboard grid container and Greeting widget shell
    - Inside `<body>`, create a `<main class="dashboard-grid">` wrapper
    - Inside the grid, add a `<section class="widget" id="greeting-widget">` card
    - Inside the greeting widget, add `<p id="greeting-text"></p>`, `<p id="time-display"></p>`, and `<p id="date-display"></p>`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.3 Add the Focus Timer widget shell
    - Add a `<section class="widget" id="timer-widget">` card inside the grid
    - Inside it, add `<p id="timer-display">25:00</p>`
    - Add three buttons: `<button id="timer-start">Start</button>`, `<button id="timer-stop">Stop</button>`, `<button id="timer-reset">Reset</button>`
    - Add a hidden completion banner: `<div id="timer-banner" class="timer-banner hidden">Time's up!</div>`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 1.4 Add the To-Do List widget shell
    - Add a `<section class="widget" id="todo-widget">` card inside the grid
    - Inside it, add `<input type="text" id="todo-input" placeholder="Add a task…">` and `<button id="todo-add-btn">Add</button>`
    - Add `<ul id="todo-list"></ul>` as the task container
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 1.5 Add the Quick Links widget shell
    - Add a `<section class="widget" id="links-widget">` card inside the grid
    - Inside it, add `<input type="text" id="link-label-input" placeholder="Label">`, `<input type="text" id="link-url-input" placeholder="https://…">`, and `<button id="link-add-btn">Add</button>`
    - Add `<div id="links-container"></div>` as the links container
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [-] 2. Create `css/style.css` — responsive layout, widget styles, and all visual states
  - [x] 2.1 Write CSS reset, custom properties, and base typography
    - Create `css/style.css`
    - Add a minimal CSS reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`)
    - Define CSS custom properties on `:root` for colours, spacing, border-radius, and font sizes
    - Set `body` font family, background colour, and base text colour
    - Use `clamp()` for fluid font sizes to satisfy responsive typography across 320 px–1920 px
    - _Requirements: 7.3, 7.4_

  - [x] 2.2 Implement the responsive CSS Grid dashboard layout
    - Style `.dashboard-grid` with `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, and `gap: 1.5rem; padding: 1.5rem`
    - This produces a 2×2 grid at ≥ 640 px and a single-column stack at < 640 px
    - _Requirements: 7.3, 7.4_

  - [x] 2.3 Style widget cards
    - Style `.widget` with background, border-radius, padding, and a subtle box-shadow
    - Ensure each widget card is visually distinct and readable at all supported viewport widths
    - _Requirements: 7.3, 7.4_

  - [x] 2.4 Style the Greeting widget typography
    - Style `#greeting-text` as a large heading
    - Style `#time-display` as a prominent monospace clock display
    - Style `#date-display` as a secondary subtitle
    - _Requirements: 1.1, 1.2_

  - [-] 2.5 Style the Focus Timer widget
    - Style `#timer-display` as a large monospace countdown display
    - Style `#timer-start`, `#timer-stop`, `#timer-reset` as clearly labelled buttons with hover and active states
    - Style `.timer-banner` as a full-width highlighted completion banner
    - Add `.hidden { display: none; }` utility class for toggling the banner
    - _Requirements: 2.6, 2.7_

  - [ ] 2.6 Style the To-Do List widget
    - Style `#todo-input` and `#todo-add-btn` as an inline add-task row
    - Style `#todo-list li` items with flex layout: checkbox on the left, task text in the middle, edit and delete buttons on the right
    - Add `.completed` rule that applies `text-decoration: line-through` and reduced opacity to completed task text
    - _Requirements: 3.4, 3.5_

  - [ ] 2.7 Style the Quick Links widget and error states
    - Style `#link-label-input` and `#link-url-input` as a two-field add-link row with `#link-add-btn`
    - Style each link card in `#links-container` with an anchor button and a delete button side by side
    - Add `.error` rule that applies a red border or highlight to invalid input fields
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [ ] 3. Checkpoint — Verify HTML and CSS are correct before writing JavaScript
  - Open `index.html` in a browser and confirm all four widget shells render in a responsive grid with correct element IDs. Ensure no console errors. Ask the user if anything looks wrong before proceeding.

- [~] 4. Create `js/app.js` — full IIFE with all widget logic
  - [ ] 4.1 Set up the IIFE skeleton, state variables, and DOMContentLoaded initialisation
    - Create `js/app.js`
    - Wrap all code in `(function () { ... })();`
    - Declare module-scoped state variables: `let tasks = [];`, `let links = [];`, `let timerSeconds = 1500;`, `let timerInterval = null;`
    - Add `document.addEventListener('DOMContentLoaded', init);` at the bottom of the IIFE
    - Define an empty `function init() {}` that will be filled in subsequent tasks
    - _Requirements: 6.3, 6.4_

  - [ ] 4.2 Implement localStorage persistence helpers: `loadTasks`, `saveTasks`, `loadLinks`, `saveLinks`
    - Write `loadTasks()`: reads `tld_tasks` from `localStorage`, `JSON.parse`s it, returns the array; wraps everything in `try/catch` and returns `[]` on any error
    - Write `saveTasks(tasks)`: `JSON.stringify`s the array and writes it to `localStorage` key `tld_tasks`
    - Write `loadLinks()`: same pattern for `tld_links`
    - Write `saveLinks(links)`: same pattern for `tld_links`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 4.3 Implement Greeting widget: `getGreetingMessage`, `updateGreeting`
    - Write `getGreetingMessage(hour)`: pure function mapping hour 0–23 to one of four greeting strings ("Good Morning" 5–11, "Good Afternoon" 12–17, "Good Evening" 18–20, "Good Night" 21–4)
    - Write `updateGreeting()`: reads `new Date()`, formats `HH:MM` time string (zero-padded), formats human-readable date string (e.g., "Monday, 2 June 2025"), calls `getGreetingMessage`, writes all three values to `#greeting-text`, `#time-display`, `#date-display`
    - In `init()`, call `updateGreeting()` once and then `setInterval(updateGreeting, 1000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 4.4 Implement Focus Timer: `renderTimer`, `initTimer`, `startTimer`, `tickTimer`, `stopTimer`, `resetTimer`, `timerComplete`
    - Write `renderTimer()`: formats `timerSeconds` as `MM:SS` (zero-padded), writes to `#timer-display`
    - Write `initTimer()`: sets `timerSeconds = 1500`, clears any existing interval, calls `renderTimer()`
    - Write `startTimer()`: guard — if `timerInterval !== null`, return immediately; otherwise create a 1-second interval that calls `tickTimer()`
    - Write `tickTimer()`: decrements `timerSeconds` by 1, calls `renderTimer()`; if `timerSeconds === 0`, clears interval, sets `timerInterval = null`, calls `timerComplete()`
    - Write `stopTimer()`: clears `timerInterval`, sets `timerInterval = null`
    - Write `resetTimer()`: calls `stopTimer()`, then `initTimer()`
    - Write `timerComplete()`: attempts to play a short beep via `AudioContext`; on failure or unavailability, removes `.hidden` from `#timer-banner`
    - In `init()`, call `initTimer()` and attach click listeners on `#timer-start`, `#timer-stop`, `#timer-reset` to `startTimer`, `stopTimer`, `resetTimer`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 4.5 Implement To-Do List rendering: `renderTasks`
    - Write `renderTasks()`: clears `#todo-list` innerHTML; for each task in `tasks[]`, creates a `<li>` containing:
      - `<input type="checkbox">` checked if `task.completed`, with a `change` listener calling `toggleTask(task.id)`
      - A `<span>` with task text, with `.completed` class applied when `task.completed === true`
      - An edit `<button>` with a `click` listener that replaces the span with an `<input>` pre-filled with the task text, and a confirm button that calls `editTask(task.id, newText)`
      - A delete `<button>` with a `click` listener calling `deleteTask(task.id)`
    - Appends each `<li>` to `#todo-list`
    - _Requirements: 3.4, 3.5, 3.6_

  - [ ] 4.6 Implement To-Do List mutations: `addTask`, `toggleTask`, `editTask`, `deleteTask`
    - Write `addTask(text)`: trims text; if empty, focuses `#todo-input` and returns; pushes `{ id: Date.now(), text: trimmed, completed: false }` to `tasks[]`; calls `saveTasks(tasks)` and `renderTasks()`; clears `#todo-input`
    - Write `toggleTask(id)`: finds task by id, flips `completed`; calls `saveTasks(tasks)` and `renderTasks()`
    - Write `editTask(id, newText)`: trims `newText`; if empty, calls `renderTasks()` (restores original) and returns; updates `task.text`; calls `saveTasks(tasks)` and `renderTasks()`
    - Write `deleteTask(id)`: filters `tasks[]` to remove matching id; calls `saveTasks(tasks)` and `renderTasks()`
    - In `init()`, set `tasks = loadTasks()`, call `renderTasks()`, attach a `click` listener on `#todo-add-btn` calling `addTask(#todo-input.value)`, and attach a `keydown` listener on `#todo-input` to submit on Enter
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.7, 3.8, 3.9, 3.10_

  - [ ] 4.7 Implement Quick Links rendering: `renderLinks`
    - Write `renderLinks()`: clears `#links-container` innerHTML; for each link in `links[]`, creates a `<div class="link-card">` containing:
      - An `<a href="link.url" target="_blank" rel="noopener noreferrer">` with `link.label` as text
      - A delete `<button>` with a `click` listener calling `deleteLink(link.id)`
    - Appends each card to `#links-container`
    - _Requirements: 4.4, 4.5_

  - [ ] 4.8 Implement Quick Links mutations: `addLink`, `deleteLink`
    - Write `addLink(label, url)`: trims both inputs; if label is empty, adds `.error` class to `#link-label-input` and returns; if url is empty, adds `.error` class to `#link-url-input` and returns; removes `.error` from both fields; pushes `{ id: Date.now(), label, url }` to `links[]`; calls `saveLinks(links)` and `renderLinks()`; clears both input fields
    - Write `deleteLink(id)`: filters `links[]` to remove matching id; calls `saveLinks(links)` and `renderLinks()`
    - In `init()`, set `links = loadLinks()`, call `renderLinks()`, attach a `click` listener on `#link-add-btn` calling `addLink(#link-label-input.value, #link-url-input.value)`, and attach a `keydown` listener on `#link-url-input` to submit on Enter
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_

- [ ] 5. Final checkpoint — Wire everything together and verify the complete app
  - Confirm `init()` calls all initialisation steps in order: greeting + interval, timer init + event bindings, tasks load + render + event bindings, links load + render + event bindings
  - Open `index.html` in a browser and verify all four widgets are functional: clock ticks, timer counts down and resets, tasks persist across page reload, links persist across page reload
  - Ensure no console errors. Ask the user if questions arise.

## Notes

- No test files are created. All tasks involve only `index.html`, `css/style.css`, and `js/app.js`.
- No terminal commands are required. All tasks are file creation or editing tasks.
- Tasks marked with `*` would be optional test sub-tasks — none are included per project constraints.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation before moving to the next layer.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "2.5", "2.6", "2.7"] },
    { "id": 5, "tasks": ["4.1"] },
    { "id": 6, "tasks": ["4.2", "4.3"] },
    { "id": 7, "tasks": ["4.4", "4.5"] },
    { "id": 8, "tasks": ["4.6", "4.7"] },
    { "id": 9, "tasks": ["4.8"] }
  ]
}
```
