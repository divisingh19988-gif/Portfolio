import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Flip, Draggable, InertiaPlugin, Observer);

const reduce = () => document.documentElement.classList.contains("reduce");

let fittingName = false;
let capRatio = 0;
const PORTRAIT_RATIO = 0.745;
const NAME_GAP = 30;

// Height of a capital letter as a share of the font size, measured from the
// real display font so the portrait can match the letters exactly.
function capHeightRatio(el: HTMLElement) {
  if (capRatio) return capRatio;
  const style = getComputedStyle(el);
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0.86;
  const font = `${style.fontWeight} 200px ${style.fontFamily}`;
  ctx.font = font;
  const measured = ctx.measureText("HIT").actualBoundingBoxAscent / 200;
  const sane = measured > 0.5 && measured < 1.1;
  if (sane && document.fonts.check(font)) capRatio = measured;
  return sane ? measured : 0.86;
}

function fitHeroName() {
  if (fittingName) return;
  const name = document.querySelector<HTMLElement>(".fly-name");
  const lock = document.querySelector<HTMLElement>(".name-lock");
  const portrait = document.querySelector<HTMLElement>(".portrait-home");
  const sample = name?.querySelector<HTMLElement>(".first");
  if (!name || !lock || !portrait || !sample || name.classList.contains("is-docked")) return;
  const motion = getComputedStyle(sample).transform;
  if (motion && motion !== "none") {
    const values = motion.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
    const shift = Math.abs(values[4] || 0) + Math.abs(values[5] || 0);
    if (shift > 0.5) return;
  }
  fittingName = true;
  portrait.style.marginTop = "0px";
  portrait.style.transform = "none";
  name.style.whiteSpace = "nowrap";
  name.style.lineHeight = "1";
  const maxW = lock.clientWidth;
  const stacked = getComputedStyle(lock).flexDirection.startsWith("column");
  if (stacked) {
    // Phone: the name fills the row; the portrait above it is sized by the stylesheet.
    name.style.fontSize = "100px";
    const probe = document.createRange();
    probe.selectNodeContents(sample);
    const ratio = Math.max(0.5, probe.getBoundingClientRect().height / 100);
    let lo = 36;
    let hi = Math.min(maxW, 520);
    let best = lo;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      name.style.fontSize = `${mid / ratio}px`;
      if (Math.max(name.scrollWidth, mid) <= maxW + 1) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    name.style.fontSize = `${best / ratio}px`;
    portrait.style.width = "";
    portrait.style.height = "";
    portrait.style.marginTop = "";
    portrait.style.transform = "";
    fittingName = false;
    return;
  }
  // Desktop: one line. The portrait stands directly right of the name, as tall
  // as the capital letters, and the pair fills the full row width.
  const cap = capHeightRatio(name);
  let lo = 36;
  let hi = Math.min(maxW, 520);
  let best = lo;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    name.style.fontSize = `${mid / cap}px`;
    if (name.scrollWidth + NAME_GAP + mid * PORTRAIT_RATIO <= maxW + 1) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  name.style.fontSize = `${best / cap}px`;
  const mark = document.createElement("span");
  mark.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  sample.appendChild(mark);
  const baseline = mark.getBoundingClientRect().bottom;
  mark.remove();
  const capTop = baseline - best - lock.getBoundingClientRect().top;
  const width = best * PORTRAIT_RATIO;
  portrait.style.width = `${width}px`;
  portrait.style.height = `${best}px`;
  portrait.style.transform = `translateY(${capTop}px)`;
  lock.parentElement?.style.setProperty("--portrait-w", `${width}px`);
  fittingName = false;
}

function setupPosters() {
  const posters = gsap.utils.toArray<HTMLElement>(".poster");
  if (!posters.length || reduce()) return;
  if (document.body.dataset.page === "case") {
    gsap.fromTo(
      posters,
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 1.05, ease: "power3.inOut", delay: 0.08 },
    );
    return;
  }
  posters.forEach((poster) => {
    gsap.fromTo(
      poster,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        ease: "none",
        scrollTrigger: {
          trigger: poster,
          start: "top 92%",
          end: "top 66%",
          scrub: 0.45,
          onToggle: () => {
            const open = posters.some((el) => {
              const box = el.getBoundingClientRect();
              return box.top < window.innerHeight * 0.62 && box.bottom > window.innerHeight * 0.28;
            });
            document.body.classList.toggle("poster-open", open);
          },
        },
      },
    );
  });
}

