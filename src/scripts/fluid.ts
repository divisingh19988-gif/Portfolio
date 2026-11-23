/**
 * Hero reveal: ink spilled over a dark cover.
 *
 * A small fluid simulation runs on the GPU. Pointer movement and timed drops
 * add ink. Where ink sits, the cover thins and the Berlin loop shows through,
 * then the ink fades and the cover closes again.
 *
 * If the browser cannot render to float textures, a plain feathered circle
 * takes over. A separate low resolution canvas scatters film dust on top.
 */

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Pair = { read: Target; write: Target };
type Splat = { x: number; y: number; dx: number; dy: number; size: number; ink: number };
type Program = { handle: WebGLProgram; at: Record<string, WebGLUniformLocation | null> };

const COVER: [number, number, number] = [0x17 / 255, 0x17 / 255, 0x1a / 255];
const RIM: [number, number, number] = [1, 0x32 / 255, 0x1d / 255];

const POINTER_INK = 0.24;
const DROP_INK = 0.55;
const INK_KEEP = 0.967;
const FLOW_KEEP = 0.9;

const PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
`;

const SMOOTH = `
vec4 smooth4(sampler2D tex, vec2 uv, vec2 cell) {
  vec2 st = uv / cell - 0.5;
  vec2 base = floor(st);
  vec2 f = st - base;
  vec2 c = (base + 0.5) * cell;
  vec4 a = texture2D(tex, c);
  vec4 b = texture2D(tex, c + vec2(cell.x, 0.0));
  vec4 d = texture2D(tex, c + vec2(0.0, cell.y));
  vec4 e = texture2D(tex, c + cell);
  return mix(mix(a, b, f.x), mix(d, e, f.x), f.y);
}
`;

const VERT = `
precision highp float;
attribute vec2 aPos;
uniform vec2 uTexel;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_SPLAT = `${PRECISION}
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uAdd;
uniform float uSize;
uniform float uAspect;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float fall = exp2(-dot(p, p) / uSize);
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + fall * uAdd, 1.0);
}
`;

const FRAG_ADVECT = `${PRECISION}${SMOOTH}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uCell;
uniform vec2 uSourceCell;
uniform float uDt;
uniform float uKeep;
void main() {
  vec2 from = vUv - uDt * smooth4(uVelocity, vUv, uCell).xy * uCell;
  gl_FragColor = uKeep * smooth4(uSource, from, uSourceCell);
}
`;

const FRAG_DIVERGENCE = `${PRECISION}
uniform sampler2D uVelocity;
void main() {
  float l = texture2D(uVelocity, vL).x;
  float r = texture2D(uVelocity, vR).x;
  float t = texture2D(uVelocity, vT).y;
  float b = texture2D(uVelocity, vB).y;
  vec2 c = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) l = -c.x;
  if (vR.x > 1.0) r = -c.x;
  if (vT.y > 1.0) t = -c.y;
  if (vB.y < 0.0) b = -c.y;
  gl_FragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}
`;

const FRAG_PRESSURE = `${PRECISION}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float l = texture2D(uPressure, vL).x;
  float r = texture2D(uPressure, vR).x;
  float t = texture2D(uPressure, vT).x;
  float b = texture2D(uPressure, vB).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((l + r + t + b - div) * 0.25, 0.0, 0.0, 1.0);
}
`;

const FRAG_PROJECT = `${PRECISION}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float l = texture2D(uPressure, vL).x;
  float r = texture2D(uPressure, vR).x;
  float t = texture2D(uPressure, vT).x;
  float b = texture2D(uPressure, vB).x;
  vec2 v = texture2D(uVelocity, vUv).xy - vec2(r - l, t - b);
  gl_FragColor = vec4(v, 0.0, 1.0);
}
`;

const FRAG_DISPLAY = `${PRECISION}${SMOOTH}
uniform sampler2D uInk;
uniform vec2 uInkCell;
uniform vec3 uCover;
uniform vec3 uRim;
void main() {
  float d = max(smooth4(uInk, vUv, uInkCell).x, 0.0);
  float open = clamp(pow(d, 0.4), 0.0, 1.0);
  float cover = 1.0 - open;
  float edge = cover * open * 4.0;
  vec3 tone = mix(uCover, uRim, edge * 0.3);
  gl_FragColor = vec4(tone * cover, cover);
}
`;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function startFluid() {
  const canvas = document.querySelector<HTMLCanvasElement>("#ink");
  const video = document.querySelector<HTMLVideoElement>("#ink-video");
  if (!canvas || !video || document.body.dataset.page !== "home") return;

  if (startInk(canvas)) {
    document.documentElement.classList.add("ink-live");
  } else {
    // A canvas that was asked for WebGL cannot hand out a 2D context later.
    const fresh = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(fresh);
    startCircle(fresh);
  }
  startDust();
}

