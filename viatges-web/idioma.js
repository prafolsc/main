'use strict';
const languageSelect = document.getElementById('language-select');
if (languageSelect) languageSelect.addEventListener('change', event => {
  window.location.href = event.target.value === 'es' ? 'index-es.html' : 'index.html';
});
