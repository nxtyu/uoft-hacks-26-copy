# UofTHacks Dashboard — design prototype

A high-fidelity, clickable prototype of the UofTHacks organizer and volunteer
dashboard. It is the reference for **how the screens should look and behave**,
not production code: it runs on sample data, has no backend, and is written in
plain HTML, CSS and JavaScript with no framework or build step.

When something here disagrees with the Figma file, treat this prototype as the
more recent decision; it was refined after the Figma frames were drawn.

## Run it

```sh
npm start            # serves the folder at http://localhost:4173
```

Any static server works (`python3 -m http.server 4173` is all `npm start`
runs), so you don't need to `npm install` to see the prototype.

Each page has its own URL hash, so you can link straight to one:
`#events`, `#shifts`, `#myshifts`, `#teamfinder`.

After pulling changes, hard-refresh (Cmd+Shift+R) so the browser doesn't
serve stale CSS or JS.

## Deploy

It's a static site with no build step. On Vercel, import the repo with the
framework preset set to **Other**, leave the build command empty and the
output directory as the repo root. Every push to `main` then redeploys. The
`?dials` panel only works locally, because it loads from `node_modules`.

## How the prototype works

The sidebar switches between pages inside one `index.html`. The demo is
pinned to the UofTHacks 14 weekend, **Fri Jan 22 – Sun Jan 24, 2027**.

The pages are connected. Events created in **Event Manager** are the shifts
organizers staff in **Shift Manager**. Volunteers assigned there see those
shifts in **My Shifts**. Changing an event updates the other two pages right
away.

### Event Manager (organizer)

A calendar of the hackathon's events.

- **Create:** click **Add**, or click and drag over empty time on the
  calendar to draw an event. Both open the event form.
- **View:** click an event to open its detail popover, which has **Edit** and
  **Delete**. Close it with Escape or by clicking outside it.
- **Move:** drag an event to a new time or day. To nudge an event with the
  keyboard, focus it and press **Alt + arrow keys** (15 minutes up or down, one day
  left or right).
- **Resize:** drag an event's top or bottom edge. Times snap to 15 minutes.
- **Filter and view:** the filter menu shows or hides event types and
  switches between **1 Day** and **3 Day** views.
- **Navigate:** the arrows step through days or weekends. Click the month
  label to pick a date from a month calendar.
- **Form:** name, date, time, location, description, event types and which
  shift group staffs it. Missing or invalid fields show errors next to the
  field.

Event Manager is the only page that saves: it stores events in the browser's
`localStorage`, so they survive a reload. Clear the key
`uofthacks-event-schedule-v2` to reset the demo.

### Shift Manager (organizer)

Staffing each event with volunteers and mentors. It has two views; switch
between them with the toggle in the header.

**Calendar view.** A day calendar of events. Each event shows how many of its
slots are filled.

- Click an event to open the **assign panel**: its details (expandable), then
  a **Volunteers** section and a **Mentors** section.
- Use the stepper in each section to set how many people the event needs.
- Click an empty slot to open the **people picker**. You can search it and
  filter it by availability. **Add** fills the slot with that person, and
  **View** opens their profile. Each slot has a remove button that deletes
  the slot.
- Escape or **Back** closes the picker.

**Table view.** Every volunteer and mentor, with role, team, preferences,
availability and shift count, plus filters. The **Upload** button is a
placeholder for importing volunteer data. Click a person to open their
profile.

**Volunteer profile.** That person's weekend calendar, marked to show which
events they can take:

- **Assigned:** already on that shift.
- **Assignable:** fits their availability and has an open slot.
- **Full:** fits their availability, but every slot for their role is taken.
- **Outside availability:** falls outside the times they said they're free.

Click assignable events to select them, or click assigned ones to mark them
for removal. Then press **Assign** to apply every change at once. Escape or
**Back** returns to the view you came from.

### My Shifts (volunteer)

The signed-in volunteer's own weekend (the demo signs in as A'ja Wilson),
showing only the shifts they're assigned to. Click a shift to see its time,
location, description, who else is on it, and instructions for that shift.
The arrows move between weekends.

### Team Finder (hacker)

Helping hackers form teams. It has four tabs. The demo hacker is Tim Jones,
who is already on a team.

- **Hackers:** cards for each hacker, 8 at a time with **Load more**. **View
  profile** opens their profile: bio, project interests, skills, photo and
  socials, then "What do you bring to the team?", a fun question and their
  experiences. Click a social link to copy it, or to open it if it's a URL.
  **Request** invites that hacker to your team.
- **Teams:** team cards. **View team** opens the team's profile in the same
  layout, with its members listed below. **Request** asks to join.
- **Requests:** incoming and outgoing requests, filterable by direction,
  recency and status. **Accept** or **Decline** incoming requests. The tab
  label shows a count of incoming requests.
- **Manage Team:** edit the team's profile and avatar, toggle whether the
  team is visible and whether it's recruiting (both ask you to confirm),
  manage members (view, make admin, remove), handle incoming requests, or
  leave the team. After leaving, you can **join a team by code**. **Create
  team** is not built yet.

