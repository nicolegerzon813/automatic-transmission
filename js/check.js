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

// Check #5: PDF embed. There's no load/error event we can rely on for
// <embed> across browsers, so this checks the one thing we *can*
// measure: whether the plugin gave the element any real size at all.
// A collapsed 0-height box strongly suggests the browser couldn't
// render the PDF inline (the known risk case flagged earlier: some
// mobile browsers show a blank embed instead of the PDF viewer).
window.addEventListener('load', () => {
  setTimeout(() => {
    const pdf = document.getElementById('pdf-probe');
    const rendered = pdf.offsetHeight > 0 && pdf.clientWidth > 0;
    setStatus('check-pdf', rendered);
    if (!rendered) {
      document.querySelector('#check-pdf .status').closest('li')
        .insertAdjacentHTML('beforeend',
          '<div style="width:100%;font-weight:normal;font-size:11.5px;margin-top:4px;">This only confirms the element rendered with a size — it can\'t confirm the PDF content itself displayed. If this fails on mobile specifically, that matches a known limitation; the fallback is linking out to open the PDF in a new tab instead of embedding it.</div>');
    }
  }, 400); // slight delay lets the PDF plugin finish initializing before we measure it
});
