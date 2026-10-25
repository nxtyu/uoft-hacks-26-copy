/* Shift Manager and My Shifts
 *
 * Also owns sidebar page switching (setDashboardPage), so it is the script
 * that decides which <main class="page"> is visible, based on the URL hash.
 *
 * Shift Manager (organizer): a day calendar of events, where selecting one
 * opens the assign panel (volunteer and mentor slots, steppers for how many,
 * a people picker per slot); a volunteer table; and a volunteer profile with
 * a weekend calendar for assigning or unassigning many shifts at once.
 *
 * My Shifts (volunteer): the signed-in volunteer's (CURRENT_VOLUNTEER_EMAIL)
 * own weekend schedule, with details and instructions for each shift.
 *
 * Events come from window.EventCalendarAPI; nothing here is saved.
 */


/* ── Sample volunteers (replace with API data) ───────────────────────── */
const VOLUNTEERS = [
  {
    name: "A'ja Wilson",
    role: "Volunteer",
    email: "aja.wilson@mail.utoronto.ca",
    phone: "(416) 555-0142",
    education: "UofT · Computer Science",
    team: "Registration",
    preferences: ["Registration", "Ceremony"],
    availability: ["Fri AM", "Fri PM", "Sat AM", "Sat PM"],
    cprTraining: true,
  },
  {
    name: "Caitlin Clark",
    role: "Volunteer",
    email: "caitlin.clark@mail.utoronto.ca",
    phone: "(647) 555-0198",
    education: "UofT · Engineering",
    team: "Logistics",
    preferences: ["Logistics", "Outdoor"],
    availability: ["Sat AM", "Sat PM", "Sun AM"],
    cprTraining: true,
  },
  {
    name: "Breanna Stewart",
    role: "Mentor",
    email: "breanna.stewart@mail.utoronto.ca",
    phone: "(437) 555-0110",
    education: "UofT · Rotman",
    team: "Workshops",
    preferences: ["Workshops", "Mentorship"],
    availability: ["Fri PM", "Sat AM", "Sat PM", "Sun PM"],
    cprTraining: false,
  },
  {
    name: "Paige Bueckers",
    role: "Volunteer",
    email: "paige.bueckers@mail.utoronto.ca",
    phone: "(416) 555-0177",
    education: "UofT · Life Sciences",
    team: "Food",
    preferences: ["Food", "Social"],
    availability: ["Sat PM"],
    cprTraining: true,
  },
  {
    name: "Nikola Jokic",
    role: "Organizer",
    email: "nikola.jokic@mail.utoronto.ca",
    phone: "(647) 555-0133",
    education: "UofT · Political Science",
    team: "Operations",
    preferences: ["Operations", "Logistics", "Ceremony"],
    availability: ["Fri AM", "Fri PM", "Sat AM", "Sat PM", "Sun AM", "Sun PM"],
    cprTraining: true,
  },
  {
    name: "Alyssa Thomas",
    role: "Mentor",
    email: "alyssa.thomas@mail.utoronto.ca",
    phone: "(416) 555-0164",
    education: "UofT · Math & Stats",
    team: "Mentorship",
    preferences: ["Mentorship", "Workshops"],
    availability: ["Sat AM", "Sun AM", "Sun PM"],
    cprTraining: false,
  },
  {
    name: "Shai Gilgeous-Alexander",
    role: "Volunteer",
    email: "shai.gilgeousalexander@mail.utoronto.ca",
    phone: "(905) 555-0188",
    education: "UofT · Kinesiology",
    team: "Registration",
    preferences: ["Outdoor", "Social", "Food"],
    availability: ["Fri AM", "Sat AM", "Sun AM"],
    cprTraining: true,
  },
  {
    name: "Jackie Young",
    role: "Volunteer",
    email: "jackie.young@mail.utoronto.ca",
    phone: "(647) 555-0121",
    education: "UofT · Commerce",
    team: "Social",
    preferences: ["Social", "Ceremony"],
    availability: ["Sun AM", "Sun PM"],
    cprTraining: false,
  },
  {
    name: "Luka Doncic",
    role: "Volunteer",
    email: "luka.doncic@mail.utoronto.ca",
    phone: "(416) 555-0191",
    education: "UofT · Computer Engineering",
    team: "Registration",
    preferences: ["Registration", "Ceremony"],
    availability: ["Fri AM", "Fri PM", "Sat AM"],
    cprTraining: true,
  },
  {
    name: "Rhyne Howard",
    role: "Volunteer",
    email: "rhyne.howard@mail.utoronto.ca",
    phone: "(647) 555-0155",
    education: "UofT · Psychology",
    team: "Food",
    preferences: ["Food", "Social"],
    availability: ["Sat PM", "Sun AM", "Sun PM"],
    cprTraining: false,
  },
  {
    name: "Giannis Antetokounmpo",
    role: "Volunteer",
    email: "giannis.antetokounmpo@mail.utoronto.ca",
    phone: "(437) 555-0182",
    education: "UofT · Physics",
    team: "Logistics",
    preferences: ["Logistics", "Ceremony"],
    availability: ["Fri AM", "Fri PM", "Sat AM", "Sat PM"],
    cprTraining: true,
  },
  {
    name: "Kayla McBride",
    role: "Mentor",
    email: "kayla.mcbride@mail.utoronto.ca",
    phone: "(416) 555-0149",
    education: "UofT · iSchool",
    team: "Mentorship",
    preferences: ["Mentorship", "Workshops"],
    availability: ["Sat AM", "Sat PM", "Sun PM"],
    cprTraining: false,
  },
  {
    name: "Victor Wembanyama",
    role: "Volunteer",
    email: "victor.wembanyama@mail.utoronto.ca",
    phone: "(647) 555-0160",
    education: "UofT · Cognitive Science",
    team: "Registration",
    preferences: ["Registration", "Ceremony"],
    availability: ["Fri AM", "Fri PM", "Sun AM"],
    cprTraining: true,
  },
];

/* ── Settings and DOM references ─────────────────────────────────────── */
const SHIFT_START_HOUR = 0;
const SHIFT_END_HOUR = 24;
const SHIFT_MINUTES_IN_VIEW = (SHIFT_END_HOUR - SHIFT_START_HOUR) * 60;
const DEFAULT_SHIFT_SCROLL_HOUR = 8;

const calendarAPI = window.EventCalendarAPI;

const pageEvents = document.querySelector("#page-events");
const pageShifts = document.querySelector("#page-shifts");
const pageMyShifts = document.querySelector("#page-myshifts");
const pageTeamFinder = document.querySelector("#page-teamfinder");
const navLinks = document.querySelectorAll("[data-page]");
const shiftTableBody = document.querySelector("#shift-table-body");
const shiftTableView = document.querySelector("#shift-table-view");
const shiftCalendarView = document.querySelector("#shift-calendar-view");
const shiftMainHeader = document.querySelector("#shift-main-header");
const shiftPageTitle = document.querySelector("#shift-page-title");
const shiftViewToggle = document.querySelector("#shift-view-toggle");
const shiftTableViewButton = document.querySelector("#shift-table-view-button");
const shiftTableToolbar = document.querySelector("#shift-table-toolbar");
const shiftCalendarToolbar = document.querySelector("#shift-calendar-toolbar");
const shiftTableFilterButton = document.querySelector("#shift-table-filter-button");
const shiftTableFilterMenu = document.querySelector("#shift-table-filter-menu");
const shiftCalendarFilterButton = document.querySelector("#shift-calendar-filter-button");
const shiftCalendarFilterMenu = document.querySelector("#shift-calendar-filter-menu");
const shiftTableUploadButton = document.querySelector("#shift-table-upload-button");
const shiftCalendarGrid = document.querySelector("#shift-calendar-grid");
const shiftTimeAxis = document.querySelector("#shift-time-axis");
const shiftDayHeaders = document.querySelector("#shift-day-headers");
const shiftPrevious = document.querySelector("#shift-previous");
const shiftNext = document.querySelector("#shift-next");
const shiftMonthLabel = document.querySelector("#shift-month-label");
const shiftMonthLabelText = document.querySelector("#shift-month-label-text");
const shiftHeadingDay = document.querySelector("#shift-heading-day");
const shiftMiniCalendar = document.querySelector("#shift-mini-calendar");
const shiftMiniCalendarTitle = document.querySelector("#shift-mini-calendar-title");
const shiftMiniCalendarWeekdays = document.querySelector("#shift-mini-calendar-weekdays");
const shiftMiniCalendarGrid = document.querySelector("#shift-mini-calendar-grid");
const shiftAssignTitle = document.querySelector(".shift-assign-header h2");
const shiftAssignDatetime = document.querySelector(".shift-assign-datetime");
const shiftViewDetails = document.querySelector(".shift-view-details");
const shiftAssignDetails = document.querySelector("#shift-assign-details");
const shiftAssignEmpty = document.querySelector("#shift-assign-empty");
const shiftAssignMain = document.querySelector("#shift-assign-main");
const shiftDetailLocation = document.querySelector("#shift-detail-location");
const shiftDetailDescription = document.querySelector("#shift-detail-description");
const shiftDetailTags = document.querySelector("#shift-detail-tags");
const shiftAssignSections = [...document.querySelectorAll(".shift-assign-section[data-shift-role]")];
const shiftAssignPicker = document.querySelector("#shift-assign-picker");
const shiftAssignPickerTitle = document.querySelector("#shift-assign-picker-title");
const shiftAssignPickerBack = document.querySelector("#shift-assign-picker-back");
const shiftAssignSearch = document.querySelector("#shift-assign-search");
const shiftAssignPeople = document.querySelector("#shift-assign-people");
const shiftAssignFilterButton = document.querySelector("#shift-assign-filter-button");
const shiftAssignFilterMenu = document.querySelector("#shift-assign-filter-menu");
const shiftProfileView = document.querySelector("#shift-profile-view");
const shiftProfileToolbar = document.querySelector("#shift-profile-toolbar");
const shiftProfileBack = document.querySelector("#shift-profile-back");
const shiftProfileAssign = document.querySelector("#shift-profile-assign");
const shiftProfileName = document.querySelector("#shift-profile-name");
const shiftProfileMeta = document.querySelector("#shift-profile-meta");
const shiftProfileShiftCount = document.querySelector("#shift-profile-shift-count");
const shiftProfileMonth = document.querySelector("#shift-profile-month");
const shiftProfileCalendar = document.querySelector("#shift-profile-calendar");
const shiftProfileDayHeaders = document.querySelector("#shift-profile-day-headers");
const shiftProfileTimeAxis = document.querySelector("#shift-profile-time-axis");
const shiftProfileCalendarGrid = document.querySelector("#shift-profile-calendar-grid");

