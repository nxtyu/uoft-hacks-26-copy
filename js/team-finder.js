/* Team Finder
 *
 * Four tabs: Hackers and Teams (browse cards, search, filter, send a join
 * request with an optional note), Requests (incoming and outgoing, accept or
 * decline), and Manage Team (edit the team profile, visibility and
 * recruiting switches, members, leave team). The signed-in hacker is
 * teamfinderState.currentHackerId and starts on team "t1".
 *
 * Clicks on the page are handled in one delegated listener keyed on each
 * button's data-action. Nothing is saved; everything resets on reload.
 */


/* ── Sample hackers, teams and requests (replace with API data) ──────── */
const TEAMFINDER_HACKERS = [
  {
    id: "h1",
    name: "Tim Jones",
    pronouns: "he/him",
    year: "2nd year",
    years: "2024 - 2029",
    program: "Computer Science",
    school: "University of Toronto",
    about: "Here to ship a polished student product with strong UX — ideally something people would actually use after the weekend.",
    bringToTeam: "Turning rough ideas into flows people can actually use — wireframes by hour two, a working frontend by Saturday night.",
    funAnswer: "I keep a running list of every app onboarding I've screenshotted. It's over 400 now.",
    skills: ["Design", "Web Apps", "Software"],
    projects: ["Consumer", "Fintech"],
    hackerType: ["Ambitious"],
    discord: "timj_22",
    experiences: [
      { title: "Product Design Intern @ Shopify", period: "2025", details: ["Redesigned the merchant onboarding flow.", "Ran usability tests with 12 new merchants."] },
      { title: "Frontend Developer @ UofT Hacks", period: "2024", details: ["Built and maintained the event dashboard.", "Shipped the volunteer check-in screen."] },
    ],
    socials: { website: "timjones.ca", github: "@timjones", linkedin: "@tim-jones-22" },
    teamId: "t1",
  },
  {
    id: "h2",
    name: "Ava Chen",
    pronouns: "she/her",
    year: "3rd year",
    years: "2024 - 2029",
    program: "Computer Science",
    school: "University of Waterloo",
    about: "Want to build a hardware + ML prototype that feels magical in demo — sensors, firmware, and a thin companion app.",
    bringToTeam: "Firmware, sensor wiring and the ML model on top. I can get a board talking to a laptop fast.",
    funAnswer: "I once built a plant that texts me when it needs water. It texts a lot.",
    skills: ["Hardware", "Machine Learning", "Software"],
    projects: ["Transportation", "AR / VR"],
    hackerType: ["Analytical", "Artistic"],
    discord: "ava.c",
    experiences: [
      { title: "Hardware Intern @ Tesla", period: "2025", details: ["Calibrated sensors for the battery team.", "Wrote test rigs for thermal monitoring."] },
      { title: "Research Assistant @ Waterloo Robotics", period: "2024", details: ["Built firmware for an autonomous rover.", "Tuned its obstacle-avoidance model."] },
    ],
    socials: { github: "@avachen", linkedin: "@ava-chen", x: "@avabuilds" },
    teamId: null,
  },
  {
    id: "h3",
    name: "Jordan Kim",
    pronouns: "they/them",
    year: "1st year",
    years: "2025 - 2030",
    program: "Engineering Science",
    school: "University of Toronto",
    about: "Looking to join a playful AR/game idea and own the frontend so the demo looks intentional, not slapped together.",
    bringToTeam: "Frontend polish: motion, layout and the small details that make a demo feel finished.",
    funAnswer: "I've beaten every Zelda game, but I still can't parallel park.",
    skills: ["Design", "Mobile Apps", "Web Apps"],
    projects: ["AR / VR", "Game Development"],
    hackerType: ["Artistic"],
    discord: "jordank",
    socials: { website: "jordankim.dev", instagram: "@jordanmakes" },
    teamId: "t3",
  },
  {
    id: "h4",
    name: "Sam Torres",
    pronouns: "he/him",
    year: "4th year",
    years: "2022 - 2027",
    program: "Electrical Engineering",
    school: "University of Toronto",
    about: "Here to build secure, reliable backend for a fintech or security tool — infra that won’t fall over during judging.",
    bringToTeam: "Backend and infra that stays up during judging — auth, databases and deploys.",
    funAnswer: "My terminal theme changes with the seasons. Right now it's autumn.",
    skills: ["Web Apps", "Software"],
    projects: ["Cybersecurity", "Fintech"],
    hackerType: ["Driver", "Analytical"],
    discord: "sam.t",
    teamId: "t2",
  },
  {
    id: "h5",
    name: "Priya Shah",
    pronouns: "she/her",
    year: "2nd year",
    years: "2024 - 2029",
    program: "Computer Science",
    school: "York University",
    about: "Want a clear problem in fintech or HCI where ML actually helps — clean data story and a demo people understand.",
    bringToTeam: "Data cleaning and modelling, plus explaining the results so non-ML people get it.",
    funAnswer: "I can name every Toronto subway station in order, both directions.",
    skills: ["Machine Learning", "Software", "Web Apps"],
    projects: ["Fintech", "Consumer"],
    hackerType: ["Analytical", "Ambitious"],
    discord: "priya.s",
    teamId: null,
  },
  {
    id: "h6",
    name: "Marcus Lee",
    pronouns: "he/him",
    year: "3rd year",
    years: "2023 - 2028",
    program: "Engineering",
    school: "University of Toronto",
    about: "Here for an IoT or game build with real hardware in the loop — something you can hold and show, not just slides.",
    bringToTeam: "Hands-on hardware: soldering, 3D printing and making things that survive a demo table.",
    funAnswer: "I build tiny arcade cabinets out of cereal boxes.",
    skills: ["Hardware", "Mobile Apps", "Design"],
    projects: ["Transportation", "Game Development"],
    hackerType: ["Driver"],
    discord: "marcusl",
    teamId: "t5",
  },
  {
    id: "h7",
    name: "Sofia Patel",
    pronouns: "she/her",
    year: "1st year",
    years: "2025 - 2030",
    program: "Rotman Commerce",
    school: "University of Toronto",
    about: "Want to shape a fintech/HCI product story — research, pitch, and a polished narrative for the final demo.",
    bringToTeam: "User research, the pitch and slides that tell one clear story.",
    funAnswer: "I've interviewed my grandma about her banking app three times. She has opinions.",
    skills: ["Design", "Software"],
    projects: ["Fintech", "Consumer"],
    hackerType: ["Ambitious", "Artistic"],
    discord: "sofiap",
    teamId: null,
  },
  {
    id: "h8",
    name: "Riley Nguyen",
    pronouns: "they/them",
    year: "4th year",
    years: "2022 - 2027",
    program: "Computer Engineering",
    school: "McMaster University",
    about: "Here to go deep on an ambitious cybersecurity or AR build and leave with something that feels production-adjacent.",
    bringToTeam: "Security thinking from the start, and the stubbornness to finish an ambitious build.",
    funAnswer: "I collect old encryption puzzles and solve one every Sunday.",
    skills: ["Web Apps", "Software"],
    projects: ["Cybersecurity", "AR / VR"],
    hackerType: ["Ambitious", "Driver"],
    discord: "riley.n",
    teamId: "t4",
  },
  {
    id: "h9",
    name: "Alex Rivera",
    pronouns: "he/him",
    year: "2nd year",
    years: "2024 - 2029",
    program: "Cognitive Science",
    school: "University of Toronto",
    about: "Want to build an accessible HCI or game experience — thoughtful interactions, not just a feature checklist.",
    bringToTeam: "Accessible, considered interactions — keyboard, screen reader and colour contrast included.",
    funAnswer: "I've watched every Pixar short in release order, twice.",
    skills: ["Design", "Web Apps", "Mobile Apps"],
    projects: ["Consumer", "Game Development"],
    hackerType: ["Artistic", "Analytical"],
    discord: "alexr",
    teamId: null,
  },
  {
    id: "h10",
    name: "Nina Okonkwo",
    pronouns: "she/her",
    year: "3rd year",
    years: "2023 - 2028",
    program: "Computer Science",
    school: "University of Toronto",
    about: "Here to prototype a cybersecurity education tool students would actually open — sharp demo, clean story.",
    bringToTeam: "Turning a technical topic into something students want to learn, with a sharp demo.",
    funAnswer: "My cat has her own GitHub account. She commits more than me.",
    skills: ["Software", "Web Apps"],
    projects: ["Cybersecurity", "Consumer"],
    hackerType: ["Analytical"],
    discord: "nina.o",
    teamId: "t2",
  },
  {
    id: "h11",
    name: "Dev Patel",
    pronouns: "he/him",
    year: "2nd year",
    years: "2024 - 2029",
    program: "Engineering Science",
    school: "Western University",
    about: "Want a fintech build with real users in mind — payments flow, fraud edge cases, and a crisp pitch.",
    bringToTeam: "Payments flows and the edge cases nobody thinks about until the demo breaks.",
    funAnswer: "I track my coffee intake in a spreadsheet with conditional formatting.",
    skills: ["Software", "Web Apps", "Machine Learning"],
    projects: ["Fintech", "Cybersecurity"],
    hackerType: ["Ambitious", "Driver"],
    discord: "dev.p",
    teamId: null,
  },
  {
    id: "h12",
    name: "Maya Chen",
    pronouns: "she/her",
    year: "4th year",
    years: "2022 - 2027",
    program: "Architecture",
    school: "University of Toronto",
    about: "Looking for an AR/VR spatial experience where design systems and presence matter as much as the tech.",
    bringToTeam: "Spatial and AR design, prototyped in tools the team can iterate on together.",
    funAnswer: "I sketch every building I walk into. Myhal is my favourite so far.",
    skills: ["Design", "Mobile Apps", "Hardware"],
    projects: ["AR / VR", "Consumer"],
    hackerType: ["Artistic"],
    discord: "maya.c",
    teamId: "t6",
  },
  {
    id: "h13",
    name: "Owen Brooks",
    pronouns: "he/him",
    year: "1st year",
    years: "2025 - 2030",
    program: "Computer Science",
    school: "University of Toronto",
    about: "Here to ship a tiny playable game loop — fun first, polish second, and something judges can try in 30 seconds.",
    bringToTeam: "Fast game loops: I'll have something playable in the first few hours.",
    funAnswer: "My first game was a Flappy Bird clone starring my dog.",
    skills: ["Software", "Design", "Mobile Apps"],
    projects: ["Game Development", "AR / VR"],
    hackerType: ["Ambitious", "Artistic"],
    discord: "owen.b",
    teamId: null,
  },
  {
    id: "h14",
    name: "Lina Park",
    pronouns: "she/her",
    year: "3rd year",
    years: "2023 - 2028",
    program: "Statistics",
    school: "University of Toronto",
    about: "Want an IoT + data project where sensors feed a live dashboard people can understand at a glance.",
    bringToTeam: "Sensor data piped into live dashboards that make sense at a glance.",
    funAnswer: "I've run a weather station on my balcony since grade nine.",
    skills: ["Machine Learning", "Hardware", "Web Apps"],
    projects: ["Transportation", "Fintech"],
    hackerType: ["Analytical", "Driver"],
    discord: "lina.p",
    teamId: "t1",
  },
  {
    id: "h15",
    name: "Chris Alvarez",
    pronouns: "they/them",
    year: "2nd year",
    years: "2024 - 2029",
    program: "Rotman Commerce",
    school: "University of Toronto",
    about: "Here to help a team turn a messy idea into a clear product story — scope, users, and a confident final demo.",
    bringToTeam: "Scoping: keeping the team focused on one thing we can finish and demo well.",
    funAnswer: "I've been to 11 hackathons and still bring the same lucky hoodie.",
    skills: ["Design", "Software", "Web Apps"],
    projects: ["Consumer", "Fintech"],
    hackerType: ["Driver", "Ambitious"],
    discord: "chris.a",
    teamId: null,
  },
];

