/**
 * Cursor-ink reveal. A compact GPU stable-fluids solver (Jos Stam, SIGGRAPH 1999)
 * written for this site. The dye field is a mask: where the cursor has stirred
 * the fluid, a muted full-screen video shows through and then dissipates.
 *
 * The method is the same family as Pavel Dobryakov's MIT-licensed WebGL Fluid
 * Simulation (https://github.com/PavelDoGreat/WebGL-Fluid-Simulation). This file
 * is an original implementation, not a copy of that repository.
 */

const VERT = `#version 300 es
layout(location = 0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const SPLAT_VEL = `#version 300 es
precision highp float;
uniform sampler2D u_target;
uniform vec2 u_point;
uniform vec2 u_delta;
uniform float u_radius;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 vel = texture(u_target, v_uv).xy * 2.0 - 1.0;
  vec2 p = v_uv - u_point;
  float drop = exp(-dot(p, p) / u_radius);
  vel += u_delta * drop;
  vel = clamp(vel, vec2(-1.0), vec2(1.0));
  outColor = vec4(vel * 0.5 + 0.5, 0.0, 1.0);
}`;

const SPLAT_DYE = `#version 300 es
precision highp float;
uniform sampler2D u_target;
uniform vec2 u_point;
uniform float u_radius;
uniform float u_amount;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec4 base = texture(u_target, v_uv);
  vec2 p = v_uv - u_point;
  float drop = exp(-dot(p, p) / u_radius);
  base.rgb = vec3(1.0);
  base.a = min(1.0, base.a + drop * u_amount);
  outColor = base;
}`;

const ADVECT = `#version 300 es
precision highp float;
uniform sampler2D u_vel;
uniform sampler2D u_src;
uniform float u_dt;
uniform float u_dissipation;
uniform float u_velocity;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 vel = texture(u_vel, v_uv).xy * 2.0 - 1.0;
  vec2 coord = clamp(v_uv - u_dt * vel, vec2(0.0), vec2(1.0));
  if (u_velocity > 0.5) {
    vec2 next = texture(u_src, coord).xy * 2.0 - 1.0;
    next *= u_dissipation;
    outColor = vec4(next * 0.5 + 0.5, 0.0, 1.0);
  } else {
    vec4 dye = texture(u_src, coord);
    dye.a *= u_dissipation;
    outColor = dye;
  }
}`;

const DIVERGENCE = `#version 300 es
precision highp float;
uniform sampler2D u_vel;
uniform vec2 u_texel;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 L = texture(u_vel, v_uv - vec2(u_texel.x, 0.0)).xy * 2.0 - 1.0;
  vec2 R = texture(u_vel, v_uv + vec2(u_texel.x, 0.0)).xy * 2.0 - 1.0;
  vec2 B = texture(u_vel, v_uv - vec2(0.0, u_texel.y)).xy * 2.0 - 1.0;
  vec2 T = texture(u_vel, v_uv + vec2(0.0, u_texel.y)).xy * 2.0 - 1.0;
  float div = 0.5 * (R.x - L.x + T.y - B.y);
  outColor = vec4(div * 0.5 + 0.5, 0.0, 0.0, 1.0);
}`;

const JACOBI = `#version 300 es
precision highp float;
uniform sampler2D u_p;
uniform sampler2D u_div;
uniform vec2 u_texel;
in vec2 v_uv;
out vec4 outColor;
void main() {
  float L = texture(u_p, v_uv - vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float R = texture(u_p, v_uv + vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float B = texture(u_p, v_uv - vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  float T = texture(u_p, v_uv + vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  float div = texture(u_div, v_uv).x * 2.0 - 1.0;
  float p = (L + R + B + T - div) * 0.25;
  outColor = vec4(p * 0.5 + 0.5, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `#version 300 es
precision highp float;
uniform sampler2D u_p;
uniform sampler2D u_vel;
uniform vec2 u_texel;
in vec2 v_uv;
out vec4 outColor;
void main() {
  float L = texture(u_p, v_uv - vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float R = texture(u_p, v_uv + vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float B = texture(u_p, v_uv - vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  float T = texture(u_p, v_uv + vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  vec2 vel = texture(u_vel, v_uv).xy * 2.0 - 1.0;
  vel -= vec2(R - L, T - B) * 0.5;
  vel = clamp(vel, vec2(-1.0), vec2(1.0));
  outColor = vec4(vel * 0.5 + 0.5, 0.0, 1.0);
}`;

const DISPLAY = `#version 300 es
precision highp float;
uniform sampler2D u_dye;
uniform sampler2D u_video;
uniform vec2 u_cover;
in vec2 v_uv;
out vec4 outColor;
void main() {
  float ink = texture(u_dye, v_uv).a;
  vec2 uv = (v_uv - 0.5) * u_cover + 0.5;
  vec3 vid = texture(u_video, clamp(uv, vec2(0.0), vec2(1.0))).rgb;
  float luma = dot(vid, vec3(0.299, 0.587, 0.114));
  vid = mix(vec3(luma), vid, 0.42);
  vid *= vec3(0.72, 0.7, 0.68);
  float mask = smoothstep(0.03, 0.42, ink);
  vec3 bg = vec3(0.0902, 0.0902, 0.1020);
  vec3 col = mix(bg, vid, mask);
  float edge = smoothstep(0.02, 0.14, ink) * (1.0 - smoothstep(0.2, 0.5, ink));
  col += vec3(0.62, 0.09, 0.05) * edge * 0.55;
  outColor = vec4(col, 1.0);
}`;

type GL = WebGL2RenderingContext;

type Pair = {
  read: WebGLTexture;
  write: WebGLTexture;
  fboRead: WebGLFramebuffer;
  fboWrite: WebGLFramebuffer;
};

function compile(gl: GL, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "shader compile");
  }
  return shader;
}

function program(gl: GL, fragment: string) {
  const vs = compile(gl, VERT, gl.VERTEX_SHADER);
  const fs = compile(gl, fragment, gl.FRAGMENT_SHADER);
  const prog = gl.createProgram();
  if (!prog) throw new Error("program");
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || "link");
  }
  return prog;
}

function texture(gl: GL, width: number, height: number) {
  const tex = gl.createTexture();
  if (!tex) throw new Error("texture");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  return tex;
}

function framebuffer(gl: GL, tex: WebGLTexture) {
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("fbo");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return fbo;
}

function pair(gl: GL, width: number, height: number): Pair {
  const read = texture(gl, width, height);
  const write = texture(gl, width, height);
  return { read, write, fboRead: framebuffer(gl, read), fboWrite: framebuffer(gl, write) };
}

function swap(target: Pair) {
  const tex = target.read;
  target.read = target.write;
  target.write = tex;
  const fbo = target.fboRead;
  target.fboRead = target.fboWrite;
  target.fboWrite = fbo;
}

export function startFluid() {
  const canvas = document.querySelector<HTMLCanvasElement>("#ink");
  const video = document.querySelector<HTMLVideoElement>("#ink-video");
  if (!canvas || !video) return;

  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: false });
  if (!gl) {
    document.documentElement.classList.add("no-gl");
    video.play().catch(() => undefined);
    return;
  }

  const sim = window.matchMedia("(max-width: 860px)").matches ? 96 : 128;
  const vel = pair(gl, sim, sim);
  const dye = pair(gl, sim, sim);
  const pressure = pair(gl, sim, sim);
  const divTex = texture(gl, sim, sim);
  const divFbo = framebuffer(gl, divTex);

  const videoTex = gl.createTexture();
  if (!videoTex) return;
  gl.bindTexture(gl.TEXTURE_2D, videoTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([23, 23, 26, 255]));

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let splatVel: WebGLProgram;
  let splatDye: WebGLProgram;
  let advect: WebGLProgram;
  let divergence: WebGLProgram;
  let jacobi: WebGLProgram;
  let gradient: WebGLProgram;
  let display: WebGLProgram;
  try {
    splatVel = program(gl, SPLAT_VEL);
    splatDye = program(gl, SPLAT_DYE);
    advect = program(gl, ADVECT);
    divergence = program(gl, DIVERGENCE);
    jacobi = program(gl, JACOBI);
    gradient = program(gl, GRADIENT);
    display = program(gl, DISPLAY);
  } catch (error) {
    console.error(error);
    document.documentElement.classList.add("no-gl");
    video.play().catch(() => undefined);
    return;
  }

  const splatQueue: { x: number; y: number; dx: number; dy: number }[] = [];
  let lastX = 0.5;
  let lastY = 0.5;
  let seen = false;
  let viewW = 0;
  let viewH = 0;

  const onPointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    if (!seen) {
      lastX = x;
      lastY = y;
      seen = true;
      return;
    }
    const dx = x - lastX;
    const dy = y - lastY;
    lastX = x;
    lastY = y;
    if (dx * dx + dy * dy < 0.0000004) return;
    const steps = Math.min(6, Math.ceil(Math.hypot(dx, dy) / 0.02));
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      splatQueue.push({ x: x - dx * (1 - t), y: y - dy * (1 - t), dx, dy });
    }
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (width === viewW && height === viewH) return;
    viewW = width;
    viewH = height;
    canvas.width = width;
    canvas.height = height;
  };
  resize();
  window.addEventListener("resize", resize);

  const clearTo = (fbo: WebGLFramebuffer, r: number, g: number, b: number, a: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, sim, sim);
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  clearTo(vel.fboRead, 0.5, 0.5, 0, 1);
  clearTo(vel.fboWrite, 0.5, 0.5, 0, 1);
  clearTo(dye.fboRead, 0, 0, 0, 0);
  clearTo(dye.fboWrite, 0, 0, 0, 0);
  clearTo(pressure.fboRead, 0.5, 0, 0, 1);
  clearTo(pressure.fboWrite, 0.5, 0, 0, 1);
  clearTo(divFbo, 0.5, 0, 0, 1);

  const texel = [1 / sim, 1 / sim];
  const bindTarget = (fbo: WebGLFramebuffer | null, width: number, height: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, width, height);
  };
  const draw = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  const unit = (prog: WebGLProgram, name: string, index: number, tex: WebGLTexture) => {
    const loc = gl.getUniformLocation(prog, name);
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, index);
  };

  let frame = 0;
  let stopped = false;
  const loop = () => {
    if (stopped) return;
    frame = requestAnimationFrame(loop);
    if (document.hidden) return;
    resize();

    if (video.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      } catch {
        /* some browsers throw until the frame is paintable */
      }
    }

    const pending = splatQueue.splice(0, 10);
    for (const splat of pending) {
      const force = 16;
      const swirl = 7;
      gl.useProgram(splatVel);
      bindTarget(vel.fboWrite, sim, sim);
      unit(splatVel, "u_target", 0, vel.read);
      gl.uniform2f(gl.getUniformLocation(splatVel, "u_point"), splat.x, splat.y);
      gl.uniform2f(
        gl.getUniformLocation(splatVel, "u_delta"),
        splat.dx * force - splat.dy * swirl,
        splat.dy * force + splat.dx * swirl,
      );
      gl.uniform1f(gl.getUniformLocation(splatVel, "u_radius"), 0.0016);
      draw();
      swap(vel);

      gl.useProgram(splatDye);
      bindTarget(dye.fboWrite, sim, sim);
      unit(splatDye, "u_target", 0, dye.read);
      gl.uniform2f(gl.getUniformLocation(splatDye, "u_point"), splat.x, splat.y);
      gl.uniform1f(gl.getUniformLocation(splatDye, "u_radius"), 0.016);
      gl.uniform1f(gl.getUniformLocation(splatDye, "u_amount"), 1);
      draw();
      swap(dye);
    }

    gl.useProgram(advect);
    bindTarget(vel.fboWrite, sim, sim);
    unit(advect, "u_vel", 0, vel.read);
    unit(advect, "u_src", 1, vel.read);
    gl.uniform1f(gl.getUniformLocation(advect, "u_dt"), 0.22);
    gl.uniform1f(gl.getUniformLocation(advect, "u_dissipation"), 0.992);
    gl.uniform1f(gl.getUniformLocation(advect, "u_velocity"), 1);
    draw();
    swap(vel);

    gl.useProgram(divergence);
    bindTarget(divFbo, sim, sim);
    unit(divergence, "u_vel", 0, vel.read);
    gl.uniform2f(gl.getUniformLocation(divergence, "u_texel"), texel[0], texel[1]);
    draw();

    gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.fboRead);
    gl.viewport(0, 0, sim, sim);
    gl.clearColor(0.5, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.fboWrite);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(jacobi);
    for (let i = 0; i < 16; i += 1) {
      bindTarget(pressure.fboWrite, sim, sim);
      unit(jacobi, "u_p", 0, pressure.read);
      unit(jacobi, "u_div", 1, divTex);
      gl.uniform2f(gl.getUniformLocation(jacobi, "u_texel"), texel[0], texel[1]);
      draw();
      swap(pressure);
    }

    gl.useProgram(gradient);
    bindTarget(vel.fboWrite, sim, sim);
    unit(gradient, "u_p", 0, pressure.read);
    unit(gradient, "u_vel", 1, vel.read);
    gl.uniform2f(gl.getUniformLocation(gradient, "u_texel"), texel[0], texel[1]);
    draw();
    swap(vel);

    gl.useProgram(advect);
    bindTarget(dye.fboWrite, sim, sim);
    unit(advect, "u_vel", 0, vel.read);
    unit(advect, "u_src", 1, dye.read);
    gl.uniform1f(gl.getUniformLocation(advect, "u_dt"), 0.22);
    gl.uniform1f(gl.getUniformLocation(advect, "u_dissipation"), 0.993);
    gl.uniform1f(gl.getUniformLocation(advect, "u_velocity"), 0);
    draw();
    swap(dye);

    const canvasAspect = viewW / Math.max(1, viewH);
    const videoAspect = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16 / 9;
    const cover: [number, number] =
      canvasAspect > videoAspect ? [1, videoAspect / canvasAspect] : [canvasAspect / videoAspect, 1];

    gl.useProgram(display);
    bindTarget(null, viewW, viewH);
    unit(display, "u_dye", 0, dye.read);
    unit(display, "u_video", 1, videoTex);
    gl.uniform2f(gl.getUniformLocation(display, "u_cover"), cover[0], cover[1]);
    draw();
  };

  video.play().catch(() => undefined);
  loop();

  const onLost = (event: Event) => {
    event.preventDefault();
    stopped = true;
    cancelAnimationFrame(frame);
    document.documentElement.classList.add("no-gl");
  };
  canvas.addEventListener("webglcontextlost", onLost);
}
