# La Boussole — site de présentation

Site public : https://raphaelflipo.github.io/la-boussole/

Ce dossier correspond au dépôt autonome `raphaelflipo/la-boussole`. Il ne faut pas le placer dans le dépôt du portfolio sous un dossier du même nom : GitHub Pages publie déjà ce dépôt à l’adresse `/la-boussole/`.

HTML, CSS et JavaScript statiques, sans compilation ni service payant. Aucun paiement n’est activé. Le code de l’application n’est pas dans ce dépôt.

## État présenté

- 1.0 : démonstration privée, validation partielle détaillée par plateforme. Aucun pilote réel ni abonnement ouvert.
- Aucun paquet d’installation public ni accès TestFlight/App Store vérifié au 12 novembre 2026.
- La démo fonctionne avec des scénarios fictifs dans la mémoire du navigateur.
- Les prix 0 €, 19 €/mois et 49 €/mois sont prévus, sans activation de paiement.

## Modifier les contenus

- `index.html` : présentation du projet et de ses objectifs.
- `fonctionnalites.html`, `associations.html`, `tarifs.html`, `faq.html` : détails.
- `telecharger.html` et `downloads.js` : disponibilité et liens par plateforme.
- `styles.css` : apparence partagée, responsive et modes clair/sombre.
- `theme.js` : reprend la préférence `rf-theme` enregistrée par le portfolio ; sans préférence ou sans JavaScript, le site suit le thème système. La page de compte `action.html` conserve son fonctionnement indépendant.
- `demo.html` / `demo.js` : démonstration fictive. Aucun réseau ni compte.
- `interet.html` / `interest.js` : fiche préparée localement, sans envoi.
- `action.html` / `action.js` : liens d’action Firebase (confirmation d’adresse et réinitialisation). Conserver les chemins, les paramètres `mode`, `oobCode`, `apiKey` et les identifiants HTML utilisés par le script.

## Ouvrir un téléchargement réel

Ne pas construire de lien vers une version future. Publier et tester d’abord le vrai fichier ou le canal de distribution, avec ses droits de diffusion et ses instructions.

Dans `downloads.js`, modifier uniquement l’entrée concernée de `RELEASES` :

1. Renseigner `version` et `url` avec les valeurs de la version réellement publiée.
2. Pour une archive/APK, utiliser `delivery: 'file'` et saisir son empreinte `sha256` (64 caractères hexadécimaux).
3. Pour iOS via TestFlight/App Store, utiliser `delivery: 'store'` et l’URL officielle HTTPS (`testflight.apple.com` ou `apps.apple.com`). L’empreinte n’est pas utilisée pour ces liens Apple.
4. Vérifier manuellement que le lien public fonctionne sans connexion au compte du développeur, correspond au bon fichier et que l’installation est documentée. Passer ensuite `verified` à `true` pour cette plateforme seulement.
5. Mettre à jour le texte de disponibilité et de compatibilité dans `telecharger.html`, y compris pour les visiteurs sans JavaScript. Enlever la mention globale « aucun fichier » dès qu’une version est effectivement ouverte.

Le script contrôle la forme de la configuration ; il ne certifie pas le contenu d’un binaire. Sans configuration complète et explicitement vérifiée, le bouton reste une demande de nouvelles par e-mail. Il n’envoie aucun message lui-même.

## Prévisualiser

Depuis ce dossier : `python3 -m http.server 8000`, puis ouvrir `http://localhost:8000/`. Le fonctionnement du site ne dépend pas de Python une fois hébergé sur GitHub Pages.

## Déploiement

Copier les fichiers de ce dossier à la racine du dépôt `raphaelflipo/la-boussole`, conserver `.nojekyll`, puis publier sur la branche configurée pour Pages. Ne pas remplacer le dépôt privé de l’application. Les pages de compte Firebase ont été conservées.

Baseline de cette révision : `222db96151b2c59339259953807ae1aa740fb771`.

© 2026 Raphaël Flipo. Tous droits réservés.

## Référence 1.0

Mise à jour autorisée du site existant, à visibilité inchangée. Les paquets et sources de l’application restent privés. Aucun fichier ancien n’est proposé au téléchargement ; la page de disponibilité distingue Mac, Android, Windows et l’installation personnelle iPhone. La capture Mac 1.0 montre le scénario familial fictif réellement vérifié. Les pages de compte Firebase, la simulation locale et la charte existante sont conservées.

La refonte graphique et la navigation mobile du commit 8f37d8b ont été intégrées à la référence 1.0, sans remplacement des pages de compte ni des paramètres Firebase. Les polices proviennent du répertoire `/fonts/` du portfolio sur le même domaine.

Contrôles 1.0 : 12 pages et 266 liens locaux, syntaxe JavaScript, 11 pages affichées à 390 et 1440 px sans débordement horizontal. Menu mobile ouvert puis fermé avec Échap, thèmes clair/sombre, contrastes des textes principaux supérieurs à 5,3:1, grossissement visuel 200 % puis restauration. Aucun service worker.
