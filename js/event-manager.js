/* Event Manager
 *
 * The weekend calendar of hackathon events, and the shared calendar helpers
 * the other pages use (exposed at the bottom as window.EventCalendarAPI).
 * Must load before shift-manager.js and team-finder.js.
 *
 * Interactions: drag on empty time to create an event, drag an event to move
 * it, drag its top or bottom edge to resize, Alt+arrow keys to nudge a
 * focused event, click an event for its detail popover (edit / delete).
 * Events are saved to localStorage under STORAGE_KEY.
 */


/* ── Settings ────────────────────────────────────────────────────────── */
const START_HOUR = 0;
const END_HOUR = 24;
const MINUTES_IN_VIEW = (END_HOUR - START_HOUR) * 60;
const STORAGE_KEY = "uofthacks-event-schedule-v2";
const BASE_WEEKEND_START = new Date(2027, 0, 22);
const DEMO_TODAY = new Date(2027, 0, 22);
const DEFAULT_SCROLL_HOUR = 8;
const MIN_EVENT_DURATION = 15;
const RESIZE_EDGE_PX = 8;

/* ─────────────────────────────────────────────────────────
 * EVENT DETAIL ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each value is ms after event selection.
 *
 *    0ms   complete popover fades and scales in from its anchor
 *  160ms   popover reaches its resting state
 *  120ms   closing popover fades and scales toward its anchor
 * ───────────────────────────────────────────────────────── */
const DETAIL_TIMING = {
  cardAppear: 0,      // complete popover appears as one unit
  closeDuration: 120, // popover finishes its exit before closing
};

const DETAIL_POPOVER = {
  gap: 12,            // space between the event and popover
  viewportMargin: 12, // minimum distance from the viewport edge
};

/* ── Sample events (replace with API data) ───────────────────────────── */
const seedEvents = [
  {
    id: "registration",
    name: "Registration",
    description: "Attendee check-in and badge pickup.",
    location: "Myhal Lobby",
    day: 0,
    start: 9 * 60,
    duration: 60,
    type: "Ceremony",
    shift: "Organizers",
    notes: "Arrive 15 minutes early, wear your volunteer badge, and help guide attendees to seating.",
  },
  {
    id: "opening",
    name: "Opening Ceremony",
    description: "Welcome, event overview, and key announcements.",
    location: "Myhal 150",
    day: 0,
    start: 11 * 60,
    duration: 120,
    type: "Ceremony",
    shift: "Organizers",
    notes: "Quiet zones near the stage — keep phone use to a minimum during speeches.",
  },
  {
    id: "team-forming",
    name: "Team Formation",
    description: "Meet hackers and find your team.",
    location: "Myhal Atrium",
    day: 1,
    start: 9 * 60,
    duration: 90,
    type: "Social",
    shift: "Mentors",
    notes: "Help with crowd flow and wayfinding. Escalate issues to a Shift Manager.",
  },
  {
    id: "keynote-speaker",
    name: "Keynote Speaker",
    description: "Opening keynote from our featured industry speaker.",
    location: "Myhal 150",
    day: 1,
    start: 10 * 60 + 30,
    duration: 60,
    type: "Ceremony",
    shift: "Organizers",
    notes: "Reserve front rows for sponsors and speakers. Doors open 15 minutes early.",
  },
  {
    id: "workshop",
    name: "Sponsor Workshop",
    description: "Build with our sponsor APIs and get technical support.",
    location: "Myhal 320",
    day: 1,
    start: 12 * 60,
    duration: 180,
    type: "Workshop",
    shift: "Mentors",
  },
  {
    id: "mentor-sessions",
    name: "Mentor Sessions",
    description: "Drop-in 1:1 time with mentors for project guidance.",
    location: "Myhal Atrium",
    day: 1,
    start: 15 * 60 + 30,
    duration: 90,
    type: "Workshop",
    shift: "Mentors",
    notes: "Sign-up sheet at the mentor booth — first come, first served.",
  },
  {
    id: "brunch",
    name: "Hacker Brunch",
    description: "Take a break and refuel.",
    location: "Myhal 150",
    day: 2,
    start: 10 * 60,
    duration: 60,
    type: "Food",
    shift: "Volunteers",
  },
  {
    id: "submission",
    name: "Project Submission",
    description: "Final Devpost submission deadline.",
    location: "Online",
    day: 2,
    start: 12 * 60,
    duration: 30,
    type: "Ceremony",
    shift: "Organizers",
  },
];

/* ── State ───────────────────────────────────────────────────────────── */
const state = {
  weekendStart: new Date(BASE_WEEKEND_START),
  dayCount: 3,
  events: loadEvents(),
  editingId: null,
  filters: new Set(["Ceremony", "Food", "Workshop", "Social"]),
  drag: null,
  createDrag: null,
  suppressClick: false,
  viewingId: null,
  detailAnchor: null,
  detailTimers: [],
  didInitialScroll: false,
};

