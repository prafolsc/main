'use strict';
// Web3Forms public form access key, linked to prafolsc@gmail.com.
const WEB3FORMS_ACCESS_KEY = '6506bfb0-2cf8-49b1-8851-43c7a7b1a263';
const es = document.documentElement.lang === 'es';
const form = document.getElementById('contact-form');
const button = document.getElementById('contact-submit');
const status = document.getElementById('contact-status');
const select = document.getElementById('language-select');
select.addEventListener('change', e => {
  window.location.href = e.target.value === 'es' ? 'contacte-es.html' : 'contacte.html';
});
if (WEB3FORMS_ACCESS_KEY) {
  form.elements.access_key.value = WEB3FORMS_ACCESS_KEY;
  button.disabled = false;
  status.textContent = '';
}
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!WEB3FORMS_ACCESS_KEY || button.disabled || !form.reportValidity()) return;
  if (form.elements.botcheck.checked) return;
  button.disabled = true;
  status.textContent = es ? 'Enviando…' : 'Enviant…';
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error('Submission failed');
    form.reset();
    status.textContent = es ? 'Mensaje enviado. ¡Gracias!' : 'Missatge enviat. Gràcies!';
  } catch {
    status.textContent = es ? 'No se ha podido enviar el mensaje. Tu texto se conserva; inténtalo de nuevo.' : 'No s’ha pogut enviar el missatge. El text es conserva; torna-ho a provar.';
  } finally { button.disabled = false; }
});
