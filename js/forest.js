(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const isActive = document.body.classList.contains("scene-active");

  const COUNT = isMobile ? 5 : 9;

  let layer = document.querySelector(".forest-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "forest-layer";
    layer.setAttribute("aria-hidden", "true");
    const scene = document.querySelector(".scene");
    if (scene && scene.parentNode) {
      scene.parentNode.insertBefore(layer, scene.nextSibling);
    } else {
      document.body.insertBefore(layer, document.body.firstChild);
    }
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function treeShape() {
    return [
      '<svg viewBox="0 0 100 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">',
      '<path d="M46 200 L 48 110 L 52 110 L 54 200 Z" fill="currentColor"/>',
      '<ellipse cx="50" cy="68" rx="34" ry="40" fill="currentColor"/>',
      '<ellipse cx="28" cy="100" rx="22" ry="24" fill="currentColor"/>',
      '<ellipse cx="72" cy="100" rx="22" ry="24" fill="currentColor"/>',
      '<ellipse cx="50" cy="44" rx="24" ry="22" fill="currentColor"/>',
      '<ellipse cx="38" cy="132" rx="16" ry="14" fill="currentColor"/>',
      '<ellipse cx="62" cy="138" rx="16" ry="14" fill="currentColor"/>',
      '</svg>'
    ].join("");
  }

  const trees = [];
  for (let i = 0; i < COUNT; i++) {
    const tree = document.createElement("div");
    tree.className = "forest-tree";

    const isClose = Math.random() < 0.45;
    const heightVh = isClose ? rand(26, 38) : rand(14, 22);
    const widthVh = heightVh * 0.78;
    const opacity = isClose ? rand(0.08, 0.13) : rand(0.04, 0.07);
    const blur = isClose ? rand(0.4, 1.2) : rand(1.4, 2.6);
    const leftPct = (i / COUNT) * 100 + rand(-(40 / COUNT), 40 / COUNT);
    const swayDur = rand(isActive ? 3.5 : 5, isActive ? 7 : 9);
    const swayAmp = rand(0.7, 1.5);
    const swayDelay = rand(-3, 0);
    const bottom = isClose ? -2 : rand(0, 6);

    tree.style.height = heightVh + "vh";
    tree.style.width = widthVh + "vh";
    tree.style.left = leftPct + "%";
    tree.style.bottom = bottom + "vh";
    tree.style.opacity = String(opacity);
    tree.style.filter = "blur(" + blur.toFixed(1) + "px)";
    tree.style.setProperty("--sway-dur", swayDur + "s");
    tree.style.setProperty("--sway-amp", swayAmp + "deg");
    tree.style.animationDelay = swayDelay + "s";
    tree.style.zIndex = isClose ? "2" : "1";

    tree.innerHTML = treeShape();
    layer.appendChild(tree);

    trees.push({
      el: tree,
      leftPct: leftPct,
      baseAmp: swayAmp,
      currentAmp: swayAmp,
      isClose: isClose
    });
  }

  if (reduceMotion) return;

  function tickInteract() {
    const stage = window.__STAGE__;
    if (stage) {
      const W = window.innerWidth;
      const sx = stage.spriteX;
      const isOnscreen = sx > -100 && sx < W + 100;
      for (let i = 0; i < trees.length; i++) {
        const t = trees[i];
        const treeX = (t.leftPct / 100) * W;
        const dx = Math.abs(treeX - sx);
        const proxRadius = 200;
        if (isOnscreen && dx < proxRadius) {
          const force = 1 - dx / proxRadius;
          const target = t.baseAmp + force * (isActive ? 4 : 2.4);
          t.currentAmp = t.currentAmp * 0.85 + target * 0.15;
        } else {
          t.currentAmp = t.currentAmp * 0.96 + t.baseAmp * 0.04;
        }
        t.el.style.setProperty("--sway-amp", t.currentAmp.toFixed(2) + "deg");
      }
    }
    requestAnimationFrame(tickInteract);
  }
  requestAnimationFrame(tickInteract);
})();