/* ── DOM references ──────────────────────────────────────────────────── */
const calendarGrid = document.querySelector("#calendar-grid");
const calendar = document.querySelector("#calendar");
const dayHeaders = document.querySelector("#day-headers");
const timeAxis = document.querySelector("#time-axis");
const monthLabel = document.querySelector("#month-label");
const monthLabelText = document.querySelector("#month-label-text");
const miniCalendar = document.querySelector("#mini-calendar");
const miniCalendarTitle = document.querySelector("#mini-calendar-title");
const miniCalendarWeekdays = document.querySelector("#mini-calendar-weekdays");
const miniCalendarGrid = document.querySelector("#mini-calendar-grid");
const dialog = document.querySelector("#event-dialog");
const form = document.querySelector("#event-form");
const descriptionInput = form.elements.description;
const notesInput = form.elements.notes;
const daySelect = document.querySelector("#day-select");
const deleteButton = document.querySelector("#delete-button");
const submitButton = document.querySelector("#submit-button");
const dialogTitle = document.querySelector("#dialog-title");
const filterMenu = document.querySelector("#filter-menu");
const filterButton = document.querySelector("#filter-button");
const toast = document.querySelector("#toast");
const detailDialog = document.querySelector("#event-detail-dialog");
const detailBackdrop = document.querySelector("#event-detail-backdrop");
const detailTitle = document.querySelector("#detail-title");
const detailDatetime = document.querySelector("#detail-datetime");
const detailLocation = document.querySelector("#detail-location");
const detailDescription = document.querySelector("#detail-description");
const detailTags = document.querySelector("#detail-tags");
const detailCloseButton = document.querySelector("#detail-close");
const typeMultiSelect = document.querySelector("#type-multi-select");
const typeTrigger = document.querySelector("#type-trigger");
const typeMenu = document.querySelector("#type-menu");
const typeTags = document.querySelector("#type-tags");
const typePlaceholder = document.querySelector("#type-placeholder");
const shiftMultiSelect = document.querySelector("#shift-multi-select");
const shiftTrigger = document.querySelector("#shift-trigger");
const shiftMenu = document.querySelector("#shift-menu");
const shiftTags = document.querySelector("#shift-tags");
const shiftPlaceholder = document.querySelector("#shift-placeholder");

/* ── Loading, saving and filtering events ────────────────────────────── */
function normalizeEvent(event) {
  const types = Array.isArray(event.types) && event.types.length
    ? [...event.types]
    : [event.type || "Ceremony"];
  const shifts = (Array.isArray(event.shifts) && event.shifts.length
    ? [...event.shifts]
    : event.shift ? [event.shift] : []
  ).filter((shift) => shift && shift !== "Unassigned");
  return {
    ...event,
    types,
    type: types[0],
    shifts,
    shift: shifts[0] ?? "",
    notes: typeof event.notes === "string" ? event.notes : "",
    date: event.date ?? dateKey(addDays(BASE_WEEKEND_START, event.day ?? 0)),
  };
}

function loadEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const source = Array.isArray(stored) ? stored : seedEvents;
    return source.map(normalizeEvent);
  } catch {
    return seedEvents.map(normalizeEvent);
  }
}

function eventTypes(event) {
  return event.types?.length ? event.types : [event.type];
}

function eventShifts(event) {
  const shifts = event.shifts?.length
    ? event.shifts
    : event.shift ? [event.shift] : [];
  return shifts.filter((shift) => shift && shift !== "Unassigned");
}

function eventMatchesFilters(event) {
  return eventTypes(event).some((type) => state.filters.has(type));
}

const eventChangeListeners = new Set();

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  eventChangeListeners.forEach((listener) => listener(state.events));
}

/* ── Date and time helpers ───────────────────────────────────────────── */
function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function startOfUpcomingFriday(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysUntilFriday = (5 - copy.getDay() + 7) % 7;
  copy.setDate(copy.getDate() + daysUntilFriday);
  return copy;
}

function formatDay(date) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    day: "numeric",
  }).format(date);
}