const TEAMFINDER_TEAMS = [
  {
    id: "t1",
    name: "Marvin’s Minions",
    description: "Looking to build a cool hardware project with some cool people. Join our team, we are really fun!",
    size: 3,
    maxSize: 4,
    skills: ["Design", "Software", "Hardware"],
    projects: ["Transportation", "AR / VR"],
    visibility: "Public",
    openToMembers: true,
  },
  {
    id: "t2",
    name: "Byte Brigade",
    description: "Building an accessible productivity tool for students during the weekend.",
    size: 2,
    maxSize: 4,
    skills: ["Web Apps", "Design", "Machine Learning"],
    projects: ["Consumer", "Fintech"],
    visibility: "Public",
    openToMembers: true,
  },
  {
    id: "t3",
    name: "Pixel Pilots",
    description: "Game jam energy with a small playable prototype as the goal.",
    size: 4,
    maxSize: 4,
    skills: ["Design", "Software", "Mobile Apps"],
    projects: ["Game Development", "AR / VR"],
    visibility: "Private",
    openToMembers: false,
  },
  {
    id: "t4",
    name: "North Star Lab",
    description: "Exploring a lightweight cybersecurity tooling idea for student clubs.",
    size: 1,
    maxSize: 4,
    skills: ["Web Apps", "Software"],
    projects: ["Cybersecurity", "Fintech"],
    visibility: "Public",
    openToMembers: true,
  },
  {
    id: "t5",
    name: "Circuit Circus",
    description: "Need one more builder for sensors + a simple companion app.",
    size: 3,
    maxSize: 4,
    skills: ["Hardware", "Mobile Apps", "Design"],
    projects: ["Transportation", "Game Development"],
    visibility: "Public",
    openToMembers: true,
  },
  {
    id: "t6",
    name: "Quiet Quarters",
    description: "Calm team looking for a designer who likes thoughtful UX.",
    size: 2,
    maxSize: 4,
    skills: ["Design", "Web Apps"],
    projects: ["Consumer"],
    visibility: "Public",
    openToMembers: true,
  },
];

const TEAMFINDER_REQUESTS = [
  {
    id: "r1",
    kind: "hacker",
    name: "Priya Shah",
    pronouns: "she/her",
    year: "2nd year",
    program: "Computer Science",
    school: "University of Toronto",
    direction: "incoming",
    recency: "new",
    note: "Hey! Your fintech + HCI direction matches what I want to build this weekend. Would love to join if you still need ML help.",
  },
  {
    id: "r2",
    kind: "hacker",
    name: "Marcus Lee",
    pronouns: "he/him",
    year: "3rd year",
    program: "Engineering",
    school: "University of Toronto",
    direction: "incoming",
    recency: "new",
  },
  {
    id: "r6",
    kind: "team",
    name: "Byte Brigade",
    pronouns: "team",
    year: "2/4",
    program: "members",
    school: "Public",
    direction: "incoming",
    recency: "old",
    note: "We’re building an accessible productivity tool and think you’d be a great fit for the UX side. Want to join?",
  },
  {
    id: "r3",
    kind: "hacker",
    name: "Sofia Patel",
    pronouns: "she/her",
    year: "1st year",
    program: "Rotman Commerce",
    school: "University of Toronto",
    direction: "outgoing",
    status: "requested",
    recency: "new",
  },
  {
    id: "r5",
    kind: "hacker",
    name: "Jordan Kim",
    pronouns: "they/them",
    year: "1st year",
    program: "Engineering Science",
    school: "University of Toronto",
    direction: "outgoing",
    status: "declined",
    recency: "old",
  },
  {
    id: "r7",
    kind: "team",
    name: "Marvin’s Minions",
    pronouns: "team",
    year: "3/4",
    program: "members",
    school: "Public",
    direction: "outgoing",
    status: "requested",
    recency: "new",
    note: "Love the hardware angle — I can help with sensors + a simple companion app if you still have a spot.",
  },
  {
    id: "r8",
    kind: "team",
    name: "Quiet Quarters",
    pronouns: "team",
    year: "2/4",
    program: "members",
    school: "Public",
    direction: "outgoing",
    status: "declined",
    recency: "old",
  },
  {
    id: "r4",
    kind: "hacker",
    name: "Alex Rivera",
    pronouns: "he/him",
    year: "2nd year",
    program: "Cognitive Science",
    school: "University of Toronto",
    direction: "incoming",
    recency: "old",
  },
];

/* ── State and filter options ────────────────────────────────────────── */
const teamfinderState = {
  tab: "hackers",
  joinedTeamId: "t1",
  currentHackerId: "h1",
  query: "",
  searchScope: null,
  hackerVisibleCount: 8,
  manageEditing: false,
  requestedHackerIds: new Set(),
  requestedTeamIds: new Set(),
  filters: {
    teamStatus: new Set(),
    hackerType: new Set(),
    skills: new Set(),
    projects: new Set(),
    requestDirection: new Set(),
    requestRecency: new Set(),
    requestStatus: new Set(),
  },
};

const TEAMFINDER_HACKER_PAGE_SIZE = 8;

/* The design labels this row "Fun question"; swap in the real prompt once
   the application form settles on one. */
const TEAMFINDER_FUN_QUESTION = "Fun question";
const TEAMFINDER_PROJECT_OPTIONS = ["Fintech", "Cybersecurity", "Game Development", "AR / VR", "Consumer", "Transportation"];
const TEAMFINDER_SKILL_OPTIONS = [
  "Design",
  "Machine Learning",
  "Hardware",
  "Mobile Apps",
  "Web Apps",
  "Software",
];

const teamfinderPage = document.querySelector("#page-teamfinder");
const teamfinderSearch = document.querySelector("#teamfinder-search");
const teamfinderSearchWrap = document.querySelector(".teamfinder-search-wrap");
const teamfinderSearchPopup = document.querySelector("#teamfinder-search-popup");
const teamfinderSearchChip = document.querySelector("#teamfinder-search-chip");
const teamfinderFilters = document.querySelector("#teamfinder-filters");
const teamfinderRequestFilters = document.querySelector("#teamfinder-request-filters");
const teamfinderClearFilters = document.querySelector("#teamfinder-clear-filters");
const teamfinderSidebar = document.querySelector(".teamfinder-sidebar");
const teamfinderSidebarTitle = document.querySelector("#teamfinder-sidebar-title");
const teamfinderSidebarDesc = document.querySelector("#teamfinder-sidebar-desc");
const teamfinderSidebarActions = document.querySelector("#teamfinder-sidebar-actions");
const teamfinderLayout = document.querySelector(".teamfinder-layout");
const teamfinderTabs = document.querySelectorAll(".teamfinder-tab");
const panelHackers = document.querySelector("#tf-panel-hackers");
const panelTeams = document.querySelector("#tf-panel-teams");
const panelRequests = document.querySelector("#tf-panel-requests");
const requestsTabCount = document.querySelector("#tf-tab-requests-count");
const panelManage = document.querySelector("#tf-panel-manage");
const teamfinderPanelCard = document.querySelector("#teamfinder-panel-card");
const teamfinderScrollHint = document.querySelector("#teamfinder-scroll-hint");
const teamfinderHelpButton = document.querySelector("#teamfinder-help-button");
const helpDialog = document.querySelector("#teamfinder-help-dialog");
const helpClose = document.querySelector("#teamfinder-help-close");
const joinDialog = document.querySelector("#teamfinder-join-dialog");
const joinForm = document.querySelector("#teamfinder-join-form");
const joinInput = document.querySelector("#teamfinder-join-input");
const joinClose = document.querySelector("#teamfinder-join-close");
const joinCancel = document.querySelector("#teamfinder-join-cancel");
const noteDialog = document.querySelector("#teamfinder-note-dialog");
const noteForm = document.querySelector("#teamfinder-note-form");
const noteName = document.querySelector("#teamfinder-note-name");
const noteInput = document.querySelector("#teamfinder-note-input");
const noteClose = document.querySelector("#teamfinder-note-close");
const noteSkip = document.querySelector("#teamfinder-note-skip");
const profileDialog = document.querySelector("#teamfinder-profile-dialog");
const profileBody = document.querySelector("#teamfinder-profile-body");
const profileTitle = document.querySelector("#teamfinder-profile-title");
const profileDismiss = document.querySelector("#teamfinder-profile-dismiss");
const profileRequest = document.querySelector("#teamfinder-profile-request");
const confirmDialog = document.querySelector("#teamfinder-confirm-dialog");
const confirmForm = document.querySelector("#teamfinder-confirm-form");
const confirmTitle = document.querySelector("#teamfinder-confirm-title");
const confirmCopy = document.querySelector("#teamfinder-confirm-copy");
const confirmClose = document.querySelector("#teamfinder-confirm-close");
const confirmCancel = document.querySelector("#teamfinder-confirm-cancel");
const confirmSubmit = document.querySelector("#teamfinder-confirm-submit");

let pendingRequest = null;
let activeProfileHackerId = null;
let activeProfileTeamId = null;
let pendingVisibilityConfirm = null;

