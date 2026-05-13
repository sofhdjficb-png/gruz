'use strict';

/* ============================================================
   SCROLL ANIMATIONS — IntersectionObserver
   ============================================================ */
(function () {
  var targets = document.querySelectorAll(
    '.section-label, .section-title, .section-sub, ' +
    '.adv-card, .service-item, .process-step, ' +
    '.pricing-item, .master-card, .contact-info__item, ' +
    '.hero__form-card, .hero__content, .footer__col'
  );
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) {
    el.classList.add('fade-up');
    observer.observe(el);
  });
})();

/* ============================================================
   HEADER — scroll state
   ============================================================ */
(function () {
  var header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 50);
  }, { passive: true });
})();

/* ============================================================
   MOBILE DRAWER
   ============================================================ */
(function () {
  var burger = document.getElementById('burgerBtn');
  var drawer = document.getElementById('mobileDrawer');
  var drawerClose = document.getElementById('drawerClose');
  if (!burger || !drawer) return;

  function openDrawer() {
    drawer.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add('is-open'); });
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(function () { drawer.hidden = true; }, 300);
  }

  burger.addEventListener('click', openDrawer);
  drawerClose && drawerClose.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer) closeDrawer();
  });
  document.querySelectorAll('.js-close-drawer').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawer(); closeModal(); }
  });
})();

/* ============================================================
   MODAL
   ============================================================ */
var closeModal; // exposed for Escape key handler
(function () {
  var modal       = document.getElementById('serviceModal');
  var modalLabel  = document.getElementById('modalServiceBadge');
  var modalClose  = document.getElementById('modalClose');
  if (!modal) { closeModal = function () {}; return; }

  function openModal(serviceName) {
    if (modalLabel) {
      modalLabel.textContent = serviceName || '';
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var firstInput = modal.querySelector('input');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 80);
  }

  closeModal = function () {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  modalClose && modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var service = btn.dataset.service ||
        (btn.closest('[data-service]') && btn.closest('[data-service]').dataset.service) || '';
      openModal(service);
    });
  });
})();

/* ============================================================
   FORMS — consent checkbox + submit + honeypot
   ============================================================ */
(function () {
  function setupForm(form) {
    var submitBtn  = form.querySelector('[type="submit"]');
    var consent    = form.querySelector('[name="pd_consent"]');
    var fieldsWrap = form.querySelector('.form-fields');
    var successWrap = form.querySelector('.form-success');

    // Disable submit until consent checked
    if (consent && submitBtn) {
      submitBtn.disabled = !consent.checked;
      consent.addEventListener('change', function () {
        submitBtn.disabled = !consent.checked;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Honeypot check
      var honey = form.querySelector('[name="website"]');
      if (honey && honey.value) return;
      // Accessibility: announce success
      if (fieldsWrap) fieldsWrap.style.display = 'none';
      if (successWrap) successWrap.classList.add('is-visible');
      // Close modal after short delay if inside one
      var parentModal = form.closest('.modal');
      if (parentModal) {
        setTimeout(closeModal, 2400);
      }
    });
  }

  document.querySelectorAll('form[data-pd]').forEach(setupForm);
})();

/* ============================================================
   SCROLL TO TOP
   ============================================================ */
(function () {
  var btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.style.display = window.scrollY > 600 ? 'flex' : 'none';
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   COOKIE BANNER + Yandex Metrika (conditional) + Map
   Adapted from цех project (ФЗ-152 ст.3, ст.9)
   ============================================================ */
(function () {
  var STORAGE_KEY      = 'kuznetcov_cookie_v1';
  var CONSENT_VERSION  = '1.0';
  var MAX_AGE_DAYS     = 365;

  var banner    = document.getElementById('cookie-banner');
  var btnAccept = document.getElementById('cookie-accept-all');
  var btnReject = document.getElementById('cookie-reject-optional');

  function safeRead() {
    try {
      var r = localStorage.getItem(STORAGE_KEY);
      return r ? JSON.parse(r) : null;
    } catch (e) { return null; }
  }

  function safeWrite(d) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch (e) {}
  }

  function isExpired(d) {
    if (!d || !d.savedAt) return true;
    return (Date.now() - new Date(d.savedAt).getTime()) > MAX_AGE_DAYS * 86400000;
  }

  function shouldAsk(d) {
    return !d || d.consentVersion !== CONSENT_VERSION || isExpired(d);
  }

  function closeBanner() {
    if (banner) banner.style.display = 'none';
  }

  function loadMap() {
    var wrapper = document.getElementById('map-consent-wrapper');
    if (!wrapper || wrapper.querySelector('iframe')) return;
    var src = wrapper.getAttribute('data-src');
    if (!src) return;
    var placeholder = document.getElementById('map-placeholder');
    if (placeholder) placeholder.remove();
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '100%';
    iframe.height = '280';
    iframe.frameBorder = '0';
    iframe.loading = 'lazy';
    iframe.title = 'Карта: ИП Кузнецов, пгт. Медведево';
    iframe.setAttribute('allowfullscreen', '');
    wrapper.appendChild(iframe);
  }

  /* [B5] Yandex Metrika — загружается ТОЛЬКО после аналитического согласия */
  function loadMetrika() {
    if (window._metrikaLoaded) return;
    window._metrikaLoaded = true;
    /* global ym */
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) { return; }
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    ym(107283700, 'init', {
      clickmap:            true,
      trackLinks:          true,
      accurateTrackBounce: true,
      webvisor:            true,
      trackHash:           true
    });
  }

  function persist(cats) {
    var payload = {
      consentVersion: CONSENT_VERSION,
      savedAt:        new Date().toISOString(),
      categories: {
        necessary:  true,
        analytics:  !!cats.analytics,
        marketing:  !!cats.marketing
      }
    };
    safeWrite(payload);
    closeBanner();
    if (payload.categories.analytics) {
      loadMap();
      loadMetrika();
    }
  }

  // On load — restore consent state
  var stored = safeRead();
  if (stored && stored.categories && stored.categories.analytics) {
    loadMap();
    loadMetrika();
  }

  // Map placeholder consent button
  var mapBtn = document.getElementById('map-consent-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      persist({ analytics: true, marketing: false });
    });
  }

  if (btnAccept) btnAccept.addEventListener('click', function () {
    persist({ analytics: true, marketing: true });
  });
  if (btnReject) btnReject.addEventListener('click', function () {
    persist({ analytics: false, marketing: false });
  });

  if (shouldAsk(stored)) {
    if (banner) banner.style.display = 'block';
  }
})();