function formatFullDay(date) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDetailDay(date) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonthAbbrev(date) {
  const month = new Intl.DateTimeFormat("en-CA", { month: "short" }).format(date);
  return `${month}. ${date.getFullYear()}`;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayIndexForDate(value) {
  for (let day = 0; day < state.dayCount; day += 1) {
    if (dateKey(addDays(state.weekendStart, day)) === value) return day;
  }
  return -1;
}

function minutesToTime(minutes) {
  const total = Math.min(START_HOUR * 60 + minutes, 23 * 60 + 59);
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function timeToMinutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute - START_HOUR * 60;
}

function displayTime(minutes) {
  const total = START_HOUR * 60 + minutes;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const period = hour >= 12 ? "PM" : "AM";
  const clockHour = hour % 12 || 12;
  return `${clockHour}:${String(minute).padStart(2, "0")} ${period}`;
}

/* ── Rendering the calendar ──────────────────────────────────────────── */
function render() {
  calendar.dataset.dayCount = String(state.dayCount);
  calendar.style.setProperty("--day-count", String(state.dayCount));
  renderHeaders();
  renderTimeAxis();
  renderEvents();
  scrollCalendarToDefaultHour();
}

function scrollCalendarToDefaultHour() {
  if (state.didInitialScroll) return;
  const scrollArea = document.querySelector(".calendar-scroll");
  if (!scrollArea) return;
  requestAnimationFrame(() => {
    if (!calendarGrid.offsetHeight) return;
    scrollArea.scrollTop =
      (DEFAULT_SCROLL_HOUR / (END_HOUR - START_HOUR)) * calendarGrid.offsetHeight;
    state.didInitialScroll = true;
  });
}

function renderHeaders() {
  monthLabelText.textContent = formatMonthAbbrev(state.weekendStart);
  dayHeaders.replaceChildren();
  daySelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select date";
  placeholder.disabled = true;
  placeholder.hidden = true;
  daySelect.append(placeholder);

  for (let day = 0; day < state.dayCount; day += 1) {
    const date = addDays(state.weekendStart, day);
    const header = document.createElement("div");
    header.className = "day-header";
    if (isSameDate(date, DEMO_TODAY)) header.classList.add("is-today");
    const label = document.createElement("span");
    label.textContent = formatDay(date);
    header.append(label);
    dayHeaders.append(header);

    const option = document.createElement("option");
    option.value = String(day);
    option.textContent = formatFullDay(date);
    daySelect.append(option);
  }
}

function renderTimeAxis() {
  timeAxis.replaceChildren();
  for (let hour = START_HOUR + 1; hour < END_HOUR; hour += 1) {
    const label = document.createElement("div");
    label.className = "time-label";
    label.style.top = `calc(var(--row-height) * ${hour - START_HOUR})`;
    const clockHour = hour % 12 || 12;
    const period = hour < 12 ? "AM" : "PM";
    label.textContent = `${clockHour} ${period}`;
    timeAxis.append(label);
  }
}

function renderEvents() {
  calendarGrid.replaceChildren();
  const calendarEvents = state.events
    .map((event) => ({ event, day: dayIndexForDate(event.date) }))
    .filter(({ day }) => day !== -1);
  const layouts = calculateEventLayouts(
    calendarEvents.filter(({ event }) => eventMatchesFilters(event)),
  );

  calendarEvents.forEach(({ event, day }) => {
    const types = eventTypes(event);
    const layout = layouts.get(event.id) ?? { column: 0, columnCount: 1 };
    const node = document.querySelector("#event-template").content.firstElementChild.cloneNode(true);
    node.dataset.id = event.id;
    node.dataset.type = event.type;
    node.dataset.column = String(layout.column);
    node.dataset.columnCount = String(layout.columnCount);
    node.setAttribute(
      "aria-label",
      `${event.name}, ${types.join(", ")}, ${formatFullDay(addDays(state.weekendStart, day))}, ${displayTime(event.start)} to ${displayTime(event.start + event.duration)}. Click for details. Drag middle to move, drag top or bottom edge to resize. Use Alt plus arrow keys to reschedule.`,
    );
    node.classList.toggle("is-compact", event.duration <= 45);
    node.querySelector("strong").textContent = event.name;
    node.querySelector(".event-location").textContent = event.location || "Location TBD";
    ["start", "end"].forEach((edge) => {
      const handle = document.createElement("span");
      handle.className = "event-resize-handle";
      handle.dataset.edge = edge;
      handle.setAttribute("aria-hidden", "true");
      node.append(handle);
    });
    positionEvent(node, day, event.start, event.duration, layout);
    node.classList.toggle("is-hidden", !eventMatchesFilters(event));
    node.addEventListener("pointerdown", beginDrag);
    node.addEventListener("pointermove", updateEventHoverCursor);
    node.addEventListener("pointerleave", clearEventHoverCursor);
    node.addEventListener("keydown", (keyboardEvent) => handleEventKeyDown(keyboardEvent, event));
    node.addEventListener("click", () => {
      if (state.suppressClick) return;
      openEventDetails(event, node);
    });
    calendarGrid.append(node);
  });
}

function calculateEventLayouts(calendarEvents) {
  const layouts = new Map();

  for (let day = 0; day < state.dayCount; day += 1) {
    const events = calendarEvents
      .filter((item) => item.day === day)
      .sort((a, b) => a.event.start - b.event.start || b.event.duration - a.event.duration);
    let group = [];
    let groupEnd = -1;

    const commitGroup = () => {
      if (!group.length) return;
      let active = [];
      let columnCount = 1;
      const assignments = [];

      group.forEach((item) => {
        active = active.filter((entry) => entry.end > item.event.start);
        const occupied = new Set(active.map((entry) => entry.column));
        let column = 0;
        while (occupied.has(column)) column += 1;
        active.push({
          column,
          end: item.event.start + item.event.duration,
        });
        columnCount = Math.max(columnCount, active.length, column + 1);
        assignments.push({ id: item.event.id, column });
      });

      assignments.forEach(({ id, column }) => {
        layouts.set(id, { column, columnCount });
      });
    };

    events.forEach((item) => {
      if (group.length && item.event.start >= groupEnd) {
        commitGroup();
        group = [];
        groupEnd = -1;
      }
      group.push(item);
      groupEnd = Math.max(groupEnd, item.event.start + item.event.duration);
    });
    commitGroup();
  }

  return layouts;
}

function positionEvent(node, day, start, duration, layout = { column: 0, columnCount: 1 }) {
  const dayWidth = 100 / state.dayCount;
  const eventWidth = dayWidth / layout.columnCount;
  const eventLeft = day * dayWidth + layout.column * eventWidth;
  node.style.left = `calc(${eventLeft}% + 2px)`;
  node.style.width = `calc(${eventWidth}% - 4px)`;
  node.style.top = `${(start / MINUTES_IN_VIEW) * 100}%`;
  node.style.height = `max(31px, calc(${(duration / MINUTES_IN_VIEW) * 100}% - 4px))`;
}

function handleEventKeyDown(keyboardEvent, event) {
  if (!keyboardEvent.altKey || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(keyboardEvent.key)) {
    return;
  }
  keyboardEvent.preventDefault();

  let targetDay = dayIndexForDate(event.date);
  let targetStart = event.start;
  if (keyboardEvent.key === "ArrowUp") targetStart -= 15;
  if (keyboardEvent.key === "ArrowDown") targetStart += 15;
  if (keyboardEvent.key === "ArrowLeft") targetDay -= 1;
  if (keyboardEvent.key === "ArrowRight") targetDay += 1;

  const candidate = {
    ...event,
    date: dateKey(addDays(state.weekendStart, targetDay)),
    start: targetStart,
  };
  const outsideSchedule = targetDay < 0
    || targetDay >= state.dayCount
    || targetStart < 0
    || targetStart + candidate.duration > MINUTES_IN_VIEW;
  if (outsideSchedule) {
    showToast("Event is already at the schedule boundary");
    return;
  }

  Object.assign(event, candidate);
  saveEvents();
  render();
  showToast(`Moved to ${formatDay(addDays(state.weekendStart, targetDay))}, ${displayTime(targetStart)}`);
  requestAnimationFrame(() => {
    calendarGrid.querySelector(`[data-id="${event.id}"]`)?.focus();
  });
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/* ── Event detail popover ────────────────────────────────────────────── */
function clearDetailTimers() {
  state.detailTimers.forEach((timer) => clearTimeout(timer));
  state.detailTimers = [];
}

function setDetailStage(stage) {
  detailDialog.dataset.stage = String(stage);
}

function positionDetailPopover(sourceNode) {
  if (!sourceNode?.isConnected || !detailDialog.open) return;

  const anchor = sourceNode.getBoundingClientRect();
  const width = detailDialog.offsetWidth;
  const height = detailDialog.offsetHeight;
  const { gap, viewportMargin } = DETAIL_POPOVER;
  const maxX = window.innerWidth - width - viewportMargin;
  const maxY = window.innerHeight - height - viewportMargin;
  const clampX = (value) => Math.max(viewportMargin, Math.min(maxX, value));
  const clampY = (value) => Math.max(viewportMargin, Math.min(maxY, value));

  const candidates = [
    {
      placement: "right",
      x: anchor.right + gap,
      y: clampY(anchor.top),
      fits: anchor.right + gap + width <= window.innerWidth - viewportMargin,
    },
    {
      placement: "left",
      x: anchor.left - width - gap,
      y: clampY(anchor.top),
      fits: anchor.left - width - gap >= viewportMargin,
    },
    {
      placement: "bottom",
      x: clampX(anchor.left),
      y: anchor.bottom + gap,
      fits: anchor.bottom + gap + height <= window.innerHeight - viewportMargin,
    },
    {
      placement: "top",
      x: clampX(anchor.left),
      y: anchor.top - height - gap,
      fits: anchor.top - height - gap >= viewportMargin,
    },
  ];

  const position = candidates.find((candidate) => candidate.fits) ?? {
    placement: "bottom",
    x: clampX(anchor.left),
    y: clampY(anchor.bottom + gap),
  };

  detailDialog.style.left = `${position.x}px`;
  detailDialog.style.top = `${position.y}px`;
  detailDialog.dataset.placement = position.placement;
}

function openEventDetails(event, sourceNode, options = {}) {
  const readOnly = Boolean(options.readOnly);
  state.viewingId = event.id;
  state.detailAnchor = sourceNode;
  clearDetailTimers();
  detailDialog.classList.remove("is-closing");
  detailDialog.classList.toggle("is-readonly", readOnly);
  setDetailStage(0);

  const day = dayIndexForDate(event.date);
  const eventDate = day === -1 ? new Date(`${event.date}T12:00:00`) : addDays(state.weekendStart, day);
  detailTitle.textContent = event.name;
  detailDatetime.textContent =
    `${formatDetailDay(eventDate)}  ·  ${displayTime(event.start)} – ${displayTime(event.start + event.duration)}`;
  detailLocation.textContent = event.location || "Location TBD";
  detailDescription.textContent = event.description || "No description has been added for this event.";
  detailTags.replaceChildren();

  const tags = [
    ...eventTypes(event),
    ...eventShifts(event).map((shift) => `${shift} shift`),
  ].filter(Boolean);
  tags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "detail-tag";
    chip.textContent = tag;
    detailTags.append(chip);
  });

  if (!detailDialog.open) detailDialog.show();
  if (detailBackdrop) detailBackdrop.hidden = false;
  detailDialog.focus({ preventScroll: true });
  positionDetailPopover(sourceNode);

  requestAnimationFrame(() => {
    state.detailTimers.push(
      setTimeout(() => setDetailStage(1), DETAIL_TIMING.cardAppear),
    );
  });
}

