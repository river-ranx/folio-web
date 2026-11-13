import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TYPES, paintCard } from './cardtex.js';

/* ───────────────────────── 常量 ───────────────────────── */
const FOV = 32;
const CAM_Z = 14;
const FW = 3.12, FH = 2.12;   // 窗口外框半尺寸（含边框）
const SW = 3.0, SH = 2.0;     // 屏幕半尺寸（3:2，与截图一致）

const SCREEN_FILES = {
  welcome: 'welcome', code: 'code', image: 'image', markdown: 'markdown', office: 'office', video: 'video',
  'theme-cream': 'theme-cream', 'theme-ink': 'theme-ink', 'theme-snow': 'theme-snow', 'theme-moss': 'theme-moss',
};

// 主题：a=主色，b=高光色，bg=背景氛围色（均按线性空间调过）
const THEMES = {
  cream: { a: [1.0, 0.56, 0.2],  b: [1.0, 0.78, 0.46], bg: [0.55, 0.26, 0.07] },
  ink:   { a: [0.42, 0.5, 1.0],  b: [0.7, 0.76, 1.0],  bg: [0.14, 0.17, 0.62] },
  snow:  { a: [0.2, 0.62, 1.0],  b: [0.62, 0.86, 1.0], bg: [0.06, 0.28, 0.6] },
  moss:  { a: [0.45, 0.82, 0.28], b: [0.78, 0.95, 0.52], bg: [0.14, 0.4, 0.07] },
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const damp = (cur, tgt, k, dt) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ───────────────────────── Shaders ───────────────────────── */
const SDF = /* glsl */`
float sdRR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r; }
`;

const WINDOW_VS = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const WINDOW_FS = /* glsl */`
varying vec2 vUv;
uniform sampler2D uTexA, uTexB;
uniform float uMix, uPower, uPulse, uRipple, uRippleAmp, uSheen, uTime, uOpacity;
uniform vec2 uFrame, uScreen, uLight;
uniform vec3 uAccent, uAccent2;
${SDF}
void main(){
  vec2 p = (vUv - 0.5) * uFrame * 2.0;
  float dO = sdRR(p, uFrame, 0.2);
  float dS = sdRR(p, uScreen, 0.1);
  float aa = fwidth(dO) * 1.1;
  float aO = 1.0 - smoothstep(-aa, aa, dO);
  if (aO < 0.003) discard;

  vec2 suv = p / (uScreen * 2.0) + 0.5;

  // 扫光转场：斜向一道亮线把 A 换成 B
  float d = (suv.x * 0.78 + suv.y * 0.22) - (uMix * 1.4 - 0.2);
  float m = 1.0 - smoothstep(-0.06, 0.06, d);
  float inTrans = step(0.001, uMix) * step(uMix, 0.999);
  vec3 scr = mix(texture2D(uTexA, suv).rgb, texture2D(uTexB, suv).rgb, m);
  scr += uAccent2 * exp(-abs(d) * 34.0) * inTrans * 1.5;

  // 通电：未吸满时屏幕偏暗，吸满后全亮
  scr *= mix(0.2, 0.74, uPower);

  // 光标聚光：屏幕被「点亮」
  vec2 dl = p - uLight;
  float sp = exp(-dot(dl, dl) * 0.32);
  scr += scr * sp * 0.22 + uAccent * sp * 0.1 * uPower;

  // 玻璃斜向反光
  float band = dot(p, normalize(vec2(1.0, 0.55)));
  scr += vec3(1.0, 0.96, 0.9) * exp(-pow((band - uSheen) * 0.85, 2.0)) * 0.07;

  // 吸收涟漪
  float rpl = exp(-pow((length(suv - 0.5) * 2.0 - uRipple) * 5.0, 2.0)) * uRippleAmp;
  scr += uAccent2 * rpl * 0.55;

  // 内缘暗角，屏幕有一点点「嵌进去」的感觉
  scr *= 0.9 + 0.1 * smoothstep(0.0, 0.5, -dS);

  // 边框：深色玻璃 + 随光标变亮的轮廓光
  vec3 bez = vec3(0.022, 0.018, 0.015) + uAccent * 0.025;
  float rim = exp(-abs(dO + 0.014) * 52.0);
  float rimLight = 0.32 + 1.5 * exp(-dot(dl, dl) * 0.07);
  vec3 rimCol = uAccent * rim * rimLight * (0.7 + uPulse * 2.4) * 1.7;
  float inner = exp(-abs(dS) * 150.0) * 0.28;
  vec3 col = mix(bez, scr, smoothstep(0.006, -0.006, dS)) + rimCol + uAccent2 * inner * (0.3 + uPower * 0.5);

  gl_FragColor = vec4(col, aO * uOpacity);
}
`;

const CARD_VS = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const CARD_FS = /* glsl */`
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uAspect, uAlpha, uHover, uNear, uFog, uDim, uTime;
uniform vec3 uTint, uAccent;
${SDF}
void main(){
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float d = sdRR(p, vec2(uAspect * 0.5, 0.5), 0.07);
  float aa = fwidth(d) * 1.2;
  float m = 1.0 - smoothstep(-aa, aa, d);
  if (m * uAlpha < 0.01) discard;

  vec3 rimC = mix(uTint, uAccent, 0.35);
  float rim = exp(-abs(d + 0.006) * 70.0);
  vec3 col;
  if (gl_FrontFacing) {
    vec3 t = texture2D(uTex, vUv).rgb;
    col = t * (0.86 + 0.5 * uHover + 0.5 * uNear);
    col += vec3(1.0, 0.96, 0.9) * smoothstep(0.0, 1.0, sin((vUv.x * 1.3 + vUv.y) * 5.0 + uTime * 0.5) * 0.5 + 0.5) * 0.035;
    col += vec3(1.0) * smoothstep(0.55, 0.0, length(vUv - vec2(0.1, 0.95))) * 0.06;
    col += rimC * rim * (0.55 + 1.9 * uHover + 1.4 * uNear);
  } else {
    col = mix(vec3(0.05, 0.045, 0.04), rimC * 0.16, smoothstep(1.0, 0.0, vUv.y)) + vec3(0.03);
    col += rimC * rim * (0.5 + uHover);
  }
  col = mix(col, vec3(0.03, 0.025, 0.02), uFog * 0.7);
  col *= uDim;
  gl_FragColor = vec4(col, m * uAlpha);
}
`;

const PARTICLE_VS = /* glsl */`
attribute vec4 aSeed;
uniform float uTime, uSuck, uPx, uShockAge, uShockAmp, uIntensity;
uniform vec3 uMouse, uCenter, uA, uB;
uniform vec2 uShock;
varying vec3 vCol;
varying float vA;
void main(){
  vec3 p = position;
  float t = uTime;
  p.x += sin(t * 0.07 * (0.5 + aSeed.x) + aSeed.y * 6.2831) * 1.3 + t * 0.12 * (aSeed.z - 0.5);
  p.y += cos(t * 0.06 * (0.5 + aSeed.y) + aSeed.z * 6.2831) * 1.1 + t * 0.05 * (0.3 + aSeed.w);
  p.z += sin(t * 0.05 + aSeed.w * 6.2831) * 0.9;
  p.x = mod(p.x + 15.0, 30.0) - 15.0;
  p.y = mod(p.y + 9.5, 19.0) - 9.5;

  // 向窗口汇流：绕中心旋转并收拢
  vec2 rel = p.xy - uCenter.xy;
  float dC = length(rel);
  float sw = uSuck * smoothstep(13.0, 1.5, dC);
  float ang = sw * 1.7 * (0.4 + aSeed.x);
  float c = cos(ang), s = sin(ang);
  rel = mat2(c, -s, s, c) * rel;
  rel *= 1.0 - sw * 0.5 * (0.3 + aSeed.y);
  p.xy = uCenter.xy + rel;
  p.z = mix(p.z, uCenter.z - 0.4 + (aSeed.w - 0.5) * 1.4, sw * 0.55);

  // 光标：漩涡 + 推开
  vec2 dm = p.xy - uMouse.xy;
  float md = length(dm);
  float f = exp(-md * md / 2.6);
  p.xy += vec2(-dm.y, dm.x) / (md + 0.25) * f * 0.95 + dm / (md + 0.3) * f * 0.55;
  p.z += f * 0.9;

  // 点击冲击波
  vec2 ds = p.xy - uShock;
  float sd = length(ds);
  float ring = exp(-pow((sd - uShockAge * 9.5) * 1.05, 2.0)) * uShockAmp * exp(-uShockAge * 1.1);
  p.xy += ds / (sd + 0.001) * ring * 1.5;
  p.z += ring * 1.1;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.6 + 0.4 * sin(t * (1.0 + aSeed.x * 2.0) + aSeed.y * 20.0);
  float size = (0.035 + aSeed.w * 0.085) * (1.0 + f * 1.4 + ring * 2.2) * (0.75 + 0.25 * tw);
  gl_PointSize = clamp(size * uPx / -mv.z, 1.0, 16.0);
  vCol = mix(uA, uB, aSeed.z) * (1.0 + f * 2.2 + ring * 3.0) * uIntensity;
  vA = (0.22 + 0.78 * aSeed.x) * (0.45 + 0.55 * tw) * smoothstep(5.5, 11.0, -mv.z);
}
`;

const PARTICLE_FS = /* glsl */`
varying vec3 vCol;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vCol * vA * a, 1.0);
}
`;

const BEAM_FS = /* glsl */`
varying vec2 vUv;
uniform float uTime, uI, uSeed;
uniform vec3 uColor;
void main(){
  float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
  across = pow(smoothstep(0.0, 1.0, across), 2.4);
  float along = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
  float streak = 0.55 + 0.45 * sin(vUv.x * 22.0 + uTime * 0.3 + uSeed + sin(vUv.y * 9.0) * 2.0);
  streak *= 0.7 + 0.3 * sin(vUv.x * 57.0 - uTime * 0.18 + uSeed * 2.0);
  float a = across * along * streak * uI;
  gl_FragColor = vec4(uColor * a, 1.0);
}
`;

const BG_FS = /* glsl */`
varying vec2 vUv;
uniform vec2 uWin;
uniform vec3 uBgTint;
uniform float uAspect, uGlow;
void main(){
  vec2 q = (vUv - uWin) * vec2(uAspect, 1.0);
  float g1 = exp(-dot(q, q) * 2.6) * uGlow;
  vec2 r = (vUv - vec2(0.04, 0.98)) * vec2(uAspect, 1.0);
  float g2 = exp(-dot(r, r) * 1.6);
  vec3 col = vec3(0.02, 0.016, 0.013) + uBgTint * (g1 * 0.06 + g2 * 0.028);
  col += uBgTint * 0.012 * smoothstep(0.5, 0.0, vUv.y);
  gl_FragColor = vec4(col, 1.0);
}
`;

const GRADE = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAb: { value: 0.0006 }, uGrain: { value: 0.028 }, uVig: { value: 0.55 }, uFlash: { value: 0 } },
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime, uAb, uGrain, uVig, uFlash;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5;
      float d = dot(c, c);
      vec2 off = c * d * uAb * 14.0;
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      col *= 1.0 - uVig * smoothstep(0.08, 0.62, d * 1.6);
      col *= 1.0 + uFlash * 0.18;
      col += (h(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 91.0) - 0.5) * uGrain;
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
};

