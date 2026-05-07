# Design Document: Todo List Life Dashboard

## Overview

The Todo List Life Dashboard is a self-contained, client-side productivity page built with pure HTML, CSS, and Vanilla JavaScript — no frameworks, no build tools, no backend. The entire application ships as three files: `index.html`, `css/style.css`, and `js/app.js`.

The page is divided into four independent widgets arranged in a responsive grid:

| Widget | Purpose |
|---|---|
| Greeting | Shows current time, date, and a time-of-day greeting |
| Focus Timer | 25-minute Pomodoro countdown with start / stop / reset |
| To-Do List | Add, edit, complete, and delete persistent tasks |
| Quick Links | Add and open user-defined URL shortcuts |

All mutable state (tasks and links) is persisted to `localStorage` under the keys `tld_tasks` and `tld_links`. The application initialises from `localStorage` on every page load and writes back on every mutation.

---

## Architecture

The application follows a simple **Model → View → Controller** pattern implemented entirely inside `js/app.js`, with no module bundler or import/export syntax (plain `<script>` tag).

```
┌─────────────────────────────────────────────────────────┐
│                        index.html                       │
│  Static markup (widget shells, input fields, buttons)   │
└────────────────────────┬────────────────────────────────┘
                         │ DOM ready
                         ▼
┌─────────────────────────────────────────────────────────┐
│                        js/app.js                        │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐  ┌─────────────┐  │
│  │  State Layer │   │  DOM Layer   │  │ Timer Layer │  │
│  │  (in-memory  │◄──│  (render /   │  │ (setInterval│  │
│  │  + storage)  │──►│   events)    │  │  + state)   │  │
│  └──────────────┘   └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    localStorage                         │
│          tld_tasks (JSON)  |  tld_links (JSON)          │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **No module system**: All code lives in a single IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope while remaining compatible with a plain `<script>` tag.
- **Render-on-mutation**: Every state change calls a dedicated `render*()` function that rebuilds the relevant widget's DOM from the current in-memory state. This keeps the DOM and state in sync without a virtual DOM.
- **Single source of truth**: In-memory arrays (`tasks[]`, `links[]`) are the authoritative state. `localStorage` is a persistence mirror written after every mutation.
- **Clock via `setInterval`**: The greeting widget uses a 1-second interval to update the time display and re-evaluate the greeting message.
- **Timer via `setInterval`**: The focus timer uses a separate 1-second interval that is started, cleared, and re-created by the start/stop/reset controls.

---

## Components and Interfaces

### 1. Greeting Widget

**Responsibility**: Display current time (HH:MM), current date (human-readable), and a time-of-day greeting. Update every second.

**DOM elements** (defined in `index.html`):
- `#greeting-text` — greeting string ("Good Morning", etc.)
- `#time-display` — current time in HH:MM
- `#date-display` — current date string

**Functions in `js/app.js`**:

```
updateGreeting()
  Reads new Date(), formats time and date strings,
  determines greeting tier, writes to DOM.
  Called once on init and every 1 000 ms via setInterval.

getGreetingMessage(hour: number) → string
  Pure function. Maps hour (0–23) to greeting string.
  05–11 → "Good Morning"
  12–17 → "Good Afternoon"
  18–20 → "Good Evening"
  21–04 → "Good Night"
```

---

### 2. Focus Timer Widget

**Responsibility**: 25-minute countdown with start, stop, and reset. Notify user on completion.

**DOM elements**:
- `#timer-display` — remaining time in MM:SS
- `#timer-start` — start button
- `#timer-stop` — stop/pause button
- `#timer-reset` — reset button

**Internal state** (module-scoped variables):
- `timerSeconds: number` — remaining seconds (initialised to 1500)
- `timerInterval: number | null` — handle returned by `setInterval`

**Functions**:

```
initTimer()
  Sets timerSeconds = 1500, clears any interval, renders display.

startTimer()
  Guard: if timerInterval is already set, return immediately.
  Creates a 1-second interval that calls tickTimer().

tickTimer()
  Decrements timerSeconds by 1.
  Calls renderTimer().
  If timerSeconds === 0: clears interval, calls timerComplete().

stopTimer()
  Clears timerInterval, sets timerInterval = null.

resetTimer()
  Calls stopTimer(), then initTimer().

timerComplete()
  Plays a short beep via the Web Audio API (AudioContext)
  or falls back to a visible "Time's up!" banner.

renderTimer()
  Formats timerSeconds as MM:SS, writes to #timer-display.
```