function closeEventDetails(onClosed) {
  if (!detailDialog.open || detailDialog.classList.contains("is-closing")) return;
  clearDetailTimers();
  detailDialog.classList.add("is-closing");
  if (detailBackdrop) detailBackdrop.hidden = true;
  state.detailTimers.push(setTimeout(() => {
    detailDialog.close();
    detailDialog.classList.remove("is-closing", "is-readonly");
    setDetailStage(0);
    state.viewingId = null;
    state.detailAnchor = null;
    onClosed?.();
  }, DETAIL_TIMING.closeDuration));
}

function editViewedEvent() {
  const event = state.events.find((item) => item.id === state.viewingId);
  if (!event) return;
  closeEventDetails(() => openDialog(event));
}

function deleteViewedEvent() {
  const event = state.events.find((item) => item.id === state.viewingId);
  if (!event) return;
  state.events = state.events.filter((item) => item.id !== event.id);
  saveEvents();
  closeEventDetails(() => {
    render();
    showToast("Event deleted");
  });
}

/* ── Type and shift multi-selects in the event form ──────────────────── */
function createMultiSelectControl(root, trigger, menu, tags, placeholder, fieldName) {
  return { root, trigger, menu, tags, placeholder, fieldName };
}

const typeControl = createMultiSelectControl(
  typeMultiSelect,
  typeTrigger,
  typeMenu,
  typeTags,
  typePlaceholder,
  "type",
);
const shiftControl = createMultiSelectControl(
  shiftMultiSelect,
  shiftTrigger,
  shiftMenu,
  shiftTags,
  shiftPlaceholder,
  "shift",
);
const multiSelectControls = [typeControl, shiftControl];

function getSelectedValues(control) {
  return [...control.menu.querySelectorAll(`input[name="${control.fieldName}"]:checked`)]
    .map((input) => input.value);
}

function renderMultiSelectTags(control) {
  const selected = getSelectedValues(control);
  control.tags.replaceChildren();
  control.placeholder.hidden = selected.length > 0;

  selected.forEach((value) => {
    const tag = document.createElement("span");
    tag.className = "type-tag";

    const label = document.createElement("span");
    label.textContent = value;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "type-tag-remove";
    remove.setAttribute("aria-label", `Remove ${value}`);
    remove.textContent = "×";
    remove.addEventListener("click", (clickEvent) => {
      clickEvent.stopPropagation();
      const input = [...control.menu.querySelectorAll(`input[name="${control.fieldName}"]`)]
        .find((option) => option.value === value);
      if (input) input.checked = false;
      renderMultiSelectTags(control);
    });

    tag.append(label, remove);
    control.tags.append(tag);
  });
}

function setSelectedValues(control, values) {
  const selected = new Set(values);
  control.menu.querySelectorAll(`input[name="${control.fieldName}"]`).forEach((input) => {
    input.checked = selected.has(input.value);
  });
  renderMultiSelectTags(control);
}

