/* ─────────────────────────────────────────────────────────────────────────
 * TEAM FINDER — DEV DIALS
 *
 * A live control panel for the Team Finder design tokens. Add `?dials` to
 * the URL to switch it on; without it this file costs one `if` and exits,
 * and DialKit is never fetched.
 *
 * State comes from DialKit's own `DialStore` (dialkit/store), which is the
 * one part of the package with no framework attached — no React, no build
 * step, no bare-specifier imports. The store owns config parsing, value
 * resolution, slider ranges, labels and localStorage persistence; this file
 * only draws the controls and writes the results onto :root as CSS custom
 * properties. If this project ever moves to React, these config objects
 * transfer to `useDialKit` verbatim and `<DialRoot />` replaces renderPanel.
 *
 * Each panel below is one PART OF THE PAGE, not one CSS property, and every
 * dial writes to a --tf-el-* token used by exactly that part. So moving the
 * card body size moves card bodies and nothing else — the earlier version
 * drove the shared scale tokens, which is why one slider could reflow half
 * the screen.
 *
 * ES module served over http:// — it will not run from a file:// page,
 * since `./node_modules/...` has to be fetched.
 * ───────────────────────────────────────────────────────────────────────── */

if (new URLSearchParams(location.search).has("dials")) {
  boot().catch((err) => {
    console.error(
      "[dials] Could not start. Serve over http (not file://) and run `npm install`.",
      err
    );
  });
}

/* Area ships 400–900 via the OTFs in assets/fonts. Outside that the
   browser synthesises a
   weight, which looks worse than picking a real one — so every weight dial
   is clamped to the faces actually loaded. */
const WEIGHT = (d) => [d, 400, 700, 100];
const SIZE = (d, min, max) => [d, min, max];

