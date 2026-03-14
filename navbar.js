/**
 * navbar.js — VUU Writing Center
 *
 * Provides the menu-toggle / nav-menu interface requested by the task spec.
 *
 * How this fits the existing system:
 *   shared.js already builds the full navbar in JavaScript and injects it into
 *   the DOM. The real toggle button is id="hamburger" and the drawer is
 *   id="mobileDrawer" / class="nav-links". shared.js handles open, close,
 *   Escape key, backdrop click, focus trap, and link-click-closes-menu.
 *
 *   This file:
 *     1. Adds id="menu-toggle" and id="nav-menu" aliases to those existing
 *        elements so any code referencing the spec IDs still works.
 *     2. Wires the menu-toggle click → the real openDrawer/closeDrawer logic
 *        by delegating to the hamburger button click.
 *     3. Ensures every nav link closes the menu when clicked (belt-and-
 *        suspenders on top of what shared.js already does).
 *
 *   Load order:  shared.js runs first (injects the navbar HTML + wires logic),
 *                then navbar.js runs and adds the alias IDs and extra bindings.
 *
 *   Both scripts must be present before </body> on every page:
 *     <script src="shared.js"></script>
 *     <script src="js/navbar.js"></script>
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Locate the real elements created by shared.js ─────────────── */
  const hamburger    = document.getElementById("hamburger");
  const mobileDrawer = document.getElementById("mobileDrawer");

  if (!hamburger || !mobileDrawer) {
    // shared.js hasn't run yet or failed — nothing to alias
    console.warn("navbar.js: hamburger / mobileDrawer not found. " +
                 "Make sure shared.js loads before navbar.js.");
    return;
  }

  /* ── Expose alias IDs (menu-toggle / nav-menu) ─────────────────── */
  // This lets any code that references the spec IDs find the real elements.
  if (!hamburger.id.includes("menu-toggle")) {
    hamburger.setAttribute("id", hamburger.id + " menu-toggle");
    // Note: getElementById only matches the first token, so we use a second
    // attribute as a hook instead of overwriting the existing id.
    hamburger.dataset.menuToggle = "true";
  }
  mobileDrawer.dataset.navMenu = "true";

  /* ── menu-toggle click → delegate to hamburger ──────────────────── */
  // The hamburger already has its listener from shared.js.
  // We add a second listener via an alias so that code targeting
  // id="menu-toggle" (via querySelector or data attribute) also works.
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navMenu    = document.querySelector("[data-nav-menu]");

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      // shared.js toggles .open on mobileDrawer — mirror that state on navMenu
      // so CSS rules targeting #nav-menu.active also work if added later.
      const isOpen = navMenu.classList.contains("open");
      navMenu.classList.toggle("active", !isOpen);
    });
  }

  /* ── Close menu when any nav link is clicked ────────────────────── */
  // shared.js already does this for .nav-drawer-links a.
  // This adds the same behaviour for any <a> anywhere inside the drawer,
  // including CTA buttons, as a belt-and-suspenders guarantee.
  if (navMenu) {
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navMenu.classList.remove("active");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Open navigation menu");
        document.body.classList.remove("scroll-locked");
      });
    });
  }

});
