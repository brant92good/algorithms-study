// theme: follow system, allow manual override (persisted)
(function(){
  var q=new URLSearchParams(location.search).get('theme');
  var s=localStorage.getItem('theme');
  var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  document.documentElement.setAttribute('data-theme', q||s||d);
})();
function toggleTheme(){
  var r=document.documentElement,
      t=r.getAttribute('data-theme')==='dark'?'light':'dark';
  r.setAttribute('data-theme',t);
  localStorage.setItem('theme',t);
}
