/**
 * 复制公众号版
 * ------------------------------------------------------------------
 * 把文章正文转换为微信公众平台可接受的全内联样式 HTML。
 * 规格来自「纽约客编辑风公众号排版规范」：
 *   - 正文 15px / 1.8 / #2b2b2b / 两端对齐
 *   - H2 17px / 600 / 下边框
 *   - 引用块 #faf9f6 底 + #8b0000 左边线
 *   - 分割线 1px #e6e6e6 / 60% 宽
 */
(function () {
  'use strict';

  var COLORS = {
    ink: '#2b2b2b',
    strong: '#1a1a1a',
    body: '#333333',
    quote: '#4a4a4a',
    muted: '#7a7a7a',
    rule: '#e6e6e6',
    paper: '#faf9f6',
    accent: '#8b0000',
    accentDeep: '#a31f1f',
    codeBg: '#f7f4ed'
  };

  var SERIF = "-apple-system-font, 'PingFang SC', 'Source Han Serif SC', 'Noto Serif CJK SC', 'Songti SC', serif";
  var MONO = "'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace";

  var CONTAINER_STYLE = [
    'font-family: ' + SERIF,
    'font-size: 15px',
    'line-height: 1.8',
    'color: ' + COLORS.ink,
    'letter-spacing: 0.5px',
    'text-align: justify',
    'padding: 12px 6px',
    'word-wrap: break-word'
  ].join('; ') + ';';

  var TOKEN_COLORS = {
    'hljs-comment': '#8a8578',
    'hljs-quote': '#8a8578',
    'hljs-keyword': COLORS.accentDeep,
    'hljs-selector-tag': COLORS.accentDeep,
    'hljs-built_in': COLORS.accentDeep,
    'hljs-string': '#3f6b4f',
    'hljs-regexp': '#3f6b4f',
    'hljs-addition': '#3f6b4f',
    'hljs-number': '#8a5a00',
    'hljs-literal': '#8a5a00',
    'hljs-doctag': '#8a5a00',
    'hljs-title': '#1f4f7a',
    'hljs-section': '#1f4f7a',
    'hljs-name': '#1f4f7a',
    'hljs-attr': '#8a5a00',
    'hljs-attribute': '#8a5a00',
    'hljs-variable': '#6b3f8c',
    'hljs-template-variable': '#6b3f8c',
    'hljs-type': '#6b3f8c',
    'hljs-symbol': '#6b3f8c',
    'hljs-meta': '#8a8578',
    'hljs-deletion': COLORS.accentDeep
  };

  function styles(map) {
    return Object.keys(map).map(function (key) {
      return key + ': ' + map[key] + ';';
    }).join(' ');
  }

  function tokenStyle(el) {
    if (!el.classList) return '';
    for (var i = 0; i < el.classList.length; i += 1) {
      var color = TOKEN_COLORS[el.classList[i]];
      if (color) {
        var style = 'color: ' + color + ';';
        if (el.classList[i] === 'hljs-comment' || el.classList[i] === 'hljs-quote') {
          style += ' font-style: italic;';
        }
        return style;
      }
    }
    return '';
  }

  function styleElement(el, tag, inQuote, inPre) {
    var style = '';

    if (tag === 'p') {
      style = inQuote
        ? styles({ margin: '0 0 8px', 'font-size': '14.5px', 'line-height': '1.75', color: COLORS.quote, 'letter-spacing': '0.5px', 'background-color': 'transparent' })
        : styles({ margin: '0 0 18px', 'font-size': '15px', 'line-height': '1.8', color: COLORS.ink, 'letter-spacing': '0.5px', 'text-align': 'justify', 'background-color': 'transparent' });
    } else if (tag === 'h1') {
      style = styles({ margin: '32px 0 20px', 'font-size': '21px', 'font-weight': '700', 'line-height': '1.5', color: COLORS.strong, 'text-align': 'center', 'letter-spacing': '1px', 'background-color': 'transparent' });
    } else if (tag === 'h2' || tag === 'h3') {
      style = styles({ margin: '32px 0 14px', 'padding-bottom': '6px', 'border-bottom': '1px solid #e0e0e0', 'font-size': tag === 'h2' ? '18px' : '17px', 'font-weight': '600', 'line-height': '1.5', color: COLORS.strong, 'letter-spacing': '0.5px', 'background-color': 'transparent' });
    } else if (tag === 'h4' || tag === 'h5' || tag === 'h6') {
      style = styles({ margin: '24px 0 12px', 'font-size': '15.5px', 'font-weight': '600', 'line-height': '1.6', color: COLORS.strong, 'letter-spacing': '0.5px', 'background-color': 'transparent' });
    } else if (tag === 'blockquote') {
      style = styles({ margin: '20px 0', padding: '10px 16px', 'background-color': COLORS.paper, 'border-left': '3px solid ' + COLORS.accent, color: COLORS.quote, 'font-size': '14.5px', 'line-height': '1.75', 'font-style': 'normal', 'letter-spacing': '0.5px' });
    } else if (tag === 'ul' || tag === 'ol') {
      style = styles({ margin: '16px 0', 'padding-left': '22px', color: COLORS.body, 'line-height': '1.75', 'font-size': '15px', 'background-color': 'transparent', 'list-style-type': tag === 'ol' ? 'decimal' : 'disc' });
    } else if (tag === 'li') {
      style = styles({ 'margin-bottom': '8px', 'line-height': '1.75', 'font-size': '15px', 'letter-spacing': '0.5px', 'background-color': 'transparent' });
    } else if (tag === 'strong' || tag === 'b') {
      style = 'font-weight: 600; color: ' + COLORS.strong + ';';
    } else if (tag === 'em' || tag === 'i') {
      style = 'font-style: italic;';
    } else if (tag === 'a') {
      style = 'color: ' + COLORS.accent + '; text-decoration: none; border-bottom: 1px solid rgba(139,0,0,0.35);';
    } else if (tag === 'img') {
      style = 'display: block; max-width: 100%; height: auto; margin: 20px auto;';
    } else if (tag === 'figure') {
      style = 'margin: 20px 0;';
    } else if (tag === 'figcaption') {
      style = styles({ 'margin-top': '8px', 'font-size': '13px', 'line-height': '1.6', color: COLORS.muted, 'text-align': 'center', 'letter-spacing': '0.5px' });
    } else if (tag === 'hr') {
      style = 'border: none; height: 1px; background-color: ' + COLORS.rule + '; margin: 32px auto; width: 60%;';
    } else if (tag === 'pre') {
      style = styles({ margin: '20px 0', padding: '14px 16px', 'background-color': COLORS.paper, border: '1px solid ' + COLORS.rule, 'border-radius': '2px', 'font-size': '13px', 'line-height': '1.65', color: '#3a3a3a', 'text-align': 'left', 'overflow-x': 'auto', 'white-space': 'pre-wrap', 'word-break': 'break-all' });
    } else if (tag === 'code') {
      style = inPre
        ? 'padding: 0; background: transparent; border: 0; color: inherit; font-family: ' + MONO + '; font-size: inherit;'
        : 'padding: 2px 5px; margin: 0 2px; background-color: ' + COLORS.codeBg + '; border-radius: 2px; font-family: ' + MONO + '; font-size: 13px; color: ' + COLORS.accentDeep + ';';
    } else if (tag === 'table') {
      style = 'width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 14px; line-height: 1.6;';
    } else if (tag === 'th') {
      style = 'border: 1px solid ' + COLORS.rule + '; padding: 8px 10px; background-color: ' + COLORS.paper + '; font-weight: 600; color: ' + COLORS.strong + '; text-align: left;';
    } else if (tag === 'td') {
      style = 'border: 1px solid ' + COLORS.rule + '; padding: 8px 10px; color: ' + COLORS.ink + ';';
    } else if (tag === 'kbd') {
      style = 'padding: 1px 5px; border: 1px solid #dddddd; border-radius: 2px; background: #ffffff; font-family: ' + MONO + '; font-size: 12px;';
    } else if (tag === 'mark') {
      style = 'background-color: #faf0ee; color: ' + COLORS.strong + '; padding: 0 2px;';
    } else if (tag === 'del' || tag === 's') {
      style = 'color: ' + COLORS.muted + ';';
    } else if (tag === 'sup' || tag === 'sub') {
      style = 'font-size: 75%; line-height: 0;';
    } else if (tag === 'span') {
      var token = tokenStyle(el);
      if (token) style = token + (inPre ? ' font-family: ' + MONO + ';' : '');
    }

    return style;
  }

  function cleanAttributes(el) {
    var tag = el.tagName.toLowerCase();
    var allowed = {};
    if (tag === 'a') {
      allowed.href = true;
      allowed.title = true;
    } else if (tag === 'img') {
      allowed.src = true;
      allowed.alt = true;
      allowed.title = true;
    } else if (tag === 'th' || tag === 'td') {
      allowed.colspan = true;
      allowed.rowspan = true;
    } else if (tag === 'ol') {
      allowed.start = true;
    }

    Array.prototype.slice.call(el.attributes).forEach(function (attr) {
      var name = attr.name.toLowerCase();
      if (name === 'style') return;
      if (!allowed[name]) el.removeAttribute(attr.name);
    });
  }

  function removeComments(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null, false);
    var comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function buildWechatHtml(source) {
    var clone = source.cloneNode(true);

    removeComments(clone);

    Array.prototype.forEach.call(
      clone.querySelectorAll('script, style, iframe, button, .sr-only, .header-anchor, .anchor'),
      function (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    );

    var section = document.createElement('section');
    section.setAttribute('style', CONTAINER_STYLE);
    while (clone.firstChild) section.appendChild(clone.firstChild);

    var all = Array.prototype.slice.call(section.querySelectorAll('*'));
    all.forEach(function (el) {
      var tag = el.tagName.toLowerCase();
      var inQuote = !!(el.closest && el.closest('blockquote'));
      var inPre = !!(el.closest && el.closest('pre'));
      var style = styleElement(el, tag, inQuote, inPre);
      if (style) el.setAttribute('style', style);
      else el.removeAttribute('style');
      cleanAttributes(el);
    });

    // Drop empty paragraphs left behind by markdown lists.
    Array.prototype.forEach.call(section.querySelectorAll('p'), function (p) {
      if (!p.textContent.trim() && !p.querySelector('img')) {
        if (p.parentNode) p.parentNode.removeChild(p);
      }
    });

    return section.outerHTML;
  }

  function fallbackCopy(html) {
    var holder = document.createElement('div');
    holder.setAttribute('contenteditable', 'true');
    holder.innerHTML = html;
    holder.style.cssText = 'position: fixed; left: -9999px; top: 0; opacity: 0; background-color: #ffffff;';
    document.body.appendChild(holder);

    var range = document.createRange();
    range.selectNodeContents(holder);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (error) {
      ok = false;
    }

    selection.removeAllRanges();
    document.body.removeChild(holder);
    return ok;
  }

  function copyRich(html, text) {
    return new Promise(function (resolve, reject) {
      if (navigator.clipboard && window.ClipboardItem && navigator.clipboard.write) {
        var item = new window.ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        });
        navigator.clipboard.write([item]).then(resolve).catch(function () {
          if (fallbackCopy(html)) resolve();
          else reject(new Error('clipboard unavailable'));
        });
      } else if (fallbackCopy(html)) {
        resolve();
      } else {
        reject(new Error('clipboard unavailable'));
      }
    });
  }

  var toastTimer = null;

  function toast(message) {
    var el = document.querySelector('.nw-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'nw-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    window.requestAnimationFrame(function () {
      el.classList.add('is-show');
    });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove('is-show');
    }, 2600);
  }

  function bind() {
    var buttons = document.querySelectorAll('[data-wechat-copy]');
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function () {
        var source = document.querySelector('.post-body');
        if (!source) return;

        var label = button.querySelector('span');
        var original = label ? label.textContent : '';
        var html = buildWechatHtml(source);

        copyRich(html, source.innerText).then(function () {
          toast('已复制，可直接粘贴到公众号编辑器');
          if (label) label.textContent = '已复制';
          button.classList.add('is-copied');
          window.setTimeout(function () {
            if (label) label.textContent = original;
            button.classList.remove('is-copied');
          }, 2600);
        }).catch(function () {
          toast('复制失败，请手动选中正文后复制');
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
