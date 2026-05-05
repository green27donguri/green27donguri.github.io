(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const sceneClass = document.body.classList.contains("scene-active") ? "active" : "calm";

  const COUNTS = {
    calm: { leaf: 8, acorn: 4 },
    active: { leaf: 16, acorn: 8 }
  };
  const SETTINGS = {
    calm: {
      wind: 0.18,
      windJitter: 0.05,
      leafFallSpeed: 0.16,
      acornGravity: 0.12,
      acornBounceRest: 0.45,
      mouseForce: 0.14,
      spriteForce: 0.18,
      spriteRadius: 200
    },
    active: {
      wind: 0.42,
      windJitter: 0.12,
      leafFallSpeed: 0.32,
      acornGravity: 0.22,
      acornBounceRest: 0.5,
      mouseForce: 0.26,
      spriteForce: 0.34,
      spriteRadius: 280
    }
  };
  const conf = SETTINGS[sceneClass];
  const counts = COUNTS[sceneClass];

  function setupCanvas() {
    let canvas = document.getElementById("particles-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "particles-canvas";
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    return canvas;
  }
  const canvas = setupCanvas();
  const ctx = canvas.getContext("2d");
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, GROUND_Y = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    GROUND_Y = H - 28;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeLeaf() {
    return {
      type: "leaf",
      x: rand(-40, W + 40),
      y: rand(-30, H * 0.7),
      vx: conf.wind * rand(0.6, 1.4),
      vy: conf.leafFallSpeed * rand(0.6, 1.3),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.018, 0.018) * (sceneClass === "active" ? 1.6 : 1),
      sway: rand(0, Math.PI * 2),
      swaySpeed: rand(0.006, 0.016),
      size: rand(3, 6),
      hueShift: rand(-12, 14),
      lightShift: rand(-8, 8),
      alpha: rand(0.08, 0.18)
    };
  }
  function makeAcorn(yStart, isInitial) {
    let initY;
    if (isInitial) {
      const r = Math.random();
      if (r < 0.35) {
        initY = rand(-2400, -200);
      } else if (r < 0.7) {
        initY = rand(-200, H * 0.4);
      } else {
        initY = rand(H * 0.4, H * 0.85);
      }
    } else {
      initY = yStart !== undefined ? yStart : rand(-300, -30);
    }
    return {
      type: "acorn",
      x: rand(0, W),
      y: initY,
      vx: rand(-0.2, 0.5) + conf.wind * 0.15,
      vy: rand(0.2, 0.9),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.045, 0.045),
      size: rand(3, 6),
      bounceCount: 0,
      maxBounces: 2 + Math.floor(Math.random() * 2),
      fading: isInitial && Math.random() < 0.18,
      alpha: rand(0.08, 0.18)
    };
  }

  const leaves = [];
  const acorns = [];
  for (let i = 0; i < counts.leaf; i++) leaves.push(makeLeaf());
  for (let i = 0; i < counts.acorn; i++) acorns.push(makeAcorn(undefined, true));

  function drawLeaf(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const s = p.size;
    const grad = ctx.createLinearGradient(-s, -s, s, s);
    grad.addColorStop(0, "hsla(" + (118 + p.hueShift) + ", 50%, " + (52 + p.lightShift) + "%, " + (p.alpha * 0.92) + ")");
    grad.addColorStop(1, "hsla(" + (108 + p.hueShift) + ", 60%, " + (32 + p.lightShift) + "%, " + (p.alpha * 0.92) + ")");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.85, -s * 0.55, s * 0.85, s * 0.55, 0, s);
    ctx.bezierCurveTo(-s * 0.85, s * 0.55, -s * 0.85, -s * 0.55, 0, -s);
    ctx.fill();
    ctx.strokeStyle = "rgba(40, 60, 40, " + (p.alpha * 0.55) + ")";
    ctx.lineWidth = Math.max(0.6, s * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.95);
    ctx.lineTo(0, s * 0.95);
    ctx.stroke();
    ctx.restore();
  }
  function drawAcorn(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const s = p.size;
    ctx.fillStyle = "hsla(35, 45%, 52%, " + (p.alpha * 0.95) + ")";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.5, s * 0.85, s * 1.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "hsla(108, 50%, 30%, " + (p.alpha * 0.96) + ")";
    ctx.beginPath();
    ctx.moveTo(-s * 1.05, -s * 0.4);
    ctx.bezierCurveTo(-s * 1.05, -s * 1.1, s * 1.05, -s * 1.1, s * 1.05, -s * 0.4);
    ctx.lineTo(-s * 1.05, -s * 0.4);
    ctx.fill();
    ctx.strokeStyle = "hsla(108, 50%, 22%, " + (p.alpha * 0.7) + ")";
    ctx.lineWidth = Math.max(0.5, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.05);
    ctx.lineTo(0, -s * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  function applyForces(p) {
    const stage = window.__STAGE__;
    if (!stage) return;

    const sx = stage.spriteX;
    const sy = stage.spriteY;
    if (sx > -100 && sx < W + 100) {
      const dx = p.x - sx;
      const dy = p.y - sy;
      const distSq = dx * dx + dy * dy;
      const r = conf.spriteRadius;
      if (distSq < r * r) {
        const dist = Math.sqrt(distSq) || 1;
        const force = (1 - dist / r) * conf.spriteForce;
        p.vx += (dx / dist) * force * 0.9;
        p.vy -= force * 0.5;
        if (p.rotSpeed !== undefined) p.rotSpeed += (Math.random() - 0.5) * force * 0.04;
      }
    }

    if (stage.mouseActive > 0.05) {
      const mx = stage.mouseX, my = stage.mouseY;
      const dx = p.x - mx;
      const dy = p.y - my;
      const distSq = dx * dx + dy * dy;
      const mr = 130;
      if (distSq < mr * mr) {
        const dist = Math.sqrt(distSq) || 1;
        const force = (1 - dist / mr) * conf.mouseForce * stage.mouseActive;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        if (p.rotSpeed !== undefined) p.rotSpeed += (Math.random() - 0.5) * force * 0.05;
      }
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < leaves.length; i++) {
      const p = leaves[i];
      applyForces(p);

      p.sway += p.swaySpeed;
      const swayX = Math.sin(p.sway) * 0.08;
      const swayY = Math.cos(p.sway * 0.7) * 0.06;

      p.vx += conf.wind * 0.012 + (Math.random() - 0.5) * conf.windJitter * 0.05 + swayX;
      p.vy += conf.leafFallSpeed * 0.014 + swayY;
      p.vx *= 0.985;
      p.vy *= 0.985;

      const rotCap = sceneClass === "active" ? 0.06 : 0.035;
      if (p.rotSpeed > rotCap) p.rotSpeed = rotCap;
      if (p.rotSpeed < -rotCap) p.rotSpeed = -rotCap;
      p.rotSpeed *= 0.995;

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      if (p.x > W + 40) p.x = -40;
      if (p.x < -40) p.x = W + 40;
      if (p.y > H + 40) {
        p.y = -30;
        p.x = rand(-40, W + 40);
      }
      if (p.y < -50) p.y = H + 40;

      drawLeaf(p);
    }

    for (let i = 0; i < acorns.length; i++) {
      const p = acorns[i];
      applyForces(p);

      const rotCap = 0.12;
      if (p.rotSpeed > rotCap) p.rotSpeed = rotCap;
      if (p.rotSpeed < -rotCap) p.rotSpeed = -rotCap;

      p.vy += conf.acornGravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      if (p.y >= GROUND_Y && !p.fading) {
        p.y = GROUND_Y;
        if (p.bounceCount < p.maxBounces && Math.abs(p.vy) > 1.0) {
          p.vy = -p.vy * conf.acornBounceRest;
          p.vx *= 0.7;
          p.bounceCount++;
          p.rotSpeed = (Math.random() - 0.5) * 0.1;
        } else {
          p.vy = 0;
          p.fading = true;
        }
      }

      if (p.fading) {
        p.alpha -= 0.025;
        if (p.alpha <= 0) {
          const fresh = makeAcorn(rand(-200, -40));
          acorns[i] = fresh;
          continue;
        }
      }

      if (p.x > W + 40) p.x = -40;
      if (p.x < -40) p.x = W + 40;

      drawAcorn(p);
    }

    rafId = requestAnimationFrame(step);
  }
  let rafId = null;

  if (reduceMotion) {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < Math.min(8, leaves.length); i++) drawLeaf(leaves[i]);
    for (let i = 0; i < Math.min(4, acorns.length); i++) drawAcorn(acorns[i]);
  } else {
    rafId = requestAnimationFrame(step);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId && !reduceMotion) {
      rafId = requestAnimationFrame(step);
    }
  });
})();
