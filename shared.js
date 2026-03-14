/**
 * shared.js — VUU Writing Center
 * Injects: top bar · sticky navbar w/ mobile drawer · footer
 * Also handles: scroll reveal · counter animation · navbar scroll tint
 */

document.addEventListener('DOMContentLoaded', function() {

  /* ── Page detection ──────────────────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  var pages = [
    { href: 'index.html',        label: 'Home',        icon: '🏛️' },
    { href: 'appointments.html', label: 'Appointments', icon: '📅', cta: true },
    { href: 'submit-draft.html', label: 'Submit Draft', icon: '📄' },
    { href: 'resources.html',    label: 'Resources',    icon: '📚' },
    { href: 'about.html',        label: 'About',        icon: 'ℹ️' },
    { href: 'contact.html',      label: 'Contact',      icon: '✉️' },
  ];

  /* ── Top bar ─────────────────────────────────────── */
  var topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML =
    '<div class="container">' +
      '<div class="topbar-inner">' +
        '<p>Virginia Union University &nbsp;&middot;&nbsp; Richmond, Virginia &nbsp;&middot;&nbsp; Est. 1865</p>' +
        '<p>Questions? <a href="contact.html">Contact us</a>&ensp;|&ensp;<a href="appointments.html">Book Now &rarr;</a></p>' +
      '</div>' +
    '</div>';

  /* ── Navbar ──────────────────────────────────────── */
  var navbar = document.createElement('nav');
  navbar.className = 'navbar';
  navbar.setAttribute('role', 'navigation');
  navbar.setAttribute('aria-label', 'Main navigation');

  var desktopLinks = pages.map(function(p) {
    var isActive = (p.href === currentPage);
    if (p.cta) {
      return '<a href="' + p.href + '" class="nav-cta-btn' + (isActive ? ' active' : '') + '" aria-current="' + (isActive ? 'page' : 'false') + '">' + p.label + '</a>';
    }
    return '<a href="' + p.href + '" class="' + (isActive ? 'active' : '') + '" aria-current="' + (isActive ? 'page' : 'false') + '">' + p.label + '</a>';
  }).join('');

  var drawerLinks = pages.filter(function(p) { return !p.cta; }).map(function(p) {
    var isActive = (p.href === currentPage);
    return '<a href="' + p.href + '" class="' + (isActive ? 'active' : '') + '" aria-current="' + (isActive ? 'page' : 'false') + '">' +
      '<span style="display:flex;align-items:center;gap:0.75rem">' +
        '<span style="font-size:1.1rem;width:24px;text-align:center">' + p.icon + '</span>' +
        p.label +
      '</span>' +
    '</a>';
  }).join('');

  navbar.innerHTML =
    '<div class="container">' +
      '<div class="navbar-inner">' +
        '<a href="index.html" class="nav-brand" aria-label="VUU Writing Center Home">' +
          '<div class="nav-brand-monogram" aria-hidden="true">WC</div>' +
          '<div class="nav-brand-text">' +
            '<span class="nav-brand-title">Writing Center</span>' +
            '<span class="nav-brand-sub">Virginia Union University</span>' +
          '</div>' +
        '</a>' +
        '<div class="nav-links" id="navLinks" role="menubar">' + desktopLinks + '</div>' +
        '<button class="hamburger" id="hamburger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileDrawer">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="nav-links" id="mobileDrawer" aria-hidden="true">' +
      '<div class="nav-drawer" id="drawerPanel" role="dialog" aria-label="Navigation menu">' +
        '<div class="nav-drawer-header">' +
          '<div class="nav-drawer-brand">' +
            '<div class="nav-brand-monogram" style="width:34px;height:34px;font-size:0.95rem" aria-hidden="true">WC</div>' +
            '<div>' +
              '<div style="font-family:\'Outfit\',sans-serif;font-size:0.85rem;font-weight:700;color:var(--white)">Writing Center</div>' +
              '<div style="font-family:\'Outfit\',sans-serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4)">Virginia Union University</div>' +
            '</div>' +
          '</div>' +
          '<button class="nav-drawer-close" id="drawerClose" aria-label="Close navigation menu">&#x2715;</button>' +
        '</div>' +
        '<div class="nav-drawer-links">' + drawerLinks + '</div>' +
        '<div class="nav-drawer-cta">' +
          '<a href="appointments.html" class="btn btn-gold">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            'Make an Appointment' +
          '</a>' +
          '<a href="submit-draft.html" class="btn btn-ghost-light">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' +
            'Submit a Draft' +
          '</a>' +
          '<div class="nav-drawer-info">Free for all enrolled VUU students<br>Mon&ndash;Fri 9 AM&ndash;6 PM &nbsp;&middot;&nbsp; Sat 10 AM&ndash;2 PM</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ── Footer ──────────────────────────────────────── */
  var footer = document.createElement('footer');
  footer.setAttribute('role', 'contentinfo');
  footer.innerHTML =
    '<div class="container">' +
      '<div class="footer-top">' +
        '<div class="footer-brand-area">' +
          '<div class="fb-logo">' +
            '<div class="fb-mono" aria-hidden="true">WC</div>' +
            '<div>' +
              '<div class="fb-name">VUU Writing Center</div>' +
              '<div class="fb-sub">Virginia Union University</div>' +
            '</div>' +
          '</div>' +
          '<p>Supporting student writers at every stage of the writing process — from brainstorming to final draft. Free for all enrolled VUU students.</p>' +
          '<div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap">' +
            '<a href="mailto:writingcenter@vuu.edu" class="footer-contact-chip">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
              'Email Us' +
            '</a>' +
            '<a href="tel:+18042575600" class="footer-contact-chip">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
              '(804) 257-5600' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>Navigate</h5>' +
          '<ul>' + pages.map(function(p) { return '<li><a href="' + p.href + '">' + p.label + '</a></li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>Services</h5>' +
          '<ul>' +
            '<li><a href="appointments.html">One-on-One Tutoring</a></li>' +
            '<li><a href="submit-draft.html">Draft Review</a></li>' +
            '<li><a href="resources.html">Writing Guides</a></li>' +
            '<li><a href="appointments.html">Workshops</a></li>' +
            '<li><a href="appointments.html">Online Sessions</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h5>Visit Us</h5>' +
          '<p>Wilder Library, Room 118<br>1500 N Lombardy Street<br>Richmond, VA 23220</p>' +
          '<p style="margin-top:1rem"><a href="mailto:writingcenter@vuu.edu">writingcenter@vuu.edu</a></p>' +
          '<p style="margin-top:0.25rem"><a href="tel:+18042575600">(804) 257-5600</a></p>' +
          '<div class="footer-hours">' +
            '<div class="footer-hours-label">Hours</div>' +
            '<p>Mon&ndash;Thu: 9 AM&ndash;7 PM<br>Fri: 9 AM&ndash;4 PM<br>Sat: 10 AM&ndash;2 PM<br><span style="opacity:0.5">Sunday: Closed</span></p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<p>&copy; ' + new Date().getFullYear() + ' Virginia Union University Writing Center. All rights reserved.</p>' +
        '<div class="footer-badge"><span class="dot"></span>Empowering Panthers Since 1865</div>' +
      '</div>' +
    '</div>';

  /* ── Inject into DOM ─────────────────────────────── */
  document.body.insertBefore(navbar, document.body.firstChild);
  document.body.insertBefore(topbar, navbar);
  document.body.appendChild(footer);

  /* ── Mobile drawer logic ─────────────────────────── */
  var hamburger    = document.getElementById('hamburger');
  var mobileDrawer = document.getElementById('mobileDrawer');
  var drawerPanel  = document.getElementById('drawerPanel');
  var drawerClose  = document.getElementById('drawerClose');
  var isOpen = false;

  function openDrawer() {
    isOpen = true;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');
    document.body.classList.add('scroll-locked');
    setTimeout(function() {
      var firstLink = drawerPanel.querySelector('a');
      if (firstLink) firstLink.focus();
    }, 320);
  }

  function closeDrawer() {
    isOpen = false;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    document.body.classList.remove('scroll-locked');
    hamburger.focus();
  }

  hamburger.addEventListener('click', function() { isOpen ? closeDrawer() : openDrawer(); });
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  mobileDrawer.addEventListener('click', function(e) { if (e.target === mobileDrawer) closeDrawer(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && isOpen) closeDrawer(); });

  /* Focus trap inside drawer */
  if (drawerPanel) {
    drawerPanel.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;
      var els = drawerPanel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      var first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawerPanel.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', closeDrawer);
    });
  }

  /* ── Scroll reveal ───────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children).filter(function(c) { return c.classList.contains('reveal'); })
          : [];
        var delay = Math.min(siblings.indexOf(entry.target) * 90, 450);
        setTimeout(function() { entry.target.classList.add('visible'); }, delay);
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });
  } else {
    /* Fallback for old browsers */
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
  }

  /* ── Navbar tint on scroll ───────────────────────── */
  function updateNavbar() {
    navbar.style.background = window.scrollY > 16 ? 'rgba(7,26,53,0.98)' : 'rgba(7,26,53,0.92)';
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ── Counter animation ───────────────────────────── */
  function runCounters() {
    document.querySelectorAll('[data-count]').forEach(function(el) {
      if (el._counted) return;
      el._counted = true;
      var target  = parseFloat(el.getAttribute('data-count'));
      var suffix  = el.getAttribute('data-suffix') || '';
      var prefix  = el.getAttribute('data-prefix') || '';
      var isFloat = String(target).includes('.');
      var start   = performance.now();
      (function step(now) {
        var p = Math.min((now - start) / 1600, 1);
        var v = (1 - Math.pow(1 - p, 3)) * target;
        el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.floor(v).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }
  var firstCounter = document.querySelector('[data-count]');
  if (firstCounter && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) runCounters(); });
    }, { threshold: 0.4 }).observe(firstCounter.closest('section') || firstCounter);
  }

});