const myshiftsToolbar = document.querySelector("#myshifts-toolbar");
const myshiftsMonthLabelText = document.querySelector("#myshifts-month-label-text");
const myshiftsPrevious = document.querySelector("#myshifts-previous");
const myshiftsNext = document.querySelector("#myshifts-next");
const myshiftsRole = document.querySelector("#myshifts-role");
const myshiftsCount = document.querySelector("#myshifts-count");
const myshiftsCalendar = document.querySelector("#myshifts-calendar");
const myshiftsDayHeaders = document.querySelector("#myshifts-day-headers");
const myshiftsTimeAxis = document.querySelector("#myshifts-time-axis");
const myshiftsCalendarGrid = document.querySelector("#myshifts-calendar-grid");
const myshiftsDetailEmpty = document.querySelector("#myshifts-detail-empty");
const myshiftsDetail = document.querySelector("#myshifts-detail");
const myshiftsDetailTitle = document.querySelector("#myshifts-detail-title");
const myshiftsDetailDatetime = document.querySelector("#myshifts-detail-datetime");
const myshiftsDetailLocation = document.querySelector("#myshifts-detail-location");
const myshiftsDetailDescription = document.querySelector("#myshifts-detail-description");
const myshiftsDetailTags = document.querySelector("#myshifts-detail-tags");
const myshiftsDetailVolunteers = document.querySelector("#myshifts-detail-volunteers");
const myshiftsDetailInstructions = document.querySelector("#myshifts-detail-instructions");

const PROFILE_DAY_COUNT = 3;
const MYSHIFTS_DAY_COUNT = 3;
const CURRENT_VOLUNTEER_EMAIL = "aja.wilson@mail.utoronto.ca";
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const AVAILABILITY_AM = { start: 9 * 60, end: 12 * 60 };
const AVAILABILITY_PM = { start: 12 * 60, end: 17 * 60 };

const ROLE_LABELS = {
  volunteer: "Volunteer",
  mentor: "Mentor",
};

/* ── State ───────────────────────────────────────────────────────────── */
const shiftState = {
  currentDate: new Date(calendarAPI.DEMO_TODAY),
  currentView: "calendar",
  viewBeforeProfile: "calendar",
  selectedId: null,
  selectedNode: null,
  selectedSlotKey: null,
  assigningSlotKey: null,
  pickerQuery: "",
  availabilityFilter: "all",
  tableRoleFilters: new Set(["Volunteer", "Mentor", "Organizer"]),
  tableCprFilter: "all",
  calendarTypeFilters: new Set(["Ceremony", "Food", "Workshop", "Social"]),
  detailsExpanded: false,
  profileEmail: null,
  profileSelectedIds: new Set(),
  profileUnassignIds: new Set(),
  profileWeekendStart: new Date(calendarAPI.BASE_WEEKEND_START),
  myshiftsWeekendStart: new Date(calendarAPI.BASE_WEEKEND_START),
  myshiftsSelectedId: null,
  demoSlotsSeeded: false,
  miniMonth: new Date(
    calendarAPI.DEMO_TODAY.getFullYear(),
    calendarAPI.DEMO_TODAY.getMonth(),
    1,
  ),
  slotsByEvent: new Map(),
};

/* ── Slots: how many people each event needs, and who fills them ─────── */
function emptySlotState() {
  return { volunteer: [], mentor: [] };
}

function getEventSlotState(eventId) {
  if (!eventId) return emptySlotState();
  seedDemoSlotsOnce();
  if (!shiftState.slotsByEvent.has(eventId)) {
    shiftState.slotsByEvent.set(eventId, emptySlotState());
  }
  return shiftState.slotsByEvent.get(eventId);
}

function seedDemoSlotsOnce() {
  if (shiftState.demoSlotsSeeded) return;
  shiftState.demoSlotsSeeded = true;
  /* Assignments only land inside each person's availability bands.
     Opening is intentionally full so profile calendars can show a green
     overlap that is still unavailable because every slot is taken. */
  shiftState.slotsByEvent.set("registration", {
    volunteer: [
      { assigneeEmail: "aja.wilson@mail.utoronto.ca" },
      { assigneeEmail: "shai.gilgeousalexander@mail.utoronto.ca" },
      { assigneeEmail: null },
      { assigneeEmail: null },
    ],
    mentor: [],
  });
  shiftState.slotsByEvent.set("opening", {
    volunteer: [
      { assigneeEmail: "aja.wilson@mail.utoronto.ca" },
      { assigneeEmail: "nikola.jokic@mail.utoronto.ca" },
      { assigneeEmail: "luka.doncic@mail.utoronto.ca" },
      { assigneeEmail: "giannis.antetokounmpo@mail.utoronto.ca" },
    ],
    mentor: [],
  });
  shiftState.slotsByEvent.set("brunch", {
    volunteer: [
      { assigneeEmail: "caitlin.clark@mail.utoronto.ca" },
      { assigneeEmail: "jackie.young@mail.utoronto.ca" },
      { assigneeEmail: null },
    ],
    mentor: [],
  });
  shiftState.slotsByEvent.set("workshop", {
    volunteer: [
      { assigneeEmail: "paige.bueckers@mail.utoronto.ca" },
      { assigneeEmail: "rhyne.howard@mail.utoronto.ca" },
      { assigneeEmail: null },
      { assigneeEmail: null },
    ],
    mentor: [
      { assigneeEmail: "breanna.stewart@mail.utoronto.ca" },
      { assigneeEmail: null },
    ],
  });
  shiftState.slotsByEvent.set("team-forming", {
    volunteer: [
      { assigneeEmail: "shai.gilgeousalexander@mail.utoronto.ca" },
      { assigneeEmail: "aja.wilson@mail.utoronto.ca" },
    ],
    mentor: [
      { assigneeEmail: "alyssa.thomas@mail.utoronto.ca" },
      { assigneeEmail: "kayla.mcbride@mail.utoronto.ca" },
    ],
  });
  shiftState.slotsByEvent.set("submission", {
    volunteer: [
      { assigneeEmail: "jackie.young@mail.utoronto.ca" },
      { assigneeEmail: "rhyne.howard@mail.utoronto.ca" },
      { assigneeEmail: null },
      { assigneeEmail: null },
    ],
    mentor: [{ assigneeEmail: "breanna.stewart@mail.utoronto.ca" }],
  });
}

function ensureDemoCapacityForEvent(eventId) {
  if (!eventId) return;
  const state = getEventSlotState(eventId);
  if (state.volunteer.length || state.mentor.length) return;

  const event = calendarAPI.getEvents().find((item) => item.id === eventId);
  let hash = 0;
  for (let i = 0; i < eventId.length; i += 1) {
    hash = (hash + eventId.charCodeAt(i) * (i + 1)) % 97;
  }
  const total = 2 + (hash % 3);
  const eligible = VOLUNTEERS.filter(
    (person) => person.role === "Volunteer" && (!event || eventFitsAvailability(event, person)),
  );
  const filled = Math.min(total - 1, eligible.length, hash % total);
  state.volunteer = Array.from({ length: total }, (_, index) => ({
    assigneeEmail: index < filled ? eligible[index % eligible.length].email : null,
  }));
}

function setRoleSlotCount(role, count) {
  const eventId = shiftState.selectedId;
  if (!eventId) return;
  const next = Math.max(0, count);
  const state = getEventSlotState(eventId);
  const slots = state[role];

  while (slots.length < next) {
    slots.push({ assigneeEmail: null });
  }
  while (slots.length > next) {
    slots.pop();
  }

  if (shiftState.selectedSlotKey?.startsWith(`${role}:`)) {
    const index = Number(shiftState.selectedSlotKey.split(":")[1]);
    if (Number.isNaN(index) || index >= next) shiftState.selectedSlotKey = null;
  }
  if (shiftState.assigningSlotKey?.startsWith(`${role}:`)) {
    const index = Number(shiftState.assigningSlotKey.split(":")[1]);
    if (Number.isNaN(index) || index >= next) closeAssignPicker();
  }
  renderAssignSlots();
  if (!shiftTableView.hidden) renderVolunteerTable();
}

function removeSlotAt(role, index) {
  const eventId = shiftState.selectedId;
  if (!eventId) return;
  const slots = getEventSlotState(eventId)[role];
  if (index < 0 || index >= slots.length) return;

  slots.splice(index, 1);

  const adjustKey = (key) => {
    if (!key?.startsWith(`${role}:`)) return key;
    const keyIndex = Number(key.split(":")[1]);
    if (Number.isNaN(keyIndex)) return null;
    if (keyIndex === index) return null;
    if (keyIndex > index) return `${role}:${keyIndex - 1}`;
    return key;
  };

  shiftState.selectedSlotKey = adjustKey(shiftState.selectedSlotKey);
  const prevAssigning = shiftState.assigningSlotKey;
  const nextAssigning = adjustKey(prevAssigning);
  if (prevAssigning && !nextAssigning) {
    closeAssignPicker();
    if (!shiftTableView.hidden) renderVolunteerTable();
    return;
  }

  shiftState.assigningSlotKey = nextAssigning;
  renderAssignSlots();
  if (nextAssigning) renderAssignPeople();
  if (!shiftTableView.hidden) renderVolunteerTable();
}