function closeMultiSelectMenu(control) {
  control.menu.hidden = true;
  control.trigger.setAttribute("aria-expanded", "false");
}

function closeAllMultiSelectMenus(except = null) {
  multiSelectControls.forEach((control) => {
    if (control !== except) closeMultiSelectMenu(control);
  });
}

function positionMultiSelectMenu(control) {
  if (control.menu.hidden) return;

  const triggerRect = control.trigger.getBoundingClientRect();
  const viewportPadding = 12;
  const menuGap = 8;

  control.menu.style.position = "fixed";
  control.menu.style.left = `${triggerRect.left}px`;
  control.menu.style.right = "auto";
  control.menu.style.width = `${triggerRect.width}px`;
  control.menu.style.bottom = "auto";

  const menuHeight = control.menu.offsetHeight;
  const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
  const canOpenAbove = triggerRect.top - viewportPadding >= menuHeight + menuGap;
  const top = menuHeight > spaceBelow && canOpenAbove
    ? triggerRect.top - menuHeight - menuGap
    : triggerRect.bottom + menuGap;
  control.menu.style.top = `${top}px`;
}

function toggleMultiSelectMenu(control) {
  const willOpen = control.menu.hidden;
  closeAllMultiSelectMenus(control);
  control.menu.hidden = !willOpen;
  control.trigger.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) positionMultiSelectMenu(control);
}

/* ── Create / edit event dialog ──────────────────────────────────────── */
function resizeAutoTextarea(input, minHeight = 44) {
  if (!input) return;
  input.style.height = `${minHeight}px`;
  input.style.height = `${Math.max(minHeight, input.scrollHeight + 2)}px`;
}

function resizeDescriptionInput() {
  resizeAutoTextarea(descriptionInput, 44);
}

function resizeNotesInput() {
  if (!notesInput) return;

  const styles = getComputedStyle(notesInput);
  const fontSize = Number.parseFloat(styles.fontSize) || 14;
  let lineHeight = Number.parseFloat(styles.lineHeight);
  if (!Number.isFinite(lineHeight)) lineHeight = fontSize * 1.45;
  const paddingY =
    Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
  const borderY =
    Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
  const singleLine = Math.ceil(lineHeight + paddingY + borderY);
  const twoLines = Math.ceil(lineHeight * 2 + paddingY + borderY);
  const threeLines = Math.ceil(lineHeight * 3 + paddingY + borderY);
  const minHeight = notesInput.value.trim() ? twoLines : singleLine;

  notesInput.style.height = "0px";
  const needed = notesInput.scrollHeight;
  notesInput.style.height = `${Math.min(threeLines, Math.max(minHeight, needed))}px`;
  notesInput.style.maxHeight = `${threeLines}px`;
}

function clearFieldErrors() {
  form.querySelectorAll("[data-field-error]").forEach((node) => {
    node.hidden = true;
    const text = node.querySelector(".field-error-text");
    if (text) text.textContent = "";
  });
}

function setFieldError(field, message) {
  clearFieldErrors();
  const node = form.querySelector(`[data-field-error="${field}"]`);
  if (!node) return;
  const text = node.querySelector(".field-error-text");
  if (text) text.textContent = message;
  node.hidden = false;
}

function openDialog(event = null, preset = {}) {
  state.editingId = event?.id ?? null;
  form.reset();
  clearFieldErrors();
  deleteButton.hidden = !event;
  dialogTitle.textContent = event ? "Event Details" : "Create a New Event";
  submitButton.textContent = event ? "Save Changes" : "Create Event";
  closeAllMultiSelectMenus();

  form.elements.name.value = event?.name ?? "";
  form.elements.description.value = event?.description ?? "";
  resizeDescriptionInput();
  form.elements.location.value = event?.location ?? "";
  const hasPresetDay = Number.isInteger(preset.day);
  const hasPresetTime = Number.isFinite(preset.start);
  form.elements.day.value = event
    ? String(dayIndexForDate(event.date))
    : hasPresetDay ? String(preset.day) : "";
  form.elements.start.value = event
    ? minutesToTime(event.start)
    : hasPresetTime ? minutesToTime(preset.start) : "";
  form.elements.end.value = event
    ? minutesToTime(event.start + event.duration)
    : hasPresetTime ? minutesToTime(preset.start + (preset.duration ?? 60)) : "";
  setSelectedValues(typeControl, event ? eventTypes(event) : []);
  setSelectedValues(shiftControl, event ? eventShifts(event) : []);
  form.elements.notes.value = event?.notes ?? "";
  dialog.showModal();
  resizeNotesInput();
  requestAnimationFrame(() => {
    resizeNotesInput();
    form.elements.name.focus();
  });
}

function closeDialog() {
  closeAllMultiSelectMenus();
  dialog.close();
  state.editingId = null;
}

function handleSubmit(event) {
  event.preventDefault();
  clearFieldErrors();

  const data = new FormData(form);
  const name = data.get("name").trim();
  const dayValue = data.get("day");
  const startValue = data.get("start");
  const endValue = data.get("end");
  const types = getSelectedValues(typeControl);
  const shifts = getSelectedValues(shiftControl);

  if (!name) {
    setFieldError("name", "Enter an event name.");
    form.elements.name.focus();
    return;
  }
  if (dayValue === "" || dayValue == null) {
    setFieldError("day", "Select a date.");
    form.elements.day.focus();
    return;
  }
  if (!startValue) {
    setFieldError("start", "Select a start time.");
    form.elements.start.focus();
    return;
  }
  if (!endValue) {
    setFieldError("end", "Select an end time.");
    form.elements.end.focus();
    return;
  }
  if (!types.length) {
    setFieldError("type", "Select at least one event type.");
    typeTrigger?.focus();
    return;
  }

  const start = timeToMinutes(startValue);
  const end = timeToMinutes(endValue);

  const candidate = {
    id: state.editingId ?? crypto.randomUUID(),
    name,
    description: data.get("description").trim(),
    location: data.get("location").trim(),
    date: dateKey(addDays(state.weekendStart, Number(dayValue))),
    start,
    duration: end - start,
    types,
    type: types[0],
    shifts,
    shift: shifts[0] ?? "",
    notes: data.get("notes").trim(),
  };

  if (candidate.duration <= 0) {
    setFieldError("end", "End time must be later than start time.");
    form.elements.end.focus();
    return;
  }
  if (start < 0 || end > MINUTES_IN_VIEW) {
    setFieldError("end", "Events must fit between 12:00 AM and 11:59 PM.");
    form.elements.end.focus();
    return;
  }

  if (state.editingId) {
    state.events = state.events.map((item) => item.id === state.editingId ? candidate : item);
    showToast("Event updated");
  } else {
    state.events.push(candidate);
    showToast("Event created");
  }
  saveEvents();
  closeDialog();
  render();
}

