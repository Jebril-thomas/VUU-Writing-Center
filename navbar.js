/**
 * navbar.js — VUU Writing Center
 * Handles open / close / toggle / close-on-link-click
 */

(function () {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (!toggle || !menu) return;

  /** Open the menu */
  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  /** Close the menu */
  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  /** Toggle */
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (menu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /** Close when a nav link is clicked */
  menu.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /** Close when clicking outside the navbar */
  document.addEventListener('click', function (e) {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  /** Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();