/* ── Filtering and small markup helpers ──────────────────────────────── */
function teamfinderMatchesFilters(item) {
  const query = teamfinderState.query.trim().toLowerCase();
  if (query) {
    const teamName = item.teamId
      ? TEAMFINDER_TEAMS.find((team) => team.id === item.teamId)?.name
      : item.teamId === null
        ? "Solo"
        : "";
    const scope = teamfinderState.searchScope;
    let haystack = "";
    if (scope === "school") {
      haystack = item.school || "";
    } else if (scope === "keywords") {
      haystack = [
        item.description,
        item.about,
        item.program,
        ...(item.skills || []),
        ...(item.projects || []),
        ...(item.hackerType || []),
      ]
        .filter(Boolean)
        .join(" ");
    } else if (scope === "hackers" || scope === "teamName") {
      haystack = item.name || "";
    } else {
      haystack = [
        item.name,
        item.description,
        item.about,
        item.program,
        item.school,
        teamName,
        ...(item.skills || []),
        ...(item.projects || []),
        ...(item.hackerType || []),
      ]
        .filter(Boolean)
        .join(" ");
    }
    if (!haystack.toLowerCase().includes(query)) return false;
  }

  const { teamStatus, hackerType, skills, projects } = teamfinderState.filters;
  if (teamStatus.size) {
    const status = "teamId" in item ? (item.teamId ? "In a team" : "Solo") : "In a team";
    if (!teamStatus.has(status)) return false;
  }
  if (teamfinderState.tab !== "teams" && hackerType.size && !(item.hackerType || []).some((value) => hackerType.has(value))) return false;
  if (skills.size && !(item.skills || []).some((value) => skills.has(value))) return false;
  if (projects.size && !(item.projects || []).some((value) => projects.has(value))) return false;
  return true;
}

function teamfinderTagList(values = [], limit = 2) {
  const shown = values.slice(0, limit);
  if (!shown.length) return `<span class="teamfinder-muted">No interests listed</span>`;
  return shown.map((value) => `<span class="teamfinder-tag">${value}</span>`).join("");
}

function teamfinderHackerTeamLabel(hacker) {
  if (!hacker?.teamId) return "Solo";
  const team = TEAMFINDER_TEAMS.find((item) => item.id === hacker.teamId);
  return team?.name || "In a team";
}

/* The line under a hacker's name on a card and in the profile dialog:
   "3rd Year Software Engineering @ MIT". One helper rather than assembling it
   at each call site, so the card, the request row and the dialog cannot drift
   apart. Each part is optional — the separators only appear when the piece on
   both sides of them does. */
function teamfinderHackerStudyLine(hacker) {
  const year = (hacker?.year || "").replace(/\byear\b/i, "Year").trim();
  const study = [year, hacker?.program].filter(Boolean).join(" ");
  if (study && hacker?.school) return `${study} @ ${hacker.school}`;
  return study || hacker?.school || "";
}

function teamfinderAvatar(label, avatarUrl) {
  if (avatarUrl) {
    return `<span class="teamfinder-avatar has-image" style="background-image: url('${avatarUrl}')" aria-hidden="true"></span>`;
  }
  const initial = (label || "?").trim().charAt(0).toUpperCase();
  return `<span class="teamfinder-avatar" aria-hidden="true">${initial}</span>`;
}

function teamfinderMemberEmail(hacker) {
  if (hacker?.email) return hacker.email;
  const local = (hacker?.discord || hacker?.name || "hacker")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
  return `${local}@mail.utoronto.ca`;
}

/* ── Hackers and Teams tabs ──────────────────────────────────────────── */
function renderTeamfinderHackers() {
  if (!panelHackers) return;
  const hackers = TEAMFINDER_HACKERS.filter((hacker) => !hacker.teamId).filter(teamfinderMatchesFilters);
  if (!hackers.length) {
    panelHackers.innerHTML = `<p class="teamfinder-empty">No hackers match your search or filters.</p>`;
    return;
  }

  const visibleCount = Math.min(teamfinderState.hackerVisibleCount, hackers.length);
  const visibleHackers = hackers.slice(0, visibleCount);
  const hasMore = visibleCount < hackers.length;

  const grid = document.createElement("div");
  grid.className = "teamfinder-card-grid";

  visibleHackers.forEach((hacker) => {
    const requested = teamfinderState.requestedHackerIds.has(hacker.id);
    const hackerType = (hacker.hackerType && hacker.hackerType[0]) || "Hacker";
    const card = document.createElement("article");
    card.className = "teamfinder-card is-interactive";
    card.dataset.action = "view-hacker";
    card.dataset.id = hacker.id;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `View ${hacker.name}'s profile`);
    card.innerHTML = `
      <div class="teamfinder-card-top">
        <div class="teamfinder-card-heading">
          <div class="teamfinder-card-title-row">
            <div class="teamfinder-card-name-block">
              <h3>${hacker.name}</h3>
            </div>
            <span class="teamfinder-type-badge">${hackerType}</span>
          </div>
          <p class="teamfinder-card-subtitle">${teamfinderHackerStudyLine(hacker)}</p>
        </div>
        <div class="teamfinder-card-intro">
          <p class="teamfinder-card-bio">${hacker.about}</p>
        </div>
      </div>
      <div class="teamfinder-card-actions">
        <button class="text-button" type="button" data-action="view-hacker" data-id="${hacker.id}">
          View profile
        </button>
        <button
          class="button teamfinder-request-button ${requested ? "is-requested" : ""}"
          type="button"
          data-action="request-hacker"
          data-id="${hacker.id}"
          ${requested ? "disabled" : ""}
        >
          ${requested ? "Requested" : "Request"}
        </button>
      </div>
    `;
    grid.append(card);
  });

  panelHackers.replaceChildren(grid);

  if (hasMore) {
    const moreWrap = document.createElement("div");
    moreWrap.className = "teamfinder-load-more";
    moreWrap.innerHTML = `
      <button class="button" type="button" data-action="load-more-hackers">
        Load more
      </button>
    `;
    panelHackers.append(moreWrap);
  }
}

