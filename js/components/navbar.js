/**
 * CampusPrint – Navbar Component
 * Dynamic navbar that adapts to guest / customer / shop-owner / admin roles.
 * Reads session from localStorage (set by auth.js in Phase 2).
 *
 * Usage: Call initNavbar() after the DOM loads.
 * The target element must have id="navbar-placeholder".
 */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     NAV LINK DEFINITIONS PER ROLE
  ----------------------------------------------------------------------- */
  const NAV_LINKS = {
    guest: [
      { label: 'Home',       href: '/index.html' },
      { label: 'Find Shops', href: '/pages/find-shops.html' },
      { label: 'Services',   href: '/pages/services.html' },
      { label: 'About Us',   href: '/pages/about.html' },
      { label: 'Contact',    href: '/pages/contact.html' },
    ],
    customer: [
      { label: 'Find Shops',   href: '/pages/find-shops.html' },
      { label: 'My Orders',    href: '/pages/customer/my-orders.html' },
      { label: 'Track Order',  href: '/pages/customer/track-order.html' },
      { label: 'My Rewards',   href: '/pages/customer/my-rewards.html' },
    ],
    shop_owner: [
      { label: 'Dashboard',    href: '/pages/shop-owner/dashboard.html' },
      { label: 'Orders',       href: '/pages/shop-owner/manage-orders.html' },
      { label: 'Services',     href: '/pages/shop-owner/manage-services.html' },
      { label: 'Analytics',    href: '/pages/shop-owner/sales-analytics.html' },
    ],
    admin: [
      { label: 'Dashboard',    href: '/pages/admin/dashboard.html' },
      { label: 'Approvals',    href: '/pages/admin/shop-approval.html' },
      { label: 'Users',        href: '/pages/admin/user-management.html' },
      { label: 'Orders',       href: '/pages/admin/order-monitoring.html' },
    ],
  };

  /* -----------------------------------------------------------------------
     USER MENU ITEMS PER ROLE
  ----------------------------------------------------------------------- */
  const USER_MENUS = {
    customer: [
      { label: 'My Dashboard',    icon: '🏠', href: '/pages/customer/dashboard.html' },
      { label: 'My Profile',      icon: '👤', href: '/pages/customer/my-profile.html' },
      { label: 'My Orders',       icon: '📦', href: '/pages/customer/my-orders.html' },
      { label: 'Favourite Shops', icon: '❤️', href: '/pages/customer/favorite-shops.html' },
      { label: 'My Rewards',      icon: '⭐', href: '/pages/customer/my-rewards.html' },
      { divider: true },
      { label: 'Logout',          icon: '🚪', action: 'logout', danger: true },
    ],
    shop_owner: [
      { label: 'Dashboard',       icon: '📊', href: '/pages/shop-owner/dashboard.html' },
      { label: 'Shop Profile',    icon: '🏪', href: '/pages/shop-owner/shop-profile.html' },
      { label: 'Manage Orders',   icon: '📋', href: '/pages/shop-owner/manage-orders.html' },
      { label: 'Sales Analytics', icon: '📈', href: '/pages/shop-owner/sales-analytics.html' },
      { divider: true },
      { label: 'Logout',          icon: '🚪', action: 'logout', danger: true },
    ],
    admin: [
      { label: 'Admin Dashboard', icon: '🛡️', href: '/pages/admin/dashboard.html' },
      { divider: true },
      { label: 'Logout',          icon: '🚪', action: 'logout', danger: true },
    ],
  };

  /* -----------------------------------------------------------------------
     RESOLVE ROOT PATH (handle pages in sub-folders)
  ----------------------------------------------------------------------- */
  function resolveRoot() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // If we are inside pages/customer/ (depth 2) → go up 2 levels, etc.
    if (depth === 0) return '';
    return Array(depth).fill('..').join('/');
  }

  function resolvePath(href) {
    if (href.startsWith('/')) {
      // Absolute path from project root – resolve relative to current page
      const root = resolveRoot();
      return root ? root + href : '.' + href;
    }
    return href;
  }

  /* -----------------------------------------------------------------------
     GET CURRENT SESSION
  ----------------------------------------------------------------------- */
  function getSession() {
    try {
      const raw = localStorage.getItem('cp_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /* -----------------------------------------------------------------------
     RENDER NAV LINKS
  ----------------------------------------------------------------------- */
  function renderNavLinks(links) {
    return links.map(link => {
      const href = resolvePath(link.href);
      const isActive = window.location.pathname.endsWith(
        link.href.replace(/^\//, '').replace(/^\.\//, '')
      );
      return `
        <li>
          <a href="${href}" class="nav-link ${isActive ? 'active' : ''}">
            ${link.label}
          </a>
        </li>
      `;
    }).join('');
  }

  /* -----------------------------------------------------------------------
     RENDER MOBILE NAV LINKS
  ----------------------------------------------------------------------- */
  function renderMobileLinks(links, session) {
    let html = links.map(link => {
      const href = resolvePath(link.href);
      return `<a href="${href}" class="mobile-nav-link">${link.label}</a>`;
    }).join('');

    html += `<div class="mobile-nav-actions">`;
    if (!session) {
      html += `
        <a href="${resolvePath('/pages/customer/login.html')}" class="btn btn-outline btn-full">🎓 Student Login</a>
        <a href="${resolvePath('/pages/shop-owner/login.html')}" class="btn btn-primary btn-full">🏪 Shop Owner Login</a>
        <a href="${resolvePath('/pages/admin/login.html')}" class="btn btn-outline btn-full" style="border:2px solid #0F172A; color:#0F172A; font-weight:700; background:#F8FAFC;">🛡️ Admin Login</a>
      `;
    } else {
      html += `
        <button class="btn btn-danger btn-full" onclick="CampusPrint.auth.logout()">🚪 Logout</button>
      `;
    }
    html += `</div>`;
    return html;
  }

  /* -----------------------------------------------------------------------
     RENDER USER MENU (authenticated)
  ----------------------------------------------------------------------- */
  function renderUserMenu(session) {
    const menuItems = USER_MENUS[session.role] || [];
    const initials = session.name
      ? session.name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
      : '?';
    const roleLabel = {
      customer:   'Student',
      shop_owner: 'Shop Owner',
      admin:      'Admin',
    }[session.role] || 'User';

    const itemsHtml = menuItems.map(item => {
      if (item.divider) return `<div class="user-menu-divider"></div>`;
      if (item.action === 'logout') {
        return `
          <button class="user-menu-item danger" onclick="CampusPrint.auth.logout()">
            <span>${item.icon}</span> ${item.label}
          </button>
        `;
      }
      return `
        <a href="${resolvePath(item.href)}" class="user-menu-item">
          <span>${item.icon}</span> ${item.label}
        </a>
      `;
    }).join('');

    return `
      <div class="user-menu" id="userMenu">
        <button class="user-menu-trigger" onclick="CampusPrint.navbar.toggleUserMenu()">
          <div class="user-avatar">${initials}</div>
          <span>${session.name ? session.name.split(' ')[0] : 'Account'}</span>
          <span style="font-size:10px; margin-left:2px;">▼</span>
        </button>
        <div class="user-menu-dropdown">
          <div class="user-menu-header">
            <div class="user-name">${session.name || 'User'}</div>
            <div class="user-role">${roleLabel}</div>
          </div>
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  /* -----------------------------------------------------------------------
     RENDER AUTH BUTTONS (guest)
  ----------------------------------------------------------------------- */
  function renderAuthButtons() {
    return `
      <a href="${resolvePath('/pages/customer/login.html')}" class="btn btn-ghost btn-sm">
        Student Login
      </a>
      <a href="${resolvePath('/pages/shop-owner/login.html')}" class="btn btn-primary btn-sm">
        Shop Owner Login
      </a>
      <a href="${resolvePath('/pages/admin/login.html')}" class="btn btn-outline btn-sm" style="border: 1.5px solid #0F172A; color: #0F172A; font-weight: 700; background: #F8FAFC; display: inline-flex; align-items: center; gap: 4px;" title="Platform Administrator Login">
        🛡️ Admin Login
      </a>
    `;
  }

  /* -----------------------------------------------------------------------
     BUILD FULL NAVBAR HTML
  ----------------------------------------------------------------------- */
  function buildNavbar() {
    const session = getSession();
    const role = session ? session.role : 'guest';
    const links = NAV_LINKS[role] || NAV_LINKS.guest;

    const actionsHtml = session ? renderUserMenu(session) : renderAuthButtons();

    return `
      <nav class="navbar" id="mainNavbar">
        <div class="navbar-inner">

          <!-- Logo -->
          <a href="${resolvePath('/index.html')}" class="navbar-logo">
            <div class="navbar-logo-icon">🖨️</div>
            <div class="navbar-logo-text">
              <span class="brand-name">CampusPrint</span>
              <span class="brand-tagline">Your Campus. Your Shop. Your Print.</span>
            </div>
          </a>

          <!-- Desktop Nav -->
          <ul class="navbar-nav">
            ${renderNavLinks(links)}
          </ul>

          <!-- Desktop Actions -->
          <div class="navbar-actions">
            ${actionsHtml}
          </div>

          <!-- Mobile Hamburger -->
          <button
            class="navbar-hamburger"
            id="hamburgerBtn"
            aria-label="Toggle menu"
            onclick="CampusPrint.navbar.toggleMobileNav()"
          >
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>

        </div>
      </nav>

      <!-- Mobile Nav Drawer -->
      <div class="mobile-nav" id="mobileNav">
        ${renderMobileLinks(links, session)}
      </div>
    `;
  }

  /* -----------------------------------------------------------------------
     SCROLL HANDLER – add shadow on scroll
  ----------------------------------------------------------------------- */
  function setupScrollHandler() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;
    const handler = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler(); // run once on load
  }

  /* -----------------------------------------------------------------------
     CLOSE MENUS ON OUTSIDE CLICK
  ----------------------------------------------------------------------- */
  function setupOutsideClick() {
    document.addEventListener('click', (e) => {
      // User menu
      const userMenu = document.getElementById('userMenu');
      if (userMenu && !userMenu.contains(e.target)) {
        userMenu.classList.remove('open');
      }
      // Mobile nav
      const mobileNav = document.getElementById('mobileNav');
      const hamburger = document.getElementById('hamburgerBtn');
      if (
        mobileNav &&
        mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        hamburger &&
        !hamburger.contains(e.target)
      ) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  /* -----------------------------------------------------------------------
     PUBLIC API
  ----------------------------------------------------------------------- */
  window.CampusPrint = window.CampusPrint || {};
  window.CampusPrint.navbar = {

    toggleUserMenu() {
      const menu = document.getElementById('userMenu');
      if (menu) menu.classList.toggle('open');
    },

    toggleMobileNav() {
      const nav = document.getElementById('mobileNav');
      const btn = document.getElementById('hamburgerBtn');
      if (nav) nav.classList.toggle('open');
      if (btn) btn.classList.toggle('open');
    },

    closeMobileNav() {
      const nav = document.getElementById('mobileNav');
      const btn = document.getElementById('hamburgerBtn');
      if (nav) nav.classList.remove('open');
      if (btn) btn.classList.remove('open');
    },

    /** Call after a login/logout to re-render without page reload */
    refresh() {
      const placeholder = document.getElementById('navbar-placeholder');
      if (placeholder) {
        placeholder.innerHTML = buildNavbar();
        setupScrollHandler();
      }
    },
  };

  /* -----------------------------------------------------------------------
     INIT
  ----------------------------------------------------------------------- */
  function initNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) {
      console.warn('[CampusPrint] #navbar-placeholder not found.');
      return;
    }
    placeholder.innerHTML = buildNavbar();
    setupScrollHandler();
    setupOutsideClick();
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }

})();
