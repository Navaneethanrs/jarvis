/* ============================================================
   JARVIS'26 — Hero 3D scene
   A floating phone mockup (mobile app development) orbited by
   dev/cloud/UI icons. Built with primitive geometry + a canvas
   texture for the "screen" — no external model files needed.
   ============================================================ */

(() => {
  const container = document.getElementById("hero-canvas");
  if (!container || typeof THREE === "undefined") return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    renderFallback();
    return;
  }
  if (!renderer) { renderFallback(); return; }

  function renderFallback() {
    const stage = document.querySelector(".hero-stage");
    if (!stage) return;
    stage.innerHTML =
      '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
      'background:linear-gradient(135deg,#9a4b24,#2c4a73);border-radius:28px;">' +
      '<span style="font-family:Space Grotesk,sans-serif;color:#fbf1e8;font-size:15px;letter-spacing:.03em;">JARVIS\'26</span></div>';
  }

  const COLORS = {
    rust: 0x9a4b24,
    rustLight: 0xd9895a,
    navy: 0x2c4a73,
    navyLight: 0x6f93bf,
    ink: 0x241811,
    cream: 0xf4e6d3,
  };

  const stage = container.parentElement;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.3, 9.2);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();

  // ---------- lights ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(COLORS.rustLight, 1.1);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(COLORS.navyLight, 0.9);
  rim.position.set(-5, -2, -4);
  scene.add(rim);
  const fill = new THREE.PointLight(COLORS.cream, 0.4, 20);
  fill.position.set(0, -3, 4);
  scene.add(fill);

  // ---------- root rig (for parallax) ----------
  const rig = new THREE.Group();
  scene.add(rig);

  // ---------- phone ----------
  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x, y + r);
    s.lineTo(x, y + h - r);
    s.quadraticCurveTo(x, y + h, x + r, y + h);
    s.lineTo(x + w - r, y + h);
    s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
    s.lineTo(x + w, y + r);
    s.quadraticCurveTo(x + w, y, x + w - r, y);
    s.lineTo(x + r, y);
    s.quadraticCurveTo(x, y, x, y + r);
    return s;
  }

  const phoneGroup = new THREE.Group();
  rig.add(phoneGroup);

  const bodyShape = roundedRectShape(2.4, 4.85, 0.42);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 12,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: COLORS.ink,
    metalness: 0.55,
    roughness: 0.35,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  phoneGroup.add(bodyMesh);

  // High-res crisp screen canvas texture (1024x2048 HD resolution)
  const cw = 1024, ch = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext("2d");
  const screenTexture = new THREE.CanvasTexture(canvas);
  screenTexture.minFilter = THREE.LinearMipmapLinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;
  screenTexture.generateMipmaps = true;
  if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  const iconColors = ["#d9895a", "#6f93bf", "#e8c39a", "#9fb6d3", "#c56a3b", "#3e5f8a"];
  const glyphs = ["</>", "☁", "⚙", "▣", "◆", "⌁", "▤", "✓"];

  let pulsePhase = 0;
  function drawScreen(t) {
    ctx.clearRect(0, 0, cw, ch);
    // bg
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, "#2c1f16");
    g.addColorStop(1, "#1a120c");
    ctx.fillStyle = g;
    roundRect(ctx, 0, 0, cw, ch, 110);
    ctx.fill();

    // status bar
    ctx.fillStyle = "rgba(244,230,211,0.9)";
    ctx.font = "600 52px Space Grotesk, sans-serif";
    ctx.fillText("9:41", 76, 130);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cw - 200 + i * 28, 100 - i * 10, 18, 20 + i * 10);
    }

    // header
    ctx.fillStyle = "#f4e6d3";
    ctx.font = "700 70px Space Grotesk, sans-serif";
    ctx.fillText("JARVIS'26", 76, 260);
    ctx.fillStyle = "rgba(244,230,211,0.65)";
    ctx.font = "600 38px JetBrains Mono, monospace";
    ctx.fillText("MADC CLUB · BUILD · WIN", 76, 325);

    // app grid
    const cols = 3, rows = 4, pad = 76, gap = 48;
    const cellW = (cw - pad * 2 - gap * (cols - 1)) / cols;
    const cellH = 226;
    const startY = 440;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * (cellW + gap);
        const y = startY + r * (cellH + gap);
        const active = Math.floor(t * 0.7) % (rows * cols) === idx;
        const glow = active ? 0.35 + 0.25 * Math.sin(pulsePhase * 4) : 0;
        ctx.fillStyle = iconColors[idx % iconColors.length];
        ctx.globalAlpha = 0.85 + glow;
        roundRect(ctx, x, y, cellW, cellH, 48);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(26,18,12,0.85)";
        ctx.font = "700 64px Space Grotesk, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(glyphs[idx % glyphs.length], x + cellW / 2, y + cellH / 2 + 24);
        ctx.textAlign = "left";
        idx++;
      }
    }

    // bottom nav
    const navY = ch - 220;
    ctx.fillStyle = "rgba(244,230,211,0.08)";
    roundRect(ctx, 76, navY, cw - 152, 140, 70);
    ctx.fill();
    const navDots = 4;
    for (let i = 0; i < navDots; i++) {
      const x = 76 + (cw - 152) * ((i + 0.5) / navDots);
      ctx.fillStyle = i === 1 ? "#d9895a" : "rgba(244,230,211,0.4)";
      ctx.beginPath();
      ctx.arc(x, navY + 70, i === 1 ? 20 : 14, 0, Math.PI * 2);
      ctx.fill();
    }

    screenTexture.needsUpdate = true;
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  drawScreen(0);

  // body extrude depth (0.34) + bevel on both caps (0.03 each side) = 0.40,
  // so after geometry.center() the front face sits at +0.20 — the screen
  // and notch must sit further forward than that or the bevel occludes them.
  const bodyFrontZ = 0.20;

  const screenGeo = new THREE.PlaneGeometry(2.08, 4.18);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = bodyFrontZ + 0.015;
  phoneGroup.add(screenMesh);

  // camera notch
  const notchGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
  const notchMat = new THREE.MeshStandardMaterial({ color: 0x0c0906, metalness: 0.7, roughness: 0.3 });
  const notch = new THREE.Mesh(notchGeo, notchMat);
  notch.rotation.x = Math.PI / 2;
  notch.position.set(0, 2.18, bodyFrontZ + 0.02);
  phoneGroup.add(notch);

  phoneGroup.rotation.y = -0.22;
  phoneGroup.rotation.x = 0.05;

  // ---------- orbiting icon builders ----------
  const orbitGroup = new THREE.Group();
  rig.add(orbitGroup);

  function makeGear(color) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.09, 8, 18),
      new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.4 })
    );
    g.add(ring);
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.4 })
      );
      tooth.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0);
      g.add(tooth);
    }
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: COLORS.ink, metalness: 0.5, roughness: 0.4 })
    );
    core.rotation.x = Math.PI / 2;
    g.add(core);
    return g;
  }

  function makeCloud(color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.65 });
    const puffs = [
      [0, 0, 0, 0.26],
      [0.26, 0.08, 0, 0.19],
      [-0.26, 0.06, 0, 0.19],
      [0.08, 0.2, 0, 0.17],
      [-0.1, 0.18, 0, 0.15],
    ];
    puffs.forEach(([x, y, z, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), mat);
      m.position.set(x, y, z);
      g.add(m);
    });
    return g;
  }

  function makeBars(color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.5 });
    [0.14, 0.24, 0.34].forEach((h, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.11, h, 0.11), mat);
      m.position.set((i - 1) * 0.16, h / 2 - 0.17, 0);
      g.add(m);
    });
    return g;
  }

  function makeAppTile(color) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.08),
      new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.5 })
    );
    g.add(base);
    const gridMat = new THREE.MeshStandardMaterial({ color: 0x1a120c, metalness: 0.2, roughness: 0.6 });
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const cell = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.19, 0.02), gridMat);
        cell.position.set((c - 0.5) * 0.24, (r - 0.5) * 0.24, 0.05);
        g.add(cell);
      }
    }
    return g;
  }

  function makeBracket(color) {
    // billboard plane with canvas glyph "</>"
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const cx = c.getContext("2d");
    cx.font = "700 56px JetBrains Mono, monospace";
    cx.fillStyle = "#" + color.toString(16).padStart(6, "0");
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("</>", 64, 68);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), mat);
    mesh.userData.billboard = true;
    return mesh;
  }

  function makeBell(color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.45 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8), mat);
    g.add(body);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16), mat);
    base.position.y = -0.13;
    g.add(base);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 10),
      new THREE.MeshStandardMaterial({ color: COLORS.rustLight, emissive: COLORS.rustLight, emissiveIntensity: 0.6 })
    );
    dot.position.set(0.16, 0.14, 0.14);
    g.add(dot);
    return g;
  }

  const orbiters = [
    { obj: makeGear(COLORS.navy), radius: 3.05, speed: 0.35, phase: 0, tilt: 0.25, yAmp: 0.35 },
    { obj: makeCloud(COLORS.cream), radius: 3.5, speed: -0.27, phase: 1.4, tilt: -0.15, yAmp: 0.5 },
    { obj: makeBars(COLORS.rustLight), radius: 2.85, speed: 0.42, phase: 3.0, tilt: 0.1, yAmp: 0.25 },
    { obj: makeAppTile(COLORS.rust), radius: 3.3, speed: -0.33, phase: 4.4, tilt: 0.3, yAmp: 0.4 },
    { obj: makeBracket(COLORS.navyLight), radius: 3.15, speed: 0.3, phase: 2.1, tilt: 0, yAmp: 0.45 },
    { obj: makeBell(COLORS.rustLight), radius: 2.7, speed: -0.4, phase: 5.2, tilt: -0.2, yAmp: 0.3 },
  ];
  orbiters.forEach((o) => orbitGroup.add(o.obj));

  // connecting lines from phone to 3 of the orbiters
  const lineMat = new THREE.LineBasicMaterial({ color: COLORS.rustLight, transparent: true, opacity: 0.28 });
  const linkedIdx = [0, 1, 3];
  const lines = linkedIdx.map(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(geo, lineMat);
    rig.add(line);
    return line;
  });

  // ---------- particles ----------
  const PCOUNT = 140;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PCOUNT * 3);
  for (let i = 0; i < PCOUNT; i++) {
    const r = 4.2 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    pPos[i * 3 + 2] = r * Math.cos(phi) * 0.6 - 1.5;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: COLORS.cream,
    size: 0.045,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ---------- parallax & rotation ----------
  let targetRotX = 0, targetRotY = 0;
  let curRotX = 0, curRotY = 0;

  function onPointerMove(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width - 0.5;
    const ny = (clientY - rect.top) / rect.height - 0.5;
    targetRotY = nx * 1.2;
    targetRotX = ny * 0.7;
  }
  if (!prefersReduced) {
    stage.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
    stage.addEventListener("touchmove", (e) => {
      if (e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    stage.addEventListener("mouseleave", () => { targetRotX = 0; targetRotY = 0; });
  }

  // ---------- resize ----------
  window.addEventListener("resize", size);
  if ("ResizeObserver" in window) {
    new ResizeObserver(size).observe(stage);
  }

  // ---------- animation loop ----------
  const clock = new THREE.Clock();
  const speedMul = prefersReduced ? 0.15 : 1;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime() * speedMul;
    pulsePhase = t;

    if (t % 0.12 < 0.02) drawScreen(t);

    // Enhanced wider rotation arc & dynamic pitch movement
    phoneGroup.rotation.y = -0.2 + Math.sin(t * 0.7) * 0.45;
    phoneGroup.rotation.x = 0.08 + Math.cos(t * 0.5) * 0.12;
    phoneGroup.position.y = Math.sin(t * 0.8) * 0.18;

    orbiters.forEach((o) => {
      const a = t * o.speed + o.phase;
      o.obj.position.set(
        Math.cos(a) * o.radius,
        Math.sin(a * 1.3) * o.yAmp,
        Math.sin(a) * o.radius * 0.55
      );
      o.obj.rotation.y = a * 1.5;
      o.obj.rotation.x = o.tilt;
      if (o.obj.userData.billboard) {
        o.obj.quaternion.copy(camera.quaternion);
      }
    });

    linkedIdx.forEach((idx, i) => {
      const pos = orbiters[idx].obj.position;
      const posAttr = lines[i].geometry.attributes.position;
      posAttr.setXYZ(0, 0, 0, 0.17);
      posAttr.setXYZ(1, pos.x, pos.y, pos.z);
      posAttr.needsUpdate = true;
    });

    particles.rotation.y = t * 0.05;

    curRotX += (targetRotX - curRotX) * 0.08;
    curRotY += (targetRotY - curRotY) * 0.08;
    rig.rotation.x = curRotX;
    rig.rotation.y = curRotY;

    renderer.render(scene, camera);
  }
  animate();
})();