function startInk(canvas: HTMLCanvasElement): boolean {
  const attrs: WebGLContextAttributes = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  };
  let gl: GL | null = null;
  let second = false;
  try {
    gl = canvas.getContext("webgl2", attrs);
    second = Boolean(gl);
    if (!gl) gl = canvas.getContext("webgl", attrs);
  } catch {
    gl = null;
  }
  if (!gl) return false;
  const g: GL = gl;

  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const SIM = small ? 64 : 128;
  const INK = small ? 384 : 512;
  const SOLVES = small ? 5 : 8;

  // Pick a float format the GPU can render into.
  const formats: { internal: number; type: number }[] = [];
  if (second) {
    const g2 = g as WebGL2RenderingContext;
    if (g2.getExtension("EXT_color_buffer_float") || g2.getExtension("EXT_color_buffer_half_float")) {
      formats.push({ internal: g2.RGBA16F, type: g2.HALF_FLOAT });
    }
  } else {
    const half = g.getExtension("OES_texture_half_float");
    g.getExtension("EXT_color_buffer_half_float");
    if (half) formats.push({ internal: g.RGBA, type: half.HALF_FLOAT_OES });
    if (g.getExtension("OES_texture_float")) {
      g.getExtension("WEBGL_color_buffer_float");
      formats.push({ internal: g.RGBA, type: g.FLOAT });
    }
  }

  const makeTarget = (w: number, h: number, format: { internal: number; type: number }): Target | null => {
    const tex = g.createTexture();
    const fbo = g.createFramebuffer();
    if (!tex || !fbo) return null;
    g.bindTexture(g.TEXTURE_2D, tex);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, format.internal, w, h, 0, g.RGBA, format.type, null);
    g.bindFramebuffer(g.FRAMEBUFFER, fbo);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
    if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) {
      g.deleteTexture(tex);
      g.deleteFramebuffer(fbo);
      return null;
    }
    g.viewport(0, 0, w, h);
    g.clearColor(0, 0, 0, 1);
    g.clear(g.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  };

  const dropTarget = (target: Target | null) => {
    if (!target) return;
    g.deleteTexture(target.tex);
    g.deleteFramebuffer(target.fbo);
  };

  let format: { internal: number; type: number } | null = null;
  for (const candidate of formats) {
    const probe = makeTarget(4, 4, candidate);
    if (probe) {
      dropTarget(probe);
      format = candidate;
      break;
    }
  }
  if (!format) return false;
  const chosen = format;

  const compile = (kind: number, source: string) => {
    const shader = g.createShader(kind);
    if (!shader) return null;
    g.shaderSource(shader, source);
    g.compileShader(shader);
    if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) {
      g.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const link = (fragSource: string): Program | null => {
    const vert = compile(g.VERTEX_SHADER, VERT);
    const frag = compile(g.FRAGMENT_SHADER, fragSource);
    const handle = g.createProgram();
    if (!vert || !frag || !handle) return null;
    g.attachShader(handle, vert);
    g.attachShader(handle, frag);
    g.bindAttribLocation(handle, 0, "aPos");
    g.linkProgram(handle);
    if (!g.getProgramParameter(handle, g.LINK_STATUS)) return null;
    const at: Record<string, WebGLUniformLocation | null> = {};
    const count = g.getProgramParameter(handle, g.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = g.getActiveUniform(handle, i);
      if (info) at[info.name] = g.getUniformLocation(handle, info.name);
    }
    return { handle, at };
  };

  let splatProg: Program | null = null;
  let advectProg: Program | null = null;
  let divergenceProg: Program | null = null;
  let pressureProg: Program | null = null;
  let projectProg: Program | null = null;
  let displayProg: Program | null = null;
  let flow: Pair | null = null;
  let ink: Pair | null = null;
  let pressure: Pair | null = null;
  let divergence: Target | null = null;

  const gridSize = (base: number) => {
    const aspect = canvas.width / Math.max(1, canvas.height);
    const long = Math.round(base * Math.max(aspect, 1 / aspect));
    return aspect >= 1 ? { w: long, h: base } : { w: base, h: long };
  };

  const makePair = (w: number, h: number): Pair | null => {
    const read = makeTarget(w, h, chosen);
    const write = makeTarget(w, h, chosen);
    if (!read || !write) return null;
    return { read, write };
  };

  const swap = (pair: Pair) => {
    const held = pair.read;
    pair.read = pair.write;
    pair.write = held;
  };

  const fitCanvas = () => {
    const w = Math.max(1, Math.round((canvas.clientWidth || window.innerWidth) * 0.75));
    const h = Math.max(1, Math.round((canvas.clientHeight || window.innerHeight) * 0.75));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
  };

  const buildTargets = (): boolean => {
    const sim = gridSize(SIM);
    const dye = gridSize(INK);
    if (flow && ink && flow.read.w === sim.w && flow.read.h === sim.h && ink.read.w === dye.w && ink.read.h === dye.h) {
      return true;
    }
    for (const pair of [flow, ink, pressure]) {
      if (pair) {
        dropTarget(pair.read);
        dropTarget(pair.write);
      }
    }
    dropTarget(divergence);
    flow = makePair(sim.w, sim.h);
    ink = makePair(dye.w, dye.h);
    pressure = makePair(sim.w, sim.h);
    divergence = makeTarget(sim.w, sim.h, chosen);
    return Boolean(flow && ink && pressure && divergence);
  };

  const setup = (): boolean => {
    splatProg = link(FRAG_SPLAT);
    advectProg = link(FRAG_ADVECT);
    divergenceProg = link(FRAG_DIVERGENCE);
    pressureProg = link(FRAG_PRESSURE);
    projectProg = link(FRAG_PROJECT);
    displayProg = link(FRAG_DISPLAY);
    if (!splatProg || !advectProg || !divergenceProg || !pressureProg || !projectProg || !displayProg) return false;
    const quad = g.createBuffer();
    if (!quad) return false;
    g.bindBuffer(g.ARRAY_BUFFER, quad);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    g.enableVertexAttribArray(0);
    g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
    g.disable(g.BLEND);
    g.disable(g.DEPTH_TEST);
    flow = null;
    ink = null;
    pressure = null;
    divergence = null;
    fitCanvas();
    return buildTargets();
  };

  if (!setup()) return false;

  const draw = (target: Target | null) => {
    if (target) {
      g.bindFramebuffer(g.FRAMEBUFFER, target.fbo);
      g.viewport(0, 0, target.w, target.h);
    } else {
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      g.viewport(0, 0, canvas.width, canvas.height);
    }
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  };

  const bind = (unit: number, target: Target) => {
    g.activeTexture(g.TEXTURE0 + unit);
    g.bindTexture(g.TEXTURE_2D, target.tex);
    return unit;
  };

  const viewW = () => canvas.clientWidth || window.innerWidth;
  const viewH = () => canvas.clientHeight || window.innerHeight;
  const baseSize = () => 1.6 / viewH();

  const queue: Splat[] = [];

  const stamp = (splat: Splat) => {
    if (!splatProg || !flow || !ink) return;
    const p = splatProg;
    g.useProgram(p.handle);
    g.uniform2f(p.at.uPoint, splat.x / viewW(), 1 - splat.y / viewH());
    g.uniform1f(p.at.uSize, splat.size);
    g.uniform1f(p.at.uAspect, viewW() / viewH());

    g.uniform2f(p.at.uTexel, 1 / flow.read.w, 1 / flow.read.h);
    g.uniform1i(p.at.uTarget, bind(0, flow.read));
    g.uniform3f(p.at.uAdd, splat.dx, -splat.dy, 0);
    draw(flow.write);
    swap(flow);

    g.uniform2f(p.at.uTexel, 1 / ink.read.w, 1 / ink.read.h);
    g.uniform1i(p.at.uTarget, bind(0, ink.read));
    g.uniform3f(p.at.uAdd, splat.ink, splat.ink, splat.ink);
    draw(ink.write);
    swap(ink);
  };

  // A drop lands as one blot plus eight smaller blots flung outwards.
  const spill = (x: number, y: number) => {
    // On a tall narrow screen a blot sized by height would flood the width, so shrink it.
    const narrow = Math.min(1, viewW() / viewH());
    const size = baseSize() * rand(1.8, 5.8) * narrow;
    const reach = Math.sqrt(size) * viewH() * 0.9;
    const force = rand(84, 204);
    const start = Math.random() * Math.PI * 2;
    queue.push({ x, y, dx: 0, dy: 0, size, ink: DROP_INK });
    for (let i = 0; i < 8; i++) {
      const angle = start + (i / 8) * Math.PI * 2 + rand(-0.16, 0.16);
      const far = reach * rand(0.82, 1.12);
      queue.push({
        x: x + Math.cos(angle) * far,
        y: y + Math.sin(angle) * far,
        dx: Math.cos(angle) * force,
        dy: Math.sin(angle) * force,
        size: size * 0.45,
        ink: DROP_INK,
      });
    }
  };

  let pointerX = viewW() * 0.65;
  let pointerY = viewH() * 0.5;
  let stampedX = pointerX;
  let stampedY = pointerY;
  let pushX = 0;
  let pushY = 0;
  let moved = false;
  let level = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      const gain = coarse ? 3 : 5;
      pushX = (event.clientX - pointerX) * gain;
      pushY = (event.clientY - pointerY) * gain;
      pointerX = event.clientX;
      pointerY = event.clientY;
      moved = true;
    },
    { passive: true },
  );

  window.addEventListener(
    "pointerdown",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      stampedX = pointerX;
      stampedY = pointerY;
      if (retired()) return;
      if (event.pointerType === "touch") spill(pointerX, pointerY);
      else {
        pushX = 10;
        pushY = 10;
        moved = true;
      }
    },
    { passive: true },
  );

  const inHero = () => window.scrollY < window.innerHeight * 1.2;

  // The ink belongs to the opening screens. Once the works block arrives it
  // stops taking new ink and what is left fades, so later sections stay clean.
  const worksBlock = document.getElementById("works");
  const retired = () =>
    worksBlock
      ? worksBlock.getBoundingClientRect().top < viewH() * 0.35
      : window.scrollY > viewH() * 2.4;
  let retiredSince = 0;

  const scheduleDrop = (delay: number) => {
    window.setTimeout(() => {
      if (!document.hidden && alive && visible && !retired()) {
        spill(viewW() * rand(0.1, 0.9), viewH() * rand(0.1, 0.9));
      }
      const gap = coarse ? rand(2000, 3600) : inHero() ? rand(2200, 4200) : rand(4000, 6500);
      scheduleDrop(gap);
    }, delay);
  };

  let alive = true;
  let visible = true;
  let last = performance.now();

  // Once the ink has cleared the whole backdrop is an unbroken dark cover. Parking it stops the
  // video decoding and drops three full-screen layers for the rest of the page.
  const backdrop = document.querySelector<HTMLVideoElement>("#ink-video");
  let parked = false;
  const park = (on: boolean) => {
    if (parked === on) return;
    parked = on;
    document.documentElement.classList.toggle("ink-parked", on);
    if (!backdrop) return;
    if (on) backdrop.pause();
    else backdrop.play().catch(() => undefined);
  };

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (!alive || !visible || document.hidden) return;
    if (!flow || !ink || !pressure || !divergence) return;
    if (!advectProg || !divergenceProg || !pressureProg || !projectProg || !displayProg) return;

    if (retired()) {
      moved = false;
      queue.length = 0;
      stampedX = pointerX;
      stampedY = pointerY;
      if (!retiredSince) retiredSince = now;
      // Six seconds is longer than any blot lives; after that there is nothing to draw.
      if (now - retiredSince > 6000) {
        document.documentElement.dataset.reveal = "0";
        park(true);
        return;
      }
    } else {
      retiredSince = 0;
      park(false);
    }

    if (moved) {
      moved = false;
      const gapX = pointerX - stampedX;
      const gapY = pointerY - stampedY;
      const steps = Math.min(6, Math.max(1, Math.ceil(Math.hypot(gapX, gapY) / 26)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        queue.push({
          x: stampedX + gapX * t,
          y: stampedY + gapY * t,
          dx: pushX / steps,
          dy: pushY / steps,
          size: baseSize(),
          ink: POINTER_INK,
        });
      }
      stampedX = pointerX;
      stampedY = pointerY;
      level += (Math.min(999, Math.hypot(pushX, pushY)) - level) * 0.25;
    } else {
      level *= 0.94;
    }
    document.documentElement.dataset.reveal = String(Math.round(level));

    while (queue.length) {
      const next = queue.shift();
      if (next) stamp(next);
    }

    const cellX = 1 / flow.read.w;
    const cellY = 1 / flow.read.h;

    g.useProgram(divergenceProg.handle);
    g.uniform2f(divergenceProg.at.uTexel, cellX, cellY);
    g.uniform1i(divergenceProg.at.uVelocity, bind(0, flow.read));
    draw(divergence);

    g.useProgram(pressureProg.handle);
    g.uniform2f(pressureProg.at.uTexel, cellX, cellY);
    g.uniform1i(pressureProg.at.uDivergence, bind(0, divergence));
    for (let i = 0; i < SOLVES; i++) {
      g.uniform1i(pressureProg.at.uPressure, bind(1, pressure.read));
      draw(pressure.write);
      swap(pressure);
    }

    g.useProgram(projectProg.handle);
    g.uniform2f(projectProg.at.uTexel, cellX, cellY);
    g.uniform1i(projectProg.at.uPressure, bind(0, pressure.read));
    g.uniform1i(projectProg.at.uVelocity, bind(1, flow.read));
    draw(flow.write);
    swap(flow);

    const frames = dt / 0.016;
    g.useProgram(advectProg.handle);
    g.uniform2f(advectProg.at.uTexel, cellX, cellY);
    g.uniform2f(advectProg.at.uCell, cellX, cellY);
    g.uniform1f(advectProg.at.uDt, dt);

    g.uniform2f(advectProg.at.uSourceCell, cellX, cellY);
    g.uniform1f(advectProg.at.uKeep, Math.pow(FLOW_KEEP, frames));
    g.uniform1i(advectProg.at.uVelocity, bind(0, flow.read));
    g.uniform1i(advectProg.at.uSource, 0);
    draw(flow.write);
    swap(flow);

    g.uniform2f(advectProg.at.uSourceCell, 1 / ink.read.w, 1 / ink.read.h);
    // Past the opening screens the leftover ink clears about three times faster.
    g.uniform1f(advectProg.at.uKeep, Math.pow(retiredSince ? 0.9 : INK_KEEP, frames));
    g.uniform1i(advectProg.at.uVelocity, bind(0, flow.read));
    g.uniform1i(advectProg.at.uSource, bind(1, ink.read));
    draw(ink.write);
    swap(ink);

    g.useProgram(displayProg.handle);
    g.uniform2f(displayProg.at.uTexel, 1 / ink.read.w, 1 / ink.read.h);
    g.uniform2f(displayProg.at.uInkCell, 1 / ink.read.w, 1 / ink.read.h);
    g.uniform3f(displayProg.at.uCover, COVER[0], COVER[1], COVER[2]);
    g.uniform3f(displayProg.at.uRim, RIM[0], RIM[1], RIM[2]);
    g.uniform1i(displayProg.at.uInk, bind(0, ink.read));
    draw(null);
  };

  window.addEventListener("resize", () => {
    if (!alive) return;
    fitCanvas();
    if (!buildTargets()) alive = false;
  });

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    alive = false;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    alive = setup();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
      },
      { threshold: 0.1 },
    ).observe(canvas);
  }

  spill(viewW() * 0.66, viewH() * 0.46);
  scheduleDrop(rand(1400, 2200));
  requestAnimationFrame(frame);
  return true;
}