function renderTeamfinderTeams() {
  if (!panelTeams) return;
  const teams = TEAMFINDER_TEAMS.filter((team) => teamfinderMatchesFilters(team));
  if (!teams.length) {
    panelTeams.innerHTML = `<p class="teamfinder-empty">No teams match your search or filters.</p>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "teamfinder-card-grid";

  teams.forEach((team) => {
    const requested = teamfinderState.requestedTeamIds.has(team.id);
    const canRequest = team.openToMembers && team.size < team.maxSize && !requested;
    const card = document.createElement("article");
    card.className = "teamfinder-card is-interactive";
    card.dataset.action = "view-team";
    card.dataset.id = team.id;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `View ${team.name}`);
    card.innerHTML = `
      <div class="teamfinder-card-top">
        <div class="teamfinder-card-heading">
          <div class="teamfinder-card-title-row">
            <div class="teamfinder-card-name-block">
              <h3>${team.name}</h3>
            </div>
          </div>
          <p class="teamfinder-card-subtitle">${team.size}/${team.maxSize} members</p>
        </div>
        <div class="teamfinder-card-intro">
          <p class="teamfinder-card-bio">${team.description}</p>
        </div>
      </div>
      <div class="teamfinder-card-actions">
        <button class="text-button" type="button" data-action="view-team" data-id="${team.id}">
          View team
        </button>
        ${
          canRequest || requested
            ? `<button
          class="button teamfinder-request-button ${requested ? "is-requested" : ""}"
          type="button"
          data-action="request-team"
          data-id="${team.id}"
          ${requested ? "disabled" : ""}
        >
          ${requested ? "Requested" : "Request"}
        </button>`
            : `<span class="teamfinder-full-badge">Full</span>`
        }
      </div>
    `;
    grid.append(card);
  });

  panelTeams.replaceChildren(grid);
}

/* The same subtitle slot every card has: a team states its size, a hacker
   states their programme. Teams used to return "" here and carry their size
   in the title chip instead, which left the two kinds of request looking
   structurally different for no reason. */

/* ── Requests tab ────────────────────────────────────────────────────── */
function teamfinderRequestSubtitle(request) {
  if (request.kind === "team" || request.pronouns === "team") {
    return [request.year, request.program].filter(Boolean).join(" ");
  }
  return teamfinderHackerStudyLine(request);
}

function teamfinderRequestTeamLabel(request) {
  if (request.kind === "team" || request.pronouns === "team") {
    return `${request.year} ${request.program}`.trim();
  }
  if ("teamId" in request) {
    return teamfinderHackerTeamLabel(request);
  }
  const hacker = TEAMFINDER_HACKERS.find((item) => item.name === request.name);
  return hacker ? teamfinderHackerTeamLabel(hacker) : "Solo";
}

/* Name alone, with the identifying detail moved to the subtitle beneath it.
   The chip that used to sit beside the name ("Solo", the team's name) was a
   third thing competing on the title line, and it said what the subtitle now
   says more plainly. Same head as a hacker or team card. */
function teamfinderRequestTitleMarkup(request) {
  return `
    <div class="teamfinder-row-title">
      <h3>${request.name}</h3>
    </div>
  `;
}

function teamfinderRequestNoteMarkup(note) {
  if (!note) return "";
  return `<p class="teamfinder-request-note"><span class="teamfinder-meta-label">Message:</span> ${note}</p>`;
}

function teamfinderRequestDirectionLabel(request) {
  return request.direction === "incoming" ? "Incoming" : "Requested";
}

function teamfinderRequestStatusLabel(request) {
  return request.status === "declined" ? "Declined" : "Pending";
}

function teamfinderRequestRecencyLabel(request) {
  return request.recency === "old" ? "Old" : "New";
}

function teamfinderMatchesRequestFilters(request) {
  const query = teamfinderState.query.trim().toLowerCase();
  if (query) {
    const haystack = [request.name, request.note, request.year, request.program, request.school, request.kind]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function teamfinderRequestRowMarkup(request, { actionsHtml }) {
  const subtitle = teamfinderRequestSubtitle(request);
  const isTeam = request.kind === "team" || request.pronouns === "team";
  const safeName = String(request.name || "").replace(/"/g, "&quot;");
  return `
    <article
      class="teamfinder-row is-interactive${request.note ? " has-note" : ""}"
      data-action="view-request"
      data-kind="${isTeam ? "team" : "hacker"}"
      data-name="${safeName}"
      tabindex="0"
      role="link"
      aria-label="View ${safeName}'s profile"
    >
      <div class="teamfinder-row-main">
        <div class="teamfinder-row-copy">
          ${teamfinderRequestTitleMarkup(request)}
          ${subtitle ? `<p>${subtitle}</p>` : ""}
          ${teamfinderRequestNoteMarkup(request.note)}
        </div>
      </div>
      <div class="teamfinder-row-actions">
        ${actionsHtml}
      </div>
    </article>
  `;
}

function renderTeamfinderRequests() {
  if (!panelRequests) return;

  const incoming = TEAMFINDER_REQUESTS.filter(
    (item) => item.direction === "incoming" && teamfinderMatchesRequestFilters(item)
  );
  const outgoing = TEAMFINDER_REQUESTS.filter((item) => item.direction === "outgoing");
  const requestedHackers = TEAMFINDER_HACKERS.filter((hacker) => teamfinderState.requestedHackerIds.has(hacker.id));
  const requestedTeams = TEAMFINDER_TEAMS.filter((team) => teamfinderState.requestedTeamIds.has(team.id));
  const outgoingRows = [
    ...outgoing,
    ...requestedHackers.map((hacker) => ({
      id: `out-${hacker.id}`,
      kind: "hacker",
      name: hacker.name,
      pronouns: hacker.pronouns,
      year: hacker.year,
      program: hacker.program,
      school: hacker.school,
      teamId: hacker.teamId,
      direction: "outgoing",
      status: "requested",
      recency: "new",
    })),
    ...requestedTeams.map((team) => ({
      id: `out-${team.id}`,
      kind: "team",
      name: team.name,
      pronouns: "team",
      year: `${team.size}/${team.maxSize}`,
      program: "members",
      direction: "outgoing",
      status: "requested",
      recency: "new",
    })),
  ].filter(teamfinderMatchesRequestFilters);

  const incomingRowsHtml = incoming.length
    ? incoming
        .map((request) =>
          teamfinderRequestRowMarkup(request, {
            actionsHtml: `
              <button class="text-button" type="button" data-action="decline-request" data-id="${request.id}">Decline</button>
              <button class="button primary-button" type="button" data-action="accept-request" data-id="${request.id}">Accept</button>
            `,
          })
        )
        .join("")
    : `<p class="teamfinder-empty">No incoming requests.</p>`;

  const outgoingRowsHtml = outgoingRows.length
    ? outgoingRows
        .map((request) => {
          const status = request.status === "declined" ? "declined" : "requested";
          const statusLabel = status === "declined" ? "Declined" : "Requested";
          const statusClass =
            status === "declined"
              ? "text-button teamfinder-request-status is-declined"
              : "button teamfinder-request-status is-requested";
          return teamfinderRequestRowMarkup(request, {
            actionsHtml: `<button class="${statusClass}" type="button" disabled>${statusLabel}</button>`,
          });
        })
        .join("")
    : `<p class="teamfinder-empty">No outgoing requests.</p>`;

  panelRequests.innerHTML = `
    <div class="teamfinder-page-layout">
      <aside class="teamfinder-page-intro">
        <h2>Requests</h2>
        <p>Track incoming requests and outgoing requests.</p>
      </aside>
      <div class="teamfinder-page-content">
        <section class="teamfinder-content-section">
          <h3>Incoming</h3>
          <div class="teamfinder-stack is-request-cards">
            ${incomingRowsHtml}
          </div>
        </section>
        <section class="teamfinder-content-section">
          <h3>Outgoing</h3>
          <div class="teamfinder-stack is-request-cards">
            ${outgoingRowsHtml}
          </div>
        </section>
      </div>
    </div>
  `;
}

/* ── Manage Team tab ─────────────────────────────────────────────────── */
function teamfinderSwitchMarkup({ action, checked, label, description }) {
  return `
    <div class="teamfinder-switch-row">
      <div class="teamfinder-switch-copy">
        <p class="teamfinder-switch-label">${label}</p>
        ${description ? `<p class="teamfinder-switch-desc">${description}</p>` : ""}
      </div>
      <button
        class="teamfinder-switch ${checked ? "is-on" : ""}"
        type="button"
        role="switch"
        aria-checked="${checked ? "true" : "false"}"
        aria-label="${label}"
        data-action="${action}"
      >
        <span class="teamfinder-switch-thumb" aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function teamfinderChipSelectMarkup({ id, field, label, options, selected }) {
  const selectedSet = new Set(selected || []);
  const optionMarkup = options
    .map((value) => {
      const checked = selectedSet.has(value);
      return `
      <label class="teamfinder-option-chip${checked ? " is-selected" : ""}">
        <input type="checkbox" name="${field}" value="${value.replace(/"/g, "&quot;")}" ${
          checked ? "checked" : ""
        } />
        <span>${value}</span>
      </label>
    `;
    })
    .join("");
  return `
    <div class="teamfinder-manage-field" id="${id}">
      <span class="teamfinder-meta-label">${label}</span>
      <p class="teamfinder-manage-field-hint">Select all that apply</p>
      <div class="teamfinder-chip-grid" role="group" aria-label="${label}">
        ${optionMarkup}
      </div>
    </div>
  `;
}

function teamfinderSelectedChipValues(root) {
  return [...(root?.querySelectorAll('input[type="checkbox"]:checked') || [])].map((input) => input.value);
}

function initTeamfinderManageChipSelects() {
  panelManage?.querySelectorAll(".teamfinder-chip-grid").forEach((grid) => {
    grid.addEventListener("change", (event) => {
      const input = event.target.closest('input[type="checkbox"]');
      if (!input) return;
      input.closest(".teamfinder-option-chip")?.classList.toggle("is-selected", input.checked);
    });
  });
}

function getJoinedTeam() {
  return (
    TEAMFINDER_TEAMS.find((item) => item.id === teamfinderState.joinedTeamId) ||
    TEAMFINDER_TEAMS[0] ||
    null
  );
}

function renderTeamfinderManage() {
  if (!panelManage) return;
  const team = getJoinedTeam();
  if (!team) {
    panelManage.innerHTML = `<p class="teamfinder-empty">Join a team to manage it here.</p>`;
    return;
  }

  const members = TEAMFINDER_HACKERS.filter((hacker) => hacker.teamId === team.id);
  const memberList =
    members.length >= team.size
      ? members.slice(0, team.size)
      : [...members, ...TEAMFINDER_HACKERS.filter((hacker) => hacker.teamId !== team.id)].slice(0, team.size);
  const editing = teamfinderState.manageEditing;
  const isPublic = team.visibility === "Public";
  if (!team.adminHackerId && memberList[0]) team.adminHackerId = memberList[0].id;
  const isViewerAdmin = team.adminHackerId === teamfinderState.currentHackerId;

  panelManage.innerHTML = `
    <div class="teamfinder-page-layout">
      <aside class="teamfinder-page-intro">
        <h2>Manage Team</h2>
        <p>Update your team profile, visibility, members, and join requests.</p>
      </aside>
      <div class="teamfinder-page-content">
        <section class="teamfinder-content-section">
          <h3>Team Profile</h3>
          <div class="teamfinder-manage-section-body teamfinder-manage-panel is-profile-card${editing ? " is-editing" : ""}">
            ${
              editing
                ? `
              <div class="teamfinder-manage-photo-section">
                <div class="teamfinder-manage-photo-copy">
                  <h4>Your profile picture</h4>
                </div>
                <div class="teamfinder-manage-photo-row">
                  <div class="teamfinder-manage-avatar is-photo">
                    ${teamfinderAvatar(team.name, team.avatarUrl)}
                  </div>
                  <input id="tf-team-avatar-input" type="file" accept="image/jpeg,image/png,image/gif" hidden />
                  <div class="teamfinder-manage-photo-actions">
                    <div class="teamfinder-manage-photo-buttons">
                      <button
                        class="button"
                        type="button"
                        data-action="change-team-avatar"
                      >
                        ${team.avatarUrl ? "Edit" : "Upload picture"}
                      </button>
                      ${
                        team.avatarUrl
                          ? `<button class="text-button" type="button" data-action="remove-team-avatar">Delete</button>`
                          : ""
                      }
                    </div>
                    <p class="teamfinder-manage-photo-note">JPG, PNG, or GIF. Max 2 MB.</p>
                  </div>
                </div>
              </div>
              <label class="teamfinder-manage-field">
                <span class="teamfinder-meta-label">Team Name</span>
                <input id="tf-manage-name" type="text" value="${team.name.replace(/"/g, "&quot;")}" maxlength="48" />
              </label>
              <label class="teamfinder-manage-field">
                <span class="teamfinder-meta-label">Description</span>
                <textarea id="tf-manage-description" rows="3">${team.description}</textarea>
              </label>
              <div class="teamfinder-manage-meta-row is-editing">
                ${teamfinderChipSelectMarkup({
                  id: "tf-manage-projects",
                  field: "tf-projects",
                  label: "Project Type",
                  options: TEAMFINDER_PROJECT_OPTIONS,
                  selected: team.projects || [],
                })}
                ${teamfinderChipSelectMarkup({
                  id: "tf-manage-skills",
                  field: "tf-skills",
                  label: "Skills",
                  options: TEAMFINDER_SKILL_OPTIONS,
                  selected: team.skills || [],
                })}
              </div>
              <div class="teamfinder-manage-toolbar-actions is-edit-footer">
                <button class="text-button" type="button" data-action="cancel-edit-team">Cancel</button>
                <button class="button primary-button" type="button" data-action="save-team">Update Profile</button>
              </div>
            `
                : `
              <div class="teamfinder-manage-identity">
                <div class="teamfinder-manage-identity-main">
                  <div class="teamfinder-manage-identity-copy">
                    <h2 class="teamfinder-manage-title">${team.name}</h2>
                    <p class="teamfinder-card-subtitle">${team.size}/${team.maxSize} members</p>
                  </div>
                  <div class="teamfinder-manage-toolbar-actions">
                    <button class="button primary-button" type="button" data-action="toggle-edit-team">Edit profile</button>
                  </div>
                </div>
              </div>
              <p class="teamfinder-card-bio teamfinder-manage-bio">${team.description}</p>
              <div class="teamfinder-manage-taggroups">
                ${teamfinderTagGroupMarkup("Project Interests", team.projects)}
                ${teamfinderTagGroupMarkup("Skills", team.skills)}
              </div>
            `
            }
          </div>
        </section>

        <section class="teamfinder-content-section">
          <h3>Visibility</h3>
          <div class="teamfinder-manage-section-body teamfinder-manage-panel">
            <div class="teamfinder-switch-list">
              ${teamfinderSwitchMarkup({
                action: "toggle-visibility",
                checked: isPublic,
                label: "Visible to anyone",
                description: isPublic ? "Anyone can find this team in Team Finder" : "Only members can see this team",
              })}
              ${teamfinderSwitchMarkup({
                action: "toggle-recruiting",
                checked: !!team.openToMembers,
                label: "Open to new members",
                description: team.openToMembers ? "Hackers can request to join" : "Not accepting new join requests",
              })}
            </div>
          </div>
        </section>

        <section class="teamfinder-content-section">
          <h3>Members</h3>
          <div class="teamfinder-manage-section-body">
            <div class="teamfinder-members-table" id="tf-manage-members"></div>
          </div>
        </section>

        <section class="teamfinder-content-section">
          <h3>Requests</h3>
          <div class="teamfinder-manage-section-body">
            <div class="teamfinder-stack is-request-cards" id="tf-manage-requests"></div>
          </div>
        </section>

        <section class="teamfinder-content-section">
          <h3>Danger Zone</h3>
          <div class="teamfinder-manage-section-body teamfinder-manage-panel teamfinder-danger-panel">
            <div class="teamfinder-danger-copy">
              <p class="teamfinder-danger-title">Leave this team</p>
              <p class="teamfinder-danger-desc">
                ${
                  isViewerAdmin
                    ? "You must transfer ownership before you can leave."
                    : "You will lose access to this team and its join requests."
                }
              </p>
            </div>
            <button class="button teamfinder-danger-button" type="button" data-action="leave-team">
              Leave Team
            </button>
          </div>
        </section>
      </div>
    </div>
  `;

  const membersWrap = panelManage.querySelector("#tf-manage-members");
  if (!memberList.length) {
    const empty = document.createElement("p");
    empty.className = "teamfinder-empty";
    empty.textContent = "No members yet.";
    membersWrap.append(empty);
  } else {
    if (!team.adminHackerId) team.adminHackerId = memberList[0].id;
    membersWrap.innerHTML = "";
    memberList.forEach((member) => {
      const isAdmin = team.adminHackerId === member.id;
      const row = document.createElement("article");
      row.className = "teamfinder-members-row is-interactive";
      row.dataset.memberId = member.id;
      row.dataset.action = "view-hacker";
      row.dataset.id = member.id;
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "link");
      row.setAttribute("aria-label", `View ${member.name}'s profile`);
      row.innerHTML = `
        <div class="teamfinder-members-person">
          <p class="teamfinder-members-name">${member.name}</p>
          <p class="teamfinder-members-email">${teamfinderMemberEmail(member)}</p>
        </div>
        <div class="teamfinder-members-row-end">
          <span class="teamfinder-members-badge${isAdmin ? " is-admin" : ""}">${isAdmin ? "Admin" : "Member"}</span>
          <div class="teamfinder-member-menu">
            <button
              class="teamfinder-member-menu-btn"
              type="button"
              data-action="toggle-member-menu"
              data-id="${member.id}"
              aria-label="Member options"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <span aria-hidden="true">⋯</span>
            </button>
            <div class="teamfinder-member-menu-pop" role="menu" hidden>
              <button type="button" role="menuitem" data-action="view-hacker" data-id="${member.id}">View profile</button>
              ${
                isAdmin
                  ? ""
                  : `<button type="button" role="menuitem" data-action="make-member-admin" data-id="${member.id}">Make admin</button>`
              }
              <button type="button" role="menuitem" data-action="remove-member" data-id="${member.id}">Remove from group</button>
            </div>
          </div>
        </div>
      `;
      membersWrap.append(row);
    });
  }

  const requestsWrap = panelManage.querySelector("#tf-manage-requests");
  const incoming = TEAMFINDER_REQUESTS.filter((item) => item.direction === "incoming" && item.kind !== "team");
  if (!incoming.length) {
    const empty = document.createElement("p");
    empty.className = "teamfinder-empty";
    empty.textContent = "No join requests right now.";
    requestsWrap.append(empty);
  } else {
    incoming.forEach((request) => {
      const subtitle = teamfinderRequestSubtitle(request);
      const isTeam = request.kind === "team" || request.pronouns === "team";
      const row = document.createElement("article");
      row.className = `teamfinder-row is-interactive${request.note ? " has-note" : ""}`;
      row.dataset.action = "view-request";
      row.dataset.kind = isTeam ? "team" : "hacker";
      row.dataset.name = request.name || "";
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "link");
      row.setAttribute("aria-label", `View ${request.name}'s profile`);
      /* Same markup the Requests tab builds — no avatar, so a join request
         looks the same object wherever it is shown. */
      row.innerHTML = `
        <div class="teamfinder-row-main">
          <div class="teamfinder-row-copy">
            ${teamfinderRequestTitleMarkup(request)}
            ${subtitle ? `<p>${subtitle}</p>` : ""}
            ${teamfinderRequestNoteMarkup(request.note)}
          </div>
        </div>
        <div class="teamfinder-row-actions">
          <button class="text-button" type="button" data-action="decline-request" data-id="${request.id}">Decline</button>
          <button class="button primary-button" type="button" data-action="accept-request" data-id="${request.id}">Accept</button>
        </div>
      `;
      requestsWrap.append(row);
    });
  }

  const avatarInput = panelManage.querySelector("#tf-team-avatar-input");
  avatarInput?.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      team.avatarUrl = String(reader.result || "");
      window.EventCalendarAPI?.showToast?.("Team photo updated");
      renderTeamfinderManage();
      renderTeamfinderTeams();
    };
    reader.readAsDataURL(file);
  });

  if (editing) initTeamfinderManageChipSelects();
}

