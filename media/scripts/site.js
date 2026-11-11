(function () {
  'use strict';

  var masthead = document.getElementById('masthead');
  var topbar = document.getElementById('topbar');
  var progress = document.getElementById('reading-progress');
  var article = document.querySelector('.post-body');
  var ticking = false;

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (masthead && topbar) {
      var visible = y > masthead.offsetHeight;
      if (visible) {
        topbar.classList.add('is-visible');
        topbar.setAttribute('aria-hidden', 'false');
      } else {
        topbar.classList.remove('is-visible');
        topbar.setAttribute('aria-hidden', 'true');
      }
    }

    if (progress && article) {
      var rect = article.getBoundingClientRect();
      var articleTop = rect.top + y;
      var height = article.offsetHeight;
      var start = articleTop - 120;
      var end = articleTop + height - window.innerHeight + 140;
      var ratio = end > start ? (y - start) / (end - start) : 0;
      ratio = Math.max(0, Math.min(1, ratio));
      progress.style.transform = 'scaleX(' + ratio + ')';
    }

    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Defer image decoding, and keep images from blocking the first paint.
  var images = document.querySelectorAll('.post-body img, .about__body img');
  Array.prototype.forEach.call(images, function (img) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  // highlight.js is bundled locally; if it failed to load, code stays readable.
  if (window.hljs) {
    try {
      window.hljs.highlightAll();
    } catch (error) {
      /* noop */
    }
  }
})();