/* ───────────────────────── 场景 ───────────────────────── */
export async function createScene(canvas, opts = {}) {
  const base = opts.base || 'assets/screens/';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const forceHigh = /[?&]q=high/.test(location.search);
  const motion = reduce ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  let dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x050403, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
  camera.position.set(0, 0, CAM_Z);

  // 所有材质共享的 uniform：引用同一个 {value}，改一处全局生效
  const shared = {
    uTime: { value: 0 },
    uAccent: { value: new THREE.Vector3(...THEMES.cream.a) },
    uAccent2: { value: new THREE.Vector3(...THEMES.cream.b) },
    uBgTint: { value: new THREE.Vector3(...THEMES.cream.bg) },
  };
  const themeTarget = { a: new THREE.Vector3(...THEMES.cream.a), b: new THREE.Vector3(...THEMES.cream.b), bg: new THREE.Vector3(...THEMES.cream.bg) };

  /* ── 背景 ── */
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { uWin: { value: new THREE.Vector2(0.7, 0.5) }, uAspect: { value: 1.6 }, uGlow: { value: 1 }, uBgTint: shared.uBgTint },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: BG_FS, depthTest: false, depthWrite: false,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false; bg.renderOrder = -10;
  scene.add(bg);

  /* ── 光束 ── */
  const beams = [];
  [[-0.62, -7, 0.9, 30, 5.5], [-0.38, -10, 0.6, 38, 7]].forEach(([rot, z, I, w, h], i) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.ShaderMaterial({
        uniforms: { uTime: shared.uTime, uI: { value: I * 0.1 }, uSeed: { value: i * 3.7 }, uColor: shared.uAccent2 },
        vertexShader: CARD_VS, fragmentShader: BEAM_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      }));
    m.position.set(i ? 5 : -3, i ? -1 : 2.5, z); m.rotation.z = rot; m.renderOrder = -6;
    scene.add(m); beams.push(m);
  });

  /* ── 窗口 rig：窗口 + 光晕 + 卡片都挂在这里，整体平移/缩放 ── */
  const rig = new THREE.Group();
  scene.add(rig);

  const placeholder = new THREE.DataTexture(new Uint8Array([22, 17, 12, 255]), 1, 1);
  placeholder.colorSpace = THREE.SRGBColorSpace; placeholder.needsUpdate = true;

  const winMat = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uTexA: { value: placeholder }, uTexB: { value: placeholder }, uMix: { value: 0 },
      uPower: { value: 0.4 }, uOpacity: { value: 1 }, uPulse: { value: 0 }, uRipple: { value: 2 }, uRippleAmp: { value: 0 }, uSheen: { value: 0 },
      uLight: { value: new THREE.Vector2(99, 99) },
      uFrame: { value: new THREE.Vector2(FW, FH) }, uScreen: { value: new THREE.Vector2(SW, SH) },
    },
    vertexShader: WINDOW_VS, fragmentShader: WINDOW_FS, transparent: true, side: THREE.DoubleSide,
  });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(FW * 2, FH * 2), winMat);
  rig.add(win);

  // 窗口身后的光晕（Bloom 会把它放大成光雾）
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 10),
    new THREE.ShaderMaterial({
      uniforms: { uAccent: shared.uAccent, uI: { value: 0.3 } },
      vertexShader: CARD_VS,
      fragmentShader: `varying vec2 vUv; uniform vec3 uAccent; uniform float uI;
        void main(){ vec2 q=(vUv-.5)*vec2(1.0,1.45); float r=length(q); float g=exp(-r*r*34.0)*(1.0-smoothstep(0.18,0.5,r)); gl_FragColor=vec4(uAccent*g*uI,1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
  halo.position.z = -0.7; halo.renderOrder = -4;
  rig.add(halo);

  /* ── 窗口屏幕纹理 ── */
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const screens = {};
  function getScreen(key) {
    const rec = screens[key] || (screens[key] = { tex: null, cbs: [] });
    if (!rec.tex && !rec.loading) {
      rec.loading = true;
      loader.load(`${base}${SCREEN_FILES[key] || SCREEN_FILES.welcome}.jpg`, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
        tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true;
        renderer.initTexture(tex);
        rec.tex = tex; rec.cbs.splice(0).forEach((f) => f(tex));
      });
    }
    return rec;
  }
  function withScreen(key, cb) { const r = getScreen(key); r.tex ? cb(r.tex) : r.cbs.push(cb); }

  let curScreen = null, wantScreen = 'welcome', mixT = -1, mixTarget = null;
  const overrideScreen = { key: null, until: 0 };
  function applyScreen(now) {
    const key = now < overrideScreen.until ? overrideScreen.key : state.screen;
    if (key === wantScreen && curScreen) return;
    wantScreen = key;
    if (mixT >= 0) return; // 上一次转场还没完，等它结束再换
    withScreen(key, (tex) => {
      if (key !== wantScreen) return;
      if (!curScreen) { winMat.uniforms.uTexA.value = tex; curScreen = key; return; }
      if (key === curScreen) return;
      winMat.uniforms.uTexB.value = tex; mixTarget = key; mixT = 0;
    });
  }
  withScreen('welcome', (tex) => { winMat.uniforms.uTexA.value = tex; curScreen = 'welcome'; });
  // 空闲时预热其余截图，转场时不再卡顿
  const warm = () => Object.keys(SCREEN_FILES).forEach((k) => getScreen(k));
  (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(warm);

  /* ── 文件卡片 ── */
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1200))]);
  const cards = [];
  const cardGroup = new THREE.Group();
  rig.add(cardGroup);
  const rndSeed = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const PER = isTouch ? 2 : 3;
  const quadGeo = new THREE.PlaneGeometry(1, 1);

  TYPES.forEach((type, ti) => {
    const tex = new THREE.CanvasTexture(paintCard(type, ti + 1));
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso; tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    const tint = new THREE.Color(type.c);
    for (let k = 0; k < PER; k++) {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: shared.uTime, uAccent: shared.uAccent,
          uTex: { value: tex }, uAspect: { value: type.ar }, uAlpha: { value: 1 }, uHover: { value: 0 }, uNear: { value: 0 },
          uFog: { value: 0 }, uDim: { value: 1 }, uTint: { value: new THREE.Vector3(tint.r * 1.4, tint.g * 1.4, tint.b * 1.4) },
        },
        vertexShader: CARD_VS, fragmentShader: CARD_FS, transparent: true, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(quadGeo, mat);
      const ch = (type.ar >= 1.5 ? 1.0 : type.ar >= 1.1 ? 1.15 : 1.45) * (0.88 + rndSeed() * 0.3);
      const u = rndSeed();
      const c = {
        mesh, mat, type, ti,
        w: ch * type.ar, h: ch,
        rx: 4.8 + u * 5.2, ry: 3.1 + u * 3.1, u,
        th0: rndSeed() * Math.PI * 2, spd: 0.042 + (1 - u) * 0.05,
        z0: (rndSeed() - 0.5) * 4.6, bobF: 0.4 + rndSeed() * 0.6, ph: rndSeed() * 6.283, roll: (rndSeed() - 0.5) * 0.5,
        delay: u * 0.62 + rndSeed() * 0.38, dir: rndSeed() < 0.5 ? 1 : -1,
        off: new THREE.Vector3(), vel: new THREE.Vector3(),
        hover: 0, near: 0, open: 0, openT: 0, openHold: 0, absorbed: false,
      };
      mesh.scale.set(c.w, c.h, 1);
      cardGroup.add(mesh); cards.push(c);
    }
  });

  /* ── 粒子 ── */
  const NP = isTouch ? 3200 : 6500;
  const pPos = new Float32Array(NP * 3), pSeed = new Float32Array(NP * 4);
  for (let i = 0; i < NP; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 30; pPos[i * 3 + 1] = (Math.random() - 0.5) * 19; pPos[i * 3 + 2] = -9 + Math.random() * 12.5;
    for (let j = 0; j < 4; j++) pSeed[i * 4 + j] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 4));
  const pMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: shared.uTime, uSuck: { value: 0 }, uPx: { value: 800 }, uShockAge: { value: 99 }, uShockAmp: { value: 0 }, uIntensity: { value: 1 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) }, uCenter: { value: new THREE.Vector3() }, uShock: { value: new THREE.Vector2(99, 99) },
      uA: shared.uAccent, uB: shared.uAccent2,
    },
    vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false; points.renderOrder = 5;
  scene.add(points);

  /* ── 后期：Bloom → 调色 → 输出 ── */
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: isTouch ? 0 : 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.6, 1.02);
  composer.addPass(bloom);
  const grade = new ShaderPass(GRADE);
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  /* ── 状态 ── */
  const state = { layout: 'hero', conv: 0, screen: 'welcome', yaw: 0, theme: 'cream', dim: false };
  const v = { conv: 0, x: 0, y: 0, z: 0, w: 6, power: 0.4, yaw: 0, intro: reduce ? 1 : 0, opacity: 1, cx: 0, cy: 0, px: 0, py: 0, glow: 1, cardVis: 1, flash: 0, pulse: 0 };
  const ptr = { x: 0, y: 0, nx: 0, ny: 0, active: false, down: false, downX: 0, downY: 0, downT: 0 };
  const mouseW = new THREE.Vector3(99, 99, 0);   // 世界坐标
  const mouseR = new THREE.Vector2(99, 99);      // rig 局部坐标
  const lightLocal = new THREE.Vector2(99, 99);
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const tmpV = new THREE.Vector3();
  const plane = new THREE.Plane();
  const shock = { x: 99, y: 99, age: 99, amp: 0 };
  let hovered = null, lastHoverId = null;
  let t = 0, last = performance.now(), frames = 0, accDt = 0, qualityChecked = forceHigh;
  let W = 1, H = 1, aspect = 1.6;

  function visibleHeight(z = 0) { return 2 * (CAM_Z - z) * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); }

  function layoutFor(kind) {
    const vh = visibleHeight(), vw = vh * aspect;
    if (aspect >= 1.05) {
      if (kind === 'ambient') return { x: vw * 0.3, y: -vh * 0.12, z: -6.5, w: vw * 0.34, side: 'left' };
      const w = Math.min(vw * 0.47, 8.0);
      return { x: vw * 0.445 - w / 2, y: vh * 0.015, z: 0, w, side: 'left' };
    }
    // 竖屏：窗口顶在上方，文字在下半屏
    const w = vw * 0.88, winH = w * (FH / FW);
    if (kind === 'ambient') return { x: 0, y: vh * 0.3, z: -6.5, w: vw * 0.62, side: 'bottom' };
    return { x: 0, y: vh * 0.5 - winH / 2 - vh * 0.125, z: 0, w, side: 'bottom' };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
    aspect = W / H;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    composer.setPixelRatio(dpr);
    composer.setSize(W, H);
    camera.aspect = aspect; camera.updateProjectionMatrix();
    pMat.uniforms.uPx.value = (H * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    bgMat.uniforms.uAspect.value = aspect;
    if (!resized) { const L = layoutFor('hero'); v.x = L.x; v.y = L.y; v.w = L.w; resized = true; }
  }
  let resized = false;
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  /* ── 指针 ── */
  const INTERACTIVE = 'a,button,input,select,textarea,label,summary,nav,[data-no-scene],.glass,.faq-q,.lang-menu,.compare-wrap,.pro-window,.swatches';
  function onMove(e) {
    ptr.x = e.clientX; ptr.y = e.clientY;
    ptr.nx = (e.clientX / innerWidth) * 2 - 1; ptr.ny = -((e.clientY / innerHeight) * 2 - 1);
    ptr.active = true;
  }
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', (e) => { onMove(e); ptr.down = true; ptr.downX = e.clientX; ptr.downY = e.clientY; ptr.downT = performance.now(); });
  addEventListener('pointerup', (e) => {
    ptr.down = false;
    if (e.pointerType === 'touch') setTimeout(() => { if (!ptr.down) ptr.active = false; }, 700);
    const moved = Math.hypot(e.clientX - ptr.downX, e.clientY - ptr.downY);
    if (moved > 8 || performance.now() - ptr.downT > 600) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    if (state.layout !== 'hero' || v.conv > 0.45) return;
    if (e.pointerType === 'touch') { onMove(e); pickHover(); }
    if (hovered && hovered.open === 0) openCard(hovered); else fireShock();
  });
  document.documentElement.addEventListener('pointerleave', () => { ptr.active = false; });
  addEventListener('blur', () => { ptr.active = false; });

  function fireShock() {
    shock.x = mouseW.x; shock.y = mouseW.y; shock.age = 0; shock.amp = 1;
    v.flash = 1; v.pulse = Math.min(1, v.pulse + 0.35);
    const s = rig.scale.x;
    cards.forEach((c) => {
      tmpV.copy(c.mesh.position).multiplyScalar(s).add(rig.position);
      const dx = tmpV.x - mouseW.x, dy = tmpV.y - mouseW.y, d = Math.hypot(dx, dy) + 0.001;
      const k = 11 * Math.exp(-d * 0.22) / s;
      c.vel.x += (dx / d) * k; c.vel.y += (dy / d) * k; c.vel.z += k * 0.35;
    });
  }

  function openCard(c) {
    c.open = 1; c.openT = 0; c.absorbed = false;
    overrideScreen.key = c.type.screen; overrideScreen.until = performance.now() + 4200;
    v.pulse = Math.min(1, v.pulse + 0.4);
    opts.onOpen && opts.onOpen({ name: c.type.name, ext: c.type.ext, id: c.type.id });
  }

  function pickHover() {
    hovered = null;
    if (state.layout !== 'hero' || v.conv > 0.3 || !ptr.active || v.intro < 0.6) return;
    ndc.set(ptr.nx, ptr.ny);
    ray.setFromCamera(ndc, camera);
    const vis = cards.filter((c) => c.mesh.visible && c.mat.uniforms.uAlpha.value > 0.5 && c.open === 0).map((c) => c.mesh);
    const hit = ray.intersectObjects(vis, false)[0];
    if (hit) hovered = cards.find((c) => c.mesh === hit.object) || null;
  }

  /* ── 主题 / 外部接口 ── */
  function setTheme(name) {
    const th = THEMES[name]; if (!th) return;
    state.theme = name;
    themeTarget.a.set(...th.a); themeTarget.b.set(...th.b); themeTarget.bg.set(...th.bg);
    v.pulse = Math.min(1, v.pulse + 0.5); v.flash = Math.max(v.flash, 0.6);
  }

  /* ── 逐帧 ── */
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    t += dt * motion;   // 「减少动态效果」时时间冻结，场景只响应交互
    const tt = t;
    shared.uTime.value = tt;
    applyScreen(now);

    // 质量自适应：慢机器自动降级，保证交互不卡
    if (!qualityChecked && ++frames > 40) {
      accDt += dt;
      if (frames === 160) {
        qualityChecked = true;
        const avg = accDt / 120;
        if (avg > 0.034) { dpr = 1; bloom.enabled = avg < 0.07; resize(); console.info('[folio] 自动降级渲染质量', avg.toFixed(3)); }
        else if (avg > 0.022 && dpr > 1.25) { dpr = 1.25; resize(); }
      }
    }

    // 主题色渐变
    const kc = 1 - Math.exp(-dt * 3.2);
    shared.uAccent.value.lerp(themeTarget.a, kc); shared.uAccent2.value.lerp(themeTarget.b, kc); shared.uBgTint.value.lerp(themeTarget.bg, kc);

    // 布局目标
    const kind = state.layout === 'ambient' ? 'ambient' : 'hero';
    const L = layoutFor(kind);
    v.intro = clamp(v.intro + dt / 2.6);
    const introE = easeInOut(v.intro);
    v.conv = damp(v.conv, state.conv, state.conv > v.conv ? 2.6 : 1.6, dt);
    v.x = damp(v.x, L.x, 3.2, dt); v.y = damp(v.y, L.y, 3.2, dt); v.z = damp(v.z, L.z, 3.2, dt); v.w = damp(v.w, L.w, 3.2, dt);
    v.yaw = damp(v.yaw, state.yaw, 3, dt);
    v.opacity = damp(v.opacity, kind === 'ambient' ? 0 : 1, 2.6, dt);
    const targetPower = kind === 'ambient' ? 0.6 : 0.72 + 0.28 * smooth(0.05, 0.9, v.conv);
    v.power = damp(v.power, targetPower * (0.35 + 0.65 * introE), 3, dt);
    v.px = damp(v.px, ptr.active ? ptr.nx : 0, 2.2, dt); v.py = damp(v.py, ptr.active ? ptr.ny : 0, 2.2, dt);

    // 相机：指针视差 + 汇聚时缓慢推进
    camera.position.x = damp(camera.position.x, v.px * 0.9, 3, dt);
    camera.position.y = damp(camera.position.y, v.py * 0.55, 3, dt);
    camera.position.z = CAM_Z - 0.4 * smooth(0, 1, v.conv) * (kind === 'ambient' ? 0 : 1) + (1 - introE) * 3.5;
    camera.lookAt(0, 0, 0);

    const zoom = 1 + 0.03 * v.conv;
    const sc = (v.w / (FW * 2)) * zoom;
    rig.position.set(v.x, v.y, v.z);
    rig.scale.setScalar(sc);

    // 窗口姿态：呼吸 + 指针倾斜 + 章节偏航
    win.position.y = Math.sin(tt * 0.6) * 0.07;
    win.rotation.y = v.px * 0.2 + v.yaw;
    win.rotation.x = -v.py * 0.13;
    win.rotation.z = Math.sin(tt * 0.35) * 0.008;

    // 指针 → 世界/局部坐标
    ndc.set(ptr.nx, ptr.ny);
    ray.setFromCamera(ndc, camera);
    plane.set(new THREE.Vector3(0, 0, 1), -rig.position.z);
    if (ray.ray.intersectPlane(plane, tmpV)) { mouseW.copy(tmpV); }
    if (ptr.active) mouseR.set((mouseW.x - rig.position.x) / sc, (mouseW.y - rig.position.y) / sc);
    else mouseR.set(99, 99);
    // 窗口局部坐标（用于屏幕聚光）
    win.updateMatrixWorld();
    const nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(win.getWorldQuaternion(new THREE.Quaternion()));
    const wp = win.getWorldPosition(new THREE.Vector3());
    plane.setFromNormalAndCoplanarPoint(nrm, wp);
    if (ptr.active && ray.ray.intersectPlane(plane, tmpV)) {
      win.worldToLocal(tmpV);
      lightLocal.set(tmpV.x, tmpV.y);
    } else lightLocal.set(damp(lightLocal.x, 9, 2, dt), damp(lightLocal.y, 9, 2, dt));

    // 点击冲击波 & 闪光
    shock.age += dt; shock.amp = Math.max(0, shock.amp - dt * 0.7);
    v.flash = Math.max(0, v.flash - dt * 2.2);
    v.pulse = Math.max(0, v.pulse - dt * 1.3);

    // 卡片
    pickHover();
    if (hovered?.type.id !== lastHoverId) {
      lastHoverId = hovered?.type.id ?? null;
      canvas.style.cursor = '';
      document.body.classList.toggle('is-hovering-card', !!hovered);
    }
    opts.onHover && opts.onHover(hovered ? { name: hovered.type.name, ext: hovered.type.ext } : null, ptr.x, ptr.y);

    const sideLeft = L.side === 'left';
    const rigLeft = rig.position.x - v.w * 0.5, rigBottom = rig.position.y - (v.w * FH / FW) / 2;
    let absorbedNow = 0, anyVisible = false;
    const globalIntro = introE;
    for (const c of cards) {
      // 轨道
      const th = c.th0 + tt * c.spd * 6.2;
      const rs = 1 + (1 - globalIntro) * 1.8;
      let x = Math.cos(th) * c.rx * rs, y = Math.sin(th) * c.ry * rs;
      let z = c.z0 + Math.sin(th) * 1.4 + Math.sin(tt * c.bobF + c.ph) * 0.25;
      y += Math.sin(tt * c.bobF * 1.3 + c.ph) * 0.2;

      // 弹簧偏移：光标推开 + 冲击
      if (mouseR.x < 90) {
        const dx = x - mouseR.x, dy = y - mouseR.y, d = Math.hypot(dx, dy) + 0.001;
        const R = 3.0;
        if (d < R) { const f = (1 - d / R); const k = f * f * 34; c.vel.x += (dx / d) * k * dt; c.vel.y += (dy / d) * k * dt; c.vel.z += f * 5 * dt; }
        c.near = damp(c.near, Math.exp(-(d * d) / 5), 8, dt);
      } else c.near = damp(c.near, 0, 4, dt);
      c.vel.x += (-c.off.x * 7 - c.vel.x * 2.8) * dt; c.vel.y += (-c.off.y * 7 - c.vel.y * 2.8) * dt; c.vel.z += (-c.off.z * 7 - c.vel.z * 2.8) * dt;
      c.off.x += c.vel.x * dt; c.off.y += c.vel.y * dt; c.off.z += c.vel.z * dt;
      x += c.off.x; y += c.off.y; z += c.off.z;

      // 吸收进度：滚动汇聚 + 点击打开
      let e = easeInOut(clamp((v.conv * 1.55 - c.delay * 0.55) / 1.0));
      if (c.open) {
        if (c.open === 1) { c.openT = Math.min(1, c.openT + dt / 0.95); if (c.openT >= 1) { c.open = 3; c.openHold = 2.2; } }
        else if (c.open === 3) { c.openHold -= dt; if (c.openHold <= 0) c.open = 2; }
        else { c.openT = Math.max(0, c.openT - dt / 1.3); if (c.openT <= 0) c.open = 0; }
        e = Math.max(e, easeInOut(c.openT));
      }
      if (e > 0.92 && !c.absorbed) { c.absorbed = true; absorbedNow++; }
      else if (e < 0.5) c.absorbed = false;

      let rotX = Math.sin(tt * 0.3 + c.ph) * 0.2 + (mouseR.x < 90 ? -(mouseR.y - y) * 0.03 * c.near : 0);
      let rotY = Math.sin(tt * 0.25 + c.ph * 1.7) * 0.5 - x * 0.05 + (mouseR.x < 90 ? (mouseR.x - x) * 0.05 * c.near : 0);
      let rotZ = c.roll;
      let scl = 1, alpha = 1;
      if (e > 0) {
        const k = 1 - e, pk = Math.pow(k, 1.25);
        const ang = Math.atan2(y, x) + e * 2.3 * c.dir;
        const r = Math.hypot(x, y) * pk;
        x = Math.cos(ang) * r; y = Math.sin(ang) * r;
        z = z * k * k - 0.2 * e;
        rotX *= k; rotY *= k; rotZ = rotZ * k + e * 1.4 * c.dir;
        scl = 1 - 0.82 * e * e;
        alpha = 1 - smooth(0.78, 1, e);
      }
      c.hover = damp(c.hover, hovered === c ? 1 : 0, 10, dt);
      scl *= 1 + 0.12 * c.hover;
      alpha *= globalIntro;

      c.mesh.position.set(x, y, z);
      c.mesh.rotation.set(rotX, rotY, rotZ);
      c.mesh.scale.set(c.w * scl, c.h * scl, 1);
      c.mesh.visible = alpha > 0.01 && (c.w * scl) > 0.02;
      anyVisible ||= c.mesh.visible;

      // 文字区压暗 / 远景加深
      const wx = rig.position.x + x * sc, wy = rig.position.y + y * sc;
      const dimText = sideLeft ? 0.3 + 0.7 * smooth(rigLeft - 3.2, rigLeft + 0.6, wx) : 0.3 + 0.7 * smooth(rigBottom - 2.4, rigBottom + 0.5, wy);
      const u = c.mat.uniforms;
      u.uAlpha.value = alpha; u.uHover.value = c.hover; u.uNear.value = c.near;
      u.uFog.value = clamp((0.8 - z) / 4.8); u.uDim.value = dimText * (1 - 0.0);
    }
    cardGroup.visible = anyVisible;
    if (absorbedNow) { v.pulse = Math.min(1, v.pulse + 0.14 * absorbedNow); winMat.uniforms.uRipple.value = 0; winMat.uniforms.uRippleAmp.value = 0.8; }

    // 窗口 uniform
    const wu = winMat.uniforms;
    if (mixT >= 0) {
      mixT += dt / 0.85; wu.uMix.value = Math.min(1, mixT);
      // 转场期间目标可能已改变：清掉 wantScreen，下一帧 applyScreen 会重新对齐到最新目标
      if (mixT >= 1) { wu.uTexA.value = wu.uTexB.value; curScreen = mixTarget; wu.uMix.value = 0; mixT = -1; wantScreen = null; }
    }
    wu.uPower.value = v.power; wu.uPulse.value = v.pulse; wu.uOpacity.value = v.opacity;
    win.visible = halo.visible = v.opacity > 0.01;
    wu.uRipple.value += dt * 1.5; wu.uRippleAmp.value = Math.max(0, wu.uRippleAmp.value - dt * 1.2);
    wu.uLight.value.copy(lightLocal);
    wu.uSheen.value = Math.sin(tt * 0.22) * 2.4 + v.px * 2.2 - v.py * 1.2;

    halo.material.uniforms.uI.value = (0.07 + 0.2 * v.power + v.pulse * 0.45) * v.opacity;

    // 粒子
    const pu = pMat.uniforms;
    pu.uSuck.value = kind === 'ambient' ? 0 : smooth(0, 1, v.conv) * (1 - 0.25 * smooth(0.9, 1, v.conv));
    pu.uMouse.value.copy(ptr.active ? mouseW : tmpV.set(99, 99, 0));
    pu.uCenter.value.copy(rig.position);
    pu.uShock.value.set(shock.x, shock.y); pu.uShockAge.value = shock.age; pu.uShockAmp.value = shock.amp;
    pu.uIntensity.value = (0.55 + 0.45 * globalIntro) * (kind === 'ambient' ? 0.85 : 1);

    // 光束视差
    beams[0].position.x = -3 + v.px * -1.2 + Math.sin(tt * 0.05) * 0.8; beams[1].position.x = 5 + v.px * -0.6;
    beams.forEach((b) => { b.material.uniforms.uI.value = damp(b.material.uniforms.uI.value, (kind === 'ambient' ? 0.05 : 0.09) * (b === beams[1] ? 0.7 : 1) * (1 + v.pulse), 3, dt); });

    // 背景辉光跟随窗口
    tmpV.copy(rig.position).project(camera);
    bgMat.uniforms.uWin.value.set(tmpV.x * 0.5 + 0.5, tmpV.y * 0.5 + 0.5);
    bgMat.uniforms.uGlow.value = 0.8 + v.power * 0.8 + v.pulse;

    bloom.strength = 0.4 + v.pulse * 0.5 + v.flash * 0.35;
    grade.uniforms.uTime.value = tt; grade.uniforms.uFlash.value = v.flash;
    composer.render(dt);
  }
  requestAnimationFrame(frame);

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); opts.onLost && opts.onLost(); });

  return {
    state, setTheme,
    // 测试/调试用：暴露只读状态
    debug: () => ({ conv: v.conv, layout: state.layout, screen: curScreen, want: wantScreen, mixT, hovered: hovered && hovered.type.id, ptrActive: ptr.active, cards: cards.filter((c) => c.mesh.visible).length, dpr, bloom: bloom.enabled }),
  };
}
