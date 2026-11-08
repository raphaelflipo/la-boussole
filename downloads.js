'use strict';
// Configuration des téléchargements.
// Pendant la bêta pilote, `enabled` reste à false : les boutons ouvrent une demande d'accès par e-mail.
// Pour ouvrir les téléchargements : publier une version GitHub (Releases) avec ces fichiers,
// renseigner les empreintes SHA-256, puis passer `enabled` à true.
const RELEASE = {
  enabled: false,
  version: '0.9.0',
  base: 'https://github.com/raphaelflipo/la-boussole/releases/download/v0.9.0/',
  files: {
    mac: { name: 'LaBoussole-v0.9-macOS.zip', sha256: '' },
    windows: { name: 'LaBoussole-v0.9-Windows.zip', sha256: '' },
    android: { name: 'LaBoussole-v0.9-Android.apk', sha256: '' }
  }
};

const CONTACT = 'r.flipob@gmail.com';
const LABELS = { mac: 'Mac', windows: 'Windows', android: 'Android', ios: 'iPhone ou iPad', linux: 'Linux', other: 'cet appareil' };

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  // iPadOS se présente comme un Mac : on le reconnaît à l'écran tactile.
  if (/Mac/i.test(platform) && navigator.maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) return 'mac';
  if (/Linux|CrOS/i.test(platform) || /Linux/i.test(ua)) return 'linux';
  return 'other';
}

function requestLink(os) {
  const subject = 'Accès pilote La Boussole — ' + LABELS[os];
  const body = "Bonjour,\n\nNotre association souhaite tester La Boussole.\n\nType d'association : \nNombre approximatif de membres : \nAppareil utilisé : " + LABELS[os] + '\n\nMerci !';
  return 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function downloadLink(os) {
  return RELEASE.base + RELEASE.files[os].name;
}

function setup() {
  const os = detectPlatform();
  const downloadable = ['mac', 'windows', 'android'];

  for (const key of downloadable) {
    const button = document.querySelector('[data-dl="' + key + '"]');
    if (!button) continue;
    if (RELEASE.enabled) {
      button.href = downloadLink(key);
      button.textContent = 'Télécharger pour ' + LABELS[key];
      button.setAttribute('download', '');
      const sha = document.querySelector('[data-sha="' + key + '"]');
      if (sha && RELEASE.files[key].sha256) {
        sha.textContent = 'SHA-256 : ' + RELEASE.files[key].sha256;
        sha.hidden = false;
      }
    } else {
      button.href = requestLink(key);
    }
  }

  const card = document.querySelector('.pf[data-os="' + os + '"]');
  if (card) card.classList.add('current');

  const title = document.getElementById('detect-title');
  const text = document.getElementById('detect-text');
  const btn = document.getElementById('detect-btn');
  const label = document.getElementById('detect-label');
  const fine = document.getElementById('detect-fine');

  if (downloadable.includes(os)) {
    label.textContent = 'Votre appareil : ' + LABELS[os];
    if (RELEASE.enabled) {
      title.textContent = 'La Boussole ' + RELEASE.version + ' pour ' + LABELS[os];
      btn.textContent = 'Télécharger pour ' + LABELS[os];
      btn.href = downloadLink(os);
      btn.setAttribute('download', '');
      fine.textContent = 'Version bêta. Consultez les étapes d’installation plus bas pour le premier lancement.';
    } else {
      title.textContent = 'La Boussole pour ' + LABELS[os];
      text.textContent = 'La version ' + LABELS[os] + ' est disponible pour les associations pilotes. Demandez votre accès : vous recevrez le lien et un accompagnement pour votre premier événement.';
      btn.textContent = 'Demander l’accès pour ' + LABELS[os];
      btn.href = requestLink(os);
    }
  } else if (os === 'ios') {
    label.textContent = 'Votre appareil : ' + LABELS.ios;
    title.textContent = 'La version iPhone arrive plus tard';
    text.textContent = 'Apple impose l’App Store pour installer une application sur iPhone. En attendant, La Boussole fonctionne sur Mac, Windows et Android, et la démo s’ouvre dans votre navigateur.';
    btn.textContent = 'Être prévenu de la sortie';
    btn.href = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent('Me prévenir — La Boussole iPhone');
  } else {
    label.textContent = 'Votre appareil : ' + LABELS[os];
    title.textContent = 'Pas encore de version pour ' + LABELS[os];
    text.textContent = 'La Boussole est disponible sur Mac, Windows et Android. Choisissez la plateforme qui vous convient ci-dessous.';
  }
}

document.addEventListener('DOMContentLoaded', setup);
