(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isActive = document.body.classList.contains("scene-active");

  const GRAV = isActive ? 0.55 : 0.34;
  const REST = 0.55;
  const JUMP_VY = isActive ? 8 : 5.5;

  window.__STAGE__ = window.__STAGE__ || {
    spriteX: -999,
    spriteY: 0,
    acornX: -999,
    acornY: 0,
    mouseX: -999,
    mouseY: -999,
    mouseActive: 0,
    isActive: isActive
  };

  const shibaPos = document.querySelector(".sprite-pos.shiba");
  const acornPos = document.querySelector(".sprite-pos.acorn");
  const acornPhysics = document.querySelector(".acorn-physics");

  if (!shibaPos || !acornPos) return;

  if (reduceMotion) {
    if (shibaPos) shibaPos.style.display = "none";
    if (acornPos) acornPos.style.display = "none";
    return;
  }

  let acornState = {
    y: 0,
    vy: 0,
    nextJumpAt: performance.now() + (isActive ? 900 : 2500)
  };

  function setVisibility(el, visible) {
    if (!el) return;
    el.style.visibility = visible ? "visible" : "hidden";
  }

  function tick(now) {
    if (acornPhysics) {
      acornState.vy += GRAV;
      acornState.y += acornState.vy;
      if (acornState.y >= 0) {
        acornState.y = 0;
        if (Math.abs(acornState.vy) > 0.6) {
          acornState.vy = -acornState.vy * REST;
        } else {
          acornState.vy = 0;
          if (now > acornState.nextJumpAt) {
            acornState.vy = -JUMP_VY * (0.85 + Math.random() * 0.25);
            acornState.nextJumpAt = now + (isActive ? 800 + Math.random() * 700 : 2000 + Math.random() * 2500);
          }
        }
      }
      acornPhysics.style.transform = "translateY(" + acornState.y.toFixed(2) + "px)";
    }

    const W = window.innerWidth;
    const shibaRect = shibaPos.getBoundingClientRect();
    const acornRect = acornPos.getBoundingClientRect();
    window.__STAGE__.spriteX = shibaRect.left + shibaRect.width / 2;
    window.__STAGE__.spriteY = shibaRect.bottom - 60;
    window.__STAGE__.acornX = acornRect.left + acornRect.width / 2;
    window.__STAGE__.acornY = acornRect.bottom - 60;

    setVisibility(shibaPos, window.__STAGE__.spriteX > -120 && window.__STAGE__.spriteX < W + 120);
    setVisibility(acornPos, window.__STAGE__.acornX > -120 && window.__STAGE__.acornX < W + 120);

    if (window.__STAGE__.mouseActive > 0) {
      window.__STAGE__.mouseActive = Math.max(0, window.__STAGE__.mouseActive - 0.012);
    }

    rafId = requestAnimationFrame(tick);
  }

  let rafId = null;

  function onMouseMove(e) {
    window.__STAGE__.mouseX = e.clientX;
    window.__STAGE__.mouseY = e.clientY;
    window.__STAGE__.mouseActive = Math.min(1, window.__STAGE__.mouseActive + 0.45);
  }
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches.length) {
      window.__STAGE__.mouseX = e.touches[0].clientX;
      window.__STAGE__.mouseY = e.touches[0].clientY;
      window.__STAGE__.mouseActive = Math.min(1, window.__STAGE__.mouseActive + 0.6);
    }
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId) {
      rafId = requestAnimationFrame(tick);
    }
  });

  rafId = requestAnimationFrame(tick);
})();
