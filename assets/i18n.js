/* Bilingual toggle (English / 繁體中文). Translatable text is authored as
   <span data-tr="en">…</span><span data-tr="zh">…</span>; CSS (injected per page)
   hides the inactive language by html[data-lang]. Technical terms / formulas / code
   are left unwrapped, so they show in English in both languages.
   Quiz explanations use data-explain (en) + optional data-explain-zh. */
(function () {
  function cur() { return document.documentElement.getAttribute('data-lang') || 'en'; }
  window.setLang = function (l) {
    var r = document.documentElement;
    r.setAttribute('data-lang', l);
    r.setAttribute('lang', l === 'zh' ? 'zh-Hant-TW' : 'en');
    try { localStorage.setItem('lang', l); } catch (e) {}
    var b = document.getElementById('langbtn'); if (b) b.textContent = l === 'zh' ? 'EN' : '中';
    try { window.dispatchEvent(new Event('zoo:lang')); } catch (e) {} // let interactive viz captions re-render
    // re-render any already-answered quiz feedback in the new language
    document.querySelectorAll('.quiz[data-done] .fb').forEach(function (fb) {
      var q = fb.closest('.quiz'); if (!q) return;
      var ex = (l === 'zh' && q.dataset.explainZh) ? q.dataset.explainZh : (q.dataset.explain || '');
      var v = fb.querySelector('.v'); var tag = v ? '<span class="v">' + v.innerHTML + '</span> ' : '';
      fb.innerHTML = tag + ex;
    });
  };
  window.toggleLang = function () { window.setLang(cur() === 'zh' ? 'en' : 'zh'); };
  function init() { var b = document.getElementById('langbtn'); if (b) b.textContent = cur() === 'zh' ? 'EN' : '中'; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
