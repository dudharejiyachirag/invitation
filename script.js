/* ===========================================================
   Aayushi & Chirag - Royal Engagement Invitation
   Vanilla JS. Uses GSAP, Lenis, AOS, VanillaTilt, Three.js (CDN).
   =========================================================== */

(function () {
  "use strict";

  const WEDDING_DATE = new Date("2026-07-19T09:00:00+05:30").getTime();

  /* ---------------- Smooth Scroll (Lenis) ---------------- */
  document.documentElement.classList.add("has-lenis");
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
      normalizeWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------- GSAP ScrollTrigger sync ---------------- */
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
  }

  /* ---------------- AOS init ---------------- */
  if (window.AOS) {
    window.AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }

  /* ---------------- VanillaTilt init ---------------- */
  if (window.VanillaTilt) {
    window.VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1.02,
    });
  }

  /* ---------------- Page Loader ---------------- */
  window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");
    setTimeout(() => {
      if (loader) loader.classList.add("hide");
      const seal = document.getElementById("inviteSeal");
      if (seal) seal.classList.add("show");
    }, 1400);
  });

  /* ---------------- Invitation opening animation ---------------- */
  const openInviteBtn = document.getElementById("openInviteBtn");
  const inviteSeal = document.getElementById("inviteSeal");
  if (openInviteBtn && inviteSeal) {
    openInviteBtn.addEventListener("click", () => {
      inviteSeal.classList.add("opening");
      setTimeout(() => {
        inviteSeal.classList.remove("show", "opening");
      }, 1000);

      if (window.gsap) {
        window.gsap.fromTo(
          ".hero-content > *",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.3 }
        );
      }
    });
  }

  /* ---------------- Cursor Glow ---------------- */
  const cursorGlow = document.getElementById("cursorGlow");
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  /* ---------------- Mouse Parallax ---------------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  window.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    parallaxEls.forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-parallax")) || 0.03;
      const moveX = dx * strength * 100;
      const moveY = dy * strength * 100;
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });

  /* ---------------- Scroll cue ---------------- */
  const scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", () => {
      const target = document.getElementById("couple");
      if (target) {
        if (lenis) {
          lenis.scrollTo(target);
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  /* ---------------- Save the date -> scroll to countdown ---------------- */
  const saveDateBtn = document.getElementById("saveDateBtn");
  if (saveDateBtn) {
    saveDateBtn.addEventListener("click", () => {
      const target = document.getElementById("countdown");
      if (target) {
        if (lenis) lenis.scrollTo(target);
        else target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  /* ---------------- Button ripple ---------------- */
  document.querySelectorAll(".ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      circle.classList.add("ripple-circle");
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  });

  /* ---------------- Floating Petals (DOM based) ---------------- */
  const petalsLayer = document.getElementById("petalsLayer");
  function spawnPetal() {
    if (!petalsLayer) return;
    const petal = document.createElement("div");
    petal.classList.add("petal");
    const size = 8 + Math.random() * 14;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.8}px`;
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.setProperty("--drift", `${(Math.random() - 0.5) * 200}px`);
    const duration = 9 + Math.random() * 8;
    petal.style.animationDuration = `${duration}s`;
    petal.style.opacity = String(0.4 + Math.random() * 0.4);
    petalsLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000);
  }
  for (let i = 0; i < 10; i++) {
    setTimeout(() => spawnPetal(), i * 400);
  }
  setInterval(spawnPetal, 1400);

  /* ---------------- Countdown Timer ---------------- */
  const cdDays = document.getElementById("cdDays");
  const cdHours = document.getElementById("cdHours");
  const cdMinutes = document.getElementById("cdMinutes");
  const cdSeconds = document.getElementById("cdSeconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    let diff = WEDDING_DATE - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (cdDays) cdDays.textContent = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMinutes) cdMinutes.textContent = pad(minutes);
    if (cdSeconds) cdSeconds.textContent = pad(seconds);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------- Three.js Hero Petal Field ---------------- */
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  function initHeroScene() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || !window.THREE || !isWebGLAvailable()) return;

    const THREE = window.THREE;
    const heroSection = document.getElementById("hero");

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 12;

    function resize() {
      const w = heroSection.clientWidth;
      const h = heroSection.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = [0xd98a98, 0xd7b56d, 0xa8b89d, 0xfcfbf7];
    const count = 90;
    const geometry = new THREE.PlaneGeometry(0.35, 0.28);
    const group = new THREE.Group();
    const meshes = [];

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.3,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = {
        speed: 0.15 + Math.random() * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        driftX: (Math.random() - 0.5) * 0.004,
        offset: Math.random() * Math.PI * 2,
      };
      meshes.push(mesh);
      group.add(mesh);
    }
    scene.add(group);

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      meshes.forEach((mesh) => {
        mesh.position.y -= mesh.userData.speed * 0.02;
        mesh.position.x += Math.sin(t + mesh.userData.offset) * mesh.userData.driftX;
        mesh.rotation.x += mesh.userData.rotSpeed;
        mesh.rotation.y += mesh.userData.rotSpeed;
        if (mesh.position.y < -7) {
          mesh.position.y = 7;
        }
      });

      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  if (window.THREE) {
    initHeroScene();
  } else {
    window.addEventListener("load", initHeroScene);
  }

  /* ---------------- Three.js Rotating 3D Engagement Ring ---------------- */
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
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.15, 5.4);
    camera.lookAt(0, 0.15, 0);

    // Small procedural studio environment so the gold reflects light and the
    // diamond sparkles (biggest quality lever, no external files needed).
    function buildEnv() {
      const s = new THREE.Scene();
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(20, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0xf3eede, side: THREE.BackSide })
      );
      s.add(dome);
      function panel(w, h, color, intensity, x, y, z) {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
        );
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        s.add(m);
      }
      panel(10, 7, 0xffffff, 3.2, 0, 8, 6);
      panel(6, 9, 0xfff1e0, 2.0, -8, 3, 3);
      panel(6, 8, 0xffffff, 1.6, 7, 2, -3);
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const rt = pmrem.fromScene(s, 0.04);
      s.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      pmrem.dispose();
      return rt.texture;
    }
    const envMap = buildEnv();
    scene.environment = envMap;

    // Lights
    const keyLight = new THREE.DirectionalLight(0xfff2d6, 1.6);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xd98a98, 0.5);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const sparkleLight = new THREE.PointLight(0xffffff, 2.0, 12, 2);
    sparkleLight.position.set(0.6, 1.6, 2.0);
    scene.add(sparkleLight);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Warm gold band, facing the viewer (the classic ring silhouette).
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xd9b45f,
      metalness: 1,
      roughness: 0.18,
      envMap: envMap,
      envMapIntensity: 1.4,
    });
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 32, 140), bandMat);
    ringGroup.add(band);

    // Brilliant-cut diamond = crown (table) + pavilion (point), reflective and
    // sparkly. LOW transmission so it never renders as a milky blob.
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true, // solid icy gradient (below), so the stone is visible
      metalness: 0,
      roughness: 0.05,
      ior: 2.42,
      reflectivity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMap: envMap,
      envMapIntensity: 1.8,
      iridescence: 0.5,
      iridescenceIOR: 1.4,
      side: THREE.DoubleSide,
    });

    // Vertical diamond gradient painted onto the facets (diamond only).
    // h = 0 at the culet (bottom point), 1 at the table (flat top).
    const cCulet = new THREE.Color(0xd9c2f0);  // soft violet
    const cGirdle = new THREE.Color(0xcfe0ff); // icy blue
    const cTable = new THREE.Color(0xffffff);  // bright white
    function diamondGradient(h) {
      const c = new THREE.Color();
      if (h < 0.5) c.copy(cCulet).lerp(cGirdle, h / 0.5);
      else c.copy(cGirdle).lerp(cTable, (h - 0.5) / 0.5);
      return c;
    }
    function paintGradient(geo, yMin, yMax, hMin, hMax) {
      const pos = geo.attributes.position;
      const colors = [];
      for (let i = 0; i < pos.count; i++) {
        const f = (pos.getY(i) - yMin) / (yMax - yMin);
        const h = Math.max(0, Math.min(1, hMin + f * (hMax - hMin)));
        const c = diamondGradient(h);
        colors.push(c.r, c.g, c.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    const diamond = new THREE.Group();
    // Crown: local y -0.09 (girdle) .. +0.09 (table)  => gradient h 0.5 .. 1.0
    const crownGeo = new THREE.CylinderGeometry(0.17, 0.33, 0.18, 8);
    paintGradient(crownGeo, -0.09, 0.09, 0.5, 1.0);
    const crown = new THREE.Mesh(crownGeo, diamondMat);
    crown.position.y = 0.16;
    diamond.add(crown);
    // Pavilion: local y -0.21 (culet) .. +0.21 (girdle)  => gradient h 0.0 .. 0.5
    const pavilionGeo = new THREE.ConeGeometry(0.33, 0.42, 8);
    paintGradient(pavilionGeo, -0.21, 0.21, 0.0, 0.5);
    const pavilion = new THREE.Mesh(pavilionGeo, diamondMat);
    pavilion.rotation.x = Math.PI; // apex points down (culet)
    pavilion.position.y = -0.14;
    diamond.add(pavilion);
    diamond.position.set(0, 1.05, 0);
    diamond.rotation.y = Math.PI / 8;
    ringGroup.add(diamond);

    // Four slim prongs gripping the stone.
    const prongGeo = new THREE.CylinderGeometry(0.028, 0.036, 0.34, 10);
    [[0.22, 0.16], [-0.22, 0.16], [0.22, -0.16], [-0.22, -0.16]].forEach(function (p) {
      const prong = new THREE.Mesh(prongGeo, bandMat);
      prong.position.set(p[0], 0.98, p[1]);
      prong.rotation.z = -p[0] * 0.5;
      prong.rotation.x = p[1] * 0.5;
      ringGroup.add(prong);
    });

    function resize() {
      const size = canvas.clientWidth || 260;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      ringGroup.rotation.y = t * 0.35; // slow, elegant spin
      ringGroup.rotation.x = -0.15 + Math.sin(t * 0.5) * 0.04; // slight tilt into the ring
      ringGroup.position.y = 0.05 + Math.sin(t * 0.8) * 0.03;
      diamondMat.envMapIntensity = 1.7 + Math.max(0, Math.sin(t * 2.2)) * 0.7; // twinkle
      sparkleLight.intensity = 1.6 + Math.max(0, Math.sin(t * 2.6)) * 1.2;
      renderer.render(scene, camera);
    }
    animate();
  }

  if (window.THREE) {
    initRingScene();
  } else {
    window.addEventListener("load", initRingScene);
  }

  /* ---------------- Three.js Floating Orb Field (Countdown) ---------------- */
  function initOrbScene() {
    const canvas = document.getElementById("orbCanvas");
    const countdownSection = document.getElementById("countdown");
    if (!canvas || !countdownSection || !window.THREE || !isWebGLAvailable()) return;

    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 9;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const pointLight = new THREE.PointLight(0xd7b56d, 2, 20);
    pointLight.position.set(2, 3, 5);
    scene.add(pointLight);

    function resize() {
      const w = countdownSection.clientWidth;
      const h = countdownSection.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const geometries = [
      new THREE.IcosahedronGeometry(0.22, 0),
      new THREE.TorusGeometry(0.18, 0.06, 12, 24),
      new THREE.OctahedronGeometry(0.2, 0),
    ];
    const colors = [0xd7b56d, 0xd98a98, 0xa8b89d, 0xfcfbf7];
    const count = 26;
    const group = new THREE.Group();
    const orbs = [];

    for (let i = 0; i < count; i++) {
      const geometry = geometries[i % geometries.length];
      const material = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 6
      );
      mesh.userData = {
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      };
      orbs.push(mesh);
      group.add(mesh);
    }
    scene.add(group);

    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      orbs.forEach((mesh) => {
        mesh.position.y += Math.sin(t * mesh.userData.speed + mesh.userData.offset) * 0.004;
        mesh.rotation.x += mesh.userData.rotSpeed;
        mesh.rotation.y += mesh.userData.rotSpeed * 1.3;
      });
      group.rotation.y = Math.sin(t * 0.08) * 0.15;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  if (window.THREE) {
    initOrbScene();
  } else {
    window.addEventListener("load", initOrbScene);
  }

  /* ---------------- GSAP scroll-triggered reveals (extra polish) ---------------- */
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.utils.toArray(".detail-card, .journey-card").forEach((el) => {
      window.gsap.fromTo(
        el,
        { y: 40, opacity: 0.001 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
          },
        }
      );
    });
  }
})();