function parseSlotKey(slotKey) {
  if (!slotKey) return null;
  const [role, indexText] = slotKey.split(":");
  const index = Number(indexText);
  if (!ROLE_LABELS[role] || Number.isNaN(index)) return null;
  return { role, index };
}

function getAssignedEmails(eventId) {
  const state = getEventSlotState(eventId);
  return new Set(
    [...state.volunteer, ...state.mentor]
      .map((slot) => slot.assigneeEmail)
      .filter(Boolean),
  );
}

function peopleForRole(role) {
  const label = ROLE_LABELS[role];
  return VOLUNTEERS.filter((person) => person.role === label);
}

function isSameDate(a, b) {
  return calendarAPI.dateKey(a) === calendarAPI.dateKey(b);
}

/* ── Sidebar page switching ──────────────────────────────────────────── */
function setDashboardPage(page) {
  const showShifts = page === "shifts";
  const showMyShifts = page === "myshifts";
  const showTeamFinder = page === "teamfinder";
  const showEvents = page === "events";

  /* Show by id rather than by a fixed list of four page references: the nav
     now also carries Home, Application, Gallery and Profile, which exist as
     placeholder pages. Anything unknown falls back to Events so a bad hash
     cannot leave the dashboard blank. */
  const target = document.querySelector(`#page-${CSS.escape(page || "events")}`) || pageEvents;
  document.querySelectorAll("main.page").forEach((node) => {
    node.hidden = node !== target;
  });

  const titles = {
    events: "Event Manager",
    shifts: "Shift Manager",
    myshifts: "My Shifts",
    teamfinder: "Team Finder",
    home: "Home",
    application: "Application",
    gallery: "Gallery",
    profile: "Profile",
  };
  document.title = `UofTHacks · ${titles[page] || "Event Manager"}`;

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  if (showShifts) {
    shiftState.selectedId = null;
    shiftState.selectedNode = null;
    shiftState.selectedSlotKey = null;
    shiftState.detailsExpanded = false;
    const resumeView = shiftState.currentView === "profile"
      ? (shiftState.viewBeforeProfile || "calendar")
      : shiftState.currentView;
    setShiftView(resumeView);
  } else {
    closeShiftMiniCalendar();
    closeAssignPicker();
    closeVolunteerProfile({ restoreView: false });
    calendarAPI.closeDetails();
  }

  if (showMyShifts) {
    renderMyShiftsPage();
    requestAnimationFrame(scrollMyShiftsCalendarToDefaultHour);
  }

  if (showTeamFinder) {
    window.TeamFinderAPI?.render?.();
  }
}

/* ── Calendar / table views and filters ──────────────────────────────── */
function setShiftView(view) {
  if (view === "profile") return;

  const showCalendar = view === "calendar";
  shiftState.currentView = showCalendar ? "calendar" : "table";
  shiftState.profileEmail = null;
  shiftState.profileSelectedIds.clear();
  shiftState.profileUnassignIds.clear();

  if (shiftProfileView) shiftProfileView.hidden = true;
  if (shiftProfileToolbar) shiftProfileToolbar.hidden = true;
  if (shiftMainHeader) shiftMainHeader.hidden = false;
  if (shiftPageTitle) shiftPageTitle.hidden = false;

  shiftTableView.hidden = showCalendar;
  shiftCalendarView.hidden = !showCalendar;
  if (shiftTableToolbar) shiftTableToolbar.hidden = showCalendar;
  if (shiftCalendarToolbar) shiftCalendarToolbar.hidden = !showCalendar;

  if (showCalendar) {
    closeTableFilterMenu();
    renderShiftCalendar();
    requestAnimationFrame(scrollShiftCalendarToDefaultHour);
  } else {
    closeShiftMiniCalendar();
    closeCalendarFilterMenu();
    closeAssignPicker();
    closeTableFilterMenu();
    calendarAPI.closeDetails();
    renderVolunteerTable();
  }
}

function closeTableFilterSubmenus() {
  shiftTableFilterMenu?.querySelectorAll(".shift-filter-submenu-trigger").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });
}

function closeTableFilterMenu() {
  if (!shiftTableFilterMenu || !shiftTableFilterButton) return;
  shiftTableFilterMenu.hidden = true;
  shiftTableFilterButton.setAttribute("aria-expanded", "false");
  closeTableFilterSubmenus();
}

function closeCalendarFilterMenu() {
  if (!shiftCalendarFilterMenu || !shiftCalendarFilterButton) return;
  shiftCalendarFilterMenu.hidden = true;
  shiftCalendarFilterButton.setAttribute("aria-expanded", "false");
}

function personMatchesTableFilters(person) {
  if (!shiftState.tableRoleFilters.has(person.role)) return false;
  if (shiftState.tableCprFilter === "trained" && !person.cprTraining) return false;
  if (shiftState.tableCprFilter === "untrained" && person.cprTraining) return false;
  return true;
}

function scrollShiftCalendarToDefaultHour() {
  const scroll = shiftCalendarView.querySelector(".calendar-scroll");
  if (!scroll) return;
  const rowHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--row-height"),
  ) || 56;
  scroll.scrollTop = DEFAULT_SHIFT_SCROLL_HOUR * rowHeight;
}

/* ── Volunteer table ─────────────────────────────────────────────────── */
function renderChipGroup(values = [], emptyLabel = "—") {
  if (!values.length) {
    return `<span class="shift-availability-empty">${emptyLabel}</span>`;
  }
  return `
    <div class="shift-availability-chips">
      ${values.map((value) => `<span class="detail-tag">${value}</span>`).join("")}
    </div>
  `;
}

