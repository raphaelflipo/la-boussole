'use strict';
/* Renseigner chaque plateforme séparément après vérification du fichier ou du lien.
   Aucun téléchargement n'est proposé tant que verified n'est pas true.
   Fichier : URL HTTPS + version + SHA-256 de 64 caractères obligatoires.
   iOS : lien TestFlight/App Store vérifié, ou fichier avec empreinte (distribution adaptée requise).
   Voir README.md. Aucune URL de fichier future n'est construite automatiquement. */
const RELEASES = {
  mac: { version: '', url: '', sha256: '', delivery: 'file', verified: false },
  windows: { version: '', url: '', sha256: '', delivery: 'file', verified: false },
  android: { version: '', url: '', sha256: '', delivery: 'file', verified: false },
  ios: { version: '', url: '', sha256: '', delivery: 'store', verified: false }
};
const CONTACT = 'r.flipob@gmail.com';
const LABELS = { mac: 'macOS', windows: 'Windows', android: 'Android', ios: 'iPhone et iPad', linux: 'Linux', other: 'cet appareil' };
function detectPlatform() {
  const ua = navigator.userAgent || '';
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) return 'mac';
  if (/Linux|CrOS/i.test(platform) || /Linux/i.test(ua)) return 'linux';
  return 'other';
}
function verifiedRelease(key) {
  const item = RELEASES[key];
  if (!item || item.verified !== true || !item.version.trim()) return null;
  try {
    const url = new URL(item.url);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (item.delivery === 'store') {
      if (key !== 'ios' || !['testflight.apple.com', 'apps.apple.com'].includes(url.hostname)) return null;
    } else if (item.delivery !== 'file' || !/^[a-f0-9]{64}$/i.test(item.sha256)) return null;
    return item;
  } catch (_) { return null; }
}
function requestLink(os) {
  const subject = 'Disponibilité de La Boussole — ' + LABELS[os];
  const body = 'Bonjour,\n\nJe souhaite connaître l’avancement de La Boussole pour ' + LABELS[os] + '.\n\nMerci !';
  return 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
function releaseLabel(key, item) {
  if (item.delivery === 'store') return new URL(item.url).hostname === 'testflight.apple.com' ? 'Voir la version TestFlight' : 'Voir sur l’App Store';
  return 'Télécharger pour ' + LABELS[key];
}
function setupDownloads() {
  const os = detectPlatform();
  Object.keys(RELEASES).forEach(key => {
    const button = document.querySelector('[data-dl="' + key + '"]');
    if (!button) return;
    const item = verifiedRelease(key);
    button.href = item ? item.url : requestLink(key);
    button.textContent = item ? releaseLabel(key, item) : 'Demander des nouvelles';
    const status = document.querySelector('[data-release-status="' + key + '"]');
    if (status && item) status.textContent = 'Version ' + item.version + ' · ' + (item.delivery === 'store' ? 'Distribution Apple' : 'Fichier disponible');
    const sha = document.querySelector('[data-sha="' + key + '"]');
    if (sha && item && item.sha256) { sha.textContent = 'SHA-256 : ' + item.sha256; sha.hidden = false; }
  });
  const card = document.querySelector('.pf[data-os="' + os + '"]');
  if (card) card.classList.add('current');
  const label = document.getElementById('detect-label');
  const title = document.getElementById('detect-title');
  const detail = document.getElementById('detect-text');
  const button = document.getElementById('detect-btn');
  if (!label || !title || !detail || !button) return;
  label.textContent = 'Appareil détecté : ' + LABELS[os];
  const item = verifiedRelease(os);
  if (item) {
    title.textContent = 'La Boussole ' + item.version + ' pour ' + LABELS[os];
    detail.textContent = 'Consultez les informations de cette version avant l’installation. Le logiciel reste en développement.';
    button.textContent = releaseLabel(os, item);
    button.href = item.url;
  } else if (Object.hasOwn(RELEASES, os)) {
    title.textContent = LABELS[os] + ' : démonstration privée';
    detail.textContent = 'Consultez ci-dessous la portée des contrôles RC4 sur cette plateforme. Aucun fichier public ni inscription ouverte n’est proposé ici.';
    button.textContent = 'Demander des nouvelles';
    button.href = requestLink(os);
  } else {
    title.textContent = 'Choisissez votre plateforme';
    detail.textContent = 'Le projet vise macOS, Windows, iOS et Android. La démonstration fictive reste accessible dans le navigateur.';
  }
}
document.addEventListener('DOMContentLoaded', setupDownloads);
