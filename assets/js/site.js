/* --------------------------------------------------------------------------
   catalect — header, mobile navigation, scroll reveals
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.nav-toggle');

  if (toggle) {
    var setMenu = function (open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', function () {
      setMenu(!header.classList.contains('nav-open'));
    });

    /* Tapping a section link should take you there, not leave the panel open. */
    header.querySelectorAll('.site-nav a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  var showAll = function () {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  };

  /* Never let an animation be the reason content is missing: without an
     observer, or on a page rendered while hidden, just show everything. */
  if (!('IntersectionObserver' in window) || document.visibilityState !== 'visible') {
    showAll();
    return;
  }

  setTimeout(showAll, 4000);

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  targets.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
    observer.observe(el);
  });
})();
