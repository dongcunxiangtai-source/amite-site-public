/* amite TOP */
(() => {
  'use strict';

  /* ---------- 設定 ---------- */
  const CONFIG = {
    heroAutoplay: true,
    heroInterval: 6000,
    // Googleフォーム連携。action と entries を埋めると、送信内容がGoogleフォームに記録される。
    // action: 'https://docs.google.com/forms/d/e/<フォームID>/formResponse'
    // entries: 各項目に対応する 'entry.123456789'。取得方法は README.md を参照。
    googleForm: {
      action: '',
      entries: {
        type: '',   // ご相談の区分（ご遺族の方 / 葬儀社の方 / その他）
        name: '',   // お名前
        email: '',  // メールアドレス
        tel: '',    // 電話番号
        home: '',   // ご紹介元の葬儀社名
        motif: '',  // 気になるモチーフ（鳥 / 花 / 星 / まだ決めていない）
        body: ''    // ご相談内容
      }
    }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ヘッダー ---------- */
  const header = $('.site-header');
  const menuBtn = $('.menu-btn');
  const nav = $('#global-nav');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 120);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));

  const scrollToId = id => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = header.getBoundingClientRect().height + 8;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); setMenu(false); scrollToId(a.dataset.scroll);
  }));
  $$('[data-to-top]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); setMenu(false); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  $$('[data-noop]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  /* ---------- ヒーロー ---------- */
  const hero = $('.hero');
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  const slideNo = $('[data-slide-no]');
  const progBar = $('.hero-prog-bar');
  let slide = 0, timer = null;

  const runProgress = () => {
    progBar.style.transition = 'none';
    progBar.style.width = '0%';
    if (!CONFIG.heroAutoplay) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      progBar.style.transition = `width ${CONFIG.heroInterval}ms linear`;
      progBar.style.width = '100%';
    }));
  };
  const goSlide = i => {
    slide = i;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
    dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
    slideNo.textContent = String(i + 1).padStart(2, '0');
    runProgress();
  };
  const startTimer = () => {
    clearInterval(timer);
    if (!CONFIG.heroAutoplay) return;
    timer = setInterval(() => goSlide((slide + 1) % slides.length), CONFIG.heroInterval);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => { goSlide(i); startTimer(); }));
  requestAnimationFrame(() => { hero.classList.add('is-loaded'); runProgress(); });
  startTimer();

  /* ---------- スクロール表示 ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- 開閉パネル（コンセプト／葬儀社の方へ） ---------- */
  const setPanel = (trigger, open) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    panel.classList.toggle('is-open', open);
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    trigger.setAttribute('aria-expanded', String(open));
    trigger.textContent = open ? trigger.dataset.labelClose : trigger.dataset.labelOpen;
  };
  $$('[data-toggle]').forEach(t => {
    let hoverOpenedAt = 0;
    t.addEventListener('click', e => {
      e.preventDefault();
      // ホバーで開いた直後のクリックで閉じてしまわないようにする
      if (Date.now() - hoverOpenedAt < 800) return;
      setPanel(t, t.getAttribute('aria-expanded') !== 'true');
    });
    if (t.hasAttribute('data-hover-open')) {
      t.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(hover: hover)').matches || t.getAttribute('aria-expanded') === 'true') return;
        hoverOpenedAt = Date.now();
        setPanel(t, true);
      });
    }
  });
  window.addEventListener('resize', () => {
    $$('.disclosure-panel.is-open').forEach(p => { p.style.maxHeight = p.scrollHeight + 'px'; });
  });

  /* ---------- Collection ---------- */
  const motifBtns = $$('.motif-btn');
  const motifImgs = $$('.motif-img');
  motifBtns.forEach((btn, i) => btn.addEventListener('click', () => {
    motifBtns.forEach((b, j) => {
      b.classList.toggle('is-active', j === i);
      b.setAttribute('aria-selected', String(j === i));
      document.getElementById(b.getAttribute('aria-controls')).hidden = j !== i;
    });
    motifImgs.forEach((img, j) => img.classList.toggle('is-active', j === i));
  }));

  /* ---------- Process ---------- */
  const steps = $$('.step');
  const pickStep = i => steps.forEach((s, j) => {
    s.classList.toggle('is-active', j === i);
    s.classList.toggle('is-done', j <= i);
    s.setAttribute('aria-selected', String(j === i));
    document.getElementById(s.getAttribute('aria-controls')).hidden = j !== i;
  });
  steps.forEach((s, i) => {
    s.addEventListener('click', () => pickStep(i));
    s.addEventListener('mouseenter', () => pickStep(i));
  });

  /* ---------- お問い合わせ ---------- */
  const modal = $('#contact-modal');
  const form = $('.contact-form', modal);
  const done = $('.modal-done', modal);
  const submitBtn = $('button[type=submit]', form);
  const familyOnly = $('[data-family-only]', form);
  const DEFAULTS = { type: 'ご遺族の方', motif: 'まだ決めていない' };
  const chipValue = {};
  let lastFocus = null;

  const setChip = (group, value) => {
    chipValue[group] = value;
    $$(`[data-chips="${group}"] .chip`, form).forEach(c => {
      const on = c.dataset.value === value;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    if (group === 'type') familyOnly.hidden = value !== 'ご遺族の方';
  };
  $$('.chip', form).forEach(c => c.addEventListener('click', () => setChip(c.closest('[data-chips]').dataset.chips, c.dataset.value)));

  const setError = (name, msg) => {
    const slot = $(`[data-err="${name}"]`, form);
    if (slot) slot.textContent = msg || '';
    const input = form.elements[name];
    if (input && input.type !== 'checkbox') input.classList.toggle('is-invalid', !!msg);
  };
  form.addEventListener('input', e => { if (e.target.name) setError(e.target.name, ''); });
  form.addEventListener('change', e => { if (e.target.name === 'agree') setError('agree', ''); });

  // 送信先が未設定のあいだは、送れたように見せず「準備中」と表示する
  const formReady = !!CONFIG.googleForm.action;
  const resetSubmit = () => {
    submitBtn.disabled = !formReady;
    submitBtn.textContent = formReady ? '送信する' : '準備中';
  };
  $('[data-form-notice]', form).hidden = formReady;

  const openModal = type => {
    lastFocus = document.activeElement;
    form.reset();
    ['name', 'email', 'email2', 'body', 'agree', 'submit'].forEach(n => setError(n, ''));
    setChip('type', type || DEFAULTS.type);
    setChip('motif', DEFAULTS.motif);
    form.hidden = false; done.hidden = true;
    resetSubmit();
    setMenu(false);
    document.body.classList.add('is-locked');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.scrollTop = 0;
    setTimeout(() => form.elements.name.focus({ preventScroll: true }), 50);
  };
  const closeModal = () => {
    document.body.classList.remove('is-locked');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  $$('[data-open-contact]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openModal(el.dataset.openContact); }));
  $$('[data-close]', modal).forEach(el => el.addEventListener('click', closeModal));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeModal();
      else setMenu(false);
    }
    if (e.key === 'Tab' && modal.classList.contains('is-open')) {
      const f = $$('button, input, textarea, a[href]', modal).filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  const validate = v => {
    const err = {};
    if (!v.name.trim()) err.name = 'お名前をご入力ください。';
    if (!v.email.trim()) err.email = 'メールアドレスをご入力ください。';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) err.email = 'メールアドレスの形式をご確認ください。';
    if (!v.email2.trim()) err.email2 = '確認のため、もう一度ご入力ください。';
    else if (v.email2 !== v.email) err.email2 = 'メールアドレスが一致しません。';
    if (!v.body.trim()) err.body = 'ご相談内容をご入力ください。';
    if (!v.agree) err.agree = 'プライバシーポリシーへの同意が必要です。';
    return err;
  };

  const sendToGoogleForm = async v => {
    const { action, entries } = CONFIG.googleForm;
    const data = new URLSearchParams();
    Object.entries(entries).forEach(([key, entry]) => { if (entry && v[key] != null) data.append(entry, v[key]); });
    // Googleフォームは CORS を返さないため no-cors で送る。レスポンスの中身は読めない。
    await fetch(action, { method: 'POST', mode: 'no-cors', body: data });
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const el = form.elements;
    const v = {
      type: chipValue.type, motif: chipValue.motif,
      name: el.name.value, email: el.email.value, email2: el.email2.value,
      tel: el.tel.value, home: chipValue.type === 'ご遺族の方' ? el.home.value : '',
      body: el.body.value, agree: el.agree.checked
    };
    const err = validate(v);
    ['name', 'email', 'email2', 'body', 'agree', 'submit'].forEach(n => setError(n, err[n]));
    if (!formReady) return;
    if (Object.keys(err).length) {
      const firstBad = ['name', 'email', 'email2', 'body', 'agree'].find(n => err[n]);
      el[firstBad].focus();
      return;
    }
    submitBtn.disabled = true; submitBtn.textContent = '送信中…';
    try {
      await sendToGoogleForm(v);
      form.hidden = true; done.hidden = false;
      $('.btn-outline', done).focus({ preventScroll: true });
    } catch (ex) {
      setError('submit', '送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。');
      resetSubmit();
    }
  });
})();