function setupSpy() {
  document.querySelectorAll<HTMLElement>("[data-screen]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;
        const name = section.dataset.screen || "";
        document.body.dataset.screen = name;
        const label = document.querySelector("[data-screen-label]");
        if (label) label.textContent = name;
        document.querySelectorAll<HTMLElement>("[data-nav]").forEach((link) => {
          link.classList.toggle("is-active", link.dataset.nav === section.id);
        });
        document.body.classList.toggle("show-minis", name === "WORKS");
        document.body.classList.toggle("at-contact", name === "CONTACT");
      },
    });
  });
}

export function primeHero() {
  if (reduce() || document.body.dataset.page !== "home") return;
  gsap.set(".name-mask > span", { yPercent: 115 });
  gsap.set(".topbar", { y: -140 });
  gsap.set(".fly-portrait", { yPercent: 120 });
  gsap.set([".hero-kicker", ".hero-foot"], { y: 22, opacity: 0 });
}

export function playHeroEntrance() {
  if (document.body.dataset.page !== "home") return;
  const bits = [".hero-kicker", ".hero-foot"];
  if (reduce()) {
    document.body.classList.add("is-in");
    gsap.set([".name-mask > span", ".topbar", ".fly-portrait", ...bits], { clearProps: "all" });
    return;
  }
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      document.body.classList.add("is-in");
      gsap.set(".name-mask > span", { clearProps: "transform" });
      fitHeroName();
    },
  });
  tl.to(".topbar", { y: 0, duration: 0.72 }, 0);
  tl.to(".name-mask > span", { yPercent: 0, duration: 0.86, stagger: 0.1 }, 0.04);
  tl.to(".fly-portrait", { yPercent: 0, duration: 0.9 }, 0.1);
  tl.to(bits, { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: "power2.out" }, 0.26);
  tl.set(".fly-portrait", { clearProps: "transform" });
  tl.set(".topbar", { clearProps: "transform" });
}

function setupHeadingRise() {
  if (reduce()) return;
  document.querySelectorAll<HTMLElement>(".display .line").forEach((line) => {
    gsap.from(line, {
      y: 48,
      opacity: 0,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: { trigger: line, start: "top 88%" },
    });
  });
  document.querySelectorAll<HTMLElement>(".contact-card h2").forEach((head) => {
    if (head.querySelector(".rise-in")) return;
    const inner = document.createElement("span");
    inner.className = "rise-in";
    while (head.firstChild) inner.appendChild(head.firstChild);
    head.appendChild(inner);
    gsap.from(inner, {
      yPercent: 120,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: head, start: "top 88%" },
    });
  });
}

// Stat numbers count up from zero the first time the row scrolls into view.
function countUpStats() {
  document.querySelectorAll<HTMLElement>(".stat b").forEach((el, i) => {
    const final = el.textContent || "";
    const parts = final.match(/^(\D*)([\d,]+)(.*)$/);
    if (!parts) return;
    const [, pre, digits, post] = parts;
    const target = Number(digits.replace(/,/g, ""));
    const grouped = digits.includes(",");
    // Hold the finished width so the neighbours do not shift while it counts.
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    const state = { v: 0 };
    gsap.to(state, {
      v: target,
      duration: 1.6,
      delay: i * 0.14,
      ease: "power2.out",
      onUpdate: () => {
        const n = Math.round(state.v);
        el.textContent = pre + (grouped ? n.toLocaleString("en-US") : String(n)) + post;
      },
      onComplete: () => {
        el.textContent = final;
      },
    });
  });
}

