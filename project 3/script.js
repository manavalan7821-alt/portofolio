
"use strict";

// ===== 1. Select DOM elements =====
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const formMessage = document.querySelector("#form-message");
const taskSummary = document.querySelector("#task-summary");
const totalCount = document.querySelector("#total-count");
const activeCount = document.querySelector("#active-count");
const completedCount = document.querySelector("#completed-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const storageWarning = document.querySelector("#storage-warning");
const filterButtons = document.querySelectorAll("[data-filter]");

const STORAGE_KEY = "taskflow-tasks-v1";

// ===== 2. Application state =====
let tasks = [];
let currentFilter = "all";
let storageAvailable = true;

// ===== 3. Load saved tasks =====
try {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (savedTasks !== null) {
    const parsedTasks = JSON.parse(savedTasks);

    if (Array.isArray(parsedTasks)) {
      // Validate stored data before using it.
      tasks = parsedTasks.filter((task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean"
      );
    }
  }
} catch (error) {
  storageAvailable = false;
  console.warn("Could not load saved tasks:", error);
}

// ===== 4. Persist state =====
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
    console.warn("Could not save tasks:", error);
  }

  storageWarning.hidden = storageAvailable;
}

// ===== 5. Create a unique task ID =====
function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ===== 6. Create a task =====
function addTask(title) {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    formMessage.textContent = "Please enter a task first.";
    taskInput.focus();
    return;
  }

  const task = {
    id: createId(),
    title: cleanTitle,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  saveTasks();

  currentFilter = "all";
  updateFilterButtons();
  renderTasks();

  formMessage.textContent = "Task added successfully.";
  taskInput.value = "";
  taskInput.focus();
}

// ===== 7. Update a task =====
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  const newTitle = window.prompt("Edit your task:", task.title);

  // Cancel means no changes.
  if (newTitle === null) return;

  const cleanTitle = newTitle.trim();

  if (!cleanTitle) {
    window.alert("Task name cannot be empty.");
    return;
  }

  if (cleanTitle.length > 200) {
    window.alert("Task name must be 200 characters or fewer.");
    return;
  }

  tasks = tasks.map((item) =>
    item.id === id ? { ...item, title: cleanTitle } : item
  );

  saveTasks();
  renderTasks();
}

// ===== 8. Delete tasks =====
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);

  saveTasks();
  renderTasks();
}

// ===== 9. Render tasks dynamically =====
function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.id = task.id;

    if (task.completed) {
      item.classList.add("is-completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("span");
    meta.className = "task-meta";
    meta.textContent = task.completed ? "Completed" : "In progress";

    content.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-button";
    editButton.dataset.action = "edit";
    editButton.textContent = "✎";
    editButton.setAttribute("aria-label", `Edit ${task.title}`);
    editButton.title = "Edit task";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-button delete";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.title = "Delete task";

    actions.append(editButton, deleteButton);
    item.append(checkbox, content, actions);
    taskList.append(item);
  });

  // Update counts from the complete state, not the filtered list.
  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.length - completed;

  totalCount.textContent = String(tasks.length);
  activeCount.textContent = String(active);
  completedCount.textContent = String(completed);
  taskSummary.textContent =
    `${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"}`;

  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;

  if (tasks.length === 0) {
    emptyTitle.textContent = "Nothing on your list yet";
    emptyDescription.textContent = "Add your first task and get moving.";
  } else if (visibleTasks.length === 0 && currentFilter === "active") {
    emptyTitle.textContent = "All caught up!";
    emptyDescription.textContent = "There are no active tasks.";
  } else if (visibleTasks.length === 0) {
    emptyTitle.textContent = "No completed tasks yet";
    emptyDescription.textContent = "Complete a task and it will appear here.";
  }

  clearCompletedButton.disabled = completed === 0;
  storageWarning.hidden = storageAvailable;
}

// ===== 10. Delegated task events =====
// One listener handles clicks on all dynamically created task buttons.
taskList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button || !taskList.contains(button)) return;

  const item = button.closest(".task-item");
  if (!item) return;

  const { id } = item.dataset;

  switch (button.dataset.action) {
    case "edit":
      editTask(id);
      break;

    case "delete":
      deleteTask(id);
      break;
  }
});

// A separate delegated change listener handles checkboxes.
taskList.addEventListener("change", (event) => {
  const checkbox = event.target.closest('[data-action="toggle"]');

  if (!checkbox || !taskList.contains(checkbox)) return;

  const item = checkbox.closest(".task-item");
  if (!item) return;

  toggleTask(item.dataset.id);
});

// ===== 11. Form submission =====
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

// Clear an old validation message while typing.
taskInput.addEventListener("input", () => {
  formMessage.textContent = "";
});

// ===== 12. Filtering =====
function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    renderTasks();
  });
});

// ===== 13. Clear completed =====
clearCompletedButton.addEventListener("click", () => {
  if (!tasks.some((task) => task.completed)) return;

  const confirmed = window.confirm(
    "Delete all completed tasks? This cannot be undone."
  );

  if (confirmed) {
    clearCompletedTasks();
  }
});

// ===== 14. Initialize application =====
saveTasks();
renderTasks();
updateFilterButtons();