/** Fallback: a feathered circle punched through the cover at the pointer. */
function startCircle(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
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
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
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
    const breath = 1 + 0.05 * Math.sin(now / 900);
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
    const marks = ghosts.map((ghost, index) => {
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

/** Film dust: a few soft specks and the odd hairline, redrawn about 12 times a second. */
function startDust() {
  if (document.querySelector(".dust")) return;
  const canvas = document.createElement("canvas");
  canvas.className = "dust";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.body.appendChild(canvas);

  const SHRINK = 4;
  const fit = () => {
    canvas.width = Math.max(1, Math.ceil(window.innerWidth / SHRINK));
    canvas.height = Math.max(1, Math.ceil(window.innerHeight / SHRINK));
  };
  fit();
  window.addEventListener("resize", fit);

  let last = 0;
  const tick = (now: number) => {
    requestAnimationFrame(tick);
    if (document.hidden || now - last < 85) return;
    last = now;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const specks = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < specks; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = rand(1.2, 4.2);
      const strength = rand(0.22, 0.7);
      // Two or three overlapping lobes so a speck reads as a fleck, not a clean dot.
      const lobes = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < lobes; k++) {
        const lx = x + (k ? rand(-r, r) * 0.7 : 0);
        const ly = y + (k ? rand(-r, r) * 0.7 : 0);
        const lr = k ? r * rand(0.45, 0.8) : r;
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        glow.addColorStop(0, `rgba(255,255,255,${strength})`);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(lx, ly, lr, lr * rand(0.55, 1), rand(0, Math.PI), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (Math.random() < 0.14) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.7;
      ctx.strokeStyle = `rgba(255,255,255,${rand(0.18, 0.4)})`;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + rand(-6, 6), y + rand(8, 30), x + rand(-10, 10), y + rand(30, 70));
      ctx.stroke();
    }

    if (Math.random() < 0.1) {
      ctx.fillStyle = `rgba(255,255,255,${rand(0.02, 0.045)})`;
      ctx.fillRect(0, Math.random() * h, w, rand(1, 3));
    }
  };
  requestAnimationFrame(tick);
}
