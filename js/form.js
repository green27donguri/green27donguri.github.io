(function () {
  const FORMSPREE_URL = 'https://formspree.io/f/mlgzrkgn';

  const LABELS = {
    name: 'お名前',
    email: 'メールアドレス',
    site: '公式サイト・SNS',
    kind: '種別',
    body: '内容'
  };

  const KIND_LABELS = {
    'pr': 'PR・スポンサー記事',
    'creative': 'AIクリエイティブ依頼',
    'consult': '相談',
    'other': 'その他'
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setError(field, on) {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('is-error', !!on);
  }

  function readValues(form) {
    return {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      site: form.site.value.trim(),
      kind: form.kind.value,
      body: form.body.value.trim()
    };
  }

  function validate(form) {
    let ok = true;
    ['name', 'email', 'kind', 'body'].forEach(function (key) {
      const f = form[key];
      const empty = !f.value || !f.value.trim();
      setError(f, empty);
      if (empty) ok = false;
    });
    if (form.email.value.trim() && !EMAIL_RE.test(form.email.value.trim())) {
      setError(form.email, true);
      ok = false;
    }
    return ok;
  }

  function renderConfirm(values) {
    const list = $('#confirm-list');
    list.innerHTML = '';
    ['name', 'email', 'site', 'kind', 'body'].forEach(function (key) {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = LABELS[key];
      const value = document.createElement('span');
      value.className = 'value';
      let raw = values[key];
      if (key === 'kind') raw = KIND_LABELS[raw] || raw;
      if (!raw) {
        value.classList.add('empty');
        value.textContent = '（未入力）';
      } else {
        value.textContent = raw;
      }
      li.appendChild(label);
      li.appendChild(value);
      list.appendChild(li);
    });
  }

  function buildPayload(values) {
    const payload = new FormData();
    payload.append('お名前', values.name);
    payload.append('メールアドレス', values.email);
    payload.append('公式サイト・SNS', values.site);
    payload.append('種別', KIND_LABELS[values.kind] || values.kind);
    payload.append('内容', values.body);
    payload.append('_subject', '緑どんぐりサイト：お問い合わせ（' + (values.name || '') + '）');
    return payload;
  }

  function submitToFormspree(values) {
    return fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: buildPayload(values)
    });
  }

  function init() {
    const form = $('#contact-form');
    if (!form) return;
    const formScreen = form;
    const confirmScreen = $('#confirm-screen');
    const honeypot = form.querySelector('.honeypot input');
    let lastValues = null;

    $$('.field input, .field textarea, .field select', form).forEach(function (el) {
      el.addEventListener('input', function () { setError(el, false); });
      el.addEventListener('change', function () { setError(el, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (honeypot && honeypot.value) return;
      if (!validate(form)) {
        const firstError = form.querySelector('.field.is-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      lastValues = readValues(form);
      renderConfirm(lastValues);
      formScreen.classList.add('hidden');
      confirmScreen.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $('#confirm-back').addEventListener('click', function () {
      confirmScreen.classList.remove('active');
      formScreen.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $('#confirm-send').addEventListener('click', function () {
      if (!lastValues) return;
      const btn = this;
      btn.disabled = true;
      const original = btn.innerHTML;
      btn.textContent = '送信中…';
      submitToFormspree(lastValues)
        .then(function (res) {
          if (res.ok) {
            window.location.href = 'thanks.html';
          } else {
            btn.disabled = false;
            btn.innerHTML = original;
            alert('送信に失敗しました。時間をおいてもう一度お試しください。');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.innerHTML = original;
          alert('通信エラーが発生しました。時間をおいてもう一度お試しください。');
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