---

### 3. To-Do List Widget

**Responsibility**: CRUD operations on tasks with inline editing and localStorage persistence.

**DOM elements**:
- `#todo-input` — text input for new task
- `#todo-add-btn` — submission button
- `#todo-list` — `<ul>` container for task items

**Each task item** is rendered as a `<li>` containing:
- A `<input type="checkbox">` for completion toggle
- A `<span>` (or `<input>` when editing) for task text
- An edit `<button>`
- A delete `<button>`

**Functions**:

```
loadTasks() → Task[]
  Reads tld_tasks from localStorage, JSON.parse, returns array.
  Returns [] on missing key or parse error.

saveTasks(tasks: Task[])
  JSON.stringify(tasks), writes to localStorage key tld_tasks.

addTask(text: string)
  Trims text. If empty, focuses #todo-input and returns.
  Pushes { id: Date.now(), text, completed: false } to tasks[].
  Calls saveTasks(), renderTasks().

toggleTask(id: number)
  Finds task by id, flips completed boolean.
  Calls saveTasks(), renderTasks().

editTask(id: number, newText: string)
  Trims newText. If empty, restores original text and returns.
  Updates task.text in tasks[].
  Calls saveTasks(), renderTasks().

deleteTask(id: number)
  Filters tasks[] to remove item with matching id.
  Calls saveTasks(), renderTasks().

renderTasks()
  Clears #todo-list innerHTML.
  For each task in tasks[], creates and appends a <li> element
  with checkbox, text span, edit button, delete button.
  Applies .completed CSS class when task.completed === true.
```

---

### 4. Quick Links Widget

**Responsibility**: Add, display, open, and delete user-defined URL shortcuts.

**DOM elements**:
- `#link-label-input` — text input for link label
- `#link-url-input` — text input for URL
- `#link-add-btn` — submission button
- `#links-container` — container for shortcut buttons

**Each link item** is rendered as a `<div>` containing:
- An `<a>` or `<button>` that opens the URL in a new tab
- A delete `<button>`

**Functions**:

```
loadLinks() → Link[]
  Reads tld_links from localStorage, JSON.parse, returns array.
  Returns [] on missing key or parse error.

saveLinks(links: Link[])
  JSON.stringify(links), writes to localStorage key tld_links.

addLink(label: string, url: string)
  Trims both inputs. If either is empty, highlights the empty
  field with an error class and returns.
  Pushes { id: Date.now(), label, url } to links[].
  Calls saveLinks(), renderLinks().

deleteLink(id: number)
  Filters links[] to remove item with matching id.
  Calls saveLinks(), renderLinks().

renderLinks()
  Clears #links-container innerHTML.
  For each link in links[], creates and appends a card element
  with an anchor (target="_blank", rel="noopener noreferrer")
  and a delete button.
```

---

### 5. Initialisation

```
document.addEventListener('DOMContentLoaded', () => {
  // Greeting
  updateGreeting();
  setInterval(updateGreeting, 1000);

  // Timer
  initTimer();
  bindTimerEvents();

  // Tasks
  tasks = loadTasks();
  renderTasks();
  bindTaskEvents();

  // Links
  links = loadLinks();
  renderLinks();
  bindLinkEvents();
});
```

---

## Data Models

### Task

