(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const isActive = document.body.classList.contains("scene-active");

  const TIER_COUNTS = isMobile
    ? { far: 4, mid: 3, near: 2 }
    : { far: 7, mid: 5, near: 4 };

  let layer = document.querySelector(".cloud-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "cloud-layer";
    layer.setAttribute("aria-hidden", "true");
    const forest = document.querySelector(".forest-layer");
    const scene = document.querySelector(".scene");
    const ref = forest || scene;
    if (ref && ref.parentNode) {
      ref.parentNode.insertBefore(layer, ref.nextSibling);
    } else {
      document.body.insertBefore(layer, document.body.firstChild);
    }
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function cloudShape(seed) {
    const variants = [
      [
        '<ellipse cx="48" cy="62" rx="38" ry="28" fill="currentColor"/>',
        '<ellipse cx="100" cy="52" rx="52" ry="34" fill="currentColor"/>',
        '<ellipse cx="155" cy="62" rx="40" ry="28" fill="currentColor"/>',
        '<ellipse cx="78" cy="40" rx="32" ry="22" fill="currentColor"/>',
        '<ellipse cx="128" cy="38" rx="30" ry="22" fill="currentColor"/>'
      ],
      [
        '<ellipse cx="42" cy="60" rx="34" ry="26" fill="currentColor"/>',
        '<ellipse cx="92" cy="58" rx="46" ry="32" fill="currentColor"/>',
        '<ellipse cx="148" cy="62" rx="38" ry="26" fill="currentColor"/>',
        '<ellipse cx="68" cy="42" rx="26" ry="20" fill="currentColor"/>',
        '<ellipse cx="118" cy="34" rx="34" ry="22" fill="currentColor"/>',
        '<ellipse cx="170" cy="44" rx="22" ry="18" fill="currentColor"/>'
      ],
      [
        '<ellipse cx="55" cy="58" rx="40" ry="30" fill="currentColor"/>',
        '<ellipse cx="115" cy="55" rx="55" ry="34" fill="currentColor"/>',
        '<ellipse cx="92" cy="36" rx="34" ry="22" fill="currentColor"/>',
        '<ellipse cx="155" cy="38" rx="26" ry="20" fill="currentColor"/>'
      ]
    ];
    const v = variants[seed % variants.length];
    return '<svg viewBox="0 0 200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' + v.join("") + '</svg>';
  }

  const TIERS = {
    far:  { w: [60, 110],   topVh: [2, 14], opacity: [0.10, 0.18], blur: [1.2, 2.4], dur: [140, 240] },
    mid:  { w: [120, 180],  topVh: [5, 22], opacity: [0.18, 0.28], blur: [0.6, 1.5], dur: [85, 150] },
    near: { w: [200, 320],  topVh: [10, 28], opacity: [0.26, 0.40], blur: [0.0, 0.7], dur: [50, 95] }
  };

  let cloudIndex = 0;
  function makeCloud(depth) {
    const tier = TIERS[depth];
    const cloud = document.createElement("div");
    cloud.className = "cloud-tile cloud-" + depth;

    const w = rand(tier.w[0], tier.w[1]);
    const topVh = rand(tier.topVh[0], tier.topVh[1]);
    const opacity = rand(tier.opacity[0], tier.opacity[1]);
    const blur = rand(tier.blur[0], tier.blur[1]);
    const baseDur = rand(tier.dur[0], tier.dur[1]);
    const dur = isActive ? baseDur * 0.55 : baseDur;
    const delay = -rand(0, dur);

    cloud.style.width = w.toFixed(0) + "px";
    cloud.style.height = (w * 0.5).toFixed(0) + "px";
    cloud.style.top = topVh.toFixed(1) + "vh";
    cloud.style.opacity = opacity.toFixed(3);
    cloud.style.filter = "blur(" + blur.toFixed(2) + "px)";

    if (reduceMotion) {
      cloud.style.animation = "none";
      cloud.style.transform = "translateX(" + rand(5, 90).toFixed(1) + "vw)";
    } else {
      cloud.style.animationDuration = dur.toFixed(1) + "s";
      cloud.style.animationDelay = delay.toFixed(1) + "s";
    }

    cloud.innerHTML = cloudShape(cloudIndex++);
    return cloud;
  }

  ["far", "mid", "near"].forEach(function (depth) {
    const n = TIER_COUNTS[depth];
    for (let i = 0; i < n; i++) {
      layer.appendChild(makeCloud(depth));
    }
  });
})();
