'use strict';
(() => {
  const root = document.documentElement;
  const nav = document.getElementById('product-navigation');
  const button = document.querySelector('.menu-toggle');
  if (nav && button) {
    root.classList.add('nav-enhanced');
    button.hidden = false;
    const close = (focus = false) => {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      if (focus) button.focus();
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) close(true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('header')) close();
    });
    document.addEventListener('focusin', event => {
      if (!event.target.closest('header')) close();
    });
    matchMedia('(min-width: 761px)').addEventListener('change', () => close());
    const current = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach(link => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
    });
  }
  const theme = document.querySelector('.theme-toggle');
  const preference = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : preference.matches;
  const update = () => {
    if (!theme) return;
    theme.setAttribute('aria-label', isDark() ? 'Activer le thème clair' : 'Activer le thème sombre');
    theme.setAttribute('aria-pressed', String(isDark()));
  };
  if (theme) {
    theme.hidden = false;
    theme.addEventListener('click', () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('rf-theme', root.dataset.theme); } catch (_) {}
      update();
    });
    preference.addEventListener('change', update);
    update();
  }
})();