```json
{
  "id": 1748880000000,
  "text": "Buy groceries",
  "completed": false
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `number` | `Date.now()` at creation time; used as a stable key |
| `text` | `string` | Non-empty task description |
| `completed` | `boolean` | `true` when the task has been toggled done |

**localStorage key**: `tld_tasks`
**Storage format**: `JSON.stringify(Task[])`

---

### Link

```json
{
  "id": 1748880001234,
  "label": "GitHub",
  "url": "https://github.com"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `number` | `Date.now()` at creation time |
| `label` | `string` | Non-empty display name for the shortcut button |
| `url` | `string` | Non-empty URL string (user-supplied, opened as-is) |

**localStorage key**: `tld_links`
**Storage format**: `JSON.stringify(Link[])`

---

### Timer State (in-memory only, not persisted)

| Variable | Type | Initial Value | Description |
|---|---|---|---|
| `timerSeconds` | `number` | `1500` | Remaining seconds |
| `timerInterval` | `number\|null` | `null` | `setInterval` handle; `null` when stopped |

---

## Responsive Layout

The four widgets are arranged using CSS Grid with a fluid column definition:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}
```

- **≥ 1024 px**: 2 × 2 grid (all four widgets visible side-by-side in pairs)
- **640 px – 1023 px**: 2 × 2 or 1 × 4 depending on content width
- **< 640 px**: single-column stack

Typography uses `clamp()` for fluid scaling between viewport extremes.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Time formatting is always valid HH:MM

*For any* `Date` object, the time-formatting function SHALL produce a string that matches the pattern `HH:MM` where HH is the zero-padded 24-hour hour (00–23) and MM is the zero-padded minute (00–59), and the values SHALL equal the date's actual hours and minutes.

**Validates: Requirements 1.1**

---

### Property 2: Date formatting always contains required components

*For any* `Date` object, the date-formatting function SHALL produce a string that contains a valid weekday name, a numeric day, a month name, and a 4-digit year matching the date's actual values.

**Validates: Requirements 1.2**

---

### Property 3: Greeting message is correct for every hour of the day

*For any* integer hour in [0, 23], `getGreetingMessage(hour)` SHALL return:
- `"Good Morning"` when hour ∈ [5, 11]
- `"Good Afternoon"` when hour ∈ [12, 17]
- `"Good Evening"` when hour ∈ [18, 20]
- `"Good Night"` when hour ∈ [21, 23] ∪ [0, 4]

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 4: Timer countdown decrements by exactly one per tick

*For any* starting `timerSeconds` value in [1, 1500], after N ticks (where N ≤ starting value), `timerSeconds` SHALL equal `startingValue − N`.

**Validates: Requirements 2.2**

---

### Property 5: Timer display is always valid MM:SS

*For any* `timerSeconds` value in [0, 1500], `renderTimer()` SHALL produce a display string matching `MM:SS` where MM is the zero-padded minutes and SS is the zero-padded seconds, and the values SHALL correctly represent the total seconds remaining.

**Validates: Requirements 2.3, 2.7**

---

### Property 6: Stopping the timer preserves remaining time

*For any* `timerSeconds` value, calling `stopTimer()` SHALL leave `timerSeconds` unchanged and SHALL set `timerInterval` to `null`.

**Validates: Requirements 2.4**

---

### Property 7: Resetting the timer always restores 25:00

*For any* timer state (any `timerSeconds` value, any `timerInterval` state), calling `resetTimer()` SHALL set `timerSeconds` to 1500 and SHALL set `timerInterval` to `null`.

**Validates: Requirements 2.5**

---

### Property 8: Starting the timer is idempotent

*For any* timer state, calling `startTimer()` multiple times SHALL result in exactly one active interval — the same as calling it once. The countdown rate SHALL NOT increase with repeated start calls.

**Validates: Requirements 2.8**

---

### Property 9: Adding a valid task grows the task list

*For any* task list and any non-empty, non-whitespace string, calling `addTask(text)` SHALL increase `tasks.length` by exactly 1, and the new task SHALL have `text` equal to the trimmed input and `completed` equal to `false`.

**Validates: Requirements 3.2**

---

### Property 10: Whitespace-only input is rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), calling `addTask(text)` SHALL leave `tasks` unchanged (same length and same contents).

**Validates: Requirements 3.3**

---

### Property 11: Every rendered task contains required controls

*For any* non-empty `tasks` array, calling `renderTasks()` SHALL produce a DOM where every task `<li>` element contains a completion checkbox, an edit button, and a delete button.

**Validates: Requirements 3.4**

---

### Property 12: Toggling a task flips its completion status

*For any* `tasks` array and any task `id` in that array, calling `toggleTask(id)` SHALL flip `task.completed` from `false` to `true` or from `true` to `false`, and SHALL leave all other tasks unchanged.

**Validates: Requirements 3.5**

---

### Property 13: Valid edits update task text

*For any* task and any non-empty, non-whitespace string `newText`, calling `editTask(id, newText)` SHALL set `task.text` to `newText.trim()` and SHALL leave all other tasks unchanged.

**Validates: Requirements 3.6**

---

### Property 14: Whitespace-only edits restore original text

*For any* task with text `originalText` and any whitespace-only string, calling `editTask(id, whitespaceText)` SHALL leave `task.text` equal to `originalText`.

**Validates: Requirements 3.7**

---

### Property 15: Deleting a task removes exactly that task

*For any* `tasks` array with at least one task, calling `deleteTask(id)` SHALL remove exactly the task with the matching `id`, reduce `tasks.length` by 1, and leave all other tasks unchanged.

**Validates: Requirements 3.8**

---

### Property 16: Tasks persistence round-trip

*For any* `Task[]` array, calling `saveTasks(tasks)` followed by `loadTasks()` SHALL return an array that is deeply equal to the original array (same length, same `id`, `text`, and `completed` values in the same order).

**Validates: Requirements 3.9, 3.10, 5.1, 5.3, 5.4**

---

### Property 17: Adding a valid link grows the links list

*For any* links array and any non-empty label and non-empty URL strings, calling `addLink(label, url)` SHALL increase `links.length` by exactly 1, and the new link SHALL have the correct trimmed `label` and `url`.

**Validates: Requirements 4.2**

---

### Property 18: Empty label or URL is rejected

*For any* combination where label is empty/whitespace OR url is empty/whitespace, calling `addLink(label, url)` SHALL leave `links` unchanged.

**Validates: Requirements 4.3**

---

### Property 19: Every rendered link contains a delete control

*For any* non-empty `links` array, calling `renderLinks()` SHALL produce a DOM where every link element contains a delete button.

**Validates: Requirements 4.5**

---

### Property 20: Links persistence round-trip

*For any* `Link[]` array, calling `saveLinks(links)` followed by `loadLinks()` SHALL return an array that is deeply equal to the original array (same length, same `id`, `label`, and `url` values in the same order).

**Validates: Requirements 4.6, 4.7, 5.2, 5.3, 5.4**

---

### Property 21: Malformed localStorage data is handled gracefully

*For any* string that is not valid JSON (including empty string, random characters, truncated JSON), calling `loadTasks()` or `loadLinks()` SHALL return an empty array `[]` and SHALL NOT throw an exception.

**Validates: Requirements 5.5**

---

## Error Handling

### localStorage Unavailability

`loadTasks()` and `loadLinks()` wrap `localStorage.getItem()` and `JSON.parse()` in a `try/catch`. On any error (storage quota exceeded, private browsing restrictions, malformed JSON), the function returns `[]` and the application continues with an empty collection.

```javascript
function loadTasks() {
  try {
    const raw = localStorage.getItem('tld_tasks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
```

### Input Validation

- **Empty/whitespace task text**: `addTask()` trims the input and returns early if the result is empty, keeping focus on `#todo-input`.
- **Empty edit text**: `editTask()` trims the new text and restores the original if the result is empty.
- **Empty label or URL for links**: `addLink()` trims both fields and adds an error CSS class to any empty field, then returns early without mutating `links[]`.

### Timer Edge Cases

- **Duplicate start**: `startTimer()` checks `timerInterval !== null` and returns immediately if an interval is already active.
- **Timer at zero**: `tickTimer()` checks `timerSeconds === 0` before decrementing, clears the interval, and calls `timerComplete()`.

### URL Handling

Quick Links opens URLs with `target="_blank"` and `rel="noopener noreferrer"`. No URL validation is performed beyond checking that the field is non-empty — the browser handles malformed URLs natively.

---

## Testing Strategy

### Applicability of Property-Based Testing

This feature is well-suited for property-based testing. The core logic consists of pure functions (`getGreetingMessage`, `formatTime`, `formatDate`, `renderTimer`) and simple state-mutation functions (`addTask`, `toggleTask`, `editTask`, `deleteTask`, `addLink`, `deleteLink`, `loadTasks`, `saveTasks`, `loadLinks`, `saveLinks`) that have clear input/output contracts and no external dependencies beyond `localStorage` (which can be mocked).

**PBT library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, runs in Node.js without a browser).

### Dual Testing Approach

**Unit tests** (example-based) cover:
- Timer initialisation to 25:00 (Requirement 2.1)
- Timer completion at 00:00 (Requirement 2.6)
- Shortcut button opens URL in new tab (Requirement 4.4)
- localStorage key names are `tld_tasks` and `tld_links` (Requirements 5.1, 5.2)

**Property-based tests** cover Properties 1–21 above. Each test runs a minimum of **100 iterations** with randomly generated inputs.

### Test File Structure

```
tests/
  greeting.test.js     — Properties 1, 2, 3
  timer.test.js        — Properties 4, 5, 6, 7, 8 + unit tests for 2.1, 2.6
  todo.test.js         — Properties 9–16
  links.test.js        — Properties 17–21 + unit test for 4.4
```

### Property Test Tag Format

Each property-based test is tagged with a comment:

```javascript
// Feature: todo-list-life-dashboard, Property 3: Greeting message is correct for every hour
```

### Test Configuration

```javascript
// fast-check default: 100 runs per property
fc.assert(fc.property(...), { numRuns: 100 });
```

### What Is Not Tested Automatically

- **Cross-browser rendering** (Requirements 7.1, 7.2): Manual testing in Chrome, Firefox, Edge, Safari.
- **Responsive layout** (Requirements 7.3, 7.4): Manual testing at 320 px, 768 px, 1280 px, 1920 px viewport widths.
- **Project file structure** (Requirements 6.1–6.5): Verified by code review.
- **Audible/visual timer completion signal** (Requirement 2.6 signal): Manual verification.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Time Format Correctness

*For any* `Date` object, `_formatTime(date)` SHALL return a string matching the pattern `HH:MM` where HH is a zero-padded 24-hour value in [00, 23] and MM is a zero-padded minute value in [00, 59].

**Validates: Requirements 1.1**

---

### Property 2: Date Format Correctness

*For any* `Date` object, `_formatDate(date)` SHALL return a string that contains a valid English weekday name, a numeric day, a valid English month name, and a four-digit year — all matching the date represented by the input.

**Validates: Requirements 1.2**

---

### Property 3: Greeting Mapping Correctness

*For any* integer hour in [0, 23], `_getGreeting(hour)` SHALL return exactly one of the four greeting strings, and the returned string SHALL correspond to the correct time-of-day range:
- hours 5–11 → "Good Morning"
- hours 12–17 → "Good Afternoon"
- hours 18–20 → "Good Evening"
- hours 21–23 and 0–4 → "Good Night"

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 4: Timer Countdown Correctness

*For any* number of elapsed seconds N in [1, 1499], after starting the timer and advancing N seconds, the remaining time SHALL equal 1500 − N seconds, and the displayed string SHALL equal `_formatTime(1500 - N)`.

**Validates: Requirements 2.2, 2.3**

---

### Property 5: Timer Pause Retains Remaining Time

*For any* elapsed time T in [1, 1499] seconds, after starting the timer, advancing T seconds, and then stopping it, the remaining time SHALL equal 1500 − T and SHALL NOT change regardless of how much additional time passes while the timer is paused.

**Validates: Requirements 2.4**

---

### Property 6: Timer Reset Restores Initial State

*For any* timer state (IDLE, RUNNING at any point, or PAUSED at any point), calling reset SHALL result in remaining === 1500, status === IDLE, and the displayed value === "25:00".

**Validates: Requirements 2.5**

---

### Property 7: Timer Display Format

*For any* integer number of seconds S in [0, 1500], `_formatTime(S)` SHALL return a string matching `MM:SS` where MM and SS are zero-padded values correctly derived from S.

**Validates: Requirements 2.7**

---

### Property 8: Timer Start Idempotence

*For any* running timer state with remaining time R, calling `_start()` again SHALL leave remaining === R, status === RUNNING, and SHALL NOT create an additional interval (no double-counting).

**Validates: Requirements 2.8**

---

### Property 9: Valid Task Addition

*For any* non-empty, non-whitespace-only string of length ≤ 500 characters, calling `_addTask(text)` SHALL increase the task list length by exactly 1, and the new task SHALL have `text` equal to the trimmed input and `completed === false`.

**Validates: Requirements 3.2**

---

### Property 10: Invalid Task Rejection

*For any* string composed entirely of whitespace characters (including the empty string), calling `_addTask(text)` SHALL leave the task list length unchanged.

**Validates: Requirements 3.3**

---

### Property 11: Task Rendering Completeness

*For any* array of Task objects, after calling `_render()`, each task SHALL be represented in the DOM with a completion toggle element, an edit control element, and a delete control element.

**Validates: Requirements 3.4**

---

### Property 12: Task Completion Toggle Round-Trip

*For any* task with any initial `completed` value, calling `_toggleTask(id)` SHALL flip `completed` to its opposite value. Calling `_toggleTask(id)` twice in succession SHALL restore `completed` to its original value.

**Validates: Requirements 3.5**

---

### Property 13: Valid Task Edit

*For any* task and any non-empty, non-whitespace-only string `newText`, calling `_confirmEdit(id, newText)` SHALL update the task's `text` to the trimmed value of `newText`.

**Validates: Requirements 3.6**

---

### Property 14: Invalid Task Edit Rejection

*For any* task with original text `originalText` and any whitespace-only string `badText`, calling `_confirmEdit(id, badText)` SHALL leave the task's `text` equal to `originalText`.

**Validates: Requirements 3.7**

---

### Property 15: Task Deletion

*For any* task list containing a task with id `targetId`, calling `_deleteTask(targetId)` SHALL result in no task with id `targetId` remaining in the list, and all other tasks SHALL remain unchanged.

**Validates: Requirements 3.8**

---

### Property 16: Task Persistence Round-Trip

*For any* sequence of task mutations (add, edit, toggle, delete), after each mutation the value returned by `StorageService.load('tld_tasks')` SHALL be deeply equal to the current in-memory task array. Furthermore, calling `init()` after saving SHALL restore the task array to the saved state.

**Validates: Requirements 3.9, 3.10**

---

### Property 17: Valid Link Addition

*For any* non-empty label string of length ≤ 100 characters and any URL string beginning with `http://` or `https://`, calling `_addLink(label, url)` SHALL increase the link list length by exactly 1, and the new link SHALL have the correct label and url values.

**Validates: Requirements 4.2**

---

### Property 18: Invalid Link Rejection

*For any* combination of inputs where the label is empty/whitespace-only OR the URL does not begin with `http://` or `https://`, calling `_addLink(label, url)` SHALL leave the link list length unchanged.

**Validates: Requirements 4.3**

---

### Property 19: Link Deletion

*For any* link list containing a link with id `targetId`, calling `_deleteLink(targetId)` SHALL result in no link with id `targetId` remaining in the list, and all other links SHALL remain unchanged.

**Validates: Requirements 4.5**

---

### Property 20: Link Persistence Round-Trip

*For any* sequence of link mutations (add, delete), after each mutation the value returned by `StorageService.load('tld_links')` SHALL be deeply equal to the current in-memory link array. Furthermore, calling `init()` after saving SHALL restore the link array to the saved state.

**Validates: Requirements 4.6, 4.7**

---

### Property 21: JSON Serialization Round-Trip

*For any* array of Task or Link objects, `StorageService.save(key, data)` followed by `StorageService.load(key)` SHALL return an array deeply equal to the original input.

**Validates: Requirements 5.3, 5.4**

---

### Property 22: Storage Fallback on Error

*For any* string that is not valid JSON (including the empty string, `null`, `undefined`, and malformed JSON), `StorageService.load(key)` SHALL return an empty array `[]` without throwing an exception.

**Validates: Requirements 5.5**

---

## Error Handling

### localStorage Unavailability

`localStorage` can be unavailable in private/incognito mode in some browsers, or when storage quota is exceeded. `StorageService` wraps all reads and writes in `try/catch` blocks:

- **Read failure**: returns `[]` — the application starts with empty state.
- **Write failure**: silently swallowed — the in-memory state remains correct for the current session; the user is not notified (acceptable for a personal productivity tool).

### Invalid Stored Data

If `localStorage` contains a value that is not valid JSON (e.g., corrupted by a third-party extension), `JSON.parse` will throw. `StorageService.load` catches this and returns `[]`, preventing a crash on startup.

### Timer Edge Cases

- **Reaching 00:00**: The `_tick()` function checks `remaining <= 0` before decrementing to avoid negative values. The interval is cleared immediately.
- **AudioContext unavailability**: The alert function checks `typeof AudioContext !== 'undefined'` before attempting to create a beep. If unavailable, only the visual indicator is shown.
- **Multiple intervals**: `_start()` checks `status === 'RUNNING'` and returns early, preventing `setInterval` from being called twice.

### Input Validation

- **Task text**: trimmed before validation; empty or whitespace-only strings are rejected with focus retained on the input field.
- **Link label**: trimmed before validation; empty or whitespace-only strings trigger an inline error message.
- **Link URL**: checked with a simple prefix test (`url.startsWith('http://') || url.startsWith('https://')`); invalid URLs trigger an inline error message.
- **Edit confirmation**: same validation as add; whitespace-only edits are discarded and the original text is restored.

### DOM Safety

All DOM queries use `getElementById` or `querySelector` with null checks. If an expected element is not found (e.g., due to a markup error), the widget logs a warning to the console and exits gracefully rather than throwing a `TypeError`.

---

## Testing Strategy

> **Note:** Per the project constraints, no test files are to be generated and no test setup is required. This section documents the intended testing approach for reference and future implementation.

### Overview

The application is a vanilla JavaScript SPA with no build tooling. The recommended testing approach uses a lightweight property-based testing library that can run directly in the browser or in Node.js without a bundler.

**Recommended library**: [fast-check](https://fast-check.dev/) (JavaScript/TypeScript property-based testing library). It can be loaded via a single `<script>` tag for in-browser testing or via `npm install fast-check` for Node.js.

### Unit Testing

Unit tests cover specific examples, edge cases, and error conditions for each widget's pure functions:

| Function | Test focus |
|---|---|
| `_formatTime(date)` | Midnight, noon, single-digit hours/minutes |
| `_formatDate(date)` | Leap year dates, month boundaries |
| `_getGreeting(hour)` | Boundary hours: 5, 12, 18, 21, 0, 4 |
| `_formatTime(s)` (timer) | 0, 1, 60, 1499, 1500 seconds |
| `_validate(text)` | Empty string, spaces only, tabs, valid text |
| `_validateUrl(url)` | http://, https://, ftp://, empty, no protocol |
| `StorageService.load` | Missing key, null value, invalid JSON, valid JSON |

### Property-Based Testing

Property tests use fast-check to verify the correctness properties defined above. Each test runs a minimum of **100 iterations**.

**Tag format for each test:**
```
// Feature: todo-list-life-dashboard, Property N: <property_text>
```

**Key arbitraries (generators) needed:**

```javascript
// Random Date in a wide range
fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })

// Random hour in [0, 23]
fc.integer({ min: 0, max: 23 })

// Random valid task text (non-empty, non-whitespace, ≤500 chars)
fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)

// Random whitespace-only string
fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'))

// Random valid URL
fc.oneof(
  fc.webUrl().filter(u => u.startsWith('http://') || u.startsWith('https://'))
)

// Random Task object
fc.record({
  id: fc.hexaString({ minLength: 8, maxLength: 12 }),
  text: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  completed: fc.boolean()
})

// Random array of Task objects
fc.array(taskArbitrary, { minLength: 0, maxLength: 50 })
```

**Property test structure example:**

```javascript
// Feature: todo-list-life-dashboard, Property 3: Greeting mapping correctness
fc.assert(
  fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
    const greeting = GreetingWidget._getGreeting(hour);
    if (hour >= 5 && hour <= 11) return greeting === 'Good Morning';
    if (hour >= 12 && hour <= 17) return greeting === 'Good Afternoon';
    if (hour >= 18 && hour <= 20) return greeting === 'Good Evening';
    return greeting === 'Good Night'; // 21-23 and 0-4
  }),
  { numRuns: 100 }
);
```

### Integration Testing

Integration tests verify that widgets interact correctly with `localStorage`:

- Save tasks → reload page (or re-call `init()`) → verify tasks restored (Property 16)
- Save links → reload → verify links restored (Property 20)
- Corrupt `localStorage` value → call `init()` → verify empty state, no crash (Property 22)

### What Is Not Tested Automatically

The following require manual verification:

- **Cross-browser rendering** (Requirement 7.1): test in Chrome, Firefox, Edge, Safari
- **Responsive layout** (Requirement 7.3): resize viewport from 320px to 1920px
- **Audible alert** (Requirement 2.6): verify beep plays when timer reaches 00:00
- **Visual alert duration** (Requirement 2.6): verify indicator displays for ≥3 seconds
- **New tab behavior** (Requirement 4.4): verify links open in new tab
- **Project file structure** (Requirement 6): verify exactly one HTML, CSS, JS file
