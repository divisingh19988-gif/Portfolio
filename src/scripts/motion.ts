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
          end: "top 42%",
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
  gsap.set([".hero-kicker", ".hero-role", ".tagline", ".hero-foot"], { y: 22, opacity: 0 });
  gsap.set(".ink-bg", { opacity: 0 });
}

export function playHeroEntrance() {
  if (document.body.dataset.page !== "home") return;
  const video = document.querySelector<HTMLElement>(".ink-bg");
  const bits = [".hero-kicker", ".hero-role", ".tagline", ".hero-foot"];
  if (reduce()) {
    document.body.classList.add("is-in");
    if (video) gsap.set(video, { opacity: 0.42 });
    gsap.set([".name-mask > span", ".topbar", ".fly-portrait", ...bits], { clearProps: "all" });
    return;
  }
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => document.body.classList.add("is-in"),
  });
  tl.to(video, { opacity: 0.42, duration: 1.05, ease: "power2.out" }, 0);
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
  let offset = 36;
  let suppress = false;
  const spacing = 214;

  const layout = () => {
    const width = stage.clientWidth;
    const loop = cards.length * spacing;
    const phase = ((offset % loop) + loop) % loop;
    cards.forEach((card, index) => {
      let x = index * spacing - phase;
      if (x < -spacing * 1.15) x += loop;
      const mid = x + 120;
      const nx = Math.max(-1.35, Math.min(1.35, (mid - width * 0.46) / (width * 0.5)));
      const y = 36 + nx * nx * 64;
      const rot = nx * 12;
      const scale = 1 - Math.min(Math.abs(nx), 1.2) * 0.08;
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
      card.style.zIndex = String(100 - Math.round(Math.abs(nx) * 40));
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
    setupHeadingRise();
    setupPosters();
    setupSpy();
    const onResize = () => fitHeroName();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.body.classList.add("docked");
    document.querySelector(".stats")?.classList.add("is-in");
    document.querySelectorAll(".poster").forEach((poster) => poster.classList.add("is-shown"));
    setupSpy();
  });
}
