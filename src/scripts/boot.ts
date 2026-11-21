import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { startFluid } from "./fluid";
import { playHeroEntrance, primeHero, startExperience } from "./motion";

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
  const readoutR = document.querySelector<HTMLElement>("[data-r]");
  const readoutS = document.querySelector<HTMLElement>("[data-s]");
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
    if (readoutR) readoutR.textContent = pad(Number(document.documentElement.dataset.reveal || 0));
    if (readoutS) readoutS.textContent = pad(window.scrollY);
    const posters = document.querySelectorAll(".poster");
    let posterOpen = false;
    posters.forEach((el) => {
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.72 && box.bottom > window.innerHeight * 0.22) posterOpen = true;
    });
    document.body.classList.toggle("poster-open", posterOpen);
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
  window.setInterval(requestPaint, 200);

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

  const tagline = document.querySelector<HTMLElement>("[data-tagline]");
  const phrases = (tagline?.dataset.phrases || "").split("|").map((line) => line.trim()).filter(Boolean);
  if (!reduce && tagline && phrases.length > 1 && tagline.dataset.bound !== "1") {
    tagline.dataset.bound = "1";
    let phrase = 0;
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const holdMs = 2800;
    const stepMs = 28;
    const steps = 18;
    const settle = (text: string) => {
      tagline.textContent = text;
      tagline.dataset.settled = "1";
    };
    const scramble = () => {
      phrase = (phrase + 1) % phrases.length;
      const next = phrases[phrase];
      tagline.dataset.settled = "0";
      let frame = 0;
      const timer = window.setInterval(() => {
        frame += 1;
        const cut = Math.floor((frame / steps) * next.length);
        let shown = next.slice(0, cut);
        for (let i = cut; i < next.length; i += 1) {
          shown += next[i] === " " ? " " : alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        if (frame >= steps) {
          window.clearInterval(timer);
          settle(next);
          window.setTimeout(scramble, holdMs);
        } else {
          tagline.textContent = shown;
        }
      }, stepMs);
    };
    settle(phrases[0]);
    window.setTimeout(scramble, holdMs);
  }

  const sound = document.querySelector<HTMLButtonElement>(".sound-toggle");
  if (sound) {
    let audio: AudioContext | null = null;
    let master: GainNode | null = null;
    let playing = false;
    sound.addEventListener("click", async () => {
      if (!audio) {
        const Context = window.AudioContext;
        audio = new Context();
        const low = audio.createOscillator();
        const high = audio.createOscillator();
        low.type = "sine";
        high.type = "triangle";
        low.frequency.value = 55;
        high.frequency.value = 82.4;
        const filter = audio.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 220;
        master = audio.createGain();
        master.gain.value = 0;
        low.connect(filter);
        high.connect(filter);
        filter.connect(master);
        master.connect(audio.destination);
        low.start();
        high.start();
      }
      if (audio.state === "suspended") await audio.resume();
      playing = !playing;
      master?.gain.linearRampToValueAtTime(playing ? 0.028 : 0, audio.currentTime + 0.35);
      sound.setAttribute("aria-pressed", playing ? "true" : "false");
      sound.textContent = playing ? "Sound on" : "Sound";
      sound.setAttribute("aria-label", playing ? "Sound is on. Turn it off." : "Sound is off. Turn on a quiet drone.");
    });
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

let videoArmed = false;

function armHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>("#ink-video");
  if (!video) return;
  if (!videoArmed) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.loop = false;
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play().catch(() => undefined);
    });
    videoArmed = true;
  }
  if (!video.paused && video.readyState >= 2) return;
  const gesture = () => {
    video.play().catch(() => undefined);
  };
  const pending = video.play();
  if (!pending) return;
  pending.catch(() => {
    window.addEventListener("pointerdown", gesture, { once: true });
    window.addEventListener("keydown", gesture, { once: true });
  });
}