function renderVolunteerTable() {
  shiftTableBody.replaceChildren();
  VOLUNTEERS.filter(personMatchesTableFilters).forEach((person) => {
    const shiftCount = countShiftsForPerson(person.email);
    const row = document.createElement("tr");
    row.className = "shift-table-row-interactive";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Open profile for ${person.name}`);
    row.innerHTML = `
      <td class="shift-table-name">${person.name}</td>
      <td>${person.role}</td>
      <td>${person.phone}</td>
      <td class="shift-chips-cell">${renderChipGroup(person.preferences)}</td>
      <td class="shift-chips-cell">${renderChipGroup(person.availability)}</td>
      <td class="shift-table-cpr">
        <label class="shift-cpr-label">
          <input
            type="checkbox"
            class="shift-cpr-check"
            ${person.cprTraining ? "checked" : ""}
            disabled
            aria-label="${person.cprTraining ? "CPR trained" : "Not CPR trained"}"
          />
        </label>
      </td>
      <td class="shift-table-shift-count">${shiftCount}</td>
    `;
    row.addEventListener("click", () => openVolunteerProfile(person.email));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVolunteerProfile(person.email);
      }
    });
    shiftTableBody.append(row);
  });
  fillVolunteerTableGrid();
}

function fillVolunteerTableGrid() {
  if (!shiftTableBody || !shiftTableView) return;
  shiftTableBody.querySelectorAll(".shift-table-empty-row").forEach((row) => row.remove());

  const scroll = shiftTableView.querySelector(".shift-table-scroll");
  const table = shiftTableView.querySelector(".shift-table");
  const head = table?.querySelector("thead");
  if (!scroll || !table || !head) return;

  const columnCount = head.querySelectorAll("th").length;
  const availableHeight = scroll.clientHeight - head.offsetHeight;
  const dataRowHeight = 40;
  const emptyRowHeight = 40;
  const filledCount = shiftTableBody.querySelectorAll("tr:not(.shift-table-empty-row)").length;
  const remainingHeight = Math.max(0, availableHeight - filledCount * dataRowHeight);
  const emptyCount = Math.ceil(remainingHeight / emptyRowHeight);

  for (let i = 0; i < emptyCount; i += 1) {
    const row = document.createElement("tr");
    row.className = "shift-table-empty-row";
    row.setAttribute("aria-hidden", "true");
    row.innerHTML = Array.from({ length: columnCount }, () => "<td></td>").join("");
    shiftTableBody.append(row);
  }
}

/* ── Shift calendar layout and fill indicators ───────────────────────── */
function eventsForCurrentDay() {
  const key = calendarAPI.dateKey(shiftState.currentDate);
  return calendarAPI.getEvents()
    .filter((event) => event.date === key)
    .filter((event) => {
      const types = event.types?.length ? event.types : [event.type];
      return types.some((type) => shiftState.calendarTypeFilters.has(type));
    })
    .sort((a, b) => a.start - b.start || b.duration - a.duration);
}

function calculateShiftLayouts(events) {
  const layouts = new Map();
  let group = [];
  let groupEnd = -1;

  const commitGroup = () => {
    if (!group.length) return;
    let active = [];
    let columnCount = 1;
    const assignments = [];

    group.forEach((event) => {
      active = active.filter((entry) => entry.end > event.start);
      const occupied = new Set(active.map((entry) => entry.column));
      let column = 0;
      while (occupied.has(column)) column += 1;
      active.push({
        column,
        end: event.start + event.duration,
      });
      columnCount = Math.max(columnCount, active.length, column + 1);
      assignments.push({ id: event.id, column });
    });

    assignments.forEach(({ id, column }) => {
      layouts.set(id, { column, columnCount });
    });
  };

  events.forEach((event) => {
    if (group.length && event.start >= groupEnd) {
      commitGroup();
      group = [];
      groupEnd = -1;
    }
    group.push(event);
    groupEnd = Math.max(groupEnd, event.start + event.duration);
  });
  commitGroup();

  return layouts;
}

function positionShiftEvent(node, start, duration, layout = { column: 0, columnCount: 1 }) {
  const eventWidth = 100 / layout.columnCount;
  const eventLeft = layout.column * eventWidth;
  node.style.left = `calc(${eventLeft}% + 2px)`;
  node.style.width = `calc(${eventWidth}% - 4px)`;
  node.style.top = `${(start / SHIFT_MINUTES_IN_VIEW) * 100}%`;
  node.style.height = `max(31px, calc(${(duration / SHIFT_MINUTES_IN_VIEW) * 100}% - 4px))`;
}

function getSlotFill(slots = []) {
  const total = slots.length;
  const filled = slots.filter((slot) => slot.assigneeEmail).length;
  return { filled, total };
}

function getEventFill(eventId) {
  const state = getEventSlotState(eventId);
  return getSlotFill([...state.volunteer, ...state.mentor]);
}

function formatFillLabel(filled, total, { withFilledWord = false } = {}) {
  const label = `${filled}/${total}`;
  return withFilledWord ? `${label} shifts` : label;
}

function updateEventFillIndicators() {
  shiftCalendarGrid.querySelectorAll(".calendar-event").forEach((node) => {
    const badge = node.querySelector(".event-fill-indicator");
    if (!badge || !node.dataset.id) return;
    const { filled, total } = getEventFill(node.dataset.id);
    badge.textContent = formatFillLabel(filled, total);
    badge.hidden = total === 0;
  });
}

function eventDetailTags(event) {
  const types = event.types?.length ? event.types : [event.type];
  const shifts = (event.shifts?.length
    ? event.shifts
    : event.shift
      ? [event.shift]
      : []
  )
    .filter((shift) => shift && shift !== "Unassigned")
    .map((shift) => `${shift} shift`);
  return [...types, ...shifts].filter(Boolean);
}

/* ── Assign panel and people picker ──────────────────────────────────── */
function setAssignDetailsExpanded(expanded) {
  shiftState.detailsExpanded = Boolean(expanded) && Boolean(shiftState.selectedId);
  if (!shiftAssignDetails || !shiftViewDetails) return;

  shiftAssignDetails.hidden = !shiftState.detailsExpanded;
  shiftViewDetails.setAttribute("aria-expanded", String(shiftState.detailsExpanded));
  shiftViewDetails.textContent = shiftState.detailsExpanded ? "Hide Details" : "View Details";
}

function populateAssignDetails(event) {
  if (!shiftDetailLocation || !shiftDetailDescription || !shiftDetailTags) return;

  if (!event) {
    shiftDetailLocation.textContent = "";
    shiftDetailDescription.textContent = "";
    shiftDetailTags.replaceChildren();
    setAssignDetailsExpanded(false);
    return;
  }

  shiftDetailLocation.textContent = event.location || "Location TBD";
  shiftDetailDescription.textContent =
    event.description || "No description has been added for this event.";
  shiftDetailTags.replaceChildren();
  eventDetailTags(event).forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "detail-tag";
    chip.textContent = tag;
    shiftDetailTags.append(chip);
  });
}

function updateAssignPanel(event) {
  const hasEvent = Boolean(event);
  const assignPanel = document.querySelector("#shift-assign-panel");
  assignPanel?.classList.toggle("is-empty", !hasEvent);
  if (shiftAssignEmpty) shiftAssignEmpty.hidden = hasEvent;
  if (shiftAssignMain) shiftAssignMain.hidden = !hasEvent;

  if (!hasEvent) {
    shiftState.selectedSlotKey = null;
    populateAssignDetails(null);
    closeAssignPicker();
    return;
  }

  shiftAssignTitle.textContent = event.name;
  shiftAssignDatetime.textContent =
    `${calendarAPI.formatDetailDay(shiftState.currentDate)} · ${calendarAPI.displayTime(event.start)} – ${calendarAPI.displayTime(event.start + event.duration)}`;
  shiftViewDetails.hidden = false;
  populateAssignDetails(event);
  setAssignDetailsExpanded(shiftState.detailsExpanded);
  renderAssignSlots();
}

function renderAssignSlots() {
  const eventId = shiftState.selectedId;
  const counts = getEventSlotState(eventId);
  const enabled = Boolean(eventId);

  shiftAssignSections.forEach((section) => {
    const role = section.dataset.shiftRole;
    const slots = counts[role] ?? [];
    const { filled, total } = getSlotFill(slots);
    const list = section.querySelector("[data-slot-list]");
    const value = section.querySelector("[data-stepper-value]");
    const decrease = section.querySelector('[data-step="-1"]');
    const increase = section.querySelector('[data-step="1"]');
    const fillIndicator = section.querySelector("[data-fill-indicator]");

    value.textContent = String(slots.length);
    decrease.disabled = !enabled || slots.length <= 0;
    increase.disabled = !enabled;
    if (fillIndicator) {
      fillIndicator.textContent = formatFillLabel(filled, total, { withFilledWord: true });
      fillIndicator.hidden = !enabled;
    }

    list.replaceChildren();
    slots.forEach((slot, index) => {
      const slotKey = `${role}:${index}`;
      const row = document.createElement("div");
      row.className = "shift-slot";
      row.dataset.slotKey = slotKey;
      row.classList.toggle("is-selected", shiftState.selectedSlotKey === slotKey);
      row.classList.toggle("is-active", shiftState.assigningSlotKey === slotKey);

      const main = document.createElement("button");
      main.type = "button";
      main.className = "shift-slot-main";

      const assignee = VOLUNTEERS.find((person) => person.email === slot.assigneeEmail);
      if (assignee) {
        row.classList.add("is-filled");
        main.innerHTML = `<strong class="shift-slot-name">${assignee.name}</strong>`;
      } else {
        main.textContent = "Assign Shift";
      }

      main.addEventListener("click", () => {
        shiftState.selectedSlotKey = slotKey;
        openAssignPicker(slotKey);
      });

      const actions = document.createElement("div");
      actions.className = "shift-slot-actions";

      const swap = document.createElement("button");
      swap.type = "button";
      swap.className = "shift-slot-action";
      swap.setAttribute(
        "aria-label",
        assignee ? `Swap ${assignee.name}` : "Assign someone to this slot",
      );
      swap.innerHTML = `<img src="./assets/icons/swap.svg" alt="" width="16" height="16" />`;
      swap.addEventListener("click", () => {
        shiftState.selectedSlotKey = slotKey;
        openAssignPicker(slotKey);
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "shift-slot-action";
      remove.setAttribute(
        "aria-label",
        assignee ? `Remove ${assignee.name} slot` : "Remove empty slot",
      );
      remove.innerHTML = `<img src="./assets/icons/event-delete.svg" alt="" width="16" height="16" />`;
      remove.addEventListener("click", () => removeSlotAt(role, index));

      actions.append(swap, remove);
      row.append(main, actions);
      list.append(row);
    });
  });

  updateEventFillIndicators();
}

function openAssignPicker(slotKey) {
  const parsed = parseSlotKey(slotKey);
  if (!parsed || !shiftState.selectedId) return;

  shiftState.assigningSlotKey = slotKey;
  shiftState.pickerQuery = "";
  shiftAssignSearch.value = "";
  shiftAssignPickerTitle.textContent = `Assign ${ROLE_LABELS[parsed.role]}`;
  shiftAssignSearch.placeholder = `Search ${ROLE_LABELS[parsed.role].toLowerCase()}s…`;
  closeAssignFilterMenu();
  shiftAssignPicker.hidden = false;
  renderAssignPeople();
  requestAnimationFrame(() => shiftAssignSearch.focus());
  renderAssignSlots();
}

function closeAssignFilterMenu() {
  shiftAssignFilterMenu.hidden = true;
  shiftAssignFilterButton.setAttribute("aria-expanded", "false");
}

function closeAssignPicker() {
  shiftState.assigningSlotKey = null;
  shiftState.pickerQuery = "";
  if (shiftAssignSearch) shiftAssignSearch.value = "";
  if (shiftAssignPicker) shiftAssignPicker.hidden = true;
  closeAssignFilterMenu();
  renderAssignSlots();
}

function countShiftsForPerson(email) {
  let count = 0;
  shiftState.slotsByEvent.forEach((state) => {
    ["volunteer", "mentor"].forEach((role) => {
      count += state[role].filter((slot) => slot.assigneeEmail === email).length;
    });
  });
  return count;
}

function formatShiftCount(count) {
  return `${count} shift${count === 1 ? "" : "s"} assigned`;
}

function formatVolunteerAssignedCount(count) {
  return `${count} volunteer${count === 1 ? "" : "s"} assigned`;
}

function renderAssignPeople() {
  const parsed = parseSlotKey(shiftState.assigningSlotKey);
  shiftAssignPeople.replaceChildren();
  if (!parsed || !shiftState.selectedId) return;

  const selectedEvent = calendarAPI.getEvents().find((item) => item.id === shiftState.selectedId);
  const query = shiftState.pickerQuery.trim().toLowerCase();
  const assigned = getAssignedEmails(shiftState.selectedId);
  const currentSlot = getEventSlotState(shiftState.selectedId)[parsed.role][parsed.index];

  const personIsUnavailable = (person) => {
    const isAssignedElsewhere =
      assigned.has(person.email) && currentSlot?.assigneeEmail !== person.email;
    const outsideAvailability =
      !!selectedEvent && !eventFitsAvailability(selectedEvent, person);
    return isAssignedElsewhere || outsideAvailability;
  };

  const people = peopleForRole(parsed.role)
    .filter((person) => {
      const unavailable = personIsUnavailable(person);
      if (shiftState.availabilityFilter === "available" && unavailable) return false;
      if (shiftState.availabilityFilter === "unavailable" && !unavailable) return false;
      if (!query) return true;
      return `${person.name} ${person.email} ${person.team}`.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const aUnavailable = personIsUnavailable(a);
      const bUnavailable = personIsUnavailable(b);
      if (aUnavailable !== bUnavailable) return aUnavailable ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

  if (!people.length) {
    const empty = document.createElement("p");
    empty.className = "shift-assign-empty";
    empty.textContent = query ? "No people match that search." : "No people available for this role.";
    shiftAssignPeople.append(empty);
    return;
  }

  people.forEach((person) => {
    const isUnavailable = personIsUnavailable(person);
    const shiftCount = countShiftsForPerson(person.email);

    const row = document.createElement("div");
    row.className = "shift-assign-person";
    row.classList.toggle("is-unavailable", isUnavailable);
    row.setAttribute("role", "option");
    row.setAttribute("aria-disabled", String(isUnavailable));

    const select = document.createElement("div");
    select.className = "shift-assign-person-info";
    select.innerHTML = `
      <span class="shift-assign-person-copy">
        <strong>${person.name}</strong>
        <span class="shift-assign-person-meta">
          <span>${formatShiftCount(shiftCount)}</span>
        </span>
      </span>
    `;

    const actions = document.createElement("div");
    actions.className = "shift-assign-person-actions";

    const add = document.createElement("button");
    add.type = "button";
    add.className = "button shift-assign-person-action is-add";
    add.classList.toggle("is-unavailable", isUnavailable);
    add.textContent = isUnavailable ? "Unavailable" : "Add";
    add.disabled = isUnavailable;
    add.addEventListener("click", () => assignPersonToSlot(person));

    const view = document.createElement("button");
    view.type = "button";
    view.className = "button shift-assign-person-action is-view";
    view.textContent = "View";
    view.addEventListener("click", () => {
      openVolunteerProfile(person.email);
    });

    /* Primary (Add / Unavailable) on the right, like Team Finder Accept. */
    actions.append(view, add);
    row.append(select, actions);
    shiftAssignPeople.append(row);
  });
}

function assignPersonToSlot(person) {
  const parsed = parseSlotKey(shiftState.assigningSlotKey);
  if (!parsed || !shiftState.selectedId) return;
  const slots = getEventSlotState(shiftState.selectedId)[parsed.role];
  if (!slots[parsed.index]) return;
  slots[parsed.index].assigneeEmail = person.email;
  closeAssignPicker();
  if (!shiftTableView.hidden) renderVolunteerTable();
}

function selectShiftEvent(event, node) {
  const eventChanged = shiftState.selectedId !== (event?.id ?? null);
  shiftState.selectedId = event?.id ?? null;
  shiftState.selectedNode = node ?? null;

  shiftCalendarGrid.querySelectorAll(".calendar-event.is-selected").forEach((item) => {
    item.classList.remove("is-selected");
  });
  node?.classList.add("is-selected");

  if (eventChanged) {
    shiftState.selectedSlotKey = null;
    shiftState.detailsExpanded = false;
    closeAssignPicker();
  }

  updateAssignPanel(event);
  calendarAPI.closeDetails();
}

/* ── Month picker and shift calendar rendering ───────────────────────── */
function openShiftMiniCalendar() {
  shiftState.miniMonth = new Date(
    shiftState.currentDate.getFullYear(),
    shiftState.currentDate.getMonth(),
    1,
  );
  renderShiftMiniCalendar();
  shiftMiniCalendar.hidden = false;
  shiftMonthLabel.setAttribute("aria-expanded", "true");
}

function closeShiftMiniCalendar() {
  shiftMiniCalendar.hidden = true;
  shiftMonthLabel.setAttribute("aria-expanded", "false");
}

function renderShiftMiniCalendar() {
  shiftMiniCalendarTitle.textContent = calendarAPI.formatMonth(shiftState.miniMonth);

  if (!shiftMiniCalendarWeekdays.childElementCount) {
    ["S", "M", "T", "W", "T", "F", "S"].forEach((label) => {
      const cell = document.createElement("span");
      cell.className = "mini-weekday";
      cell.textContent = label;
      shiftMiniCalendarWeekdays.append(cell);
    });
  }

  shiftMiniCalendarGrid.replaceChildren();

  const year = shiftState.miniMonth.getFullYear();
  const month = shiftState.miniMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = calendarAPI.DEMO_TODAY;
  const activeKey = calendarAPI.dateKey(shiftState.currentDate);

  for (let i = 0; i < firstDay; i += 1) {
    const blank = document.createElement("span");
    blank.className = "mini-day is-blank";
    shiftMiniCalendarGrid.append(blank);
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const date = new Date(year, month, dayNum);
    const key = calendarAPI.dateKey(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-day";
    button.textContent = String(dayNum);
    if (key === activeKey) button.classList.add("is-active");
    if (isSameDate(date, today)) button.classList.add("is-today");
    button.addEventListener("click", () => {
      shiftState.currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      shiftState.selectedId = null;
      closeShiftMiniCalendar();
      calendarAPI.closeDetails();
      renderShiftCalendar();
    });
    shiftMiniCalendarGrid.append(button);
  }
}

function shiftMiniMonth(delta) {
  shiftState.miniMonth = new Date(
    shiftState.miniMonth.getFullYear(),
    shiftState.miniMonth.getMonth() + delta,
    1,
  );
  renderShiftMiniCalendar();
}

function renderShiftCalendar() {
  const currentDate = shiftState.currentDate;
  const isToday = isSameDate(currentDate, calendarAPI.DEMO_TODAY);

  shiftMonthLabelText.textContent = calendarAPI.formatMonthAbbrev(currentDate);
  shiftHeadingDay.classList.toggle("is-today", isToday);
  shiftHeadingDay.innerHTML = `<span>${calendarAPI.formatDay(currentDate)}</span>`;

  shiftDayHeaders.replaceChildren();
  const header = document.createElement("div");
  header.className = "day-header";
  if (isToday) header.classList.add("is-today");
  header.innerHTML = `<span>${calendarAPI.formatDay(currentDate)}</span>`;
  shiftDayHeaders.append(header);

  shiftTimeAxis.replaceChildren();
  for (let hour = SHIFT_START_HOUR + 1; hour < SHIFT_END_HOUR; hour += 1) {
    const label = document.createElement("div");
    label.className = "time-label";
    label.style.top = `calc(var(--row-height) * ${hour - SHIFT_START_HOUR})`;
    const clockHour = hour % 12 || 12;
    const period = hour < 12 ? "AM" : "PM";
    label.textContent = `${clockHour} ${period}`;
    shiftTimeAxis.append(label);
  }

  const dayEvents = eventsForCurrentDay();
  const layouts = calculateShiftLayouts(dayEvents);
  shiftCalendarGrid.replaceChildren();

  dayEvents.forEach((event) => {
    const layout = layouts.get(event.id) ?? { column: 0, columnCount: 1 };
    const types = event.types?.length ? event.types : [event.type];
    const { filled, total } = getEventFill(event.id);
    const node = document.querySelector("#event-template").content.firstElementChild.cloneNode(true);
    node.classList.add("is-readonly");
    node.dataset.id = event.id;
    node.dataset.type = event.type;
    node.draggable = false;
    node.classList.toggle("is-compact", event.duration <= 45);
    node.classList.toggle("is-selected", event.id === shiftState.selectedId);
    node.setAttribute(
      "aria-label",
      `${event.name}, ${types.join(", ")}, ${calendarAPI.formatFullDay(currentDate)}, ${calendarAPI.displayTime(event.start)} to ${calendarAPI.displayTime(event.start + event.duration)}, ${formatFillLabel(filled, total)} shifts filled. Click for details.`,
    );

    const main = document.createElement("span");
    main.className = "event-main";
    const title = node.querySelector("strong");
    const location = node.querySelector(".event-location");
    title.textContent = event.name;
    location.textContent = event.location || "Location TBD";
    main.append(title, location);

    const fill = document.createElement("span");
    fill.className = "event-fill-indicator";
    fill.textContent = formatFillLabel(filled, total);
    fill.hidden = total === 0;

    node.replaceChildren(main, fill);
    positionShiftEvent(node, event.start, event.duration, layout);
    node.addEventListener("pointerdown", (pointerEvent) => {
      // Read-only: never start a drag / resize gesture.
      if (pointerEvent.button !== 0) return;
      pointerEvent.stopPropagation();
    });
    node.addEventListener("click", () => selectShiftEvent(event, node));
    shiftCalendarGrid.append(node);
  });

  const selected = dayEvents.find((event) => event.id === shiftState.selectedId) ?? null;
  const selectedNode = selected
    ? shiftCalendarGrid.querySelector(`[data-id="${selected.id}"]`)
    : null;
  selectShiftEvent(selected, selectedNode);
}

function navigateShiftCalendar(direction) {
  shiftState.currentDate = calendarAPI.addDays(shiftState.currentDate, direction);
  shiftState.selectedId = null;
  closeShiftMiniCalendar();
  calendarAPI.closeDetails();
  renderShiftCalendar();
}

/* ── Availability and assignment rules ───────────────────────────────── */
function personByEmail(email) {
  return VOLUNTEERS.find((person) => person.email === email) ?? null;
}

function slotRoleForPerson(person) {
  if (!person) return "volunteer";
  if (person.role === "Mentor") return "mentor";
  return "volunteer";
}

function isPersonAssignedToEvent(eventId, email) {
  const state = getEventSlotState(eventId);
  return [...state.volunteer, ...state.mentor].some((slot) => slot.assigneeEmail === email);
}

function findOpenSlot(eventId, role) {
  const slots = getEventSlotState(eventId)[role];
  return slots.findIndex((slot) => !slot.assigneeEmail);
}

function isEventFullForRole(eventId, role) {
  const slots = getEventSlotState(eventId)[role];
  if (!slots.length) return false;
  return findOpenSlot(eventId, role) === -1;
}

function availabilityBandsForDay(person, date) {
  const short = DAY_SHORT[date.getDay()];
  const tags = person.availability || [];
  const bands = [];
  if (tags.includes(`${short} AM`)) bands.push(AVAILABILITY_AM);
  if (tags.includes(`${short} PM`)) bands.push(AVAILABILITY_PM);
  return bands;
}

function dateFromEventDateKey(dateKey) {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function eventFitsAvailability(event, person) {
  if (!event?.date || !person) return false;
  const date = dateFromEventDateKey(event.date);
  if (!date) return false;
  const bands = availabilityBandsForDay(person, date);
  if (!bands.length) return false;

  const eventStart = event.start;
  const eventEnd = event.start + event.duration;
  const sorted = [...bands].sort((a, b) => a.start - b.start);
  let coveredUntil = eventStart;
  for (const band of sorted) {
    if (band.end <= coveredUntil) continue;
    if (band.start > coveredUntil) return false;
    coveredUntil = Math.max(coveredUntil, band.end);
    if (coveredUntil >= eventEnd) return true;
  }
  return coveredUntil >= eventEnd;
}

function profileEventStatus(event, person) {
  const actuallyAssigned = isPersonAssignedToEvent(event.id, person.email);
  const pendingUnassign = shiftState.profileUnassignIds.has(event.id);

  if (actuallyAssigned && !pendingUnassign) return "assigned";

  const role = slotRoleForPerson(person);
  const fits = eventFitsAvailability(event, person);
  if (!fits) return "outside";
  if (!actuallyAssigned && isEventFullForRole(event.id, role)) return "full";
  if (shiftState.profileSelectedIds.has(event.id)) return "selected";
  return "assignable";
}

/* ── Volunteer profile: mass assign / unassign ───────────────────────── */
function profileWeekendDates() {
  return Array.from({ length: PROFILE_DAY_COUNT }, (_, day) => (
    calendarAPI.addDays(shiftState.profileWeekendStart, day)
  ));
}

function eventsForProfileWeekend() {
  const keys = new Set(profileWeekendDates().map((date) => calendarAPI.dateKey(date)));
  return calendarAPI.getEvents()
    .filter((event) => keys.has(event.date))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start || b.duration - a.duration);
}

function dayIndexForEvent(event) {
  const dates = profileWeekendDates();
  return dates.findIndex((date) => calendarAPI.dateKey(date) === event.date);
}

function calculateProfileLayouts(events) {
  const byDay = new Map();
  events.forEach((event) => {
    const day = dayIndexForEvent(event);
    if (day < 0) return;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(event);
  });

  const layouts = new Map();
  byDay.forEach((dayEvents) => {
    calculateShiftLayouts(dayEvents).forEach((layout, id) => layouts.set(id, layout));
  });
  return layouts;
}

function positionProfileEvent(node, day, start, duration, layout = { column: 0, columnCount: 1 }) {
  const dayWidth = 100 / PROFILE_DAY_COUNT;
  const eventWidth = dayWidth / layout.columnCount;
  const eventLeft = day * dayWidth + layout.column * eventWidth;
  node.style.left = `calc(${eventLeft}% + 3px)`;
  node.style.width = `calc(${eventWidth}% - 6px)`;
  node.style.top = `${(start / SHIFT_MINUTES_IN_VIEW) * 100}%`;
  node.style.height = `max(28px, calc(${(duration / SHIFT_MINUTES_IN_VIEW) * 100}% - 4px))`;
}

function updateProfileAssignButton() {
  if (!shiftProfileAssign) return;
  const hasChanges =
    shiftState.profileSelectedIds.size > 0
    || shiftState.profileUnassignIds.size > 0;
  shiftProfileAssign.disabled = !hasChanges;
  shiftProfileAssign.textContent = "Save changes";
}

function handleProfileEventClick(eventId, person) {
  const actuallyAssigned = isPersonAssignedToEvent(eventId, person.email);
  const pendingUnassign = shiftState.profileUnassignIds.has(eventId);

  if (actuallyAssigned && !pendingUnassign) {
    shiftState.profileUnassignIds.add(eventId);
    shiftState.profileSelectedIds.delete(eventId);
  } else if (actuallyAssigned && pendingUnassign) {
    shiftState.profileUnassignIds.delete(eventId);
    shiftState.profileSelectedIds.delete(eventId);
  } else if (shiftState.profileSelectedIds.has(eventId)) {
    shiftState.profileSelectedIds.delete(eventId);
  } else {
    shiftState.profileSelectedIds.add(eventId);
    shiftState.profileUnassignIds.delete(eventId);
  }

  renderVolunteerProfile();
}

function unassignPersonFromEvent(eventId, email) {
  if (!eventId || !email) return false;
  const state = getEventSlotState(eventId);
  let removed = false;
  ["volunteer", "mentor"].forEach((role) => {
    state[role].forEach((slot) => {
      if (slot.assigneeEmail === email) {
        slot.assigneeEmail = null;
        removed = true;
      }
    });
  });
  return removed;
}

function openVolunteerProfile(email) {
  const person = personByEmail(email);
  if (!person || !shiftProfileView) return;

  if (shiftState.currentView !== "profile") {
    shiftState.viewBeforeProfile = shiftState.currentView === "table" ? "table" : "calendar";
  }

  shiftState.profileEmail = email;
  shiftState.profileSelectedIds.clear();
  shiftState.profileUnassignIds.clear();
  shiftState.currentView = "profile";

  closeShiftMiniCalendar();
  closeAssignPicker();
  closeTableFilterMenu();
  calendarAPI.closeDetails();

  shiftTableView.hidden = true;
  shiftCalendarView.hidden = true;
  if (shiftTableToolbar) shiftTableToolbar.hidden = true;
  if (shiftCalendarToolbar) shiftCalendarToolbar.hidden = true;
  if (shiftMainHeader) shiftMainHeader.hidden = true;
  if (shiftPageTitle) shiftPageTitle.hidden = true;
  shiftProfileView.hidden = false;
  if (shiftProfileToolbar) shiftProfileToolbar.hidden = false;

  renderVolunteerProfile();
  requestAnimationFrame(scrollProfileCalendarToDefaultHour);
}

function closeVolunteerProfile({ restoreView = true } = {}) {
  shiftState.profileEmail = null;
  shiftState.profileSelectedIds.clear();
  shiftState.profileUnassignIds.clear();
  if (shiftProfileView) shiftProfileView.hidden = true;
  if (shiftProfileToolbar) shiftProfileToolbar.hidden = true;
  if (restoreView) setShiftView(shiftState.viewBeforeProfile || "calendar");
}

function scrollProfileCalendarToDefaultHour() {
  const scroll = shiftProfileView?.querySelector(":scope > .calendar-scroll");
  if (!scroll) return;
  const rowHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--row-height"),
  ) || 56;
  scroll.scrollTop = DEFAULT_SHIFT_SCROLL_HOUR * rowHeight;
}

function renderProfileHeader(person) {
  if (shiftProfileName) shiftProfileName.textContent = person.name;
  if (shiftProfileMeta) shiftProfileMeta.textContent = person.role;
  if (shiftProfileShiftCount) {
    shiftProfileShiftCount.textContent = formatShiftCount(countShiftsForPerson(person.email));
  }
}

function renderProfileAvailabilityBands(person) {
  profileWeekendDates().forEach((date, day) => {
    availabilityBandsForDay(person, date).forEach((band) => {
      const node = document.createElement("div");
      node.className = "shift-profile-availability-band";
      node.setAttribute("aria-hidden", "true");
      const dayWidth = 100 / PROFILE_DAY_COUNT;
      node.style.left = `calc(${day * dayWidth}% + 2px)`;
      node.style.width = `calc(${dayWidth}% - 4px)`;
      node.style.top = `${(band.start / SHIFT_MINUTES_IN_VIEW) * 100}%`;
      node.style.height = `${((band.end - band.start) / SHIFT_MINUTES_IN_VIEW) * 100}%`;
      shiftProfileCalendarGrid.append(node);
    });
  });
}

function renderProfileCalendar(person) {
  if (!shiftProfileDayHeaders || !shiftProfileTimeAxis || !shiftProfileCalendarGrid) return;

  shiftProfileCalendar?.style.setProperty("--day-count", String(PROFILE_DAY_COUNT));
  if (shiftProfileCalendar) shiftProfileCalendar.dataset.dayCount = String(PROFILE_DAY_COUNT);
  if (shiftProfileMonth) {
    shiftProfileMonth.textContent = calendarAPI.formatMonth(shiftState.profileWeekendStart);
  }

  shiftProfileDayHeaders.replaceChildren();
  profileWeekendDates().forEach((date) => {
    const header = document.createElement("div");
    header.className = "day-header";
    if (isSameDate(date, calendarAPI.DEMO_TODAY)) header.classList.add("is-today");
    header.innerHTML = `<span>${calendarAPI.formatDay(date)}</span>`;
    shiftProfileDayHeaders.append(header);
  });

  shiftProfileTimeAxis.replaceChildren();
  for (let hour = SHIFT_START_HOUR + 1; hour < SHIFT_END_HOUR; hour += 1) {
    const label = document.createElement("div");
    label.className = "time-label";
    label.style.top = `calc(var(--row-height) * ${hour - SHIFT_START_HOUR})`;
    const clockHour = hour % 12 || 12;
    const period = hour < 12 ? "AM" : "PM";
    label.textContent = `${clockHour} ${period}`;
    shiftProfileTimeAxis.append(label);
  }

  const events = eventsForProfileWeekend();
  const layouts = calculateProfileLayouts(events);
  shiftProfileCalendarGrid.replaceChildren();
  renderProfileAvailabilityBands(person);

  events.forEach((event) => {
    const day = dayIndexForEvent(event);
    if (day < 0) return;
    const status = profileEventStatus(event, person);

    ensureDemoCapacityForEvent(event.id);
    const layout = layouts.get(event.id) ?? { column: 0, columnCount: 1 };
    const fill = getEventFill(event.id);
    const types = event.types?.length ? event.types : [event.type];
    const outsideAvailability = status === "outside" || (status !== "assigned" && !eventFitsAvailability(event, person));
    const isFullUnavailable = status === "full";
    const node = document.createElement("button");
    node.type = "button";
    node.className = `calendar-event is-readonly shift-profile-event is-${status === "outside" ? "outside-availability" : status}`;
    node.dataset.id = event.id;
    node.dataset.type = event.type || types[0] || "Ceremony";
    node.classList.toggle("is-compact", event.duration <= 45);
    node.classList.toggle("is-outside-availability", outsideAvailability || isFullUnavailable);
    node.disabled = outsideAvailability || isFullUnavailable;
    node.setAttribute(
      "aria-label",
      `${event.name}, ${status === "outside" ? "unavailable" : status}${outsideAvailability && status !== "outside" ? ", outside availability" : ""}${isFullUnavailable ? ", full" : ""}, ${formatFillLabel(fill.filled, fill.total, { withFilledWord: true })}, ${calendarAPI.displayTime(event.start)} to ${calendarAPI.displayTime(event.start + event.duration)}`,
    );

    const main = document.createElement("span");
    main.className = "event-main";
    const title = document.createElement("strong");
    title.textContent = event.name;
    const location = document.createElement("span");
    location.className = "event-location";
    location.textContent = event.location || "Location TBD";
    main.append(title, location);
    node.append(main);

    if (fill.total > 0) {
      const badge = document.createElement("span");
      badge.className = "event-fill-indicator";
      badge.textContent = formatFillLabel(fill.filled, fill.total);
      node.append(badge);
    }

    positionProfileEvent(node, day, event.start, event.duration, layout);

    if (status === "assignable" || status === "selected" || status === "assigned") {
      node.addEventListener("click", () => handleProfileEventClick(event.id, person));
    }

    shiftProfileCalendarGrid.append(node);
  });
}

function renderVolunteerProfile() {
  const person = personByEmail(shiftState.profileEmail);
  if (!person || shiftProfileView?.hidden) return;
  renderProfileHeader(person);
  renderProfileCalendar(person);
  updateProfileAssignButton();
}

function assignSelectedProfileShifts() {
  const person = personByEmail(shiftState.profileEmail);
  if (!person) return;

  const hasChanges =
    shiftState.profileSelectedIds.size > 0
    || shiftState.profileUnassignIds.size > 0;
  if (!hasChanges) return;

  const role = slotRoleForPerson(person);
  let assignedCount = 0;
  let removedCount = 0;

  shiftState.profileUnassignIds.forEach((eventId) => {
    if (unassignPersonFromEvent(eventId, person.email)) removedCount += 1;
  });

  shiftState.profileSelectedIds.forEach((eventId) => {
    if (isPersonAssignedToEvent(eventId, person.email)) return;
    if (isEventFullForRole(eventId, role)) return;

    const state = getEventSlotState(eventId);
    let openIndex = findOpenSlot(eventId, role);
    if (openIndex === -1) {
      state[role].push({ assigneeEmail: null });
      openIndex = state[role].length - 1;
    }
    state[role][openIndex].assigneeEmail = person.email;
    assignedCount += 1;
  });

  shiftState.profileSelectedIds.clear();
  shiftState.profileUnassignIds.clear();
  renderVolunteerProfile();
  if (!shiftTableView.hidden) renderVolunteerTable();
  if (!shiftCalendarView.hidden) {
    renderShiftCalendar();
    updateEventFillIndicators();
  }

  if (assignedCount > 0 || removedCount > 0) {
    calendarAPI.showToast(`Changes saved for ${person.name}`);
  } else {
    calendarAPI.showToast("No changes to save");
  }

  if (pageMyShifts && !pageMyShifts.hidden) renderMyShiftsPage();
}

/* ── My Shifts ───────────────────────────────────────────────────────── */
function currentVolunteer() {
  return personByEmail(CURRENT_VOLUNTEER_EMAIL);
}

function myshiftsWeekendDates() {
  return Array.from({ length: MYSHIFTS_DAY_COUNT }, (_, day) => (
    calendarAPI.addDays(shiftState.myshiftsWeekendStart, day)
  ));
}

function eventsAssignedToCurrentVolunteer() {
  const person = currentVolunteer();
  if (!person) return [];
  return calendarAPI.getEvents()
    .filter((event) => isPersonAssignedToEvent(event.id, person.email))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start || a.name.localeCompare(b.name));
}

function eventsForMyShiftsWeekend() {
  const keys = new Set(myshiftsWeekendDates().map((date) => calendarAPI.dateKey(date)));
  return eventsAssignedToCurrentVolunteer().filter((event) => keys.has(event.date));
}

function dayIndexForMyShiftsEvent(event) {
  return myshiftsWeekendDates().findIndex((date) => calendarAPI.dateKey(date) === event.date);
}

function calculateMyShiftsLayouts(events) {
  const byDay = new Map();
  events.forEach((event) => {
    const day = dayIndexForMyShiftsEvent(event);
    if (day < 0) return;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(event);
  });

  const layouts = new Map();
  byDay.forEach((dayEvents) => {
    calculateShiftLayouts(dayEvents).forEach((layout, id) => layouts.set(id, layout));
  });
  return layouts;
}

function positionMyShiftsEvent(node, day, start, duration, layout = { column: 0, columnCount: 1 }) {
  const dayWidth = 100 / MYSHIFTS_DAY_COUNT;
  const eventWidth = dayWidth / layout.columnCount;
  const eventLeft = day * dayWidth + layout.column * eventWidth;
  node.style.left = `calc(${eventLeft}% + 3px)`;
  node.style.width = `calc(${eventWidth}% - 6px)`;
  node.style.top = `${(start / SHIFT_MINUTES_IN_VIEW) * 100}%`;
  node.style.height = `max(28px, calc(${(duration / SHIFT_MINUTES_IN_VIEW) * 100}% - 4px))`;
}

function scrollMyShiftsCalendarToDefaultHour() {
  const scroll = myshiftsCalendar?.closest(".calendar-scroll");
  if (!scroll) return;
  const rowHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--row-height"),
  ) || 56;
  scroll.scrollTop = DEFAULT_SHIFT_SCROLL_HOUR * rowHeight;
}

function navigateMyShiftsWeekend(direction) {
  shiftState.myshiftsWeekendStart = calendarAPI.addDays(
    shiftState.myshiftsWeekendStart,
    direction * MYSHIFTS_DAY_COUNT,
  );
  renderMyShiftsPage();
}

function renderMyShiftsHeader(person, assignedEvents) {
  if (myshiftsRole) myshiftsRole.textContent = person.role;
  if (myshiftsCount) myshiftsCount.textContent = formatShiftCount(assignedEvents.length);
  if (myshiftsMonthLabelText) {
    myshiftsMonthLabelText.textContent = calendarAPI.formatMonth(shiftState.myshiftsWeekendStart);
  }
}

function volunteerGuidanceForEvent(event) {
  if (event.notes?.trim()) {
    return { instructions: event.notes.trim() };
  }
  const type = (event.types?.length ? event.types[0] : event.type) || "Ceremony";
  const guides = {
    Ceremony: {
      instructions: "Arrive 15 minutes early, wear your volunteer badge, and help guide attendees to seating. Stay at your post until the ceremony officially ends.",
    },
    Food: {
      instructions: "Help with setup, serving, and cleanup. Confirm dietary labels before handing out meals and restock as needed.",
    },
    Workshop: {
      instructions: "Welcome hackers, point them to seats, and escalate tech questions to mentors or sponsor staff.",
    },
    Social: {
      instructions: "Help with crowd flow, answer basic wayfinding questions, and keep pathways clear.",
    },
  };
  return guides[type] || {
    instructions: "Check in with your Shift Manager when you arrive, follow on-site signage, and stay for your full assigned window.",
  };
}

function clearMyShiftsSelection() {
  shiftState.myshiftsSelectedId = null;
  if (myshiftsDetail) myshiftsDetail.hidden = true;
  if (myshiftsDetailEmpty) myshiftsDetailEmpty.hidden = false;
  myshiftsCalendarGrid?.querySelectorAll(".myshifts-event.is-selected").forEach((node) => {
    node.classList.remove("is-selected");
  });
}

function selectMyShiftsEvent(event, node) {
  if (!event) {
    clearMyShiftsSelection();
    return;
  }

  shiftState.myshiftsSelectedId = event.id;
  myshiftsCalendarGrid?.querySelectorAll(".myshifts-event").forEach((item) => {
    item.classList.toggle("is-selected", item.dataset.id === event.id);
  });
  if (node) node.classList.add("is-selected");

  const eventDate = new Date(`${event.date}T00:00:00`);
  const guidance = volunteerGuidanceForEvent(event);

  if (myshiftsDetailTitle) myshiftsDetailTitle.textContent = event.name;
  if (myshiftsDetailDatetime) {
    myshiftsDetailDatetime.textContent = `${calendarAPI.formatFullDay(eventDate)} · ${calendarAPI.displayTime(event.start)} – ${calendarAPI.displayTime(event.start + event.duration)}`;
  }
  if (myshiftsDetailLocation) myshiftsDetailLocation.textContent = event.location || "Location TBD";
  if (myshiftsDetailDescription) {
    myshiftsDetailDescription.textContent =
      event.description || "No description has been added for this event.";
  }
  if (myshiftsDetailTags) {
    myshiftsDetailTags.replaceChildren();
    const types = event.types?.length ? event.types : [event.type];
    types.filter(Boolean).forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "detail-tag";
      chip.textContent = tag;
      myshiftsDetailTags.append(chip);
    });
  }
  if (myshiftsDetailVolunteers) {
    const filled = getSlotFill(getEventSlotState(event.id).volunteer).filled;
    myshiftsDetailVolunteers.textContent = formatVolunteerAssignedCount(filled);
  }
  if (myshiftsDetailInstructions) myshiftsDetailInstructions.textContent = guidance.instructions;

  if (myshiftsDetailEmpty) myshiftsDetailEmpty.hidden = true;
  if (myshiftsDetail) myshiftsDetail.hidden = false;
}

function renderMyShiftsCalendar(weekendEvents) {
  if (!myshiftsDayHeaders || !myshiftsTimeAxis || !myshiftsCalendarGrid) return;

  myshiftsCalendar?.style.setProperty("--day-count", String(MYSHIFTS_DAY_COUNT));
  if (myshiftsCalendar) myshiftsCalendar.dataset.dayCount = String(MYSHIFTS_DAY_COUNT);

  myshiftsDayHeaders.replaceChildren();
  myshiftsWeekendDates().forEach((date) => {
    const header = document.createElement("div");
    header.className = "day-header";
    if (isSameDate(date, calendarAPI.DEMO_TODAY)) header.classList.add("is-today");
    header.innerHTML = `<span>${calendarAPI.formatDay(date)}</span>`;
    myshiftsDayHeaders.append(header);
  });

  myshiftsTimeAxis.replaceChildren();
  for (let hour = SHIFT_START_HOUR + 1; hour < SHIFT_END_HOUR; hour += 1) {
    const label = document.createElement("div");
    label.className = "time-label";
    label.style.top = `calc(var(--row-height) * ${hour - SHIFT_START_HOUR})`;
    const clockHour = hour % 12 || 12;
    const period = hour < 12 ? "AM" : "PM";
    label.textContent = `${clockHour} ${period}`;
    myshiftsTimeAxis.append(label);
  }

  const layouts = calculateMyShiftsLayouts(weekendEvents);
  myshiftsCalendarGrid.replaceChildren();

  weekendEvents.forEach((event) => {
    const day = dayIndexForMyShiftsEvent(event);
    if (day < 0) return;
    const layout = layouts.get(event.id) ?? { column: 0, columnCount: 1 };
    const types = event.types?.length ? event.types : [event.type];
    const node = document.createElement("button");
    node.type = "button";
    node.className = "calendar-event is-readonly myshifts-event is-assigned";
    node.dataset.id = event.id;
    node.dataset.type = event.type || types[0] || "Ceremony";
    node.classList.toggle("is-compact", event.duration <= 45);
    node.classList.toggle("is-selected", event.id === shiftState.myshiftsSelectedId);
    node.setAttribute(
      "aria-label",
      `${event.name}, ${calendarAPI.displayTime(event.start)} to ${calendarAPI.displayTime(event.start + event.duration)}, ${event.location || "Location TBD"}`,
    );

    const main = document.createElement("span");
    main.className = "event-main";
    const title = document.createElement("strong");
    title.textContent = event.name;
    const location = document.createElement("span");
    location.className = "event-location";
    location.textContent = event.location || "Location TBD";
    main.append(title, location);
    node.append(main);

    positionMyShiftsEvent(node, day, event.start, event.duration, layout);
    node.addEventListener("click", () => selectMyShiftsEvent(event, node));
    myshiftsCalendarGrid.append(node);
  });

  const selected = weekendEvents.find((event) => event.id === shiftState.myshiftsSelectedId);
  if (selected) {
    const selectedNode = myshiftsCalendarGrid.querySelector(`[data-id="${selected.id}"]`);
    selectMyShiftsEvent(selected, selectedNode);
  } else {
    clearMyShiftsSelection();
  }
}

function renderMyShiftsPage() {
  seedDemoSlotsOnce();
  const person = currentVolunteer();
  if (!person || !pageMyShifts || pageMyShifts.hidden) return;

  const allAssigned = eventsAssignedToCurrentVolunteer();
  const weekendEvents = eventsForMyShiftsWeekend();
  renderMyShiftsHeader(person, allAssigned);
  renderMyShiftsCalendar(weekendEvents);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const page = link.dataset.page;
    setDashboardPage(page);
    if (page) window.location.hash = page;
  });
});

shiftViewToggle?.addEventListener("click", () => {
  setShiftView(shiftViewToggle.dataset.targetView || "calendar");
});

shiftTableViewButton?.addEventListener("click", () => {
  setShiftView(shiftTableViewButton.dataset.targetView || "table");
});

shiftProfileBack?.addEventListener("click", () => closeVolunteerProfile());
shiftProfileAssign?.addEventListener("click", () => assignSelectedProfileShifts());

myshiftsPrevious?.addEventListener("click", () => navigateMyShiftsWeekend(-1));
myshiftsNext?.addEventListener("click", () => navigateMyShiftsWeekend(1));

shiftTableFilterButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = shiftTableFilterMenu.hidden;
  if (!willOpen) {
    closeTableFilterMenu();
    return;
  }
  closeCalendarFilterMenu();
  closeTableFilterSubmenus();
  shiftTableFilterMenu.hidden = false;
  shiftTableFilterButton.setAttribute("aria-expanded", "true");
});

shiftCalendarFilterButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = shiftCalendarFilterMenu.hidden;
  if (!willOpen) {
    closeCalendarFilterMenu();
    return;
  }
  closeTableFilterMenu();
  closeShiftMiniCalendar();
  shiftCalendarFilterMenu.hidden = false;
  shiftCalendarFilterButton.setAttribute("aria-expanded", "true");
});

shiftTableFilterMenu?.querySelectorAll(".shift-filter-item").forEach((item) => {
  const trigger = item.querySelector(".shift-filter-submenu-trigger");
  if (!trigger) return;
  item.addEventListener("mouseenter", () => {
    closeTableFilterSubmenus();
    trigger.setAttribute("aria-expanded", "true");
  });
  item.addEventListener("mouseleave", () => {
    trigger.setAttribute("aria-expanded", "false");
  });
});

shiftTableFilterMenu?.addEventListener("change", (event) => {
  if (event.target.name === "shift-table-role-filter") {
    if (event.target.checked) shiftState.tableRoleFilters.add(event.target.value);
    else shiftState.tableRoleFilters.delete(event.target.value);
    renderVolunteerTable();
    return;
  }
  if (event.target.name === "shift-table-cpr-filter") {
    shiftState.tableCprFilter = event.target.value;
    renderVolunteerTable();
  }
});

shiftCalendarFilterMenu?.addEventListener("change", (event) => {
  if (event.target.name !== "shift-calendar-type-filter") return;
  if (event.target.checked) shiftState.calendarTypeFilters.add(event.target.value);
  else shiftState.calendarTypeFilters.delete(event.target.value);
  renderShiftCalendar();
});

shiftTableUploadButton?.addEventListener("click", () => {
  // Upload / sync flow comes later.
  window.alert("Connect or upload volunteer data to sync this table.");
});

/* ── Event listeners and startup ─────────────────────────────────────── */
document.addEventListener("pointerdown", (event) => {
  if (shiftTableFilterMenu && !shiftTableFilterMenu.hidden) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const clickedInside =
      shiftTableFilterMenu.contains(event.target)
      || shiftTableFilterButton?.contains(event.target)
      || path.includes(shiftTableFilterMenu)
      || path.includes(shiftTableFilterButton);
    if (!clickedInside) closeTableFilterMenu();
  }

  if (shiftCalendarFilterMenu && !shiftCalendarFilterMenu.hidden) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const clickedInside =
      shiftCalendarFilterMenu.contains(event.target)
      || shiftCalendarFilterButton?.contains(event.target)
      || path.includes(shiftCalendarFilterMenu)
      || path.includes(shiftCalendarFilterButton);
    if (!clickedInside) closeCalendarFilterMenu();
  }
});

shiftPrevious.addEventListener("click", () => navigateShiftCalendar(-1));
shiftNext.addEventListener("click", () => navigateShiftCalendar(1));

shiftMonthLabel.addEventListener("click", () => {
  if (shiftMiniCalendar.hidden) openShiftMiniCalendar();
  else closeShiftMiniCalendar();
});

document.querySelector("#shift-mini-previous").addEventListener("click", () => shiftMiniMonth(-1));
document.querySelector("#shift-mini-next").addEventListener("click", () => shiftMiniMonth(1));

document.addEventListener("click", (event) => {
  if (
    !shiftMiniCalendar.hidden
    && !shiftMiniCalendar.contains(event.target)
    && !shiftMonthLabel.contains(event.target)
  ) {
    closeShiftMiniCalendar();
  }
});

shiftViewDetails.addEventListener("click", () => {
  if (!shiftState.selectedId) return;
  setAssignDetailsExpanded(!shiftState.detailsExpanded);
});

shiftAssignSections.forEach((section) => {
  const role = section.dataset.shiftRole;

  section.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!shiftState.selectedId) return;
      const step = Number(button.dataset.step);
      const slots = getEventSlotState(shiftState.selectedId)[role] ?? [];
      setRoleSlotCount(role, slots.length + step);
    });
  });
});

shiftAssignPickerBack.addEventListener("click", closeAssignPicker);

shiftAssignFilterButton.addEventListener("click", () => {
  const willOpen = shiftAssignFilterMenu.hidden;
  shiftAssignFilterMenu.hidden = !willOpen;
  shiftAssignFilterButton.setAttribute("aria-expanded", String(willOpen));
});

shiftAssignFilterMenu.addEventListener("change", (event) => {
  if (event.target.name !== "shift-availability-filter") return;
  shiftState.availabilityFilter = event.target.value;
  renderAssignPeople();
});

document.addEventListener("click", (event) => {
  if (
    !shiftAssignFilterMenu.hidden
    && !shiftAssignFilterMenu.contains(event.target)
    && !shiftAssignFilterButton.contains(event.target)
  ) {
    closeAssignFilterMenu();
  }
});

shiftAssignSearch.addEventListener("input", () => {
  shiftState.pickerQuery = shiftAssignSearch.value;
  renderAssignPeople();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && shiftState.currentView === "profile") {
    event.preventDefault();
    closeVolunteerProfile();
    return;
  }
  if (event.key === "Escape" && !shiftAssignPicker.hidden) {
    event.preventDefault();
    closeAssignPicker();
  }
});

calendarAPI.subscribe(() => {
  if (!shiftCalendarView.hidden) renderShiftCalendar();
  if (shiftState.currentView === "profile") renderVolunteerProfile();
  if (pageMyShifts && !pageMyShifts.hidden) renderMyShiftsPage();
});

window.addEventListener("resize", () => {
  if (!shiftTableView.hidden) fillVolunteerTableGrid();
});

seedDemoSlotsOnce();
renderVolunteerTable();
renderShiftCalendar();
renderAssignSlots();
const initialPage = window.location.hash.replace(/^#/, "");
setDashboardPage(["events", "shifts", "myshifts", "teamfinder"].includes(initialPage) ? initialPage : "events");
