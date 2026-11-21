/**
 * Hero reveal: a feathered circle punched through the dark cover.
 * The Berlin loop plays underneath at full colour. The circle idles small,
 * grows with pointer speed, and eases back. A short lerp keeps a light trail.
 */

type Circle = { x: number; y: number; r: number; alpha: number };

export function startFluid() {
  const canvas = document.querySelector<HTMLCanvasElement>("#ink");
  const video = document.querySelector<HTMLVideoElement>("#ink-video");
  if (!canvas || !video || document.body.dataset.page !== "home") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const reduce = document.documentElement.classList.contains("reduce");
  let viewW = 0;
  let viewH = 0;
  let dpr = 1;
  let pointerX = window.innerWidth * 0.6;
  let pointerY = window.innerHeight * 0.45;
  let x = pointerX;
  let y = pointerY;
  let radius = 0;
  let seen = false;
  let lastMove = 0;
  let prevPointerX = pointerX;
  let prevPointerY = pointerY;
  let drift = 0;
  const ghosts: { x: number; y: number }[] = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = Math.max(1, Math.floor(window.innerWidth * dpr));
    viewH = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.width = viewW;
    canvas.height = viewH;
  };
  resize();
  window.addEventListener("resize", resize);

  const idleRadius = () => (window.innerWidth * 0.075) / 2;
  const maxRadius = () => (window.innerWidth * 0.3) / 2;

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!seen) {
        x = pointerX;
        y = pointerY;
        seen = true;
      }
      lastMove = performance.now();
    },
    { passive: true },
  );

  let last = performance.now();
  let speed = 0;

  const paint = (now: number) => {
    const elapsed = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    if (coarse) {
      drift += elapsed * 0.35;
      pointerX = cssW * (0.55 + Math.cos(drift) * 0.16);
      pointerY = cssH * (0.42 + Math.sin(drift * 0.8) * 0.1);
    }
    const follow = 1 - Math.exp(-elapsed / 0.09);
    x += (pointerX - x) * follow;
    y += (pointerY - y) * follow;
    ghosts.push({ x, y });
    if (ghosts.length > 5) ghosts.shift();

    const moving = now - lastMove < 80 && seen && !coarse;
    const instant = Math.hypot(pointerX - prevPointerX, pointerY - prevPointerY) / elapsed;
    prevPointerX = pointerX;
    prevPointerY = pointerY;
    speed += (instant - speed) * (1 - Math.exp(-elapsed / 0.12));
    const drive = moving ? Math.min(1, speed / 1400) : 0;
    const breath = 1 + (reduce ? 0 : 0.05 * Math.sin(now / 900));
    const idle = idleRadius() * (moving ? 1 : breath);
    const target = idle + (maxRadius() - idleRadius()) * drive;
    const tau = target < radius ? 0.24 : 0.12;
    radius += (target - radius) * (1 - Math.exp(-elapsed / tau));

    document.documentElement.dataset.reveal = String(Math.round(radius));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#17171a";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.globalCompositeOperation = "destination-out";
    const marks: Circle[] = ghosts.map((ghost, index) => {
      const t = (index + 1) / ghosts.length;
      return { x: ghost.x, y: ghost.y, r: radius * (0.72 + t * 0.28), alpha: t * t * 0.45 };
    });
    marks.push({ x, y, r: radius, alpha: 1 });
    for (const mark of marks) {
      const soft = mark.r * 1.35;
      const grad = ctx.createRadialGradient(mark.x, mark.y, soft * 0.28, mark.x, mark.y, soft);
      grad.addColorStop(0, `rgba(0,0,0,${mark.alpha})`);
      grad.addColorStop(0.62, `rgba(0,0,0,${mark.alpha * 0.72})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mark.x, mark.y, soft, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(paint);
  };

  document.documentElement.classList.add("ink-circle");
  paint(performance.now());
}
