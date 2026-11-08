// Page d'action Firebase Authentication aux couleurs de La Boussole :
// vérification d'adresse e-mail, réinitialisation et récupération d'adresse.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  getAuth, applyActionCode, checkActionCode, verifyPasswordResetCode, confirmPasswordReset
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const params = new URLSearchParams(location.search);
const mode = params.get('mode');
const code = params.get('oobCode');
const apiKey = params.get('apiKey');
const $ = (id) => document.getElementById(id);

function show(state, title, text) {
  $('icon').textContent = state === 'ok' ? '✓' : state === 'error' ? '!' : '✦';
  $('icon').className = 'action-icon ' + state;
  $('title').textContent = title;
  $('text').textContent = text;
}

function friendly(error) {
  const c = (error && error.code) || '';
  if (c.includes('expired')) return 'Ce lien a expiré. Demandez-en un nouveau depuis l’application.';
  if (c.includes('invalid-action-code')) return 'Ce lien a déjà été utilisé ou n’est plus valable. Si votre adresse est déjà confirmée, vous pouvez simplement vous connecter.';
  if (c.includes('weak-password')) return 'Ce mot de passe est trop faible. Choisissez-en un plus long.';
  if (c.includes('network')) return 'Connexion impossible. Vérifiez votre accès à Internet, puis rechargez la page.';
  return 'Une erreur est survenue. Réessayez depuis l’application.';
}

async function run() {
  if (!mode || !code || !apiKey) {
    show('error', 'Lien incomplet', 'Ouvrez directement le lien reçu par e-mail, sans le modifier.');
    return;
  }
  const auth = getAuth(initializeApp({ apiKey }));
  auth.languageCode = 'fr';
  try {
    if (mode === 'verifyEmail') {
      await applyActionCode(auth, code);
      show('ok', 'Adresse confirmée !', 'Bienvenue dans La Boussole. Votre compte est prêt.');
      $('next').hidden = false;
    } else if (mode === 'resetPassword') {
      const email = await verifyPasswordResetCode(auth, code);
      show('info', 'Nouveau mot de passe', 'Pour le compte ' + email + '.');
      const form = $('reset');
      form.hidden = false;
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button');
        button.disabled = true;
        try {
          await confirmPasswordReset(auth, code, $('pw').value);
          form.hidden = true;
          show('ok', 'Mot de passe modifié', 'Vous pouvez vous connecter avec votre nouveau mot de passe.');
          $('next').hidden = false;
        } catch (error) {
          button.disabled = false;
          show('error', 'Mot de passe non enregistré', friendly(error));
        }
      });
    } else if (mode === 'recoverEmail') {
      const info = await checkActionCode(auth, code);
      await applyActionCode(auth, code);
      show('ok', 'Adresse rétablie', 'Votre compte utilise de nouveau ' + info.data.email + '. Par sécurité, changez votre mot de passe.');
      $('next').hidden = false;
    } else {
      show('error', 'Lien inconnu', 'Ce type de lien n’est pas pris en charge.');
    }
  } catch (error) {
    show('error', 'Lien non valable', friendly(error));
  }
}

run();
