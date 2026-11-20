import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { startFluid } from "./fluid";
import { startExperience } from "./motion";

gsap.registerPlugin(ScrollSmoother);

const reduce = document.documentElement.classList.contains("reduce");

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function pad(value: number, size = 4) {
  return String(Math.max(0, Math.round(value))).padStart(size, "0");
}

function startChrome() {
  const rulers = [...document.querySelectorAll<HTMLCanvasElement>("[data-ruler]")];
  const readoutX = document.querySelector<HTMLElement>("[data-x]");
  const readoutY = document.querySelector<HTMLElement>("[data-y]");
  const readoutP = document.querySelector<HTMLElement>("[data-p]");
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.4;
  let frame = 0;

  const draw = (canvas: HTMLCanvasElement) => {
    const axis = canvas.dataset.ruler;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(236,231,220,0.4)";
    ctx.fillStyle = "rgba(236,231,220,0.72)";
    ctx.font = "9px Satoshi, sans-serif";
    ctx.lineWidth = 1;
    const length = axis === "x" ? width : height;
    for (let i = 0; i <= length; i += 10) {
      const major = i % 100 === 0;
      const mid = i % 50 === 0;
      const tick = major ? 14 : mid ? 9 : 5;
      ctx.beginPath();
      if (axis === "x") {
        ctx.moveTo(i + 0.5, height);
        ctx.lineTo(i + 0.5, height - tick);
      } else {
        ctx.moveTo(width, i + 0.5);
        ctx.lineTo(width - tick, i + 0.5);
      }
      ctx.stroke();
      if (major && i > 0) {
        if (axis === "x") ctx.fillText(String(i), i + 4, 11);
        else ctx.fillText(String(i), 2, i - 2);
      }
    }
    ctx.fillStyle = "#ff321d";
    if (axis === "x") {
      const x = Math.max(6, Math.min(width - 6, pointerX));
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x - 5, height - 9);
      ctx.lineTo(x + 5, height - 9);
      ctx.fill();
    } else {
      const y = Math.max(0, Math.min(height, pointerY));
      ctx.fillRect(width - 14, y - 1, 14, 2);
    }
  };

  const paint = () => {
    frame = 0;
    rulers.forEach(draw);
    if (readoutX) readoutX.textContent = pad(pointerX);
    if (readoutY) readoutY.textContent = pad(pointerY);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(99, Math.round((window.scrollY / max) * 100)) : 0;
    if (readoutP) readoutP.textContent = pad(progress, 2);
  };
  const requestPaint = () => {
    if (frame) return;
    frame = requestAnimationFrame(paint);
  };

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    requestPaint();
  });
  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", requestPaint);
  paint();

  const nodes = [...document.querySelectorAll<HTMLElement>("[data-rotate]")];
  const words = (document.querySelector("[data-words]")?.textContent || "Signal")
    .split("|")
    .map((word) => word.trim())
    .filter(Boolean);
  let index = 0;
  if (!reduce && words.length > 1) {
    window.setInterval(() => {
      index = (index + 1) % words.length;
      nodes.forEach((node) => {
        node.textContent = words[index];
        node.classList.remove("is-flicker");
        void node.offsetWidth;
        node.classList.add("is-flicker");
      });
    }, 2400);
  }

  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      const live = document.querySelector("#copy-live");
      try {
        await navigator.clipboard.writeText(value);
        button.dataset.copied = "true";
        const label = button.querySelector("span:last-child");
        const previous = label?.textContent;
        if (label && previous && previous.length < 12) label.textContent = "Copied";
        if (live) live.textContent = "Email copied.";
        window.setTimeout(() => {
          button.dataset.copied = "false";
          if (label && previous) label.textContent = previous;
        }, 1600);
      } catch {
        window.location.href = `mailto:${value}`;
      }
    });
  });

  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const menu = document.querySelector<HTMLElement>(".mobile-menu");
  const setMenu = (open: boolean) => {
    menu?.classList.toggle("is-open", open);
    toggle?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
  };
  toggle?.addEventListener("click", () => setMenu(!menu?.classList.contains("is-open")));
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (event) => {
    const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href^='#']");
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    const smoother = ScrollSmoother.get();
    if (smoother && !reduce) smoother.scrollTo(target, true, "top 12px");
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  const videos = [...document.querySelectorAll<HTMLVideoElement>("video[data-lazy]")];
  if (videos.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting) {
            item.pause();
            return;
          }
          const source = item.querySelector("source");
          if (source?.dataset.src && !source.getAttribute("src")) {
            source.src = source.dataset.src;
            item.load();
          }
          if (!reduce) item.play().catch(() => undefined);
        });
      },
      { rootMargin: "240px" },
    );
    videos.forEach((item) => observer.observe(item));
  }
}

async function waitForAssets() {
  const video = document.querySelector<HTMLVideoElement>("#ink-video");
  const videoReady = new Promise((resolve) => {
    if (!video || video.readyState >= 2) {
      resolve(true);
      return;
    }
    const done = () => resolve(true);
    video.addEventListener("loadeddata", done, { once: true });
    video.addEventListener("error", done, { once: true });
    window.setTimeout(done, 4000);
  });
  await Promise.race([Promise.all([document.fonts.ready, videoReady]), sleep(4500)]);
}

async function runPreloader() {
  const shell = document.querySelector<HTMLElement>("[data-preloader]");
  const num = document.querySelector<HTMLElement>("[data-count]");
  if (!shell || !num) return;
  const state = { n: 0 };
  const tween = gsap.to(state, {
    n: 100,
    duration: reduce ? 0.2 : 1.5,
    ease: "power1.inOut",
    onUpdate: () => {
      num.textContent = String(Math.round(state.n)).padStart(3, "0");
    },
  });
  await Promise.all([waitForAssets(), tween]);
  num.textContent = "100";
  shell.classList.add("is-done");
  window.setTimeout(() => shell.setAttribute("hidden", ""), 900);
}

startChrome();
runPreloader().then(() => {
  if (!reduce) startFluid();
  startExperience();
});
