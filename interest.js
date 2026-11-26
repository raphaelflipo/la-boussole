'use strict';

const form = document.getElementById('interest-form');
const result = document.getElementById('interest-result');
const fields = ['interest-type', 'interest-size', 'interest-goal', 'interest-device'];
const confirmation = document.documentElement.lang === 'en'
  ? 'Summary prepared on this page. Nothing was sent.'
  : 'Fiche locale préparée. Rien n’a été envoyé.';

form.addEventListener('submit', event => {
  event.preventDefault();
  result.textContent = [confirmation, ...fields.map(id => document.getElementById(id).value)].join(' · ');
  result.hidden = false;
});

form.addEventListener('reset', () => {
  result.hidden = true;
  result.textContent = '';
});
