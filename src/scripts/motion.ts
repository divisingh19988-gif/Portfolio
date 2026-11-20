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

function fitHeroName() {
  const name = document.querySelector<HTMLElement>(".fly-name");
  const row = document.querySelector<HTMLElement>(".hero-name-row");
  const portrait = document.querySelector<HTMLElement>(".portrait-home");
  if (!name || !row || name.classList.contains("is-docked")) return;
  name.style.fontSize = "";
  const styles = getComputedStyle(name);
  let size = parseFloat(styles.fontSize);
  const stacked = getComputedStyle(row).flexDirection === "column";
  const gap = 18;
  const available = row.clientWidth - (stacked ? 8 : (portrait?.offsetWidth || 0) + gap);
  name.style.whiteSpace = "nowrap";
  while (name.scrollWidth > available && size > 42) {
    size -= 2;
    name.style.fontSize = `${size}px`;
  }
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

function setupSkills() {
  if (reduce()) {
    document.querySelector(".stats")?.classList.add("is-in");
    return;
  }
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((line) => {
    const split = SplitText.create(line, { type: "chars", charsClass: "char", aria: "auto" });
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
  ScrollTrigger.create({
    trigger: ".stats",
    start: "top 82%",
    onEnter: () => document.querySelector(".stats")?.classList.add("is-in"),
  });
  gsap.from(".giant", {
    y: 70,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".giant", start: "top 85%" },
  });
}

function setupGallery(auto: boolean) {
  const stage = document.querySelector<HTMLElement>(".curve");
  if (!stage) return () => undefined;
  const cards = [...stage.querySelectorAll<HTMLElement>(".gcard")];
  if (!cards.length) return () => undefined;
  let offset = 0;
  let suppress = false;
  const spacing = 340;

  const layout = () => {
    const width = stage.clientWidth;
    const loop = cards.length * spacing;
    cards.forEach((card, index) => {
      let x = ((index * spacing - offset) % loop + loop) % loop - spacing * 0.35;
      const center = width * 0.46;
      const nx = (x - center) / (width * 0.62);
      const y = 24 + nx * nx * 130;
      const rot = nx * 18;
      const scale = 1 - Math.min(Math.abs(nx), 1.15) * 0.1;
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
      card.style.zIndex = String(100 - Math.round(Math.abs(nx) * 30));
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
    onRelease: () => {
      window.setTimeout(() => {
        suppress = false;
      }, 50);
    },
  });

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
  if (auto) gsap.ticker.add(tick);
  else layout();

  return () => {
    observer.kill();
    stage.removeEventListener("click", onClick, true);
    if (auto) gsap.ticker.remove(tick);
    cards.forEach((card) => {
      card.style.transform = "";
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
  const panels = track.querySelectorAll(".panel").length;
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
      onUpdate: (self) => {
        if (!counter) return;
        const index = Math.min(panels - 1, Math.round(self.progress * (panels - 1)));
        counter.textContent = String(index + 1).padStart(2, "0");
      },
    },
  });
}

function setupAwards() {
  const orbit = document.querySelector<HTMLElement>(".orbit");
  if (!orbit) return () => undefined;
  const cards = [...orbit.querySelectorAll<HTMLElement>(".cert")];
  const proxy = document.createElement("div");
  let hold = false;
  let auto = 0;
  const [instance] = Draggable.create(proxy, {
    trigger: orbit,
    type: "x",
    inertia: true,
    onPress() {
      hold = true;
    },
    onThrowComplete() {
      hold = false;
    },
  });
  const layout = () => {
    const angle = auto + (instance?.x || 0) * 0.28;
    const rx = Math.min(340, orbit.clientWidth * 0.34);
    const ry = Math.min(120, orbit.clientHeight * 0.18);
    cards.forEach((card, index) => {
      const theta = angle * 0.01 + (index / cards.length) * Math.PI * 2;
      const depth = Math.sin(theta);
      const x = Math.cos(theta) * rx;
      const y = depth * ry;
      card.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${Math.cos(theta) * 14}deg) scale(${0.86 + (depth + 1) * 0.08})`;
      card.style.zIndex = String(10 + Math.round((depth + 1) * 20));
      card.style.opacity = String(0.45 + (depth + 1) * 0.28);
    });
  };
  const tick = () => {
    if (!hold) auto += 0.35;
    layout();
  };
  gsap.ticker.add(tick);
  return () => {
    instance?.kill();
    gsap.ticker.remove(tick);
    cards.forEach((card) => {
      card.style.transform = "";
      card.style.opacity = "";
    });
  };
}

function setupContact() {
  const stage = document.querySelector(".contact-stage");
  if (!stage) return () => undefined;
  const drags = Draggable.create(".tile", {
    bounds: stage,
    inertia: true,
    edgeResistance: 0.72,
    dragClickables: true,
    minimumMovement: 4,
  });
  return () => {
    drags.forEach((drag) => drag.kill());
  };
}

export function startExperience() {
  const mm = gsap.matchMedia();

  mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
    document.documentElement.classList.add("is-smooth");
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.15,
      effects: true,
      smoothTouch: false,
    });
    fitHeroName();
    const stopGallery = setupGallery(true);
    const stopFlight = setupFlight();
    setupSkills();
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
    return () => {
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
    setupSpy();
    const onResize = () => fitHeroName();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.body.classList.add("docked");
    document.querySelector(".stats")?.classList.add("is-in");
    setupSpy();
  });
}
