/* amite TOP */
(() => {
  'use strict';

  /* ---------- 設定 ---------- */
  const CONFIG = {
    heroAutoplay: true,
    heroInterval: 6000,
    // Googleフォーム連携（amite お問い合わせ・ご相談フォーム）。
    // 項目IDは「事前入力したURL」から取得。質問を作り直すとIDが変わるので、その際は取り直す。
    googleForm: {
      action: 'https://docs.google.com/forms/d/e/1FAIpQLSfx67u6lJsdsnORJyS6KUsGzm1MZkaZCO_rFj7Bbx_7Rkcyaw/formResponse',
      entries: {
        name: 'entry.2041938747',     // お名前 *
        kana: 'entry.990902210',      // ふりがな *
        email: 'entry.1968972590',    // メールアドレス *
        tel: 'entry.1928932167',      // 電話番号
        contact: 'entry.489224955',   // ご連絡方法の希望 *（その他あり）
        kind: 'entry.1721913068',     // お問い合わせの種類 *（その他あり）
        size: 'entry.1684426241',     // ご希望のサイズ（現時点でのお考え）
        material: 'entry.1688603153', // お預かりする素材（現時点でのお考え）
        body: 'entry.709531915'       // お問い合わせ・ご相談内容
      },
      // フォーム側の選択肢に見えない文字（ゼロ幅スペース等）が含まれているもの。選択肢の文言と一字一句一致しないと記録されない。
      optionText: {
        'メールでのご連絡を希望': '\u200bメールでのご連絡を希望 \u200b',
        'まずは相談してみたい（ご質問・ご不安な点など）': '\u200bまずは相談してみたい（ご質問・ご不安な点など）'
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

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
  if (hero) {
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
  }

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
  if (modal) {
    const form = $('.contact-form', modal);
    const done = $('.modal-done', modal);
    const submitBtn = $('button[type=submit]', form);
    const fromNotice = $('[data-from-notice]', form);
    // 開いたボタンごとの案内文・初期選択・ご相談内容の先頭に付ける見出し
    const FROM = {
      funeral: { notice: '葬儀社さまからのお問い合わせとして承ります。', prefix: '【葬儀社さまからのお問い合わせ】' },
      booklet: {
        notice: '冊子『大切な人を亡くしたあとに起こることについて』のお申し込みとして承ります。お送り先のご住所を「お問い合わせ・ご相談内容」にご記入ください。',
        prefix: '【冊子のお申し込み】', kind: '資料を送ってほしい', needsAddress: true
      }
    };
    const FIELDS = ['name', 'kana', 'email', 'email2', 'tel', 'contact', 'kind', 'body', 'agree', 'submit'];
    const chipValue = {};
    let from = null;
    let lastFocus = null;

    const setChip = (group, value) => {
      chipValue[group] = value;
      $$(`[data-chips="${group}"] .chip`, form).forEach(c => {
        const on = c.dataset.value === value;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      const other = form.elements[group + 'Other'];
      if (other) other.hidden = value !== 'その他';
      setError(group, '');
    };
    $$('.chip', form).forEach(c => c.addEventListener('click', () => {
      const wrap = c.closest('[data-chips]');
      const group = wrap.dataset.chips;
      // 任意項目は、選択中のものをもう一度押すと解除できる
      const next = wrap.hasAttribute('data-optional') && chipValue[group] === c.dataset.value ? null : c.dataset.value;
      setChip(group, next);
      if (next === 'その他') form.elements[group + 'Other'].focus();
    }));

    function setError(name, msg) {
      const slot = $(`[data-err="${name}"]`, form);
      if (slot) slot.textContent = msg || '';
      const input = form.elements[name];
      if (input && input.type && input.type !== 'checkbox') input.classList.toggle('is-invalid', !!msg);
    }
    form.addEventListener('input', e => {
      const n = e.target.name;
      if (!n) return;
      setError(n.replace(/Other$/, ''), '');
      if (n === 'tel') setError('contact', '');
    });
    form.addEventListener('change', e => { if (e.target.name === 'agree') setError('agree', ''); });

    // 送信先が未設定のあいだは、送れたように見せず「準備中」と表示する
    const formReady = !!CONFIG.googleForm.action;
    const resetSubmit = () => {
      submitBtn.disabled = !formReady;
      submitBtn.textContent = formReady ? '送信する' : '準備中';
    };
    $('[data-form-notice]', form).hidden = formReady;

    const openModal = key => {
      lastFocus = document.activeElement;
      form.reset();
      FIELDS.forEach(n => setError(n, ''));
      ['contact', 'kind', 'size', 'material'].forEach(g => setChip(g, null));
      from = FROM[key] || null;
      fromNotice.hidden = !from;
      fromNotice.textContent = from ? from.notice : '';
      if (from && from.kind) setChip('kind', from.kind);
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
      if (!v.kana.trim()) err.kana = 'ふりがなをご入力ください。';
      if (!v.email.trim()) err.email = 'メールアドレスをご入力ください。';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) err.email = 'メールアドレスの形式をご確認ください。';
      if (!v.email2.trim()) err.email2 = '確認のため、もう一度ご入力ください。';
      else if (v.email2 !== v.email) err.email2 = 'メールアドレスが一致しません。';
      if (!v.contact) err.contact = 'ご連絡方法をお選びください。';
      else if (v.contact === 'その他' && !v.contactOther.trim()) err.contact = 'ご希望の連絡方法をご入力ください。';
      else if (v.contact === 'お電話でのご連絡を希望' && !v.tel.trim()) err.tel = 'お電話でのご連絡には、電話番号が必要です。';
      if (!v.kind) err.kind = 'お問い合わせの種類をお選びください。';
      else if (v.kind === 'その他' && !v.kindOther.trim()) err.kind = 'お問い合わせの内容をご入力ください。';
      if (from && from.needsAddress && !v.body.trim()) err.body = 'お送り先のご住所をご記入ください。';
      if (!v.agree) err.agree = 'プライバシーポリシーへの同意が必要です。';
      return err;
    };

    const sendToGoogleForm = async v => {
      const { action, entries: en, optionText } = CONFIG.googleForm;
      const data = new URLSearchParams();
      const put = (key, val) => { if (val) data.append(en[key], val); };
      const choice = (key, val, other) => {
        if (!val) return;
        if (val === 'その他') {
          data.append(en[key], '__other_option__');
          data.append(en[key] + '.other_option_response', other.trim());
        } else {
          data.append(en[key], optionText[val] || val);
        }
      };
      put('name', v.name.trim()); put('kana', v.kana.trim()); put('email', v.email.trim()); put('tel', v.tel.trim());
      choice('contact', v.contact, v.contactOther);
      choice('kind', v.kind, v.kindOther);
      choice('size', v.size); choice('material', v.material);
      put('body', (from ? from.prefix + '\n' : '') + v.body.trim());
      // Googleフォームは CORS を返さないため no-cors で送る。レスポンスの中身は読めない。
      await fetch(action, { method: 'POST', mode: 'no-cors', body: data });
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!formReady) return;
      const el = form.elements;
      const v = {
        name: el.name.value, kana: el.kana.value, email: el.email.value, email2: el.email2.value, tel: el.tel.value,
        contact: chipValue.contact, contactOther: el.contactOther.value,
        kind: chipValue.kind, kindOther: el.kindOther.value,
        size: chipValue.size, material: chipValue.material,
        body: el.body.value, agree: el.agree.checked
      };
      const err = validate(v);
      FIELDS.forEach(n => setError(n, err[n]));
      const firstBad = FIELDS.find(n => err[n]);
      if (firstBad) {
        const target = el[firstBad] || $(`[data-chips="${firstBad}"] .chip`, form);
        target.focus();
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
  }
})();
