// StarryNight
//
// Update resistance: Spotify ships hashed class names, renames data-testids
// and moves wrappers around between versions. Nothing in user.css targets
// those directly. Instead this script finds every piece of the layout through
// a chain of fallbacks (known id/testid -> fuzzy attribute match -> structure
// -> geometry) and tags it with a stable sn-* class. Missing pieces only
// disable their own styling; run StarryNight.report() in devtools to see
// which hooks resolved.

(() => {
  function random(min, max) {
    // min inclusive max exclusive
    return Math.random() * (max - min) + min;
  }

  const tag = (el, cls) => {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  };
  // first match of several selectors, in priority order
  const q = (scope, ...sels) => {
    if (!scope) return null;
    for (const s of sels) {
      try {
        const el = scope.querySelector(s);
        if (el) return el;
      } catch {}
    }
    return null;
  };
  // the direct child of `parent` that contains `node`
  const childContaining = (parent, node) => {
    if (!parent || !node || !parent.contains(node) || parent === node) return null;
    let el = node;
    while (el && el.parentElement !== parent) el = el.parentElement;
    return el;
  };
  const closestUpTo = (node, limit, test) => {
    for (let el = node; el && el !== limit; el = el.parentElement) if (test(el)) return el;
    return null;
  };
  const hasBgColor = (cs) => {
    const c = cs.backgroundColor.match(/[\d.]+/g);
    return !!c && (c.length < 4 || +c[3] > 0);
  };
  const isIdent = (v) => /^-?[a-z_][\w-]*$/i.test(v) && !/^(auto|span|inherit|initial|unset)$/i.test(v);

  const warned = new Set();
  const safe = (name, fn) => {
    try {
      return fn();
    } catch (e) {
      if (!warned.has(name)) {
        warned.add(name);
        console.warn(`[StarryNight] ${name} failed`, e);
      }
    }
  };

  // ---------------------------------------------------------------- sky

  const buildSky = () => {
    const rs = getComputedStyle(document.documentElement);
    const sky = document.createElement("div");
    sky.className = "starrynight-bg-container";

    // create the stars
    const canvasSize = window.innerWidth * window.innerHeight;
    const starsFraction = canvasSize / 4000;
    for (let i = 0; i < starsFraction; i++) {
      const size = Math.random() < 0.5 ? 1 : 2;

      const star = document.createElement("div");
      star.style.position = "absolute";
      star.style.left = `${random(0, 99)}%`;
      star.style.top = `${random(0, 99)}%`;
      star.style.opacity = random(0.5, 1);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = rs.getPropertyValue("--spice-star");
      star.style.zIndex = "-1";
      star.style.borderRadius = "50%";

      if (Math.random() < 1 / 5) {
        star.style.setProperty(
          "animation",
          `twinkle${Math.floor(Math.random() * 4) + 1} 5s infinite`,
          "important",
        );
      }

      sky.appendChild(star);
    }

    /*
    Pure CSS Shooting Star Animation Effect Copyright (c) 2021 by Delroy Prithvi (https://codepen.io/delroyprithvi/pen/LYyJROR)

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */
    for (let i = 0; i < 4; i++) {
      const shootingstar = document.createElement("span");
      shootingstar.className = "shootingstar";
      if (Math.random() < 0.75) {
        shootingstar.style.top = "-4px"; // hidden off screen when animation is delayed
        shootingstar.style.right = `${random(0, 90)}%`;
      } else {
        shootingstar.style.top = `${random(0, 50)}%`;
        shootingstar.style.right = "-4px"; // hidden when animation is delayed
      }

      const shootingStarGlowColor = `rgba(${rs.getPropertyValue(
        "--spice-rgb-shooting-star-glow",
      )},${0.1})`;
      shootingstar.style.boxShadow = `0 0 0 4px ${shootingStarGlowColor}, 0 0 0 8px ${shootingStarGlowColor}, 0 0 20px ${shootingStarGlowColor}`;

      shootingstar.style.animationDuration = `${
        Math.floor(Math.random() * 3) + 3
      }s`;
      shootingstar.style.animationDelay = `${Math.floor(Math.random() * 7)}s`;

      sky.appendChild(shootingstar);

      shootingstar.addEventListener("animationend", () => {
        if (Math.random() < 0.75) {
          shootingstar.style.top = "-4px"; // hidden off screen when animation is delayed
          shootingstar.style.right = `${random(0, 90)}%`;
        } else {
          shootingstar.style.top = `${random(0, 50)}%`;
          shootingstar.style.right = "-4px"; // hidden when animation is delayed
        }

        shootingstar.style.animation = "none"; // Remove animation

        void shootingstar.offsetWidth;

        shootingstar.style.animation = "";
        shootingstar.style.setProperty(
          "animation-duration",
          `${Math.floor(Math.random() * 4) + 3}s`,
          "important",
        );
      });
    }

    return sky;
  };

  // ---------------------------------------------------------------- root

  // the app-wide grid that lays out the panels; must cover most of the window
  const isAppGrid = (el) => {
    if (getComputedStyle(el).display !== "grid" || el.children.length < 3) return false;
    const r = el.getBoundingClientRect();
    return r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.8;
  };
  const findRoot = () => {
    const known = q(document, ".Root__top-container", '[class*="Root__top-container"]');
    if (known && isAppGrid(known)) return known;
    const anchors = [
      '[data-testid="now-playing-bar"]',
      "#main-view",
      ".main-view-container",
      '[data-testid="player-controls"]',
      '[data-testid*="playpause"]',
      "main",
      '[role="main"]',
      "#global-nav-bar",
    ];
    for (const s of anchors) {
      const hit = q(document, s);
      const grid = hit && closestUpTo(hit.parentElement, document.body, isAppGrid);
      if (grid) return grid;
    }
    return null;
  };

  // ---------------------------------------------------------------- slots

  let root = null;
  let sky = null;
  let slots = {};
  // grid area names, learned from Spotify's own CSS before ours applies;
  // the defaults are what Spotify has used for years
  const names = {
    banner: "top-banner",
    nav: "global-nav",
    left: "left-sidebar",
    main: "main-view",
    right: "right-sidebar",
    playbar: "now-playing-bar",
  };
  let extraNames = [];
  const origArea = new WeakMap();

  // content/id signals first; area-name signals only as a second pass, since
  // overlay layers reuse the panel area names
  const CONTENT_TESTS = [
    ["playbar", (s) => q(s, '[data-testid="now-playing-bar"]', '[data-testid="player-controls"]', '[data-testid="control-button-playpause"]', ".main-nowPlayingBar-container")],
    ["nav", (s) => s.id === "global-nav-bar" || /globalnav/i.test(s.className) || q(s, '[role="search"]', 'input[type="search"]')],
    ["main", (s) => s.id === "main-view" || q(s, ".main-view-container", "main", '[role="main"]')],
    ["left", (s) => /left/i.test(s.id) || q(s, ".YourLibraryX", '[id*="LeftSidebar"]')],
    ["right", (s) => /right/i.test(s.id) || q(s, "#Desktop_PanelContainer_Id", '[id*="PanelContainer"]', "[data-npv-root]")],
  ];

  const areaOf = (slot) => {
    const a = origArea.get(slot) ?? getComputedStyle(slot).gridRowStart;
    return isIdent(a) ? a : "";
  };
  // full-window overlays (cinema mode, drag layers) are grid children too
  const isOverlay = (slot) => {
    const parts = getComputedStyle(slot).gridArea.split("/").map((x) => x.trim());
    return new Set(parts.filter(isIdent)).size >= 3;
  };

  const tagSlots = () => {
    const prev = slots;
    slots = {};
    const kids = [...root.children].filter((s) => s !== sky && !isOverlay(s));
    const claimed = new Set();
    const claim = (role, slot) => {
      if (!slot || slots[role]) return;
      slots[role] = slot;
      claimed.add(slot);
    };
    for (const [role, test] of CONTENT_TESTS)
      claim(role, kids.find((s) => !claimed.has(s) && test(s)));
    for (const role of ["left", "main", "right", "nav", "playbar"])
      claim(role, kids.find((s) => !claimed.has(s) && areaOf(s) === names[role]));
    // geometric fallback: whatever sits beside the main view
    if (slots.main) {
      const m = slots.main.getBoundingClientRect();
      const free = kids.filter((s) => !claimed.has(s) && s.getBoundingClientRect().height > 100);
      claim("right", free.find((s) => s.getBoundingClientRect().left >= m.right - 8));
      claim("left", free.find((s) => s.getBoundingClientRect().right <= m.left + 8));
    }
    for (const role of ["left", "right", "main", "playbar", "nav"]) {
      if (prev[role] && prev[role] !== slots[role]) prev[role].classList.remove(`sn-slot-${role}`);
      tag(slots[role], `sn-slot-${role}`);
      // nav spans banner+nav rows in Spotify's CSS, so its row-start isn't its
      // own area name; it's placed by line numbers in user.css anyway
      if (role === "nav") continue;
      const a = slots[role] && areaOf(slots[role]);
      const taken = Object.entries(names).some(([r, n]) => r !== role && n === a);
      if (a && !taken) names[role] = a;
    }
  };

  const readOriginalTemplate = () => {
    for (const kid of root.children) origArea.set(kid, getComputedStyle(kid).gridRowStart);
    const tpl = getComputedStyle(root).gridTemplateAreas;
    const rows = [...tpl.matchAll(/"([^"]*)"/g)].map((m) => m[1].trim().split(/\s+/));
    // Spotify stacks full-width rows on top: banner, then nav
    const full = rows.filter((r) => new Set(r).size === 1 && r[0] !== ".").map((r) => r[0]);
    if (full.length >= 2 && rows[0][0] === full[0]) {
      names.banner = full[0];
      names.nav = full[1];
    }
    return [...new Set(rows.flat())].filter((n) => n !== ".");
  };

  // grid template built from the live area names so a rename can't break it
  const applyGrid = () => {
    const n = names;
    const used = new Set([n.banner, n.nav, n.left, n.main, n.right, n.playbar]);
    if (used.size !== 6 || ![...used].every(isIdent)) return;
    const extras = extraNames.filter((x) => !used.has(x));
    if (extras.length && !warned.has("extra-areas")) {
      warned.add("extra-areas");
      console.warn("[StarryNight] Spotify added grid areas this theme doesn't place:", extras);
    }
    const tpl = `"${n.banner} ${n.nav} ${n.nav}" "${n.left} ${n.main} ${n.playbar}" "${n.left} ${n.main} ${n.right}"`;
    if (root.style.getPropertyValue("grid-template-areas") !== tpl)
      root.style.setProperty("grid-template-areas", tpl, "important");
    if (slots.main && slots.main.style.getPropertyValue("grid-area") !== n.main)
      slots.main.style.setProperty("grid-area", n.main, "important");
  };

  // ---------------------------------------------------------------- backdrops

  // full-size wrapper layers inside a panel paint the opaque backgrounds that
  // hide the sky; actual content (cards, rows, art) is never panel-sized
  const clearBackdrops = (slot) => {
    if (!slot) return;
    const { width, height } = slot.getBoundingClientRect();
    if (!width || !height) return;
    const walk = (el, depth) => {
      for (const child of el.children) {
        if (child.matches("img, video, canvas, svg, picture")) continue;
        const r = child.getBoundingClientRect();
        if (r.width < width * 0.95 || r.height < height * 0.8) continue;
        const cs = getComputedStyle(child);
        if (hasBgColor(cs)) tag(child, "sn-clear");
        if (cs.backgroundImage.includes("gradient")) tag(child, "sn-clear-gradient");
        for (const p of ["before", "after"]) {
          const ps = getComputedStyle(child, `::${p}`);
          if (ps.content !== "none" && (hasBgColor(ps) || ps.backgroundImage.includes("gradient")))
            tag(child, `sn-clear-${p}`);
        }
        if (depth < 16) walk(child, depth + 1);
      }
    };
    walk(slot, 0);
  };

  // ---------------------------------------------------------------- playbar

  const hooks = {};
  const tagPlaybar = () => {
    const slot = slots.playbar;
    const bar =
      q(slot || document, '[data-testid="now-playing-bar"]', 'aside[data-testid*="now-playing"]', ".main-nowPlayingBar-container") ||
      (slot && q(slot, "aside", "footer")) ||
      slot?.firstElementChild;
    hooks.bar = bar;
    if (!bar) return;
    tag(bar, "sn-npb");

    const playpause = q(bar, '[data-testid="control-button-playpause"]', '[data-testid*="playpause"]', '[data-testid*="play-pause"]', 'button[data-encore-id="buttonPrimary"]');
    const progressEl = q(bar, '[data-testid="playback-position"]', '[data-testid="playback-progressbar"]', '[data-testid*="progress"]', '[role="slider"]', 'input[type="range"]');
    const controls =
      q(bar, '[data-testid="player-controls"]') ||
      (playpause && progressEl && closestUpTo(playpause.parentElement, bar, (el) => el.contains(progressEl)));
    hooks.controls = controls;
    tag(controls, "sn-controls");
    const buttons = q(bar, '[data-testid="general-controls"]') || childContaining(controls, playpause);
    tag(buttons, "sn-controls-buttons");
    const progress = childContaining(controls, progressEl);
    if (progress && progress !== buttons) tag(progress, "sn-progress");

    const firstImg = bar.querySelector("img");
    const cover =
      q(bar, '[data-testid="cover-art-button"]', '[data-testid*="cover-art"] button', '[data-testid*="cover"] button') ||
      firstImg?.closest("button, a") ||
      firstImg?.parentElement;
    hooks.cover = cover;
    tag(cover, "sn-cover");

    const inner = childContaining(bar, controls || playpause || cover);
    hooks.inner = inner;
    if (!inner) return;
    tag(inner, "sn-npb-inner");
    const left = childContaining(inner, cover);
    const center = childContaining(inner, controls || playpause);
    // roles are exclusive; an early pass (before the cover loads) may have
    // tagged things differently
    for (const c of inner.children) {
      const role = c === left ? "left" : c === center ? "center" : "right";
      for (const r of ["left", "center", "right"]) c.classList.toggle(`sn-npb-${r}`, r === role);
    }

    // widget = closest ancestor of the cover that also holds the track title link
    let widget = q(bar, '[data-testid^="now-playing-widget"]');
    if (!widget && cover && left)
      widget = closestUpTo(cover.parentElement, inner, (el) => !!el.querySelector("a[href]"));
    hooks.widget = widget;
    if (!widget) return;
    tag(widget, "sn-widget");
    const coverSlot = childContaining(widget, cover);
    for (const c of widget.children) {
      c.classList.toggle("sn-cover-slot", c === coverSlot);
      c.classList.toggle("sn-track-info", c !== coverSlot && !!c.querySelector("a[href]"));
    }
  };

  const tagPanelHeader = () => {
    const slot = slots.right;
    if (!slot) return;
    const panel = q(slot, "[data-npv-root]") || q(slot, "aside")?.firstElementChild;
    if (!panel) return;
    const header = [...panel.children].find(
      (c) => c.querySelector("button") && c.getBoundingClientRect().height < 120,
    );
    hooks.panelHeader = header;
    if (!header) return;
    tag(header, "sn-panel-header");
    for (const c of header.children) if (c.querySelector("a")) tag(c, "sn-panel-header-title");
  };

  // ---------------------------------------------------------------- play state

  const isPlaying = () => {
    const P = window.Spicetify?.Player;
    if (typeof P?.isPlaying === "function") return !!P.isPlaying();
    if (P?.data && "isPaused" in P.data) return !P.data.isPaused;
    const ms = navigator.mediaSession?.playbackState;
    if (ms && ms !== "none") return ms === "playing";
    return false;
  };
  const updatePlaying = () => root?.toggleAttribute("data-sn-playing", isPlaying());
  let playListener = false;
  const bindPlayer = () => {
    if (playListener || !window.Spicetify?.Player?.addEventListener) return;
    window.Spicetify.Player.addEventListener("onplaypause", updatePlaying);
    playListener = true;
  };

  // ---------------------------------------------------------------- panel width

  // handles resizing of playbar panel to match right sidebar below it
  let rightSidebarSlot = null;
  const resizeObserver = new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width);
    if (w === 0) root?.style.removeProperty("--starrynight-panel-width");
    else root?.style.setProperty("--starrynight-panel-width", `${w}px`);
  });
  // measure the sidebar's content, not the slot: the slot is an auto grid
  // column the playbar also sits in, so measuring it would let a long track
  // title widen the column, which widens the playbar, which widens the column...
  const sidebarPanel = (slot) =>
    [...slot.children]
      .filter((c) => !/resize/i.test(c.className) && c.getBoundingClientRect().width > 0)
      .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] ?? slot;
  const bindSidebar = () => {
    const target = slots.right && sidebarPanel(slots.right);
    if (target === rightSidebarSlot) return;
    resizeObserver.disconnect();
    rightSidebarSlot = target;
    if (target) resizeObserver.observe(target);
    else root.style.removeProperty("--starrynight-panel-width");
  };

  // ---------------------------------------------------------------- lifecycle

  let pending = false;
  const refresh = () => {
    pending = false;
    if (!root?.isConnected) return;
    // each step is isolated: one broken hook never takes the rest down
    safe("slots", tagSlots);
    safe("grid", applyGrid);
    safe("sidebar", bindSidebar);
    safe("playbar", tagPlaybar);
    safe("panel header", tagPanelHeader);
    for (const r of ["left", "main", "right"]) safe(`backdrop ${r}`, () => clearBackdrops(slots[r]));
    safe("player", bindPlayer);
    safe("play state", updatePlaying);
  };
  const schedule = () => {
    if (pending) return;
    pending = true;
    setTimeout(refresh, 200);
  };
  const observer = new MutationObserver(schedule);

  const attach = () => {
    const found = safe("root", findRoot);
    if (!found) return;
    if (found !== root) {
      root?.classList.remove("starrynight-root");
      root = found;
      slots = {};
      rightSidebarSlot = null;
      resizeObserver.disconnect();
      observer.disconnect();
      // read Spotify's layout before our CSS (scoped to .starrynight-root) applies
      extraNames = safe("template", readOriginalTemplate) ?? [];
      root.classList.add("starrynight-root");
      // to position stars and shooting stars between the background and everything else
      root.style.zIndex = "0";
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    if (!sky?.isConnected) {
      sky = safe("sky", buildSky);
      if (sky) root.appendChild(sky);
    }
    refresh();
  };

  // poll forever (cheap): first attach with no timeout, plus self-heal when
  // React remounts the root, strips our class or drops the sky
  attach();
  setInterval(() => {
    if (!root?.isConnected || !sky?.isConnected || !root.classList.contains("starrynight-root")) attach();
    safe("play state", updatePlaying);
  }, 1000);
  window.addEventListener("resize", schedule);

  window.StarryNight = {
    refresh: attach,
    report() {
      const row = (v) => (v ? (v.isConnected ? "ok" : "stale") : "MISSING");
      const out = {
        root: row(root),
        sky: row(sky),
        ...Object.fromEntries(["nav", "left", "main", "right", "playbar"].map((r) => [`slot.${r}`, row(slots[r])])),
        ...Object.fromEntries(["bar", "controls", "cover", "inner", "widget", "panelHeader"].map((k) => [k, row(hooks[k])])),
        areas: Object.values(names).join(" | "),
        playing: isPlaying(),
      };
      console.table(out);
      return out;
    },
  };

  // one-time heads up if a future Spotify update hides something from us
  setTimeout(() => {
    const r = window.StarryNight.report();
    const missing = Object.keys(r).filter((k) => r[k] === "MISSING" && k !== "panelHeader" && k !== "slot.right");
    if (missing.length) console.warn("[StarryNight] hooks not found:", missing.join(", "));
  }, 15000);
})();