/* ── Pointer interactions: create, move, resize ──────────────────────── */
function pointerToDay(clientX) {
  const rect = calendarGrid.getBoundingClientRect();
  const maxDay = state.dayCount - 1;
  return Math.max(0, Math.min(maxDay, Math.floor(((clientX - rect.left) / rect.width) * state.dayCount)));
}

function pointerToRawMinutes(clientY) {
  const rect = calendarGrid.getBoundingClientRect();
  return ((clientY - rect.top) / rect.height) * MINUTES_IN_VIEW;
}

function snapMinutes(minutes) {
  return Math.max(0, Math.min(MINUTES_IN_VIEW, Math.round(minutes / 15) * 15));
}

function pointerToMinutes(clientY) {
  return snapMinutes(pointerToRawMinutes(clientY));
}

function beginCreateSelection(pointerEvent) {
  if (pointerEvent.button !== 0) return;
  if (pointerEvent.target !== calendarGrid) return;
  if (state.drag) return;

  const day = pointerToDay(pointerEvent.clientX);
  const start = pointerToMinutes(pointerEvent.clientY);
  state.createDrag = {
    pointerId: pointerEvent.pointerId,
    originX: pointerEvent.clientX,
    originY: pointerEvent.clientY,
    day,
    originMinutes: start,
    currentMinutes: start,
    moved: false,
    preview: null,
  };
  calendarGrid.setPointerCapture(pointerEvent.pointerId);
  calendarGrid.addEventListener("pointermove", handleCreateSelection);
  calendarGrid.addEventListener("pointerup", endCreateSelection);
  calendarGrid.addEventListener("pointercancel", endCreateSelection);
}

function handleCreateSelection(pointerEvent) {
  const createDrag = state.createDrag;
  if (!createDrag || pointerEvent.pointerId !== createDrag.pointerId) return;

  const distance = Math.hypot(
    pointerEvent.clientX - createDrag.originX,
    pointerEvent.clientY - createDrag.originY,
  );
  if (!createDrag.moved && distance < 8) return;

  if (!createDrag.moved) {
    createDrag.moved = true;
    createDrag.preview = document.createElement("div");
    createDrag.preview.className = "drop-preview create-preview";
    createDrag.preview.setAttribute("aria-hidden", "true");
    calendarGrid.append(createDrag.preview);
  }

  pointerEvent.preventDefault();
  createDrag.day = pointerToDay(pointerEvent.clientX);
  createDrag.currentMinutes = pointerToMinutes(pointerEvent.clientY);
  const start = Math.min(createDrag.originMinutes, createDrag.currentMinutes);
  const end = Math.max(createDrag.originMinutes, createDrag.currentMinutes);
  const duration = Math.max(15, end - start);
  positionEvent(createDrag.preview, createDrag.day, start, duration);
}

function endCreateSelection(pointerEvent) {
  const createDrag = state.createDrag;
  if (!createDrag || pointerEvent.pointerId !== createDrag.pointerId) return;

  calendarGrid.removeEventListener("pointermove", handleCreateSelection);
  calendarGrid.removeEventListener("pointerup", endCreateSelection);
  calendarGrid.removeEventListener("pointercancel", endCreateSelection);
  createDrag.preview?.remove();

  if (createDrag.moved) {
    const start = Math.min(createDrag.originMinutes, createDrag.currentMinutes);
    const end = Math.max(createDrag.originMinutes, createDrag.currentMinutes);
    const duration = Math.max(15, end - start);
    if (start + duration <= MINUTES_IN_VIEW) {
      openDialog(null, { day: createDrag.day, start, duration });
    }
  }

  state.createDrag = null;
}

function getEventEdge(node, clientY) {
  const rect = node.getBoundingClientRect();
  const edge = Math.min(RESIZE_EDGE_PX, Math.max(6, rect.height * 0.25));
  if (clientY <= rect.top + edge) return "start";
  if (clientY >= rect.bottom - edge) return "end";
  return "move";
}

function updateEventHoverCursor(pointerEvent) {
  if (state.drag) return;
  const node = pointerEvent.currentTarget;
  const edge = getEventEdge(node, pointerEvent.clientY);
  node.dataset.resizeEdge = edge;
}

function clearEventHoverCursor(pointerEvent) {
  if (state.drag) return;
  delete pointerEvent.currentTarget.dataset.resizeEdge;
}

function beginDrag(pointerEvent) {
  if (pointerEvent.button !== 0) return;
  const node = pointerEvent.currentTarget;
  const event = state.events.find((item) => item.id === node.dataset.id);
  if (!event) return;

  const handle = pointerEvent.target.closest(".event-resize-handle");
  const mode = handle?.dataset.edge ?? getEventEdge(node, pointerEvent.clientY);
  const originMinutes = pointerToRawMinutes(pointerEvent.clientY);
  state.drag = {
    mode,
    event,
    node,
    pointerId: pointerEvent.pointerId,
    originX: pointerEvent.clientX,
    originY: pointerEvent.clientY,
    grabOffset: originMinutes - event.start,
    moved: false,
    targetDay: dayIndexForDate(event.date),
    targetStart: event.start,
    targetDuration: event.duration,
    layout: {
      column: Number(node.dataset.column),
      columnCount: Number(node.dataset.columnCount),
    },
    ghost: null,
  };
  node.dataset.resizeEdge = mode;
  node.setPointerCapture(pointerEvent.pointerId);
  node.addEventListener("pointermove", handleDrag);
  node.addEventListener("pointerup", endDrag);
  node.addEventListener("pointercancel", endDrag);
}