// Skill categories sharpen out of a blur as they scroll up, tied to scroll position.
// The hidden start state is set here, so the section stays readable without motion or JS.
function setupSkillCats() {
  gsap.utils.toArray<HTMLElement>(".skill-cat").forEach((cat) => {
    const index = cat.querySelector(".skill-cat-index");
    const title = cat.querySelector<HTMLElement>(".skill-cat-title");
    const tags = cat.querySelector(".skill-cat-tags");
    const note = cat.querySelector(".skill-cat-note");
    if (!index || !title || !tags) return;
    const split = SplitText.create(title, { type: "words", aria: "auto" });
    // The blur-in is a desktop effect. Phones get the same rise and fade without the filter cost.
    const soft = window.innerWidth > 860;
    const blur = (px: number) => (soft ? { filter: `blur(${px}px)` } : {});
    const pieces = [index, ...split.words, tags, ...(note ? [note] : [])];
    gsap.set(index, { y: 8, opacity: 0, ...blur(5) });
    gsap.set(split.words, { y: 16, opacity: 0, ...blur(7) });
    gsap.set(tags, { y: 12, opacity: 0, ...blur(6) });
    if (note) gsap.set(note, { y: 10, opacity: 0, ...blur(6) });
    const shown = { y: 0, opacity: 1, ...blur(0), ease: "none" };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cat,
        start: "top 90%",
        end: soft ? "top 55%" : "top 70%",
        scrub: 0.4,
        // A finished blur(0px) still keeps every word on its own filter layer, so drop it.
        onLeave: () => gsap.delayedCall(0.6, () => gsap.set(pieces, { clearProps: "filter" })),
      },
    });
    tl.to(index, { ...shown, duration: 0.3 }, 0)
      .to(split.words, { ...shown, duration: 0.4, stagger: 0.08 }, 0.15)
      .to(tags, { ...shown, duration: 0.3 }, 0.45);
    if (note) tl.to(note, { ...shown, duration: 0.3 }, 0.6);
  });
}

function setupSkills() {
  if (reduce()) {
    document.querySelector(".stats")?.classList.add("is-in");
    return;
  }
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((line) => {
    const split = SplitText.create(line, { type: "words,chars", wordsClass: "word", charsClass: "char", aria: "auto" });
    gsap.from(split.chars, {
      x: () => gsap.utils.random(-160, 160),
      y: () => gsap.utils.random(-110, 110),
      rotation: () => gsap.utils.random(-80, 80),
      opacity: 0,
      duration: 0.95,
      ease: "power3.out",
      stagger: { each: 0.012, from: "random" },
      scrollTrigger: { trigger: line, start: "top 84%" },
    });
  });
  gsap.to(".hero .brush path", {
    strokeDashoffset: 0,
    duration: 1.05,
    delay: 0.15,
    ease: "power2.out",
  });
  gsap.utils.toArray<SVGPathElement>(".sheet .brush path").forEach((path) => {
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.15,
      ease: "power2.out",
      scrollTrigger: { trigger: path, start: "top 88%" },
    });
  });
  setupSkillCats();
  let counted = false;
  ScrollTrigger.create({
    trigger: ".stats",
    start: "top 82%",
    onEnter: () => {
      document.querySelector(".stats")?.classList.add("is-in");
      if (!counted) countUpStats();
      counted = true;
    },
  });
  if (document.querySelector(".giant")) {
    gsap.from(".giant", {
      y: 70,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".giant", start: "top 85%" },
    });
  }
}