Profiles close with **Back**, Escape, or a click outside the dialog. Every
request opens a dialog where you can add an optional note before sending.
The search bar can be narrowed to hackers, keywords, a school or a team
name, and the sidebar filters (team status, hacker type, skills, project
interests) apply to both the Hackers and Teams tabs.

## Reading the code

Start with `index.html` to see a page's markup. Then open that page's script
and stylesheet. Each script starts with a summary of what it covers and is
split into labelled sections (`/* ── Section ── */`). Search for those
markers to jump around.

```
index.html              every page's markup, dialogs and templates
css/                    loaded in this order — later files build on earlier ones
  tokens.css            fonts and design tokens (start here)
  shell.css             sidebar, nav, page header band, buttons, toolbars
  event-manager.css     the shared calendar grid + Event Manager
  shift-manager.css     Shift Manager
  my-shifts.css         My Shifts
  team-finder.css       Team Finder
js/                     plain scripts, loaded in this order
  event-manager.js      Event Manager; also exposes window.EventCalendarAPI
  shift-manager.js      Shift Manager, My Shifts and sidebar page switching
  team-finder.js        Team Finder
  dials.js              dev-only token tuning panel (see below)
assets/
  icons/                UI icons (SVG)
  brand/logo.svg        UofTHacks wordmark
  images/avatar.svg     placeholder profile photo
  fonts/                Area (OTF)
```

| Page          | Script                | Styles                  | Sample data |
| ------------- | --------------------- | ----------------------- | ----------- |
| Event Manager | `js/event-manager.js` | `css/event-manager.css` | `seedEvents` |
| Shift Manager | `js/shift-manager.js` | `css/shift-manager.css` | `VOLUNTEERS` |
| My Shifts     | `js/shift-manager.js` | `css/my-shifts.css`     | assignments made in Shift Manager |
| Team Finder   | `js/team-finder.js`   | `css/team-finder.css`   | `TEAMFINDER_HACKERS`, `TEAMFINDER_TEAMS`, `TEAMFINDER_REQUESTS` |
| Sidebar, header, buttons | `js/shift-manager.js` (`setDashboardPage`) | `css/shell.css` | — |

### How the pieces connect

- **Script order matters.** `js/event-manager.js` loads first. It puts
  calendar helpers (time formatting, the toast, an event-change `subscribe`)
  on `window.EventCalendarAPI`, which the other two scripts use.
- **Page switching** lives in `setDashboardPage` in `js/shift-manager.js`.
  It shows one `<main class="page">` by id and reads the starting page from
  the URL hash.
- **Team Finder** handles all clicks on its page in one listener keyed on
  each button's `data-action`. To see what a button does, search for its
  action name.
- **Sample data** sits at the top of each script. Replace it with API calls.
  Only Event Manager persists anything. Everything else resets on reload.
- **Animation timing** for the event detail popover is written as a readable
  storyboard near the top of `js/event-manager.js`.
- **Responsive.** Layouts adapt at roughly 1100px, 900px and 650px. The
  sidebar collapses to an icon rail, then to a top bar.

## Design system

Everything visual is driven by CSS custom properties in **`css/tokens.css`**.

- **Type roles** set a size, weight and line height that go together, named
  by what the text is: subject, support, heading, item, body and meta. Pick
  a role by what the text is (a section heading, a name in a list), not by
  how big it should look.
  - `--type-*` is the calendar pages' ramp, from the Shift Manager assign
    panel.
  - `--tf-type-*` is Team Finder's. Its running copy is 600, the same weight
    as an event description in Shift Manager, with the roomier line spacing
    of the Team Finder Hackers frame.

  The two use the same role names, so they can be merged by pointing one set
  at the other.

- **`--tf-*`** is the design-system ramp: colors (`--tf-c-*`), type scale
  (`--tf-text-*`), weights (`--tf-weight-*`), radii (`--tf-radius-*`) and
  component sizing (`--tf-card-*`, `--tf-modal-*`, `--tf-rail-*`). It came
  from the Figma source for Team Finder and now drives every page.
- **Legacy names** (`--ink`, `--muted`, `--line`, `--panel`, `--accent`,
  `--blue` …) are aliases onto that ramp, kept so the calendar pages didn't
  need rewriting. Prefer the `--tf-*` names in new work.
- **Per-element tokens** (`--tf-el-*`) let one part of the page change size or
  weight without moving anything else.
- **Event colors** (default, food, workshop, social) are tokens too, so event
  types can be re-colored in one place.
- **Typeface:** Area, in six weights. Check the font license before shipping
  it in production.

The stylesheets are commented heavily with the *why* behind decisions, such as
contrast fixes and alignment choices. Read those comments before changing a
value.

## Dev dials (optional)

`js/dials.js` adds a live panel for tuning the design tokens with sliders. It
only loads when the URL has `?dials`:

```sh
npm install          # one time; installs DialKit
npm start            # then open http://localhost:4173/?dials
```

Without `?dials` the file does nothing and nothing extra is downloaded. It's
a design tool, not part of the product.