/* [panel, [key, label, cssProperty, spec, unit]] */
const PANELS = [
  {
    id: "tf-title",
    name: "Page title",
    hint: "“Team Finder”",
    dials: [
      ["size", "Size", "--tf-el-title-size", SIZE(30, 18, 46), "px"],
      ["weight", "Weight", "--tf-el-title-weight", WEIGHT(600), ""],
    ],
  },
  {
    id: "tf-tabs",
    name: "Tabs",
    hint: "Hackers / Teams / …",
    dials: [
      ["size", "Size", "--tf-el-tab-size", SIZE(17, 11, 24), "px"],
      ["weight", "Weight", "--tf-el-tab-weight", WEIGHT(400), ""],
      ["gap", "Gap", "--tf-tab-gap", SIZE(48, 16, 80), "px"],
    ],
  },
  {
    id: "tf-headings",
    name: "Headings",
    hint: "“Hackers”, “Team Profile”",
    dials: [
      ["size", "Size", "--tf-el-heading-size", SIZE(19, 12, 30), "px"],
      ["weight", "Weight", "--tf-el-heading-weight", WEIGHT(600), ""],
      ["copySize", "Sub size", "--tf-el-railcopy-size", [13.4, 10, 20, 0.2], "px"],
      ["copyWeight", "Sub weight", "--tf-el-railcopy-weight", WEIGHT(400), ""],
    ],
  },
  {
    id: "tf-filters",
    name: "Filters",
    hint: "Hacker Type, Skills, …",
    dials: [
      ["labelSize", "Label size", "--tf-el-filter-label-size", SIZE(15, 10, 22), "px"],
      ["labelWeight", "Label weight", "--tf-el-filter-label-weight", WEIGHT(400), ""],
      ["optionSize", "Option size", "--tf-el-filter-option-size", SIZE(14, 10, 22), "px"],
      ["optionWeight", "Option weight", "--tf-el-filter-option-weight", WEIGHT(400), ""],
      ["groupGap", "Group gap", "--tf-rail-group-gap", SIZE(28, 8, 52), "px"],
      ["optionGap", "Option gap", "--tf-rail-option-gap", SIZE(5, 0, 20), "px"],
    ],
  },
  {
    id: "tf-card-type",
    name: "Card type",
    hint: "Text inside a card",
    dials: [
      ["nameSize", "Name size", "--tf-el-card-name-size", SIZE(17, 11, 26), "px"],
      ["nameWeight", "Name weight", "--tf-el-card-name-weight", WEIGHT(500), ""],
      ["bioSize", "Body size", "--tf-el-card-bio-size", SIZE(14, 9, 20), "px"],
      ["bioWeight", "Body weight", "--tf-el-card-bio-weight", WEIGHT(400), ""],
      ["metaSize", "Meta size", "--tf-el-card-meta-size", SIZE(14, 9, 20), "px"],
      ["metaWeight", "Meta weight", "--tf-el-card-meta-weight", WEIGHT(400), ""],
      ["metaLabelWeight", "Meta label", "--tf-el-card-meta-label-weight", WEIGHT(500), ""],
      ["chipSize", "Chip size", "--tf-el-card-chip-size", SIZE(12, 8, 18), "px"],
      ["chipWeight", "Chip weight", "--tf-el-card-chip-weight", WEIGHT(400), ""],
      ["btnSize", "Button size", "--tf-el-card-btn-size", SIZE(14, 9, 20), "px"],
      ["btnWeight", "Button weight", "--tf-el-card-btn-weight", WEIGHT(500), ""],
    ],
  },
  {
    id: "tf-card-leading",
    name: "Card spacing",
    hint: "Leading and gaps",
    dials: [
      ["nameLeading", "Name leading", "--tf-el-card-name-leading", SIZE(25, 12, 40), "px"],
      ["bioLeading", "Body leading", "--tf-el-card-bio-leading", SIZE(20, 10, 34), "px"],
      ["metaLeading", "Meta leading", "--tf-el-card-meta-leading", SIZE(19, 10, 34), "px"],
      ["headingGap", "Name → body", "--tf-card-gap", SIZE(8, 0, 24), "px"],
      ["bodyGap", "Body → meta", "--tf-card-body-gap", SIZE(8, 0, 24), "px"],
      ["metaGap", "Meta rows", "--tf-card-meta-gap", SIZE(6, 0, 20), "px"],
      ["actionGap", "Meta → button", "--tf-card-action-gap", SIZE(27, 0, 48), "px"],
    ],
  },
  {
    id: "tf-card-box",
    name: "Card box",
    hint: "Padding, radius, stroke",
    dials: [
      ["padding", "Padding", "--tf-card-pad", SIZE(20, 8, 40), "px"],
      ["radius", "Radius", "--tf-radius-card", SIZE(10, 0, 24), "px"],
      ["border", "Card stroke", "--tf-card-border", [1, 0, 4, 0.25], "px"],
      ["btnBorder", "Button stroke", "--tf-el-card-btn-border", [1, 0, 4, 0.25], "px"],
      ["btnRadius", "Button radius", "--tf-radius-control", SIZE(8, 0, 24), "px"],
      ["btnPadY", "Button pad Y", "--tf-el-card-btn-pad-y", SIZE(10, 0, 28), "px"],
      ["btnPadX", "Button pad X", "--tf-el-card-btn-pad-x", SIZE(10, 0, 40), "px"],
      ["gridGap", "Grid gap", "--tf-grid-gap", SIZE(24, 8, 48), "px"],
    ],
  },
  {
    id: "tf-rows",
    name: "Rows",
    hint: "Requests / Manage lists",
    dials: [
      ["titleSize", "Title size", "--tf-el-row-title-size", SIZE(17, 11, 26), "px"],
      ["titleWeight", "Title weight", "--tf-el-row-title-weight", WEIGHT(500), ""],
      ["copySize", "Copy size", "--tf-el-row-copy-size", SIZE(14, 10, 22), "px"],
      ["copyWeight", "Copy weight", "--tf-el-row-copy-weight", WEIGHT(400), ""],
    ],
  },
  {
    id: "tf-requests",
    name: "Requests",
    hint: "Incoming / Outgoing panel",
    dials: [
      ["sectionSize", "Group size", "--tf-el-section-size", SIZE(17, 11, 26), "px"],
      ["sectionWeight", "Group weight", "--tf-el-section-weight", WEIGHT(400), ""],
      ["actionSize", "Action size", "--tf-el-request-action-size", SIZE(14, 9, 20), "px"],
      ["cardPad", "Card padding", "--tf-request-card-pad", SIZE(24, 8, 44), "px"],
      ["cardGap", "Card gap", "--tf-request-card-gap", SIZE(16, 4, 40), "px"],
      ["sectionGap", "Group gap", "--tf-request-section-gap", SIZE(40, 8, 80), "px"],
      ["actionGap", "Decline → Accept", "--tf-request-action-gap", SIZE(24, 4, 48), "px"],
      ["copyGap", "Copy → actions", "--tf-request-copy-gap", SIZE(30, 8, 64), "px"],
    ],
  },
  {
    id: "tf-layout",
    name: "Layout",
    hint: "The rail and its gutter",
    dials: [
      ["railGap", "Rail gap", "--tf-rail-gap", SIZE(66, 16, 120), "px"],
      ["railTitleGap", "Rail title gap", "--tf-rail-title-gap", SIZE(32, 8, 64), "px"],
    ],
  },
];

