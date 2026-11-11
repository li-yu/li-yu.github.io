/**
 * New Yorker — search overlay for Gridea Pro.
 *
 * Gridea Pro generates /api/search.json at build time:
 *   [{ title, link, date, tags: [], content }]
 *
 * The overlay is rendered only in Pro mode. On the legacy Gridea theme the
 * masthead search icon is a normal link to /search/.
 */
(function () {
  'use strict';

  var overlay = document.getElementById('search-overlay');
  if (!overlay) return;

  var input = overlay.querySelector('[data-search-input]');
  var results = overlay.querySelector('[data-search-results]');
  var triggers = document.querySelectorAll('[data-search-open]');
  var apiUrl = overlay.getAttribute('data-search-api') || '/api/search.json';

  var posts = null;
  var loading = false;
  var failed = false;
  var lastTrigger = null;
  var activeIndex = -1;
  var debounceTimer = null;
  var pending = [];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlight(text, query) {
    var source = String(text || '');
    if (!query) return escapeHtml(source);
    var lower = source.toLowerCase();
    var target = query.toLowerCase();
    var index = lower.indexOf(target);
    if (index === -1) return escapeHtml(source);
    return escapeHtml(source.slice(0, index))
      + '<mark>' + escapeHtml(source.slice(index, index + query.length)) + '</mark>'
      + escapeHtml(source.slice(index + query.length));
  }

  function excerpt(content, query) {
    var text = String(content || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    var lower = text.toLowerCase();
    var target = query.toLowerCase();
    var index = lower.indexOf(target);
    if (index === -1) {
      return escapeHtml(text.slice(0, 110)) + (text.length > 110 ? '…' : '');
    }
    var start = Math.max(0, index - 50);
    var end = Math.min(text.length, index + query.length + 90);
    return (start > 0 ? '…' : '')
      + escapeHtml(text.slice(start, index))
      + '<mark>' + escapeHtml(text.slice(index, index + query.length)) + '</mark>'
      + escapeHtml(text.slice(index + query.length, end))
      + (end < text.length ? '…' : '');
  }

  function resultItem(post, query) {
    var tags = (post.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var title = query ? highlight(post.title, query) : escapeHtml(post.title);
    var body = query ? excerpt(post.content, query) : escapeHtml(String(post.content || '').slice(0, 100)) + '…';
    return '<article class="search-result">'
      + '<time class="search-result__date">' + escapeHtml(post.date || '') + '</time>'
      + '<div>'
      + '<h3 class="search-result__title"><a href="' + escapeHtml(post.link) + '">' + title + '</a></h3>'
      + '<p class="search-result__excerpt">' + body + '</p>'
      + '<div class="search-result__meta">' + tags + '</div>'
      + '</div>'
      + '</article>';
  }

  function render(postsToShow, query) {
    if (!results) return;
    if (!postsToShow.length) {
      results.innerHTML = '<div class="search-empty">' + (query ? '没有找到相关文章，换一个关键词试试。' : '还没有可搜索的文章。') + '</div>';
      activeIndex = -1;
      return;
    }
    results.innerHTML = postsToShow.map(function (post) {
      return resultItem(post, query);
    }).join('');
    activeIndex = -1;
  }

  function search(query) {
    var q = String(query || '').trim();
    if (!q) {
      render((posts || []).slice(0, 6), '');
      return;
    }
    var target = q.toLowerCase();
    var matched = [];
    (posts || []).forEach(function (post) {
      var title = String(post.title || '').toLowerCase();
      var content = String(post.content || '').toLowerCase();
      var tags = (post.tags || []).map(function (tag) { return String(tag).toLowerCase(); });
      var score = 0;
      if (title.indexOf(target) !== -1) score += 10;
      if (tags.some(function (tag) { return tag.indexOf(target) !== -1; })) score += 5;
      if (content.indexOf(target) !== -1) score += 1;
      if (score > 0) matched.push({ post: post, score: score });
    });
    matched.sort(function (a, b) { return b.score - a.score; });
    render(matched.slice(0, 20).map(function (item) { return item.post; }), q);
  }

  function load(callback) {
    if (posts !== null) {
      if (callback) callback();
      return;
    }
    if (failed) {
      if (callback) callback();
      return;
    }
    if (callback) pending.push(callback);
    if (loading) return;
    loading = true;
    if (results) results.innerHTML = '<div class="search-empty">加载中…</div>';
    fetch(apiUrl, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) throw new Error('search index unavailable');
        return response.json();
      })
      .then(function (data) {
        posts = Array.isArray(data) ? data : [];
        loading = false;
        var callbacks = pending.slice();
        pending = [];
        callbacks.forEach(function (fn) { fn(); });
      })
      .catch(function () {
        failed = true;
        loading = false;
        posts = [];
        pending = [];
        if (results) results.innerHTML = '<div class="search-empty">搜索数据加载失败，请稍后再试。</div>';
      });
  }

  function open(event) {
    if (event) {
      event.preventDefault();
      lastTrigger = event.currentTarget;
    }
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-open');
    activeIndex = -1;
    if (input) {
      input.value = '';
      input.focus();
    }
    if (posts !== null) {
      render(posts.slice(0, 6), '');
    } else {
      load(function () {
        if (input && !input.value.trim()) render(posts.slice(0, 6), '');
      });
    }
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-open');
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }

  function moveActive(step) {
    var items = results ? results.querySelectorAll('.search-result') : [];
    if (!items.length) return;
    activeIndex = (activeIndex + step + items.length) % items.length;
    for (var i = 0; i < items.length; i += 1) {
      items[i].classList.toggle('is-active', i === activeIndex);
    }
    if (items[activeIndex]) {
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  if (triggers.length) {
    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener('click', open);
    });
  }

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-search-close]'), function (element) {
    element.addEventListener('click', close);
  });

  if (input) {
    input.addEventListener('input', function () {
      window.clearTimeout(debounceTimer);
      var value = input.value;
      debounceTimer = window.setTimeout(function () {
        if (!posts) {
          load(function () { search(value); });
        } else {
          search(value);
        }
      }, 120);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveActive(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveActive(-1);
      } else if (event.key === 'Enter') {
        var items = results ? results.querySelectorAll('.search-result a') : [];
        var target = items[activeIndex >= 0 ? activeIndex : 0];
        if (target) {
          event.preventDefault();
          window.location.href = target.getAttribute('href');
        }
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    var isOpen = overlay.classList.contains('is-open');
    if (event.key === 'Escape' && isOpen) {
      close();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
      event.preventDefault();
      if (isOpen) close();
      else open();
    }
  });

  // Compatibility: old /search/?q=... URLs redirect to /?q=...; open the overlay
  // and run the query immediately.
  try {
    var initialParams = new URLSearchParams(window.location.search);
    var initialQuery = initialParams.get('q');
    var openOnLoad = !!initialQuery || initialParams.get('search') === '1';
    if (openOnLoad) {
      open();
      if (initialQuery && input) input.value = initialQuery;
      load(function () {
        if (initialQuery) search(initialQuery);
      });
    }
  } catch (error) {
    /* noop */
  }
})();