function handleDrag(pointerEvent) {
  const drag = state.drag;
  if (!drag || pointerEvent.pointerId !== drag.pointerId) return;
  const distance = Math.hypot(
    pointerEvent.clientX - drag.originX,
    pointerEvent.clientY - drag.originY,
  );
  if (!drag.moved && distance < 5) return;

  if (!drag.moved) {
    drag.moved = true;
    drag.ghost = drag.node.cloneNode(true);
    drag.ghost.classList.remove("dragging", "resizing");
    drag.ghost.classList.add("event-ghost");
    drag.ghost.removeAttribute("data-id");
    drag.ghost.removeAttribute("data-resize-edge");
    drag.ghost.replaceChildren();
    drag.ghost.setAttribute("aria-hidden", "true");
    drag.ghost.tabIndex = -1;
    calendarGrid.append(drag.ghost);
    drag.node.classList.add(drag.mode === "move" ? "dragging" : "resizing");
  }

  pointerEvent.preventDefault();
  const pointerMinutes = pointerToMinutes(pointerEvent.clientY);

  if (drag.mode === "move") {
    const day = pointerToDay(pointerEvent.clientX);
    const maxStart = MINUTES_IN_VIEW - drag.targetDuration;
    const start = Math.max(
      0,
      Math.min(maxStart, snapMinutes(pointerToRawMinutes(pointerEvent.clientY) - drag.grabOffset)),
    );
    drag.targetDay = day;
    drag.targetStart = start;
  } else if (drag.mode === "start") {
    const end = drag.event.start + drag.event.duration;
    const start = Math.max(0, Math.min(end - MIN_EVENT_DURATION, pointerMinutes));
    drag.targetDay = dayIndexForDate(drag.event.date);
    drag.targetStart = start;
    drag.targetDuration = end - start;
  } else {
    const start = drag.event.start;
    const end = Math.max(start + MIN_EVENT_DURATION, Math.min(MINUTES_IN_VIEW, pointerMinutes));
    drag.targetDay = dayIndexForDate(drag.event.date);
    drag.targetStart = start;
    drag.targetDuration = end - start;
  }

  drag.node.classList.toggle("is-compact", drag.targetDuration <= 45);
  positionEvent(drag.node, drag.targetDay, drag.targetStart, drag.targetDuration, drag.layout);
}

function endDrag(pointerEvent) {
  const drag = state.drag;
  if (!drag || pointerEvent.pointerId !== drag.pointerId) return;
  drag.node.removeEventListener("pointermove", handleDrag);
  drag.node.removeEventListener("pointerup", endDrag);
  drag.node.removeEventListener("pointercancel", endDrag);
  drag.node.classList.remove("dragging", "resizing");
  delete drag.node.dataset.resizeEdge;
  drag.ghost?.remove();

  if (drag.moved) {
    Object.assign(drag.event, {
      date: dateKey(addDays(state.weekendStart, drag.targetDay)),
      start: drag.targetStart,
      duration: drag.targetDuration,
    });
    saveEvents();
    const dayLabel = formatDay(addDays(state.weekendStart, drag.targetDay));
    const rangeLabel = `${displayTime(drag.targetStart)} – ${displayTime(drag.targetStart + drag.targetDuration)}`;
    showToast(
      drag.mode === "move"
        ? `Moved to ${dayLabel}, ${displayTime(drag.targetStart)}`
        : `Resized to ${rangeLabel}`,
    );
    state.suppressClick = true;
    requestAnimationFrame(() => {
      state.suppressClick = false;
    });
    render();
  }
  state.drag = null;
}

/* ── Delete, weekend navigation and month picker ─────────────────────── */
function deleteEvent() {
  if (!state.editingId) return;
  state.events = state.events.filter((event) => event.id !== state.editingId);
  saveEvents();
  closeDialog();
  render();
  showToast("Event deleted");
}

function moveWeekend(days) {
  state.weekendStart = addDays(state.weekendStart, days);
  render();
}

function navigateCalendar(direction) {
  const step = state.dayCount === 1 ? 1 : 7;
  moveWeekend(direction * step);
}

function fridayForDate(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = copy.getDay();
  const offset = weekday === 5 ? 0 : weekday === 6 ? -1 : weekday === 0 ? -2 : (5 - weekday);
  copy.setDate(copy.getDate() + offset);
  return copy;
}

function dateForViewSelection(date) {
  if (state.dayCount === 1) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  return fridayForDate(date);
}

let miniMonth = new Date(BASE_WEEKEND_START);

function openMiniCalendar() {
  miniMonth = new Date(state.weekendStart.getFullYear(), state.weekendStart.getMonth(), 1);
  renderMiniCalendar();
  miniCalendar.hidden = false;
  monthLabel.setAttribute("aria-expanded", "true");
}

function closeMiniCalendar() {
  miniCalendar.hidden = true;
  monthLabel.setAttribute("aria-expanded", "false");
}

