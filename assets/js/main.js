/* =========================================================================
   34th Standard — site behaviour
   Vanilla JS, no dependencies. Every effect degrades gracefully.
   ========================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     1. Language  (JA / EN)
     The markup carries both languages; CSS shows one based on <html lang>.
     --------------------------------------------------------------------- */
  var LANG_KEY = 'std34-lang';

  function metaFor(lang) {
    var el = document.querySelector('[data-title-' + lang + ']');
    return el;
  }

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

    // <title> and description swap
    var t = document.body.getAttribute('data-title-' + lang);
    var d = document.body.getAttribute('data-desc-' + lang);
    if (t) document.title = t;
    if (d) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', d);
    }

    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  var stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
  if (!stored) {
    var nav = (navigator.language || 'ja').toLowerCase();
    stored = nav.indexOf('ja') === 0 ? 'ja' : 'en';
  }
  applyLang(stored);

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.lang button');
    if (!b) return;
    applyLang(b.dataset.lang);
  });

  /* ---------------------------------------------------------------------
     2. Loader
     --------------------------------------------------------------------- */
  var loader = document.querySelector('.loader');
  if (loader) {
    var hide = function () {
      setTimeout(function () { loader.classList.add('is-done'); }, reduced ? 0 : 620);
    };
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    // safety net — never trap the page behind the loader
    setTimeout(function () { loader.classList.add('is-done'); }, 3500);
  }

  /* ---------------------------------------------------------------------
     2b. Hero film
     Loaded from JS so we can pick the right cut for the screen and skip it
     entirely for reduced-motion or save-data. The still image underneath is
     the fallback, so nothing here is load-bearing.
     --------------------------------------------------------------------- */
  var hv = document.querySelector('.hero__vid');
  if (hv) {
    var conn = navigator.connection || {};
    var lean = reduced || conn.saveData === true ||
               /2g/.test(String(conn.effectiveType || ''));

    if (lean) {
      hv.remove();
    } else {
      var small = window.matchMedia('(max-width: 700px)').matches;
      var src = (small && hv.dataset.srcSm) ? hv.dataset.srcSm : hv.dataset.src;
      var source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      hv.appendChild(source);
      hv.load();

      hv.addEventListener('playing', function () {
        hv.classList.add('is-playing');
      });
      hv.addEventListener('error', function () { hv.remove(); }, true);

      var tryPlay = function () {
        var p = hv.play();
        if (p && p.catch) p.catch(function () { /* autoplay refused — keep the still */ });
      };
      if (hv.readyState >= 2) tryPlay();
      else hv.addEventListener('canplay', tryPlay, { once: true });

      // iOS pauses media when the tab is backgrounded; resume on return
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && hv.paused) tryPlay();
      });
    }
  }

  /* ---------------------------------------------------------------------
     3. Header state
     --------------------------------------------------------------------- */
  var hdr = document.querySelector('.hdr');
  if (hdr && !hdr.classList.contains('hdr--solid')) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     4. Mobile drawer
     --------------------------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  if (burger && drawer) {
    var links = drawer.querySelectorAll('.drawer__nav a');
    var setOpen = function (open) {
      burger.classList.toggle('is-open', open);
      drawer.classList.toggle('is-open', open);
      if (hdr) hdr.classList.toggle('is-nav', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      links.forEach(function (a, i) {
        a.style.transitionDelay = open ? (0.22 + i * 0.07) + 's' : '0s';
      });
    };
    burger.addEventListener('click', function () {
      setOpen(!drawer.classList.contains('is-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
     5. Reveal on scroll
     --------------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.rv, .tl li, .mapwrap');
  if (!('IntersectionObserver' in window) || reduced) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     6. Count-up numbers   data-count="12" [data-decimals]
     --------------------------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    if (isNaN(target)) return;
    if (reduced) { el.textContent = target.toFixed(dec); return; }
    var dur = 1500, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(countUp);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          countUp(en.target);
          cio.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------------------------------------------------------------------
     7. Timeline progress line
     --------------------------------------------------------------------- */
  var tl = document.querySelector('.tl');
  if (tl) {
    var fill = document.createElement('span');
    fill.className = 'tl__fill';
    tl.appendChild(fill);
    var paint = function () {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.72 - r.top) / r.height;
      fill.style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
    };
    paint();
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
  }

  /* ---------------------------------------------------------------------
     8. Live clocks — Hiroshima / Los Angeles
     --------------------------------------------------------------------- */
  function tick() {
    var zones = [
      { sel: '[data-clock="jp"]', tz: 'Asia/Tokyo' },
      { sel: '[data-clock="us"]', tz: 'America/Los_Angeles' }
    ];
    zones.forEach(function (z) {
      var nodes = document.querySelectorAll(z.sel);
      if (!nodes.length) return;
      var s;
      try {
        s = new Intl.DateTimeFormat('en-GB', {
          timeZone: z.tz, hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date());
      } catch (e) { s = '--:--'; }
      nodes.forEach(function (n) { n.textContent = s; });
    });
  }
  if (document.querySelector('[data-clock]')) {
    tick();
    setInterval(tick, 15000);
  }

  /* ---------------------------------------------------------------------
     9. Contact form
     Posts to the endpoint in data-endpoint when one is configured;
     otherwise falls back to the visitor's mail client so the form is
     never a dead end.
     --------------------------------------------------------------------- */
  var form = document.querySelector('form[data-contact]');
  if (form) {
    var status = form.querySelector('[data-status]');
    var say = function (ja, en, ok) {
      if (!status) return;
      status.innerHTML =
        '<span class="ja-only">' + ja + '</span><span class="en-only">' + en + '</span>';
      status.style.color = ok ? '#1E7A4C' : '#B03A3A';
    };

    form.addEventListener('submit', function (e) {
      var endpoint = form.dataset.endpoint || '';
      var isConfigured = endpoint.indexOf('http') === 0;

      if (isConfigured) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        say('送信しています…', 'Sending…', true);
        fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        }).then(function (r) {
          if (!r.ok) throw new Error('bad status');
          form.reset();
          say('送信しました。担当者より折り返しご連絡いたします。',
              'Thank you. We will be in touch shortly.', true);
        }).catch(function () {
          say('送信に失敗しました。お手数ですがお電話またはメールでご連絡ください。',
              'Something went wrong. Please contact us by phone or email instead.', false);
        }).finally(function () {
          if (btn) btn.disabled = false;
        });
        return;
      }

      // no endpoint configured → hand off to the mail client
      e.preventDefault();
      var v = function (n) {
        var f = form.elements[n];
        return f ? String(f.value || '').trim() : '';
      };
      var lang = document.documentElement.getAttribute('lang');
      var subject = (lang === 'en' ? '[Website enquiry] ' : '【お問い合わせ】') + (v('company') || v('name'));
      var lines = lang === 'en'
        ? ['Company: ' + v('company'), 'Name: ' + v('name'), 'Email: ' + v('email'),
           'Phone: ' + v('phone'), 'Subject: ' + v('topic'), '', v('message')]
        : ['会社名: ' + v('company'), 'お名前: ' + v('name'), 'メール: ' + v('email'),
           '電話: ' + v('phone'), 'ご相談内容: ' + v('topic'), '', v('message')];
      window.location.href = 'mailto:' + (form.dataset.mailto || 'info@34th-standard.com') +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      say('メールソフトを起動しました。内容をご確認のうえ送信してください。',
          'Your mail client has been opened — please review and send.', true);
    });
  }

  /* ---------------------------------------------------------------------
     10. Current year
     --------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (n) {
    n.textContent = String(new Date().getFullYear());
  });
})();