/* ── Tabs, filters and page rendering ────────────────────────────────── */
function setTeamfinderTab(tab) {
  const next = ["hackers", "teams", "requests", "manage"].includes(tab) ? tab : "hackers";
  const prev = teamfinderState.tab;
  teamfinderState.tab = next;

  teamfinderTabs.forEach((button) => {
    const active = button.dataset.tfTab === next;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  if (panelHackers) {
    panelHackers.hidden = next !== "hackers";
    panelHackers.classList.toggle("is-active", next === "hackers");
  }
  if (panelTeams) {
    panelTeams.hidden = next !== "teams";
    panelTeams.classList.toggle("is-active", next === "teams");
  }
  if (panelRequests) {
    panelRequests.hidden = next !== "requests";
    panelRequests.classList.toggle("is-active", next === "requests");
  }
  if (panelManage) {
    panelManage.hidden = next !== "manage";
    panelManage.classList.toggle("is-active", next === "manage");
  }

  if (prev !== next) {
    const scope = teamfinderState.searchScope;
    const hackerScopes = new Set(["hackers", "school"]);
    const teamScopes = new Set(["teamName"]);
    if (next === "teams" && hackerScopes.has(scope)) {
      teamfinderState.searchScope = null;
    } else if (next === "hackers" && teamScopes.has(scope)) {
      teamfinderState.searchScope = null;
    }
    syncTeamfinderSearchScopeUI();
  }

  syncTeamfinderFilterMode();
  renderTeamfinderPage();

  /* All four panels share one scroll port, so its scrollTop survives a tab
     change: scrolling down in Hackers and then opening Manage used to land
     partway down the page, with Team Profile already scrolled off the top.
     Every tab should open at its first section. */
  if (prev !== next && teamfinderPanelCard) {
    teamfinderPanelCard.scrollTop = 0;
  }
  updateTeamfinderScrollHint();
}

function updateTeamfinderScrollHint() {
  if (!teamfinderPanelCard || !teamfinderScrollHint) return;
  const canScroll = teamfinderPanelCard.scrollHeight > teamfinderPanelCard.clientHeight + 4;
  const atBottom =
    teamfinderPanelCard.scrollTop + teamfinderPanelCard.clientHeight >= teamfinderPanelCard.scrollHeight - 12;
  teamfinderScrollHint.hidden = !(canScroll && !atBottom);
}

/* Counts every incoming request, not the filtered view: the chip is a
   notification count, so ticking a sidebar filter must not appear to make
   pending requests disappear. */
function syncTeamfinderRequestCount() {
  if (!requestsTabCount) return;
  const pending = TEAMFINDER_REQUESTS.filter((item) => item.direction === "incoming").length;
  requestsTabCount.textContent = String(pending);
  requestsTabCount.hidden = pending === 0;
  const tab = document.querySelector("#tf-tab-requests");
  if (tab) {
    if (pending) tab.setAttribute("aria-label", `Requests, ${pending} pending`);
    else tab.removeAttribute("aria-label");
  }
}

function renderTeamfinderPage() {
  if (!teamfinderPage || teamfinderPage.hidden) return;

  syncTeamfinderRequestCount();

  if (teamfinderState.tab === "hackers") renderTeamfinderHackers();
  if (teamfinderState.tab === "teams") renderTeamfinderTeams();
  if (teamfinderState.tab === "requests") renderTeamfinderRequests();
  if (teamfinderState.tab === "manage") renderTeamfinderManage();
  requestAnimationFrame(updateTeamfinderScrollHint);
}

function syncTeamfinderSidebarIntro() {
  const tab = teamfinderState.tab;
  if (teamfinderSidebarTitle) {
    teamfinderSidebarTitle.textContent = tab === "teams" ? "Teams" : "Hackers";
  }
  if (teamfinderSidebarDesc) {
    if (tab === "teams") {
      teamfinderSidebarDesc.hidden = true;
      teamfinderSidebarDesc.textContent = "";
    } else {
      teamfinderSidebarDesc.hidden = false;
      teamfinderSidebarDesc.textContent = "List of all hackers participating.";
    }
  }
  if (teamfinderSidebarActions) {
    teamfinderSidebarActions.hidden = tab !== "teams";
  }
}

function syncTeamfinderFilterMode() {
  const onRequests = teamfinderState.tab === "requests";
  const onManage = teamfinderState.tab === "manage";
  const onTeams = teamfinderState.tab === "teams";
  const hackerTypeGroup = teamfinderFilters?.querySelector('[data-filter-group="hackerType"]');
  if (hackerTypeGroup) hackerTypeGroup.hidden = onTeams;
  if (teamfinderFilters) teamfinderFilters.hidden = onRequests || onManage;
  if (teamfinderRequestFilters) teamfinderRequestFilters.hidden = true;
  if (teamfinderSidebar) teamfinderSidebar.hidden = onManage || onRequests;
  teamfinderLayout?.classList.toggle("is-manage", onManage);
  teamfinderLayout?.classList.toggle("is-requests", onRequests);
  if (teamfinderSearchWrap) teamfinderSearchWrap.hidden = onManage;
  if (onManage) closeTeamfinderSearchPopup();
  syncTeamfinderSidebarIntro();
  updateTeamfinderClearFiltersVisibility();
}

function syncTeamfinderFiltersFromDom() {
  const discoverGroups = ["teamStatus", "hackerType", "skills", "projects"];
  const requestGroups = ["requestDirection", "requestRecency", "requestStatus"];
  discoverGroups.forEach((group) => {
    const box = teamfinderFilters?.querySelector(`[data-filter-group="${group}"]`);
    const values = [...(box?.querySelectorAll('input[type="checkbox"]:checked') || [])].map((input) => input.value);
    teamfinderState.filters[group] = new Set(values);
  });
  requestGroups.forEach((group) => {
    const box = teamfinderRequestFilters?.querySelector(`[data-filter-group="${group}"]`);
    const values = [...(box?.querySelectorAll('input[type="checkbox"]:checked') || [])].map((input) => input.value);
    teamfinderState.filters[group] = new Set(values);
  });
  updateTeamfinderClearFiltersVisibility();
}

function updateTeamfinderClearFiltersVisibility() {
  if (!teamfinderClearFilters) return;
  if (teamfinderState.tab === "manage" || teamfinderState.tab === "requests") {
    teamfinderClearFilters.hidden = true;
    return;
  }
  const groups = ["hackerType", "skills", "projects"];
  const hasFilters = groups.some((group) => teamfinderState.filters[group]?.size);
  teamfinderClearFilters.hidden = !hasFilters;
}

function clearTeamfinderFilters() {
  const root = teamfinderState.tab === "requests" ? teamfinderRequestFilters : teamfinderFilters;
  root?.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  syncTeamfinderFiltersFromDom();
  teamfinderState.hackerVisibleCount = TEAMFINDER_HACKER_PAGE_SIZE;
  renderTeamfinderPage();
}

teamfinderTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setTeamfinderTab(button.dataset.tfTab);
  });
});

