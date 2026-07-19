(function () {
  const DATA_URL = 'data/works.json';

  function fallbackSvg() {
    return '<div class="thumb-fallback">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
      '<path d="M5 9 C 5 14 8 20 12 20 C 16 20 19 14 19 9 Z" fill="currentColor" fill-opacity="0.18"/>' +
      '<path d="M5 9 C 5 7.5 8 6.5 12 6.5 C 16 6.5 19 7.5 19 9 C 19 14 16 20 12 20 C 8 20 5 14 5 9 Z"/>' +
      '<path d="M12 6.5 L 12 3"/>' +
      '</svg></div>';
  }

  function buildCard(item) {
    const isPR = item.kind === 'PR';
    const card = document.createElement('a');
    card.className = 'url-card';
    card.href = item.url;
    card.target = '_blank';
    card.rel = 'noopener';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (item.image) {
      const probe = new Image();
      probe.onload = function () { thumb.style.backgroundImage = 'url("' + item.image + '")'; };
      probe.onerror = function () { thumb.innerHTML = fallbackSvg(); };
      probe.src = item.image;
    } else {
      thumb.innerHTML = fallbackSvg();
    }

    const cardBody = document.createElement('div');
    cardBody.className = 'body';

    const badge = document.createElement('span');
    badge.className = 'badge' + (isPR ? ' pr' : '');
    if (isPR) {
      badge.innerHTML =
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v3H3zM3 11h18v3H3zM3 17h12v3H3z"/></svg>' +
        'PR';
    } else {
      const isArticle = item.site && item.site.indexOf('article') >= 0;
      badge.innerHTML =
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 8 V 16 L 15 8 V 16"/></svg>' +
        'note ' + (isArticle ? 'article' : 'magazine');
    }

    const title = document.createElement('h3');
    title.textContent = item.title;

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = item.description || '';

    cardBody.appendChild(badge);
    cardBody.appendChild(title);
    cardBody.appendChild(desc);

    if (item.body) {
      const bodyLine = document.createElement('p');
      bodyLine.className = 'body-line';
      bodyLine.textContent = item.body;
      cardBody.appendChild(bodyLine);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML =
      '<svg class="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M14 3h7v7"/><path d="M21 3 10 14"/><path d="M21 14v7H3V3h7"/></svg>' +
      'note.com';
    cardBody.appendChild(meta);

    card.appendChild(thumb);
    card.appendChild(cardBody);
    return card;
  }

  async function loadData() {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('works data request failed: ' + response.status);
    }
    return response.json();
  }

  function showLoadError() {
    ['#magazine-list', '#pr-list'].forEach(function (selector) {
      const list = document.querySelector(selector);
      if (!list) return;
      const message = document.createElement('p');
      message.className = 'body-line';
      message.setAttribute('role', 'status');
      message.textContent = '掲載情報を読み込めませんでした。時間をおいて再度お試しください。';
      list.appendChild(message);
    });
  }

  async function render() {
    let data;
    try {
      data = await loadData();
    } catch (error) {
      console.error('[cards] ' + error.message);
      showLoadError();
      return;
    }

    const magList = document.querySelector('#magazine-list');
    if (magList && data.magazines) {
      data.magazines.forEach(function (item) { magList.appendChild(buildCard(item)); });
      const cnt = document.querySelector('[data-count="magazine"]');
      if (cnt) cnt.textContent = String(data.magazines.length).padStart(2, '0') + ' 件';
    }
    const prList = document.querySelector('#pr-list');
    if (prList && data.pr) {
      data.pr.forEach(function (item) { prList.appendChild(buildCard(item)); });
      const cnt = document.querySelector('[data-count="pr"]');
      if (cnt) cnt.textContent = String(data.pr.length).padStart(2, '0') + ' 件';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