async function boot() {
  const { DialStore } = await import("../node_modules/dialkit/dist/store/index.js");

  /* DialKit wants { key: [default, min, max, step?] }; the dial tables above
     carry labels and CSS targets alongside, so build its config from them. */
  PANELS.forEach((panel) => {
    const config = {};
    panel.dials.forEach(([key, , , spec]) => (config[key] = spec));
    DialStore.registerPanel(panel.id, panel.name, config, undefined, { persist: true });
  });

  const lookup = (panel, key) => panel.dials.find((d) => d[0] === key);

  /* Only properties moved off their default are written, so an untouched
     dial leaves the cascade alone instead of pinning a duplicate value. */
  function apply() {
    const root = document.documentElement;
    PANELS.forEach((panel) => {
      const values = DialStore.getValues(panel.id);
      panel.dials.forEach(([key, , prop, spec, unit]) => {
        const value = values[key];
        if (typeof value !== "number") return;
        if (value === spec[0]) root.style.removeProperty(prop);
        else root.style.setProperty(prop, value + unit);
      });
    });
  }

  function changedCss() {
    const out = [];
    PANELS.forEach((panel) => {
      const values = DialStore.getValues(panel.id);
      const moved = panel.dials.filter(([key, , , spec]) => values[key] !== spec[0]);
      if (!moved.length) return;
      out.push(`  /* ${panel.name} */`);
      moved.forEach(([key, , prop, , unit]) => {
        out.push(`  ${prop}: ${values[key]}${unit};`);
      });
    });
    return out.length ? `:root {\n${out.join("\n")}\n}` : "/* nothing changed */";
  }

  document.head.append(
    Object.assign(document.createElement("style"), { textContent: CSS })
  );
  document.body.append(renderPanel());
  apply();

  function renderPanel() {
    const root = document.createElement("aside");
    root.className = "dials";
    root.innerHTML = `
      <header class="dials-bar">
        <strong>Team Finder dials</strong>
        <span class="dials-count" hidden></span>
        <button class="dials-collapse" type="button" aria-label="Collapse">–</button>
      </header>
      <div class="dials-body"></div>
      <footer class="dials-foot">
        <button class="dials-btn" type="button" data-act="copy">Copy CSS</button>
        <button class="dials-btn" type="button" data-act="reset">Reset all</button>
      </footer>`;

    const body = root.querySelector(".dials-body");
    const count = root.querySelector(".dials-count");

    /* How many dials are off default — shown in the title bar so you can see
       at a glance that something is overridden even with sections closed. */
    function syncCount() {
      const n = PANELS.reduce((total, panel) => {
        const values = DialStore.getValues(panel.id);
        return total + panel.dials.filter(([k, , , spec]) => values[k] !== spec[0]).length;
      }, 0);
      count.hidden = n === 0;
      count.textContent = n;
      PANELS.forEach((panel) => {
        const values = DialStore.getValues(panel.id);
        const touched = panel.dials.some(([k, , , spec]) => values[k] !== spec[0]);
        body.querySelector(`[data-panel="${panel.id}"]`).classList.toggle("is-touched", touched);
      });
    }

    PANELS.forEach((panel, index) => {
      const section = document.createElement("section");
      section.className = "dials-group";
      section.dataset.panel = panel.id;
      /* Cards open by default — that's what most tuning starts with. */
      if (!panel.id.startsWith("tf-card")) section.classList.add("is-shut");
      section.innerHTML = `
        <button class="dials-head" type="button">
          <span class="dials-caret" aria-hidden="true">▸</span>
          <span class="dials-name">${panel.name}</span>
          <span class="dials-hint">${panel.hint}</span>
        </button>
        <div class="dials-rows"></div>`;

      const rows = section.querySelector(".dials-rows");

      panel.dials.forEach(([key, label, , spec]) => {
        const control = DialStore.getPanel(panel.id).controls.find((c) => c.path === key);
        const value = DialStore.getValue(panel.id, key);
        const row = document.createElement("label");
        row.className = "dials-row";
        row.dataset.key = key;
        row.innerHTML = `
          <span class="dials-label">${label}</span>
          <input type="range" min="${control.min}" max="${control.max}"
                 step="${control.step}" value="${value}" />
          <output>${value}</output>`;

        const input = row.querySelector("input");
        const output = row.querySelector("output");

        input.addEventListener("input", () => {
          const next = Number(input.value);
          DialStore.updateValue(panel.id, key, next);
          output.textContent = next;
          row.classList.toggle("is-changed", next !== spec[0]);
          apply();
          syncCount();
        });

        /* Double-click a row to send just that dial back to its default. */
        row.addEventListener("dblclick", () => {
          DialStore.updateValue(panel.id, key, spec[0]);
          input.value = spec[0];
          output.textContent = spec[0];
          row.classList.remove("is-changed");
          apply();
          syncCount();
        });

        row.classList.toggle("is-changed", value !== spec[0]);
        rows.append(row);
      });

      section.querySelector(".dials-head").addEventListener("click", () => {
        section.classList.toggle("is-shut");
      });

      body.append(section);
    });

    root.querySelector(".dials-collapse").addEventListener("click", () => {
      root.classList.toggle("is-collapsed");
    });

    root.querySelector(".dials-foot").addEventListener("click", async (event) => {
      const act = event.target.dataset?.act;
      if (act === "copy") {
        await navigator.clipboard.writeText(changedCss());
        event.target.textContent = "Copied";
        setTimeout(() => (event.target.textContent = "Copy CSS"), 1200);
      }
      if (act === "reset") {
        PANELS.forEach((panel) => {
          DialStore.resetValues(panel.id);
          const section = body.querySelector(`[data-panel="${panel.id}"]`);
          panel.dials.forEach(([key, , , spec]) => {
            const row = section.querySelector(`[data-key="${key}"]`);
            row.querySelector("input").value = spec[0];
            row.querySelector("output").textContent = spec[0];
            row.classList.remove("is-changed");
          });
        });
        apply();
        syncCount();
      }
    });

    makeDraggable(root, root.querySelector(".dials-bar"));
    queueMicrotask(syncCount);
    return root;
  }
}