/* ── Search popup ────────────────────────────────────────────────────── */
const TEAMFINDER_SEARCH_SCOPE_LABELS = {
  hackers: "Hackers",
  keywords: "Keywords",
  school: "School",
  teamName: "Team name",
};

const TEAMFINDER_SEARCH_SCHOOLS = [
  "University of Waterloo",
  "University of Toronto",
  "York University",
  "McMaster University",
  "Western University",
];

function renderTeamfinderSearchPopup() {
  if (!teamfinderSearchPopup) return;
  const scope = teamfinderState.searchScope;
  const onTeams = teamfinderState.tab === "teams";

  if (!onTeams && scope === "school") {
    teamfinderSearchPopup.innerHTML = TEAMFINDER_SEARCH_SCHOOLS.map(
      (school) => `
        <button class="teamfinder-search-option" type="button" role="option" data-search-school="${school}">
          <span class="teamfinder-search-option-pill">School</span>
          <span class="teamfinder-search-option-value">${school}</span>
        </button>
      `
    ).join("");
    return;
  }

  if (onTeams) {
    teamfinderSearchPopup.innerHTML = `
      <button class="teamfinder-search-option" type="button" role="option" data-search-scope="keywords">
        <span class="teamfinder-search-option-pill">Keywords</span>
        <span class="teamfinder-search-option-desc">Search bios, skills, and projects</span>
      </button>
      <button class="teamfinder-search-option" type="button" role="option" data-search-scope="teamName">
        <span class="teamfinder-search-option-pill">Team name</span>
        <span class="teamfinder-search-option-desc">Search by team name</span>
      </button>
    `;
    return;
  }

  teamfinderSearchPopup.innerHTML = `
    <button class="teamfinder-search-option" type="button" role="option" data-search-scope="hackers">
      <span class="teamfinder-search-option-pill">Hackers</span>
      <span class="teamfinder-search-option-desc">Search by hacker name</span>
    </button>
    <button class="teamfinder-search-option" type="button" role="option" data-search-scope="keywords">
      <span class="teamfinder-search-option-pill">Keywords</span>
      <span class="teamfinder-search-option-desc">Search bios, skills, and projects</span>
    </button>
    <button class="teamfinder-search-option" type="button" role="option" data-search-scope="school">
      <span class="teamfinder-search-option-pill">School</span>
      <span class="teamfinder-search-option-desc">Search by school</span>
    </button>
  `;
}

function syncTeamfinderSearchScopeUI() {
  const scope = teamfinderState.searchScope;
  renderTeamfinderSearchPopup();
  teamfinderSearchPopup?.querySelectorAll("[data-search-scope]").forEach((button) => {
    const active = button.dataset.searchScope === scope;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (teamfinderSearchChip) {
    if (scope && TEAMFINDER_SEARCH_SCOPE_LABELS[scope]) {
      teamfinderSearchChip.hidden = false;
      teamfinderSearchChip.textContent = TEAMFINDER_SEARCH_SCOPE_LABELS[scope];
      if (teamfinderSearch) teamfinderSearch.placeholder = "";
    } else {
      teamfinderSearchChip.hidden = true;
      teamfinderSearchChip.textContent = "";
      if (teamfinderSearch) teamfinderSearch.placeholder = "Search";
    }
  }
  syncTeamfinderSearchTrack();
}

function openTeamfinderSearchPopup() {
  if (!teamfinderSearchPopup) return;
  syncTeamfinderSearchScopeUI();
  teamfinderSearchPopup.hidden = false;
  teamfinderSearchWrap?.classList.add("is-open");
}

function closeTeamfinderMemberMenus() {
  panelManage?.querySelectorAll(".teamfinder-member-menu-pop").forEach((pop) => {
    pop.hidden = true;
  });
  panelManage?.querySelectorAll(".teamfinder-member-menu-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
}

function closeTeamfinderSearchPopup() {
  if (!teamfinderSearchPopup) return;
  teamfinderSearchPopup.hidden = true;
  teamfinderSearchWrap?.classList.remove("is-open");
}

const teamfinderSearchTrack = document.querySelector(".teamfinder-search-track");
let teamfinderSearchMeasureCtx = null;

function syncTeamfinderSearchTrack() {
  if (!teamfinderSearch || !teamfinderSearchTrack) return;
  if (!teamfinderSearchMeasureCtx) {
    teamfinderSearchMeasureCtx = document.createElement("canvas").getContext("2d");
  }
  const styles = getComputedStyle(teamfinderSearch);
  teamfinderSearchMeasureCtx.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
  const text = teamfinderSearch.value || (!teamfinderState.searchScope ? teamfinderSearch.placeholder || "" : "");
  const measured = Math.ceil(teamfinderSearchMeasureCtx.measureText(text).width) + 16;
  teamfinderSearch.style.width = `${Math.max(72, measured)}px`;
  requestAnimationFrame(() => {
    teamfinderSearchTrack.scrollLeft = teamfinderSearchTrack.scrollWidth;
  });
}

teamfinderSearch?.addEventListener("input", () => {
  teamfinderState.query = teamfinderSearch.value;
  teamfinderState.hackerVisibleCount = TEAMFINDER_HACKER_PAGE_SIZE;
  syncTeamfinderSearchTrack();
  renderTeamfinderPage();
});

teamfinderSearchWrap?.querySelector(".teamfinder-search")?.addEventListener("click", () => {
  teamfinderSearch?.focus();
});

teamfinderSearch?.addEventListener("focus", () => {
  openTeamfinderSearchPopup();
  syncTeamfinderSearchTrack();
});

teamfinderSearchPopup?.addEventListener("mousedown", (event) => {
  event.preventDefault();
});

teamfinderSearchPopup?.addEventListener("click", (event) => {
  const schoolOption = event.target.closest("[data-search-school]");
  if (schoolOption) {
    const school = schoolOption.dataset.searchSchool;
    if (teamfinderSearch) teamfinderSearch.value = school;
    teamfinderState.query = school;
    teamfinderState.searchScope = "school";
    syncTeamfinderSearchScopeUI();
    teamfinderState.hackerVisibleCount = TEAMFINDER_HACKER_PAGE_SIZE;
    renderTeamfinderPage();
    teamfinderSearch?.focus();
    return;
  }

  const option = event.target.closest("[data-search-scope]");
  if (!option) return;
  const nextScope = option.dataset.searchScope;
  teamfinderState.searchScope = teamfinderState.searchScope === nextScope ? null : nextScope;
  syncTeamfinderSearchScopeUI();
  teamfinderState.hackerVisibleCount = TEAMFINDER_HACKER_PAGE_SIZE;
  renderTeamfinderPage();
  teamfinderSearch?.focus();
});

document.addEventListener("pointerdown", (event) => {
  if (!teamfinderSearchWrap?.contains(event.target)) {
    closeTeamfinderSearchPopup();
  }
  if (!event.target.closest(".teamfinder-member-menu")) {
    closeTeamfinderMemberMenus();
  }
});

teamfinderSearch?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTeamfinderSearchPopup();
  if (event.key === "Backspace" && !teamfinderSearch.value && teamfinderState.searchScope) {
    teamfinderState.searchScope = null;
    syncTeamfinderSearchScopeUI();
    teamfinderState.hackerVisibleCount = TEAMFINDER_HACKER_PAGE_SIZE;
    renderTeamfinderPage();
  }
});

syncTeamfinderSearchScopeUI();
syncTeamfinderFilterMode();

teamfinderFilters?.addEventListener("change", () => {
  syncTeamfinderFiltersFromDom();
  teamfinderState.hackerVisibleCount = TEAMFINDER_HACKER_PAGE_SIZE;
  renderTeamfinderPage();
});

teamfinderRequestFilters?.addEventListener("change", () => {
  syncTeamfinderFiltersFromDom();
  renderTeamfinderPage();
});

teamfinderClearFilters?.addEventListener("click", () => {
  clearTeamfinderFilters();
});

updateTeamfinderClearFiltersVisibility();

/* ── Profile dialogs ─────────────────────────────────────────────────── */
function openRequestNoteDialog({ type, id, name }) {
  pendingRequest = { type, id, name };
  if (noteName) noteName.textContent = name || "this hacker";
  if (noteInput) noteInput.value = "";
  if (typeof noteDialog?.showModal === "function") {
    noteDialog.showModal();
    noteInput?.focus();
  } else {
    sendPendingRequest("");
  }
}

function closeRequestNoteDialog() {
  pendingRequest = null;
  if (noteDialog?.open) noteDialog.close();
}

function closeProfileDialog() {
  activeProfileHackerId = null;
  activeProfileTeamId = null;
  if (profileDialog?.open) profileDialog.close();
}

/* Read-only chip row. Uses the same .teamfinder-tag the cards use so the modal
   does not introduce a second chip language; .is-wrap lets it run to multiple
   lines here, where there is room, instead of clipping like the card rows. */
/* A labelled chip group — "Project Interests" over its chips. The profile
   dialog and the Manage Team profile card show the same pairing, so they
   build it from the same helper rather than each laying it out by hand. */
function teamfinderTagGroupMarkup(label, values) {
  return `
    <div class="teamfinder-manage-taggroup">
      <h4>${label}</h4>
      ${teamfinderChipRow(values)}
    </div>
  `;
}

function teamfinderChipRow(values) {
  const list = (values || []).filter(Boolean);
  if (!list.length) return `<p class="teamfinder-profile-none">None listed</p>`;
  return `
    <div class="teamfinder-tags is-wrap">
      ${list.map((value) => `<span class="teamfinder-tag">${value}</span>`).join("")}
    </div>
  `;
}

/* Both profile dialogs (hacker and team) share one layout: a top block of
   who they are — name, subtitle, about, then interests and skills side by
   side — beside a photo and socials, and below it labelled rows with the
   label in a left column. */
function teamfinderProfileGroup(label, bodyHtml) {
  return `
    <section class="teamfinder-profile-group">
      <h4 class="teamfinder-profile-label">${label}</h4>
      ${bodyHtml}
    </section>
  `;
}

function teamfinderProfileRow(label, bodyHtml) {
  return `
    <section class="teamfinder-profile-row">
      <h4 class="teamfinder-profile-label">${label}</h4>
      <div class="teamfinder-profile-row-body">${bodyHtml}</div>
    </section>
  `;
}

function teamfinderProfileText(value) {
  return `<p class="teamfinder-profile-text">${value}</p>`;
}

/* Square photo slot. Without a photo it shows the initial, so the layout
   holds its shape on sample data. */
function teamfinderProfilePhoto(name, avatarUrl) {
  if (avatarUrl) {
    return `<div class="teamfinder-profile-photo" style="background-image: url('${avatarUrl}')" aria-hidden="true"></div>`;
  }
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return `<div class="teamfinder-profile-photo" aria-hidden="true">${initial}</div>`;
}

function teamfinderProfileTop({ name, pronouns, subtitle, about, projects, skills, photoHtml, socialsHtml }) {
  return `
    <div class="teamfinder-profile-top">
      <div class="teamfinder-profile-intro">
        <div class="teamfinder-profile-headline">
          <h3 class="teamfinder-profile-name">${name}</h3>
          ${pronouns ? `<span class="teamfinder-profile-pronouns">(${pronouns})</span>` : ""}
        </div>
        <p class="teamfinder-profile-subtitle">${subtitle}</p>
        <p class="teamfinder-profile-about">${about || "None listed"}</p>
        <div class="teamfinder-profile-groups">
          ${teamfinderProfileGroup("Project Interests", teamfinderChipRow(projects))}
          ${teamfinderProfileGroup("Skills", teamfinderChipRow(skills))}
        </div>
      </div>
      <div class="teamfinder-profile-aside">
        ${photoHtml}
        ${socialsHtml || ""}
      </div>
    </div>
  `;
}

/* A bordered entry: a role, or a team member. The aside holds a year or a
   role; the lines below are bullets. */
function teamfinderProfileEntry({ title, aside, lines = [] }) {
  const list = lines.filter(Boolean);
  return `
    <div class="teamfinder-profile-entry">
      <div class="teamfinder-profile-entry-head">
        <p class="teamfinder-profile-entry-title">${title || ""}</p>
        ${aside ? `<p class="teamfinder-profile-entry-aside">${aside}</p>` : ""}
      </div>
      ${
        list.length
          ? `<ul class="teamfinder-profile-entry-list">${list.map((line) => `<li>${line}</li>`).join("")}</ul>`
          : ""
      }
    </div>
  `;
}

function teamfinderExperienceEntries(experiences) {
  return (experiences || [])
    .map((item) =>
      teamfinderProfileEntry({
        title: item.title,
        aside: item.period,
        lines: item.details || [item.detail],
      })
    )
    .join("");
}

/* Sets the footer's Back + request pair, then opens the dialog. */
function showTeamfinderProfile({ canRequest, requested }) {
  if (profileRequest) {
    profileRequest.hidden = !(canRequest || requested);
    profileRequest.disabled = requested || !canRequest;
    profileRequest.classList.toggle("is-requested", requested);
    profileRequest.textContent = requested ? "Requested" : "Send request";
  }
  profileDialog.scrollTop = 0;
  if (typeof profileDialog.showModal === "function" && !profileDialog.open) {
    profileDialog.showModal();
  }
}

const teamfinderHandle = (value) => String(value).replace(/^@/, "").trim();

/* Two kinds of social: `href` builds a destination and opens in a new tab;
   the rest are handles with nowhere to go, so clicking copies them. */
const TEAMFINDER_SOCIAL_ICONS = {
  website: {
    icon: "social-link",
    label: "Website",
    href: (v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`),
  },
  linkedin: {
    icon: "social-linkedin",
    label: "LinkedIn",
    href: (v) => `https://www.linkedin.com/in/${teamfinderHandle(v)}`,
  },
  github: {
    icon: "social-github",
    label: "GitHub",
    href: (v) => `https://github.com/${teamfinderHandle(v)}`,
  },
  instagram: {
    icon: "social-instagram",
    label: "Instagram",
    href: (v) => `https://instagram.com/${teamfinderHandle(v)}`,
  },
  x: {
    icon: "social-x",
    label: "X",
    href: (v) => `https://x.com/${teamfinderHandle(v)}`,
  },
  discord: { icon: "social-discord", label: "Discord" },
  email: { icon: "social-mail", label: "Email" },
};

function teamfinderSocialRows(hacker) {
  /* Discord and email live on the hacker, the rest on hacker.socials. */
  const values = {
    ...(hacker.socials || {}),
    discord: hacker.discord || "",
    email: teamfinderMemberEmail(hacker),
  };
  const items = Object.keys(TEAMFINDER_SOCIAL_ICONS)
    .filter((key) => values[key])
    .map((key) => {
      const { icon, label, href } = TEAMFINDER_SOCIAL_ICONS[key];
      const value = values[key];
      const glyph = `<img class="teamfinder-profile-social-icon" src="./assets/icons/${icon}.svg" alt="" width="22" height="22" />`;
      /* The handle is only in the tooltip/label now, so it still reaches
         pointer and screen-reader users even though the row is icons only. */
      if (href) {
        return `
          <a
            class="teamfinder-profile-social"
            href="${href(value)}"
            target="_blank"
            rel="noopener noreferrer"
            title="${label} — ${value}"
            aria-label="${label}, ${value} (opens in a new tab)"
          >${glyph}</a>
        `;
      }
      return `
        <button
          class="teamfinder-profile-social"
          type="button"
          data-action="copy-social"
          data-value="${value}"
          data-label="${label}"
          title="${label} — ${value}"
          aria-label="Copy ${label}, ${value}"
        >${glyph}</button>
      `;
    })
    .join("");
  return items ? `<div class="teamfinder-profile-socials">${items}</div>` : "";
}

async function teamfinderCopySocial(value, label) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* Clipboard API needs a secure context; fall back to a scratch selection. */
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    try {
      document.execCommand("copy");
    } catch {
      window.EventCalendarAPI?.showToast?.(`Could not copy ${label.toLowerCase()}`);
      field.remove();
      return;
    }
    field.remove();
  }
  window.EventCalendarAPI?.showToast?.("Copied to clipboard");
}