function setupGallery(auto: boolean) {
  const stage = document.querySelector<HTMLElement>(".curve");
  if (!stage) return () => undefined;
  const cards = [...stage.querySelectorAll<HTMLElement>(".gcard")];
  if (!cards.length) return () => undefined;
  let offset = 0;
  let suppress = false;

  // Cards sit on the inside of a cylinder: the centre card is furthest away,
  // the edge cards swing toward the viewer and turn to face the middle.
  let cardWidth = cards[0].offsetWidth || 240;
  const measure = () => {
    cardWidth = cards[0].offsetWidth || cardWidth;
  };
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(stage);

  const layout = () => {
    const spacing = cardWidth * 1.11;
    const radius = cardWidth * 2.3;
    const loop = cards.length * spacing;
    cards.forEach((card, index) => {
      let arc = (index * spacing - offset) % loop;
      if (arc < -loop / 2) arc += loop;
      if (arc >= loop / 2) arc -= loop;
      const theta = arc / radius;
      if (Math.abs(theta) > 1.15) {
        card.style.visibility = "hidden";
        return;
      }
      const x = radius * Math.sin(theta);
      const z = radius * (1 - Math.cos(theta));
      card.style.visibility = "visible";
      card.style.transform = `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${(-theta).toFixed(4)}rad)`;
    });
  };

  const observer = Observer.create({
    target: stage,
    type: "pointer,touch",
    dragMinimum: 3,
    onDrag: (self) => {
      offset -= self.deltaX;
      if (Math.abs(self.deltaX) > 0.5) suppress = true;
      layout();
    },
    onPress: () => stage.classList.add("is-dragging"),
    onRelease: () => {
      stage.classList.remove("is-dragging");
      window.setTimeout(() => {
        suppress = false;
      }, 50);
    },
  });

  // Cards are links around images. Without this the browser starts its own
  // link/image drag, fires pointercancel, and the gallery drag dies after a few pixels.
  const onDragStart = (event: Event) => event.preventDefault();
  stage.addEventListener("dragstart", onDragStart);

  const onClick = (event: Event) => {
    if (!suppress) return;
    event.preventDefault();
    event.stopPropagation();
  };
  stage.addEventListener("click", onClick, true);

  const tick = () => {
    if (auto) offset += 0.35;
    layout();
  };
  // The carousel only turns while it is on screen. Left running, it rewrote nine
  // transforms on every frame for the whole visit, wherever the visitor was.
  let turning = false;
  const turn = (on: boolean) => {
    if (!auto || turning === on) return;
    turning = on;
    if (on) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
  };
  const onScreen = new IntersectionObserver((entries) => entries.forEach((entry) => turn(entry.isIntersecting)), {
    rootMargin: "200px",
  });
  layout();
  if (auto) onScreen.observe(stage);

  return () => {
    observer.kill();
    stage.removeEventListener("click", onClick, true);
    stage.removeEventListener("dragstart", onDragStart);
    stage.classList.remove("is-dragging");
    turn(false);
    onScreen.disconnect();
    resizeObserver.disconnect();
    cards.forEach((card) => {
      card.style.transform = "";
      card.style.visibility = "";
    });
  };
}

function setupFlight() {
  const name = document.querySelector<HTMLElement>(".fly-name");
  const portrait = document.querySelector<HTMLElement>(".fly-portrait");
  const nameSlot = document.querySelector<HTMLElement>(".side-name-slot");
  const portraitSlot = document.querySelector<HTMLElement>(".side-portrait-slot");
  const nameHome = document.querySelector<HTMLElement>(".name-home");
  const portraitHome = document.querySelector<HTMLElement>(".portrait-home");
  if (!name || !portrait || !nameSlot || !portraitSlot || !nameHome || !portraitHome) return () => undefined;

  const toSide = () => {
    if (name.classList.contains("is-docked")) return;
    const state = Flip.getState([name, portrait]);
    name.style.fontSize = "";
    name.style.whiteSpace = "";
    name.style.lineHeight = "";
    name.classList.add("is-docked");
    portrait.classList.add("is-docked");
    nameSlot.appendChild(name);
    portraitSlot.appendChild(portrait);
    document.body.classList.add("docked");
    Flip.from(state, {
      duration: 0.95,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      stagger: 0.03,
    });
  };

  const toHome = () => {
    if (!name.classList.contains("is-docked")) return;
    const state = Flip.getState([name, portrait]);
    name.classList.remove("is-docked");
    portrait.classList.remove("is-docked");
    nameHome.appendChild(name);
    portraitHome.appendChild(portrait);
    document.body.classList.remove("docked");
    Flip.from(state, {
      duration: 0.8,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onComplete: fitHeroName,
    });
  };

  const trigger = ScrollTrigger.create({
    trigger: ".hero",
    start: "bottom 72%",
    onEnter: toSide,
    onLeaveBack: toHome,
  });

  return () => {
    trigger.kill();
    if (name.classList.contains("is-docked")) {
      name.classList.remove("is-docked");
      portrait.classList.remove("is-docked");
      nameHome.appendChild(name);
      portraitHome.appendChild(portrait);
    }
    document.body.classList.remove("docked");
  };
}