/* Drag by the title bar; the panel is fixed, so this is just an offset. */
function makeDraggable(el, handle) {
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;

  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = el.getBoundingClientRect();
    baseX = rect.left;
    baseY = rect.top;
    startX = event.clientX;
    startY = event.clientY;
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp, { once: true });
  });

  function onMove(event) {
    el.style.left = `${baseX + event.clientX - startX}px`;
    el.style.top = `${baseY + event.clientY - startY}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";
  }

  function onUp(event) {
    handle.releasePointerCapture(event.pointerId);
    handle.removeEventListener("pointermove", onMove);
  }
}

const CSS = `
.dials {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  width: 276px;
  max-height: min(82vh, 780px);
  display: flex;
  flex-direction: column;
  border: 1px solid #2e2e33;
  border-radius: 10px;
  background: #17171a;
  color: #e6e6e9;
  font: 500 11px/1.4 ui-sans-serif, system-ui, sans-serif;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}
.dials-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 10px;
  border-bottom: 1px solid #2e2e33;
  background: #1e1e22;
  cursor: grab;
  touch-action: none;
}
.dials-bar:active { cursor: grabbing; }
.dials-bar strong { flex: 1; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
.dials-count {
  min-width: 16px; height: 16px; padding: 0 4px;
  display: grid; place-items: center;
  border-radius: 999px; background: #1e6fd9; color: #fff;
  font-size: 9px; font-weight: 600;
}
.dials-count[hidden] { display: none; }
.dials-collapse {
  width: 20px; height: 20px;
  display: grid; place-items: center;
  padding: 0; border: 0; border-radius: 5px;
  background: #2b2b31; color: #e6e6e9;
  font: inherit; line-height: 1; cursor: pointer;
}
.dials-collapse:hover { background: #37373f; }
.dials.is-collapsed .dials-body,
.dials.is-collapsed .dials-foot { display: none; }
.dials-body { padding: 4px 0 8px; overflow-y: auto; scrollbar-width: thin; }
.dials-group { border-bottom: 1px solid #232328; }
.dials-group:last-child { border-bottom: 0; }
.dials-head {
  width: 100%;
  display: flex; align-items: baseline; gap: 6px;
  padding: 8px 10px;
  border: 0; background: transparent; color: #e6e6e9;
  font: inherit; text-align: left; cursor: pointer;
}
.dials-head:hover { background: #1c1c20; }
.dials-caret { color: #6f6f7a; transform: rotate(90deg); transition: transform 120ms ease; }
.dials-group.is-shut .dials-caret { transform: rotate(0deg); }
.dials-name { font-weight: 600; }
.dials-group.is-touched .dials-name { color: #6db2ff; }
.dials-hint {
  flex: 1;
  color: #6f6f7a; font-size: 10px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right;
}
.dials-rows { padding: 0 10px 8px; }
.dials-group.is-shut .dials-rows { display: none; }
.dials-row {
  display: grid;
  grid-template-columns: 84px 1fr 30px;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}
.dials-label { color: #b6b6bf; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dials-row.is-changed .dials-label { color: #6db2ff; }
.dials-row output { color: #8f8f99; text-align: right; font-variant-numeric: tabular-nums; }
.dials-row.is-changed output { color: #6db2ff; }
.dials-row input[type="range"] {
  width: 100%; height: 3px; margin: 0;
  appearance: none; -webkit-appearance: none;
  border-radius: 999px; background: #3a3a42; cursor: pointer;
}
.dials-row input[type="range"]::-webkit-slider-thumb {
  appearance: none; -webkit-appearance: none;
  width: 11px; height: 11px;
  border: 0; border-radius: 50%; background: #e6e6e9;
}
.dials-row.is-changed input[type="range"]::-webkit-slider-thumb { background: #6db2ff; }
.dials-foot {
  display: flex; gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid #2e2e33;
  background: #1e1e22;
}
.dials-btn {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #3a3a42; border-radius: 6px;
  background: #2b2b31; color: #e6e6e9;
  font: inherit; cursor: pointer;
}
.dials-btn:hover { background: #37373f; }
`;