profileBody?.addEventListener("click", (event) => {
  /* The dialog sits outside #page-teamfinder, so the page's action delegate
     never sees these clicks — the dialog handles its own. */
  const trigger = event.target.closest('[data-action="copy-social"]');
  if (!trigger) return;
  event.preventDefault();
  teamfinderCopySocial(trigger.dataset.value || "", trigger.dataset.label || "Handle");
});

function openHackerProfileDialog(hackerId) {
  const hacker = TEAMFINDER_HACKERS.find((item) => item.id === hackerId);
  if (!hacker || !profileDialog || !profileBody) return;

  activeProfileHackerId = hacker.id;
  activeProfileTeamId = null;
  const requested = teamfinderState.requestedHackerIds.has(hacker.id);
  const onMyTeam = !!hacker.teamId && hacker.teamId === teamfinderState.joinedTeamId;

  if (profileTitle) profileTitle.textContent = `${hacker.name}'s profile`;

  const experiencesHtml = teamfinderExperienceEntries(hacker.experiences);
  const rows = [
    hacker.bringToTeam && teamfinderProfileRow("What do you bring to the team?", teamfinderProfileText(hacker.bringToTeam)),
    hacker.funAnswer && teamfinderProfileRow(TEAMFINDER_FUN_QUESTION, teamfinderProfileText(hacker.funAnswer)),
    experiencesHtml && teamfinderProfileRow("Experiences", `<div class="teamfinder-profile-entries">${experiencesHtml}</div>`),
  ].filter(Boolean);

  profileBody.innerHTML = `
    ${teamfinderProfileTop({
      name: hacker.name,
      pronouns: hacker.pronouns,
      subtitle: teamfinderHackerStudyLine(hacker),
      about: hacker.about,
      projects: hacker.projects,
      skills: hacker.skills,
      photoHtml: teamfinderProfilePhoto(hacker.name, hacker.avatarUrl),
      socialsHtml: teamfinderSocialRows(hacker),
    })}
    ${rows.length ? `<div class="teamfinder-profile-rows">${rows.join("")}</div>` : ""}
  `;

  showTeamfinderProfile({ canRequest: !onMyTeam && !requested, requested });
}

function openTeamProfileDialog(teamId) {
  const team = TEAMFINDER_TEAMS.find((item) => item.id === teamId);
  if (!team || !profileDialog || !profileBody) return;

  activeProfileHackerId = null;
  activeProfileTeamId = team.id;
  const requested = teamfinderState.requestedTeamIds.has(team.id);
  const isMyTeam = team.id === teamfinderState.joinedTeamId;
  const canRequest = !isMyTeam && team.openToMembers && team.size < team.maxSize && !requested;
  const members = TEAMFINDER_HACKERS.filter((item) => item.teamId === team.id);

  if (profileTitle) profileTitle.textContent = `${team.name} team profile`;

  const membersHtml = members.length
    ? `<div class="teamfinder-profile-entries">${members
        .map((member) =>
          teamfinderProfileEntry({
            title: member.name,
            aside: member.pronouns,
            lines: [teamfinderHackerStudyLine(member), teamfinderMemberEmail(member)],
          })
        )
        .join("")}</div>`
    : `<p class="teamfinder-profile-none">No members listed yet.</p>`;

  profileBody.innerHTML = `
    ${teamfinderProfileTop({
      name: team.name,
      subtitle: `${team.size}/${team.maxSize} members`,
      about: team.description,
      projects: team.projects,
      skills: team.skills,
      photoHtml: teamfinderProfilePhoto(team.name, team.avatarUrl),
    })}
    <div class="teamfinder-profile-rows">
      ${teamfinderProfileRow("Members", membersHtml)}
    </div>
  `;

  showTeamfinderProfile({ canRequest, requested });
}

/* ── Sending requests ────────────────────────────────────────────────── */
function sendPendingRequest(note) {
  if (!pendingRequest) return;
  const { type, id, name } = pendingRequest;
  const trimmed = (note || "").trim();

  if (type === "hacker") {
    teamfinderState.requestedHackerIds.add(id);
    window.EventCalendarAPI?.showToast?.(
      trimmed
        ? `Request sent to ${name} with a note`
        : `Request sent to ${name || "hacker"}`
    );
  }

  if (type === "team") {
    teamfinderState.requestedTeamIds.add(id);
    window.EventCalendarAPI?.showToast?.(
      trimmed
        ? `Request sent to ${name} with a note`
        : `Request sent to ${name || "team"}`
    );
  }

  closeRequestNoteDialog();
  renderTeamfinderPage();
}

teamfinderPage?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(
    ".teamfinder-card.is-interactive, .teamfinder-members-row.is-interactive, .teamfinder-row.is-interactive"
  );
  if (!card || event.target !== card) return;
  event.preventDefault();
  card.click();
});

