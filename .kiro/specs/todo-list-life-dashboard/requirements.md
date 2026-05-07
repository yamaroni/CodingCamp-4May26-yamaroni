# Requirements Document

## Introduction

The Todo List Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a real-time greeting with the current date and time, a Pomodoro-style focus timer, a persistent to-do list, and a quick-access links panel — all in a single, clean HTML page. The application requires no backend server; all data is stored in the browser's Local Storage. It can be used as a standalone web page or packaged as a browser extension.

The project follows a strict single-file-per-type structure: one HTML file, one CSS file (`css/style.css`), and one JavaScript file (`js/app.js`).

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The UI section that implements a 25-minute countdown timer with start, stop, and reset controls.
- **Todo_List**: The UI section that manages a collection of user-defined tasks.
- **Task**: A single item in the Todo_List, consisting of a text description and a completion status.
- **Quick_Links**: The UI section that displays user-defined shortcut buttons that open external URLs.
- **Link**: A single item in the Quick_Links section, consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for client-side data persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their current stable release.

---

## Requirements

### Requirement 1: Real-Time Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I have an immediate sense of the time of day without checking another app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every second.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 2 June 2025").
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the local hour is between 18:00 and 20:59, THE Greeting_Widget SHALL display the message "Good Evening".
6. WHEN the local hour is between 21:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Night".
7. THE Greeting_Widget SHALL update the greeting message automatically when the local hour changes, without requiring a page reload.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and restore the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visual or audible signal to notify the user that the session has ended.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format.
8. IF the user activates the start control while the Focus_Timer is already counting down, THEN THE Focus_Timer SHALL ignore the duplicate activation and continue the current countdown unchanged.

---

### Requirement 3: To-Do List Management

**User Story:** As a user, I want to add, edit, mark as done, and delete tasks in a persistent to-do list, so that I can track my daily responsibilities across browser sessions.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and a submission control that allows the user to add a new Task.
2. WHEN the user submits a non-empty input, THE Todo_List SHALL append the new Task to the list and clear the input field.
3. IF the user attempts to submit an empty or whitespace-only input, THEN THE Todo_List SHALL not create a Task and SHALL retain focus on the input field.
4. THE Todo_List SHALL display each Task with a completion toggle, an edit control, and a delete control.
5. WHEN the user activates the completion toggle for a Task, THE Todo_List SHALL update the Task's completion status and apply a visual distinction (e.g., strikethrough text) to completed Tasks.
6. WHEN the user activates the edit control for a Task, THE Todo_List SHALL allow the user to modify the Task's text inline and save the change upon confirmation.
7. IF the user saves an edit with empty or whitespace-only text, THEN THE Todo_List SHALL discard the edit and restore the original Task text.
8. WHEN the user activates the delete control for a Task, THE Todo_List SHALL remove the Task from the list permanently.
9. THE Todo_List SHALL persist all Tasks (text and completion status) to Local_Storage after every add, edit, complete, or delete operation.
10. WHEN the Dashboard loads, THE Todo_List SHALL restore all previously saved Tasks from Local_Storage and display them in their last-saved order and completion state.

---

### Requirement 4: Quick Links Management

**User Story:** As a user, I want to save and access shortcut buttons for my favourite websites, so that I can open them quickly without typing URLs.

#### Acceptance Criteria

1. THE Quick_Links section SHALL provide an input field for a link label and an input field for a URL, along with a submission control to add a new Link.
2. WHEN the user submits a non-empty label and a valid URL, THE Quick_Links section SHALL add a new shortcut button to the panel.
3. IF the user attempts to submit with an empty label or an empty URL, THEN THE Quick_Links section SHALL not create a Link and SHALL indicate which field requires input.
4. WHEN the user activates a shortcut button, THE Quick_Links section SHALL open the associated URL in a new browser tab.
5. THE Quick_Links section SHALL provide a delete control for each Link that permanently removes it from the panel.
6. THE Quick_Links section SHALL persist all Links (label and URL) to Local_Storage after every add or delete operation.
7. WHEN the Dashboard loads, THE Quick_Links section SHALL restore all previously saved Links from Local_Storage and render them as shortcut buttons.

---

### Requirement 5: Client-Side Data Persistence

**User Story:** As a user, I want my tasks and quick links to survive page refreshes and browser restarts, so that I do not lose my data between sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL store all Task data under a dedicated Local_Storage key (e.g., `tld_tasks`).
2. THE Dashboard SHALL store all Link data under a dedicated Local_Storage key (e.g., `tld_links`).
3. THE Dashboard SHALL serialise Task and Link collections as JSON strings before writing to Local_Storage.
4. WHEN reading from Local_Storage, THE Dashboard SHALL deserialise the JSON string back into the corresponding data structure before use.
5. IF Local_Storage is unavailable or returns a parse error, THEN THE Dashboard SHALL initialise the affected data collection as empty and continue operating without crashing.

---

### Requirement 6: Single-File Project Structure

**User Story:** As a developer, I want the project to follow a strict single-file-per-type structure, so that the codebase remains simple and easy to maintain.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented in exactly one HTML file at the project root.
2. THE Dashboard SHALL use exactly one CSS file located at `css/style.css`.
3. THE Dashboard SHALL use exactly one JavaScript file located at `js/app.js`.
4. THE Dashboard SHALL not depend on any external JavaScript frameworks or libraries (e.g., React, Vue, jQuery).
5. THE Dashboard SHALL not require a backend server or build step to run.

---

### Requirement 7: Browser Compatibility and Responsiveness

**User Story:** As a user, I want the Dashboard to work correctly in any modern browser and adapt to different screen sizes, so that I can use it on desktop or laptop without compatibility issues.

#### Acceptance Criteria

1. THE Dashboard SHALL render and function correctly in the current stable release of Chrome, Firefox, Edge, and Safari.
2. THE Dashboard SHALL use only standard Web APIs available in Modern_Browser without polyfills.
3. THE Dashboard SHALL apply a responsive layout so that all four widgets remain usable on viewport widths from 320 px to 1920 px.
4. THE Dashboard SHALL maintain readable typography and clear visual hierarchy across all supported viewport widths.
