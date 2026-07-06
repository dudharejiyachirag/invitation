function initRingScene() {
  const canvas = document.getElementById("ringCanvas");
  if (!canvas || !window.THREE || !isWebGLAvailable()) return;
  const THREE = window.THREE;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  // Flattering 3/4 view, ring reasonably large in frame.
  camera.position.set(0.05, 1.9, 6.2);
  camera.lookAt(0, 0.15, 0);

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Procedural studio environment (PMREM) ----------
     A tiny scene of soft emissive panels on a gradient backdrop, baked
     into an environment map. This is what gives the metal its specular
     streaks and the diamond its sparkle — no external HDR needed. */
  function buildEnvironment() {
    const envScene = new THREE.Scene();

    // Warm-ivory gradient dome (inside of a big sphere).
    const domeGeo = new THREE.SphereGeometry(30, 32, 16);
    const domeMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      vertexColors: true,
    });
    const top = new THREE.Color(0xfffaf0);
    const mid = new THREE.Color(0xf3e9d6);
    const bot = new THREE.Color(0x9d8f7a);
    const pos = domeGeo.attributes.position;
    const colors = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const h = (v.y + 1) / 2; // 0 bottom .. 1 top
      const c = new THREE.Color();
      if (h > 0.5) c.copy(mid).lerp(top, (h - 0.5) * 2);
      else c.copy(bot).lerp(mid, h * 2);
      colors.push(c.r, c.g, c.b);
    }
    domeGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    envScene.add(new THREE.Mesh(domeGeo, domeMat));

    // Bright soft-box panels — these become the crisp reflections/glints.
    function panel(w, h, x, y, z, intensity, color) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      envScene.add(m);
    }
    panel(9, 9, 0, 9, 8, 6.0, 0xffffff);   // big key softbox, upper front
    panel(7, 7, -10, 5, 3, 3.4, 0xfff2e0); // warm side fill
    panel(6, 6, 9, 3, -4, 2.6, 0xffffff);  // rim behind
    panel(5, 5, 4, -6, 6, 1.4, 0xffe9d0);  // low bounce
    panel(3, 8, -6, 2, -7, 2.2, 0xffffff); // vertical strip for streaks

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const rt = pmrem.fromScene(envScene, 0.02);

    // Clean up the source scene geometry/materials.
    envScene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    pmrem.dispose();
    return rt.texture;
  }

  const envMap = buildEnvironment();
  scene.environment = envMap;

  /* ---------- Materials ---------- */
  // Platinum / white gold.
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xeae7e1,
    metalness: 1.0,
    roughness: 0.18,
    envMap: envMap,
    envMapIntensity: 1.5,
  });

  // Center diamond — reflective, lightly transmissive, high IOR.
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.02,
    transmission: 0.35,
    thickness: 1.2,
    ior: 2.4,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMap: envMap,
    envMapIntensity: 2.6,
    iridescence: 0.28,
    iridescenceIOR: 1.6,
    specularIntensity: 1.0,
  });

  // Tiny pavé stones — cheaper, no transmission (perf on mobile).
  const paveMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.03,
    envMap: envMap,
    envMapIntensity: 3.0,
  });

  const ringGroup = new THREE.Group();

  /* ---------- Emerald / radiant cut center stone ----------
     Hand-built BufferGeometry: an octagonal table on top, crown facets
     angling out to a girdle, then a pavilion tapering to a point. */
  function buildEmeraldCut() {
    const geo = new THREE.BufferGeometry();
    const N = 8; // octagon
    const rTable = 0.52;   // table radius
    const rGirdle = 0.72;  // widest point
    const yTable = 0.34;   // table height
    const yGirdle = 0.0;   // girdle plane
    const yCulet = -0.86;  // point of pavilion

    const ringVerts = (radius, y) => {
      const arr = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + Math.PI / N;
        arr.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return arr;
    };

    const tableRing = ringVerts(rTable, yTable);
    const girdleRing = ringVerts(rGirdle, yGirdle);
    const tableCenter = new THREE.Vector3(0, yTable, 0);
    const culet = new THREE.Vector3(0, yCulet, 0);

    const positions = [];
    const pushTri = (a, b, c) => {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    };

    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      // Table (flat top) — fan from center.
      pushTri(tableCenter, tableRing[i], tableRing[j]);
      // Crown facets (table edge -> girdle).
      pushTri(tableRing[i], girdleRing[i], girdleRing[j]);
      pushTri(tableRing[i], girdleRing[j], tableRing[j]);
      // Pavilion facets (girdle -> culet point).
      pushTri(girdleRing[i], culet, girdleRing[j]);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals(); // faceted glints from distinct face normals
    return geo;
  }

  const diamond = new THREE.Mesh(buildEmeraldCut(), diamondMat);
  diamond.position.set(0, 0.92, 0);
  // Elongate slightly like a radiant cut and tilt the table toward camera.
  diamond.scale.set(0.82, 0.9, 0.62);
  diamond.rotation.x = 0.16;
  ringGroup.add(diamond);

  /* ---------- Prongs (four claws holding the stone) ---------- */
  const prongGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.62, 12);
  const prongPositions = [
    [0.42, 0.72, 0.3],
    [-0.42, 0.72, 0.3],
    [0.42, 0.72, -0.3],
    [-0.42, 0.72, -0.3],
  ];
  prongPositions.forEach((p) => {
    const prong = new THREE.Mesh(prongGeo, metalMat);
    prong.position.set(p[0], p[1], p[2]);
    // Lean each prong inward toward the stone.
    prong.rotation.z = -p[0] * 0.5;
    prong.rotation.x = p[2] * 0.6;
    ringGroup.add(prong);
    // Rounded tip.
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), metalMat);
    tip.position.set(p[0] * 1.06, p[1] + 0.3, p[2] * 1.06);
    ringGroup.add(tip);
  });

  /* ---------- Basket / setting head under the stone ---------- */
  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.24, 0.28, 8, 1, true),
    metalMat
  );
  basket.position.set(0, 0.5, 0);
  ringGroup.add(basket);

  /* ---------- The band ---------- */
  const bandGeo = new THREE.TorusGeometry(0.98, 0.11, 24, 120);
  const band = new THREE.Mesh(bandGeo, metalMat);
  band.rotation.x = Math.PI / 2; // lay it as a ring standing up
  band.position.y = -0.28;
  ringGroup.add(band);

  /* ---------- Pavé: tiny stones along the band shoulders ---------- */
  const paveGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const bandR = 0.98;
  const paveGroup = new THREE.Group();
  // Two rows across the upper front shoulders (toward the stone).
  for (let row = -1; row <= 1; row += 2) {
    for (let k = 0; k < 16; k++) {
      // Sweep an arc across the top-front of the band.
      const a = Math.PI / 2 + (k / 15 - 0.5) * 1.7; // centered on top
      const cx = Math.cos(a) * bandR;
      const cy = Math.sin(a) * bandR - 0.28;
      const s = new THREE.Mesh(paveGeo, paveMat);
      s.position.set(cx, cy, row * 0.09);
      // Push each bead just proud of the band tube surface.
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      s.position.x += nx * 0.11;
      s.position.y += ny * 0.11;
      paveGroup.add(s);
    }
  }
  ringGroup.add(paveGroup);

  // Lay the whole ring at a 3/4 tilt: table facing up-and-toward camera.
  ringGroup.rotation.x = -0.5;
  ringGroup.position.y = 0.05;
  scene.add(ringGroup);

  /* ---------- A little direct light for sharp prong/metal highlights ---------- */
  const key = new THREE.DirectionalLight(0xfff4e2, 1.1);
  key.position.set(2.5, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd98a98, 0.4);
  rim.position.set(-3, 1, -3);
  scene.add(rim);

  function resize() {
    const size = canvas.clientWidth || 260;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  const baseEnv = 2.6;
  function animate() {
    const t = clock.getElapsedTime();
    if (reduceMotion) {
      ringGroup.rotation.y = -0.5; // fixed flattering angle
    } else {
      // Calm oscillation instead of a full spin — premium, not busy.
      ringGroup.rotation.y = Math.sin(t * 0.35) * 0.55;
      ringGroup.position.y = 0.05 + Math.sin(t * 0.7) * 0.03;
      // Twinkle: gently pulse the diamond's env reflections.
      diamondMat.envMapIntensity =
        baseEnv + Math.sin(t * 2.1) * 0.5 + Math.sin(t * 5.3) * 0.25;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