/* ── Page click actions (data-action) ────────────────────────────────── */
teamfinderPage?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "view-hacker") {
    closeTeamfinderMemberMenus();
    openHackerProfileDialog(id);
    return;
  }

  if (action === "view-request") {
    const name = button.dataset.name;
    if (button.dataset.kind === "team") {
      const team = TEAMFINDER_TEAMS.find((item) => item.name === name);
      if (team) openTeamProfileDialog(team.id);
    } else {
      const hacker = TEAMFINDER_HACKERS.find((item) => item.name === name);
      if (hacker) openHackerProfileDialog(hacker.id);
    }
    return;
  }

  if (action === "toggle-member-menu") {
    const menu = button.closest(".teamfinder-member-menu");
    const pop = menu?.querySelector(".teamfinder-member-menu-pop");
    const wasOpen = pop && !pop.hidden;
    closeTeamfinderMemberMenus();
    if (pop && !wasOpen) {
      pop.hidden = false;
      button.setAttribute("aria-expanded", "true");
    }
    return;
  }

  if (action === "make-member-admin") {
    const team = getJoinedTeam();
    if (!team) return;
    team.adminHackerId = id;
    closeTeamfinderMemberMenus();
    window.EventCalendarAPI?.showToast?.("Admin updated");
    renderTeamfinderManage();
    return;
  }

  if (action === "remove-member") {
    const team = getJoinedTeam();
    const hacker = TEAMFINDER_HACKERS.find((item) => item.id === id);
    if (!team || !hacker) return;
    if (team.adminHackerId === id) {
      window.EventCalendarAPI?.showToast?.("Assign another admin before removing");
      closeTeamfinderMemberMenus();
      return;
    }
    hacker.teamId = null;
    team.size = Math.max(1, (team.size || 1) - 1);
    closeTeamfinderMemberMenus();
    window.EventCalendarAPI?.showToast?.(`${hacker.name} removed from team`);
    renderTeamfinderManage();
    return;
  }

  if (action === "load-more-hackers") {
    teamfinderState.hackerVisibleCount += TEAMFINDER_HACKER_PAGE_SIZE;
    renderTeamfinderHackers();
    return;
  }

  if (action === "create-team") {
    window.EventCalendarAPI?.showToast?.("Create team coming soon (demo)");
    return;
  }

  if (action === "join-team-code") {
    openJoinTeamDialog();
    return;
  }

  if (action === "view-team") {
    openTeamProfileDialog(id);
    return;
  }

  if (action === "request-hacker") {
    const hacker = TEAMFINDER_HACKERS.find((item) => item.id === id);
    openRequestNoteDialog({ type: "hacker", id, name: hacker?.name || "this hacker" });
    return;
  }

  if (action === "request-team") {
    const team = TEAMFINDER_TEAMS.find((item) => item.id === id);
    openRequestNoteDialog({ type: "team", id, name: team?.name || "this team" });
    return;
  }

  if (action === "join-team") {
    teamfinderState.joinedTeamId = id;
    setTeamfinderTab("manage");
    window.EventCalendarAPI?.showToast?.("Joined team (demo)");
    return;
  }

  if (action === "leave-team") {
    teamfinderState.joinedTeamId = null;
    teamfinderState.manageEditing = false;
    setTeamfinderTab("teams");
    window.EventCalendarAPI?.showToast?.("Left team (demo)");
    return;
  }

  if (action === "toggle-edit-team") {
    teamfinderState.manageEditing = true;
    renderTeamfinderManage();
    return;
  }

  if (action === "cancel-edit-team") {
    teamfinderState.manageEditing = false;
    renderTeamfinderManage();
    return;
  }

  if (action === "save-team") {
    const team = getJoinedTeam();
    if (!team) return;
    const nameInput = panelManage?.querySelector("#tf-manage-name");
    const descInput = panelManage?.querySelector("#tf-manage-description");
    const projectsRoot = panelManage?.querySelector("#tf-manage-projects");
    const skillsRoot = panelManage?.querySelector("#tf-manage-skills");
    const nextName = (nameInput?.value || "").trim();
    if (nextName) team.name = nextName;
    team.description = (descInput?.value || "").trim() || team.description;
    team.projects = teamfinderSelectedChipValues(projectsRoot);
    team.skills = teamfinderSelectedChipValues(skillsRoot);
    teamfinderState.manageEditing = false;
    window.EventCalendarAPI?.showToast?.("Team updated");
    renderTeamfinderManage();
    renderTeamfinderTeams();
    return;
  }

  if (action === "toggle-visibility") {
    const team = getJoinedTeam();
    if (!team) return;
    const makingPublic = team.visibility !== "Public";
    openTeamfinderConfirmDialog({
      kind: "visibility",
      title: makingPublic ? "Make team visible?" : "Make team private?",
      copy: makingPublic
        ? "Anyone in Team Finder will be able to find and request to join this team."
        : "Only current members will be able to see this team in Team Finder.",
      confirmLabel: makingPublic ? "Make visible" : "Make private",
      successToast: makingPublic ? "Team is visible to anyone" : "Team is private",
    });
    return;
  }

  if (action === "toggle-recruiting") {
    const team = getJoinedTeam();
    if (!team) return;
    const opening = !team.openToMembers;
    openTeamfinderConfirmDialog({
      kind: "recruiting",
      title: opening ? "Open to new members?" : "Close to new members?",
      copy: opening
        ? "Hackers will be able to send join requests to this team."
        : "Hackers will no longer be able to request to join this team.",
      confirmLabel: opening ? "Open team" : "Close team",
      successToast: opening ? "Open to new members" : "Closed to new members",
    });
    return;
  }

  if (action === "change-team-avatar") {
    panelManage?.querySelector("#tf-team-avatar-input")?.click();
    return;
  }

  if (action === "remove-team-avatar") {
    const team = getJoinedTeam();
    if (!team) return;
    team.avatarUrl = "";
    window.EventCalendarAPI?.showToast?.("Team photo removed");
    renderTeamfinderManage();
    renderTeamfinderTeams();
    return;
  }

  if (action === "accept-request") {
    window.EventCalendarAPI?.showToast?.("Request accepted (demo)");
    return;
  }

  if (action === "decline-request") {
    window.EventCalendarAPI?.showToast?.("Request declined (demo)");
  }
});

noteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  sendPendingRequest(noteInput?.value || "");
});

noteSkip?.addEventListener("click", () => {
  sendPendingRequest("");
});

noteClose?.addEventListener("click", () => {
  closeRequestNoteDialog();
});

noteDialog?.addEventListener("cancel", () => {
  pendingRequest = null;
});

/* ── Confirm, join-by-code and help dialogs ──────────────────────────── */
function closeTeamfinderConfirmDialog() {
  pendingVisibilityConfirm = null;
  if (confirmDialog?.open) confirmDialog.close();
}

function openJoinTeamDialog() {
  if (!joinDialog) return;
  if (joinInput) joinInput.value = "";
  joinDialog.showModal();
  joinInput?.focus();
}

function closeJoinTeamDialog() {
  if (joinDialog?.open) joinDialog.close();
}

function openTeamfinderHelpDialog() {
  helpDialog?.showModal();
}

function closeTeamfinderHelpDialog() {
  if (helpDialog?.open) helpDialog.close();
}

function openTeamfinderConfirmDialog({ kind, title, copy, confirmLabel, successToast }) {
  pendingVisibilityConfirm = { kind, successToast };
  if (confirmTitle) confirmTitle.textContent = title;
  if (confirmCopy) confirmCopy.textContent = copy;
  if (confirmSubmit) confirmSubmit.textContent = confirmLabel || "Confirm";
  confirmDialog?.showModal();
}

function applyTeamfinderConfirmChange() {
  const pending = pendingVisibilityConfirm;
  const team = getJoinedTeam();
  if (!pending || !team) {
    closeTeamfinderConfirmDialog();
    return;
  }

  if (pending.kind === "visibility") {
    team.visibility = team.visibility === "Public" ? "Private" : "Public";
  } else if (pending.kind === "recruiting") {
    team.openToMembers = !team.openToMembers;
  }

  const toast = pending.successToast;
  closeTeamfinderConfirmDialog();
  window.EventCalendarAPI?.showToast?.(toast);
  renderTeamfinderManage();
  renderTeamfinderTeams();
}

confirmForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  applyTeamfinderConfirmChange();
});

confirmCancel?.addEventListener("click", () => {
  closeTeamfinderConfirmDialog();
});

confirmClose?.addEventListener("click", () => {
  closeTeamfinderConfirmDialog();
});

confirmDialog?.addEventListener("cancel", () => {
  pendingVisibilityConfirm = null;
});


profileDismiss?.addEventListener("click", () => {
  closeProfileDialog();
});

profileRequest?.addEventListener("click", () => {
  if (profileRequest.disabled) return;
  if (activeProfileTeamId) {
    const team = TEAMFINDER_TEAMS.find((item) => item.id === activeProfileTeamId);
    const teamId = team?.id || activeProfileTeamId;
    closeProfileDialog();
    openRequestNoteDialog({ type: "team", id: teamId, name: team?.name || "this team" });
    return;
  }
  if (!activeProfileHackerId) return;
  const hacker = TEAMFINDER_HACKERS.find((item) => item.id === activeProfileHackerId);
  closeProfileDialog();
  openRequestNoteDialog({
    type: "hacker",
    id: hacker?.id || activeProfileHackerId,
    name: hacker?.name || "this hacker",
  });
});

/* The shell fills the dialog, so a click that lands on the dialog itself is
   a click on the backdrop. */
profileDialog?.addEventListener("click", (event) => {
  if (event.target === profileDialog) closeProfileDialog();
});

profileDialog?.addEventListener("cancel", () => {
  activeProfileHackerId = null;
  activeProfileTeamId = null;
});

teamfinderHelpButton?.addEventListener("click", () => {
  openTeamfinderHelpDialog();
});

helpClose?.addEventListener("click", () => {
  closeTeamfinderHelpDialog();
});

helpDialog?.addEventListener("click", (event) => {
  if (event.target === helpDialog) closeTeamfinderHelpDialog();
});

joinForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const pin = (joinInput?.value || "").trim();
  if (!pin) {
    window.EventCalendarAPI?.showToast?.("Enter a team pin");
    return;
  }
  closeJoinTeamDialog();
  window.EventCalendarAPI?.showToast?.(`Joined team with pin ${pin} (demo)`);
  setTeamfinderTab("manage");
});

joinCancel?.addEventListener("click", () => {
  closeJoinTeamDialog();
});

joinClose?.addEventListener("click", () => {
  closeJoinTeamDialog();
});

joinDialog?.addEventListener("click", (event) => {
  if (event.target === joinDialog) closeJoinTeamDialog();
});

teamfinderPanelCard?.addEventListener("scroll", updateTeamfinderScrollHint, { passive: true });
window.addEventListener("resize", updateTeamfinderScrollHint);

teamfinderScrollHint?.addEventListener("click", () => {
  if (!teamfinderPanelCard) return;
  teamfinderPanelCard.scrollBy({ top: Math.max(180, teamfinderPanelCard.clientHeight * 0.45), behavior: "smooth" });
});

/* ── Shared API and startup ──────────────────────────────────────────── */
window.TeamFinderAPI = {
  render: renderTeamfinderPage,
  setTab: setTeamfinderTab,
};

syncTeamfinderRequestCount();
renderTeamfinderPage();
updateTeamfinderScrollHint();