function scrambleName(shell: HTMLElement) {
  const node = shell.querySelector<HTMLElement>("[data-pre-name]");
  if (!node || reduce) return;
  const finalName = "DIGVIJAY RATHORE";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let frame = 0;
  const steps = 12;
  const timer = window.setInterval(() => {
    frame += 1;
    const cut = Math.floor((frame / steps) * finalName.length);
    let shown = finalName.slice(0, cut);
    for (let i = cut; i < finalName.length; i += 1) {
      shown += finalName[i] === " " ? " " : alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    node.textContent = frame >= steps ? finalName : shown;
    if (frame >= steps) window.clearInterval(timer);
  }, 40);
}

function flipPolaroids(shell: HTMLElement) {
  const frames = [...shell.querySelectorAll<HTMLImageElement>("[data-pre-stack] img")];
  if (frames.length < 2 || reduce) return () => undefined;
  frames.forEach((frame, index) => {
    frame.style.opacity = index < 3 ? "1" : "0";
  });
  let cursor = 0;
  const timer = window.setInterval(() => {
    cursor = (cursor + 1) % frames.length;
    frames.forEach((frame, index) => {
      const slot = (index - cursor + frames.length) % frames.length;
      const front = slot === 0;
      frame.style.opacity = slot < 3 ? "1" : "0";
      frame.style.zIndex = front ? "4" : String(3 - slot);
      frame.style.transform = `rotate(${front ? -2 : slot === 1 ? 6 : -8}deg) translate(${slot * 3}px, ${slot * 4}px)`;
    });
  }, 90);
  return () => window.clearInterval(timer);
}

async function runPreloader() {
  const shell = document.querySelector<HTMLElement>("[data-preloader]");
  const num = document.querySelector<HTMLElement>("[data-count]");
  const bar = document.querySelector<HTMLElement>("[data-pre-bar]");
  armHeroVideo();
  if (!shell || !num) return;
  const stopFlip = flipPolaroids(shell);
  scrambleName(shell);
  const images = [...shell.querySelectorAll("img")];
  let loaded = 0;
  const total = images.length + 2;
  const bump = () => {
    loaded += 1;
  };
  images.forEach((img) => {
    if (img.complete) bump();
    else {
      img.addEventListener("load", bump, { once: true });
      img.addEventListener("error", bump, { once: true });
    }
  });
  document.fonts.ready.then(bump).catch(bump);
  const video = document.querySelector<HTMLVideoElement>("#ink-video");
  let videoReady = !video || video.readyState >= 3;
  if (video && !videoReady) {
    const mark = () => {
      videoReady = true;
      bump();
    };
    video.addEventListener("canplay", mark, { once: true });
    video.addEventListener("error", mark, { once: true });
  } else bump();

  const started = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - started;
      const limit = reduce ? 200 : videoReady ? 1600 : 2500;
      const asset = loaded / total;
      const shown = Math.min(1, asset >= 1 ? Math.max(elapsed / limit, elapsed / 1100) : elapsed / limit);
      num.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (bar) bar.style.left = `${shown * 100}%`;
      if (shown >= 1) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
  stopFlip();
  if (reduce) {
    shell.remove();
    return;
  }
  await gsap.to(shell, {
    clipPath: "inset(0 0 100% 0)",
    opacity: 0,
    duration: 0.42,
    ease: "power2.inOut",
  });
  shell.remove();
}

primeHero();
function startLabelCycle() {
  const node = document.querySelector<HTMLElement>("[data-cycle]");
  if (!node || reduce) return;
  const words = (node.dataset.cycle || "").split("|").map((word) => word.trim()).filter(Boolean);
  if (words.length < 2) return;
  let index = 0;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const swap = () => {
    index = (index + 1) % words.length;
    const next = words[index].toUpperCase();
    let frame = 0;
    const steps = 8;
    const timer = window.setInterval(() => {
      frame += 1;
      const cut = Math.floor((frame / steps) * next.length);
      let shown = next.slice(0, cut);
      for (let i = cut; i < next.length; i += 1) {
        shown += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      node.textContent = frame >= steps ? next : shown;
      if (frame >= steps) window.clearInterval(timer);
    }, 28);
  };
  window.setInterval(swap, 2500);
}

function startGlitch() {
  if (reduce) return;
  const nameBits = [...document.querySelectorAll<HTMLElement>(".fly-name .first, .fly-name .last")];
  const extras = [...document.querySelectorAll<HTMLElement>(".top-nav a, .brand-lock, .hero-role")];
  const pool = [...nameBits, ...extras];
  if (!pool.length) return;
  pool.forEach((node) => {
    node.dataset.text = node.textContent || "";
  });
  const glyphs = "█▓▒#@%$?";
  const burst = () => {
    const preferName = Math.random() < 0.72;
    const group = preferName && nameBits.length ? nameBits : pool;
    const target = group[Math.floor(Math.random() * group.length)];
    const original = target.dataset.text || target.textContent || "";
    if (Math.random() < 0.6 && original.length > 2) {
      const chars = original.split("");
      const swaps = 1 + Math.floor(Math.random() * 2);
      for (let n = 0; n < swaps; n += 1) {
        const at = Math.floor(Math.random() * chars.length);
        if (chars[at] !== " ") chars[at] = glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      target.textContent = chars.join("");
    }
    target.classList.add("is-glitch");
    const ms = 80 + Math.random() * 120;
    window.setTimeout(() => {
      target.classList.remove("is-glitch");
      if (target.dataset.text) target.textContent = target.dataset.text;
    }, ms);
    window.setTimeout(burst, 2500 + Math.random() * 3500);
  };
  window.setTimeout(burst, 1800 + Math.random() * 1200);
}

startChrome();
startLabelCycle();
startGlitch();
runPreloader().then(async () => {
  playHeroEntrance();
  armHeroVideo();
  if (!reduce && document.body.dataset.page === "home") startFluid();
  startExperience();
});