function renderMiniCalendar() {
  miniCalendarTitle.textContent = formatMonth(miniMonth);

  if (!miniCalendarWeekdays.childElementCount) {
    ["S", "M", "T", "W", "T", "F", "S"].forEach((label) => {
      const cell = document.createElement("span");
      cell.className = "mini-weekday";
      cell.textContent = label;
      miniCalendarWeekdays.append(cell);
    });
  }

  miniCalendarGrid.replaceChildren();

  const year = miniMonth.getFullYear();
  const month = miniMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = DEMO_TODAY;

  const activeDays = new Set(
    Array.from({ length: state.dayCount }, (_, day) => dateKey(addDays(state.weekendStart, day))),
  );

  for (let i = 0; i < firstDay; i += 1) {
    const blank = document.createElement("span");
    blank.className = "mini-day is-blank";
    miniCalendarGrid.append(blank);
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const date = new Date(year, month, dayNum);
    const key = dateKey(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-day";
    button.textContent = String(dayNum);
    if (activeDays.has(key)) button.classList.add("is-active");
    if (isSameDate(date, today)) button.classList.add("is-today");
    button.addEventListener("click", () => {
      state.weekendStart = dateForViewSelection(date);
      closeMiniCalendar();
      render();
    });
    miniCalendarGrid.append(button);
  }
}

function shiftMiniMonth(delta) {
  miniMonth = new Date(miniMonth.getFullYear(), miniMonth.getMonth() + delta, 1);
  renderMiniCalendar();
}

/* ── Toast ───────────────────────────────────────────────────────────── */
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

/* ── Event listeners ─────────────────────────────────────────────────── */
document.querySelector("#add-button").addEventListener("click", () => openDialog());
monthLabel.addEventListener("click", () => {
  if (miniCalendar.hidden) openMiniCalendar();
  else closeMiniCalendar();
});
document.querySelector("#mini-previous").addEventListener("click", () => shiftMiniMonth(-1));
document.querySelector("#mini-next").addEventListener("click", () => shiftMiniMonth(1));
document.addEventListener("click", (event) => {
  if (!miniCalendar.hidden
    && !miniCalendar.contains(event.target)
    && !monthLabel.contains(event.target)) {
    closeMiniCalendar();
  }
});
document.querySelector("#close-dialog").addEventListener("click", closeDialog);
document.querySelector("#cancel-button").addEventListener("click", closeDialog);
detailCloseButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeEventDetails();
});
detailBackdrop?.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  closeEventDetails();
});
document.querySelector("#detail-edit").addEventListener("click", editViewedEvent);
document.querySelector("#detail-delete").addEventListener("click", deleteViewedEvent);
deleteButton.addEventListener("click", deleteEvent);
form.addEventListener("submit", handleSubmit);
descriptionInput.addEventListener("input", resizeDescriptionInput);
notesInput?.addEventListener("input", resizeNotesInput);
calendarGrid.addEventListener("pointerdown", beginCreateSelection);
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  const isBackdrop = event.clientX < rect.left
    || event.clientX > rect.right
    || event.clientY < rect.top
    || event.clientY > rect.bottom;
  if (!isBackdrop) return;

  if (multiSelectControls.some((control) => !control.menu.hidden)) {
    closeAllMultiSelectMenus();
    return;
  }

  closeDialog();
});

dialog.addEventListener("cancel", (event) => {
  if (multiSelectControls.some((control) => !control.menu.hidden)) {
    event.preventDefault();
    closeAllMultiSelectMenus();
  }
});

multiSelectControls.forEach((control) => {
  control.trigger.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMultiSelectMenu(control);
  });

  control.menu.addEventListener("change", (event) => {
    if (!event.target.matches(`input[name="${control.fieldName}"]`)) return;
    renderMultiSelectTags(control);
  });
});

filterButton.addEventListener("click", () => {
  const willOpen = filterMenu.hidden;
  filterMenu.hidden = !willOpen;
  filterButton.setAttribute("aria-expanded", String(willOpen));
});

filterMenu.addEventListener("change", (event) => {
  if (event.target.matches("input[name='view-mode']")) {
    state.dayCount = Number(event.target.value) === 1 ? 1 : 3;
    if (state.dayCount === 3) {
      state.weekendStart = fridayForDate(state.weekendStart);
    }
    render();
    return;
  }
  if (!event.target.matches("input[type='checkbox']")) return;
  if (event.target.checked) state.filters.add(event.target.value);
  else state.filters.delete(event.target.value);
  renderEvents();
});

document.addEventListener("click", (event) => {
  if (!filterMenu.hidden && !filterMenu.contains(event.target) && !filterButton.contains(event.target)) {
    filterMenu.hidden = true;
    filterButton.setAttribute("aria-expanded", "false");
  }

  multiSelectControls.forEach((control) => {
    if (!control.menu.hidden && !control.root.contains(event.target)) {
      closeMultiSelectMenu(control);
    }
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!detailDialog.open || detailDialog.classList.contains("is-closing")) return;
  if (detailDialog.contains(event.target)) return;
  if (detailBackdrop && !detailBackdrop.hidden) return;
  closeEventDetails();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && detailDialog.open) {
    event.preventDefault();
    closeEventDetails();
  }
});

function repositionOpenMultiSelectMenus() {
  multiSelectControls.forEach(positionMultiSelectMenu);
}

dialog.addEventListener("scroll", repositionOpenMultiSelectMenus);
window.addEventListener("resize", () => {
  positionDetailPopover(state.detailAnchor);
  repositionOpenMultiSelectMenus();
});
window.addEventListener("scroll", () => positionDetailPopover(state.detailAnchor), true);

render();

/* ── Shared API used by the other pages ──────────────────────────────── */
window.EventCalendarAPI = {
  getEvents: () => state.events.slice(),
  subscribe(listener) {
    eventChangeListeners.add(listener);
    return () => eventChangeListeners.delete(listener);
  },
  openDetails(event, sourceNode, options) {
    openEventDetails(event, sourceNode, options);
  },
  closeDetails: closeEventDetails,
  formatDay,
  formatMonth,
  formatMonthAbbrev,
  formatDetailDay,
  formatFullDay,
  displayTime,
  dateKey,
  addDays,
  DEMO_TODAY,
  BASE_WEEKEND_START,
  MINUTES_IN_VIEW,
  showToast,
};