function setupShowcase() {
  const section = document.querySelector<HTMLElement>(".showcase");
  const track = document.querySelector<HTMLElement>(".showcase-track");
  const counter = document.querySelector<HTMLElement>("[data-counter]");
  if (!section || !track) return;
  const panels = [...track.querySelectorAll<HTMLElement>(".panel")];
  const syncCounter = () => {
    if (!counter || !panels.length) return;
    const frame = section.getBoundingClientRect();
    const middle = frame.left + frame.width / 2;
    let index = 0;
    let nearest = Infinity;
    panels.forEach((panel, i) => {
      const box = panel.getBoundingClientRect();
      const gap = Math.abs(box.left + box.width / 2 - middle);
      if (gap < nearest) {
        nearest = gap;
        index = i;
      }
    });
    counter.textContent = String(index + 1).padStart(2, "0");
  };
  gsap.to(track, {
    x: () => -(track.scrollWidth - section.clientWidth + 48),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${Math.max(track.scrollWidth - section.clientWidth, 1)}`,
      pin: true,
      scrub: 0.65,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: syncCounter,
      onRefresh: syncCounter,
    },
  });
}

function setupAwards() {
  const orbit = document.querySelector<HTMLElement>(".orbit");
  if (!orbit) return () => undefined;
  const cards = [...orbit.querySelectorAll<HTMLElement>(".cert")];
  const count = cards.length;
  if (!count) return () => undefined;
  const proxy = document.createElement("div");
  const step = 150;
  let dragged = false;
  const focus = () => -(Number(gsap.getProperty(proxy, "x")) || 0) / step;
  const layout = () => {
    const spread = Math.min(150, (orbit.clientWidth - 210) / Math.max(count - 1, 1));
    const at = focus();
    cards.forEach((card, index) => {
      let d = (index - at) % count;
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;
      const far = Math.abs(d);
      const edge = count / 2;
      const fade = far > edge - 0.5 ? Math.max(0, (edge - far) / 0.5) : 1;
      card.style.transform = `translate(-50%, -50%) translate(${d * spread}px, ${d * d * 14}px) rotate(${d * 7}deg) scale(${1 - Math.min(far, 2) * 0.05})`;
      card.style.zIndex = String(40 - Math.round(far * 10));
      card.style.opacity = String(fade);
      card.classList.toggle("is-front", far < 0.5);
    });
  };
  const [instance] = Draggable.create(proxy, {
    trigger: orbit,
    type: "x",
    inertia: true,
    minimumMovement: 4,
    snap: { x: (value: number) => Math.round(value / step) * step },
    onDragStart() {
      dragged = true;
    },
    onDrag: layout,
    onThrowUpdate: layout,
    onRelease() {
      window.setTimeout(() => {
        dragged = false;
      }, 60);
    },
  });
  const onClick = (event: Event) => {
    if (dragged) return;
    const card = (event.target as HTMLElement).closest<HTMLElement>(".cert");
    if (!card) return;
    const at = Math.round(focus());
    let d = (cards.indexOf(card) - at) % count;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    if (!d) return;
    gsap.to(proxy, {
      x: -(at + d) * step,
      duration: 0.55,
      ease: "power3.out",
      onUpdate: layout,
      onComplete: () => {
        instance?.update();
      },
    });
  };
  orbit.addEventListener("click", onClick);
  const resize = new ResizeObserver(layout);
  resize.observe(orbit);
  gsap.set(proxy, { x: -Math.floor(count / 2) * step });
  instance?.update();
  layout();
  return () => {
    instance?.kill();
    resize.disconnect();
    orbit.removeEventListener("click", onClick);
    cards.forEach((card) => {
      card.style.transform = "";
      card.style.opacity = "";
      card.style.zIndex = "";
      card.classList.remove("is-front");
    });
  };
}

function setupContact() {
  const scene = document.querySelector<HTMLElement>(".wall-scene");
  const wall = scene?.querySelector<HTMLElement>(".wall");
  if (!scene || !wall) return () => undefined;
  const tiles = [...wall.querySelectorAll<HTMLElement>(".wall-tile")];
  const cols = Number(wall.dataset.cols) || 12;
  const rows = Math.ceil(tiles.length / cols);
  const shade = scene.querySelector<HTMLElement>(".wall-shade");
  const ask = scene.querySelector<HTMLElement>(".wall-ask");
  const phone = scene.querySelector<HTMLElement>(".phone-drop");
  const card = scene.querySelector<HTMLElement>(".call-card");
  const hints = [...scene.querySelectorAll<HTMLElement>(".wall-drag, .wall-top")];

  // Stable pseudo-random scatter per tile, so a refresh never reshuffles the wall.
  const rand = (i: number, k: number) => {
    const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const seeds = tiles.map((_, i) => ({
    dx: (rand(i, 1) - 0.5) * 1500,
    dy: (rand(i, 2) - 0.5) * 1100,
    rot: (rand(i, 3) - 0.5) * 70,
    scale: 0.35 + rand(i, 4) * 1.5,
    delay: rand(i, 5),
  }));

  const state = { mix: 0 };
  let step = 200;
  let ox = 0;
  let oy = 0;
  const measure = () => {
    step = Math.max(180, Math.round(window.innerWidth / 7));
    wall.style.setProperty("--tile", `${step - 18}px`);
    // Centre the grid gutters on the viewport.
    ox = ox || Math.round((window.innerWidth % step) / 2) - step + 9;
    oy = oy || Math.round((window.innerHeight % step) / 2) - step + 9;
  };
  const render = () => {
    const width = cols * step;
    const height = rows * step;
    const wrapX = gsap.utils.wrap(-step, width - step);
    const wrapY = gsap.utils.wrap(-step, height - step);
    tiles.forEach((tile, i) => {
      const seed = seeds[i];
      const local = gsap.utils.clamp(0, 1, state.mix * 1.7 - seed.delay * 0.7);
      const settle = 1 - Math.pow(1 - local, 3);
      const away = 1 - settle;
      const x = wrapX((i % cols) * step + ox) + seed.dx * away;
      const y = wrapY(Math.floor(i / cols) * step + oy) + seed.dy * away;
      const scale = 1 + (seed.scale - 1) * away;
      tile.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(seed.rot * away).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      tile.style.opacity = Math.min(1, local * 1.8).toFixed(3);
    });
  };

  wall.classList.add("is-live");
  scene.classList.add("is-live");
  measure();
  render();

  // The phone drops in real time, so the spring keeps its bounce however fast the page scrolls.
  let phoneDown = false;
  let sway: gsap.core.Tween | null = null;
  gsap.set(phone, { yPercent: -115, y: 0, rotation: 0 });
  const dropPhone = () => {
    if (!phone || phoneDown) return;
    phoneDown = true;
    gsap.killTweensOf(phone);
    gsap.fromTo(
      phone,
      { yPercent: -115, rotation: -7 },
      {
        yPercent: 0,
        rotation: 3,
        duration: 1.7,
        ease: "elastic.out(1, 0.38)",
        onComplete: () => {
          sway = gsap.to(phone, { rotation: -3, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
        },
      },
    );
  };
  const liftPhone = () => {
    if (!phone || !phoneDown) return;
    phoneDown = false;
    sway?.kill();
    gsap.killTweensOf(phone);
    gsap.to(phone, { yPercent: -115, rotation: 0, duration: 0.45, ease: "power2.in" });
  };

  gsap.set([shade, card, ...hints], { autoAlpha: 0 });
  gsap.set(card, { xPercent: -50, x: 0 });
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "+=170%",
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        measure();
        render();
      },
      onUpdate: (self) => {
        if (self.progress > 0.8) dropPhone();
        else if (self.progress < 0.72) liftPhone();
      },
    },
  });
  const askLines = ask ? [...ask.children] : [];
  // The question is already on screen when the scene pins, so the first frame is never empty.
  const askIn = gsap.fromTo(
    ask,
    { autoAlpha: 0, y: 60 },
    {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      immediateRender: true,
      scrollTrigger: { trigger: scene, start: "top 65%", end: "top 8%", scrub: 0.5 },
    },
  );
  tl.to(state, { mix: 1, duration: 0.62, onUpdate: render }, 0.02)
    // Fade the lines, not the container: the container belongs to askIn, and two tweens on one
    // element race when the page jumps straight to the end.
    .to(askLines, { autoAlpha: 0, y: -40, duration: 0.1 }, 0.44)
    .to(shade, { autoAlpha: 1, duration: 0.16 }, 0.6)
    .fromTo(card, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.16 }, 0.7)
    .to(hints, { autoAlpha: 1, duration: 0.1 }, 0.8)
    .to({}, { duration: 0.1 });

  // Dragging pans the whole wall. The grid wraps, so it never runs out.
  const proxy = document.createElement("div");
  let lastX = 0;
  let lastY = 0;
  const pan = function (this: Draggable) {
    ox += this.x - lastX;
    oy += this.y - lastY;
    lastX = this.x;
    lastY = this.y;
    render();
  };
  const drags = Draggable.create(proxy, {
    type: ScrollTrigger.isTouch === 1 ? "x" : "x,y",
    trigger: scene,
    inertia: true,
    dragClickables: false,
    minimumMovement: 3,
    cursor: "grab",
    activeCursor: "grabbing",
    onPress(this: Draggable) {
      lastX = this.x;
      lastY = this.y;
    },
    onDrag: pan,
    onThrowUpdate: pan,
  });
  const onResize = () => {
    measure();
    render();
  };
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    drags.forEach((drag) => drag.kill());
    sway?.kill();
    tl.scrollTrigger?.kill();
    tl.kill();
    askIn.scrollTrigger?.kill();
    askIn.kill();
    wall.classList.remove("is-live");
    scene.classList.remove("is-live");
    tiles.forEach((tile) => {
      tile.style.transform = "";
      tile.style.opacity = "";
    });
    gsap.set([shade, ask, ...askLines, phone, card, ...hints], { clearProps: "all" });
  };
}

export function startExperience() {
  const mm = gsap.matchMedia();

  mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
    document.documentElement.classList.add("is-smooth");
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.8,
      effects: true,
      smoothTouch: false,
    });
    fitHeroName();
    const stopGallery = setupGallery(true);
    const stopFlight = setupFlight();
    setupSkills();
    setupHeadingRise();
    setupPosters();
    setupShowcase();
    const stopAwards = setupAwards();
    const stopContact = setupContact();
    setupSpy();
    ScrollTrigger.refresh();
    const onResize = () => {
      fitHeroName();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    const lock = document.querySelector(".name-lock");
    const nameObserver = new ResizeObserver(() => fitHeroName());
    if (lock) nameObserver.observe(lock);
    return () => {
      nameObserver.disconnect();
      window.removeEventListener("resize", onResize);
      stopGallery?.();
      stopFlight?.();
      stopAwards?.();
      stopContact?.();
      smoother.kill();
      document.documentElement.classList.remove("is-smooth");
    };
  });

  mm.add("(max-width: 860px) and (prefers-reduced-motion: no-preference)", () => {
    fitHeroName();
    setupSkills();
    setupHeadingRise();
    setupPosters();
    setupSpy();
    const onResize = () => fitHeroName();
    window.addEventListener("resize", onResize);
    const lock = document.querySelector(".name-lock");
    const nameObserver = new ResizeObserver(() => fitHeroName());
    if (lock) nameObserver.observe(lock);
    return () => {
      nameObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.body.classList.add("docked");
    document.querySelector(".stats")?.classList.add("is-in");
    document.querySelectorAll(".poster").forEach((poster) => poster.classList.add("is-shown"));
    setupSpy();
  });
}
