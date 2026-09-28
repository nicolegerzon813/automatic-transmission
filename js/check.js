// This file being executed at all is check #4 (external JS loading from
// a subfolder) — the very first line marks that row as passed.
setStatus('check-js', true);

// Check #1: did styles.css actually apply? We test this by reading the
// computed background-color of the .css-probe box — if the stylesheet
// failed to load, the browser default (transparent) shows instead of
// the teal color defined in styles.css.
const probe = document.getElementById('css-probe');
const bg = getComputedStyle(probe).backgroundColor;
setStatus('check-css', bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent');

// Check #2: fetch() of a relative JSON path. This is the one that fails
// under file:// (CORS) and needs a real http(s) server — exactly what
// GitHub Pages provides and what a local double-click of index.html
// does not.
fetch('data/status.json')
  .then(res => {
    if (!res.ok) throw new Error('bad response');
    return res.json();
  })
  .then(data => setStatus('check-fetch', data.hosting_check === 'fetch worked'))
  .catch(() => setStatus('check-fetch', false));

// Check #3: image in a subfolder. The <img> tag in index.html either
// loads images/placeholder.svg or fires its error handler.
const img = document.getElementById('image-probe');
img.addEventListener('load', () => setStatus('check-image', true));
img.addEventListener('error', () => setStatus('check-image', false));
// If it's already loaded/cached by the time this script runs, 'load'
// won't fire again — check .complete directly as a fallback.
if (img.complete && img.naturalWidth > 0) setStatus('check-image', true);

function setStatus(id, passed){
  const el = document.querySelector('#' + id + ' .status');
  if (!el) return;
  el.textContent = passed ? 'OK' : 'FAILED';
  el.className = 'status ' + (passed ? 'ok' : 'fail');
}
