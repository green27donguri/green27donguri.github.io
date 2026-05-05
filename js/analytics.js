(function () {
  const id = (window.SITE_CONFIG && window.SITE_CONFIG.ga4MeasurementId) || "";
  if (!id) return;
  if (!/^G-[A-Z0-9]+$/.test(id)) return;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id, { anonymize_ip: true });
})();
