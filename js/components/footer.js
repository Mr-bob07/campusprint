/**
 * CampusPrint – Footer Component
 * Renders the shared footer across all public pages.
 * Contact info is centralised here — change once, updates everywhere.
 *
 * Usage: Add <div id="footer-placeholder"></div> to any page.
 * The script auto-injects the footer when DOM loads.
 */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     CONTACT CONSTANTS (single source of truth)
  ----------------------------------------------------------------------- */
  const CONTACT = {
    email:     'sowrovtaluk07@gmail.com',
    phone:     '01921646409',
    copyright: '© 2026 CampusPrint. All rights reserved.',
  };

  /* -----------------------------------------------------------------------
     RESOLVE ROOT PATH (handle pages in sub-folders)
  ----------------------------------------------------------------------- */
  function resolvePath(href) {
    if (href.startsWith('/')) {
      const depth = window.location.pathname.split('/').filter(Boolean).length;
      const root  = depth > 0 ? Array(depth).fill('..').join('/') : '';
      return root ? root + href : '.' + href;
    }
    return href;
  }

  /* -----------------------------------------------------------------------
     FOOTER HTML TEMPLATE
  ----------------------------------------------------------------------- */
  function buildFooter() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">

            <!-- Brand Column -->
            <div class="footer-brand">
              <a href="${resolvePath('/index.html')}" class="footer-logo">
                <div class="navbar-logo-icon" style="width:38px;height:38px;background:linear-gradient(135deg,#1E3A8A,#0284C7);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:700;">🖨️</div>
                <span class="brand-name" style="font-family:'Poppins',sans-serif;font-size:1.25rem;font-weight:800;color:#fff;margin-left:10px;">CampusPrint</span>
              </a>
              <p>
                Your campus printing solution. Discover printing shops near your university,
                compare prices, and order documents online — all in one place.
              </p>

              <!-- Social Links -->
              <div class="footer-social">
                <a href="mailto:${CONTACT.email}" title="Email Us" aria-label="Email">
                  ✉️
                </a>
                <a href="tel:+88${CONTACT.phone}" title="Call Us" aria-label="Phone">
                  📞
                </a>
                <a href="#" title="Facebook" aria-label="Facebook">
                  📘
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul class="footer-links">
                <li><a href="${resolvePath('/index.html')}">🏠 Home</a></li>
                <li><a href="${resolvePath('/pages/find-shops.html')}">🔍 Find Shops</a></li>
                <li><a href="${resolvePath('/pages/services.html')}">🛠️ Services</a></li>
                <li><a href="${resolvePath('/pages/about.html')}">ℹ️ About Us</a></li>
                <li><a href="${resolvePath('/pages/faq.html')}">❓ FAQ</a></li>
                <li><a href="${resolvePath('/pages/contact.html')}">📬 Contact</a></li>
              </ul>
            </div>

            <!-- For Users -->
            <div class="footer-col">
              <h4>For Students</h4>
              <ul class="footer-links">
                <li><a href="${resolvePath('/pages/customer/register.html')}">📝 Register</a></li>
                <li><a href="${resolvePath('/pages/customer/login.html')}">🔑 Login</a></li>
                <li><a href="${resolvePath('/pages/customer/place-order.html')}">🖨️ Place Order</a></li>
                <li><a href="${resolvePath('/pages/customer/track-order.html')}">📍 Track Order</a></li>
                <li><a href="${resolvePath('/pages/customer/my-rewards.html')}">⭐ My Rewards</a></li>
              </ul>

              <h4 style="margin-top:1.5rem;">For Shop Owners</h4>
              <ul class="footer-links">
                <li><a href="${resolvePath('/pages/shop-owner/register.html')}">🏪 Register Shop</a></li>
                <li><a href="${resolvePath('/pages/shop-owner/login.html')}">🔑 Owner Login</a></li>
                <li><a href="${resolvePath('/pages/shop-owner/dashboard.html')}">📊 Dashboard</a></li>
                <li><a href="${resolvePath('/pages/admin/login.html')}" style="color:#FDE68A;">🛡️ Admin Portal</a></li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div class="footer-col">
              <h4>Contact Us</h4>

              <div class="footer-contact-item">
                <div class="contact-icon">📍</div>
                <div>
                  <strong style="color:rgba(255,255,255,0.85);font-size:0.875rem;">Location</strong><br>
                  DIU–Ashulia Area, Dhaka, Bangladesh
                </div>
              </div>

              <div class="footer-contact-item">
                <div class="contact-icon">📧</div>
                <div>
                  <strong style="color:rgba(255,255,255,0.85);font-size:0.875rem;">Email</strong><br>
                  <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
                </div>
              </div>

              <div class="footer-contact-item">
                <div class="contact-icon">📞</div>
                <div>
                  <strong style="color:rgba(255,255,255,0.85);font-size:0.875rem;">Phone</strong><br>
                  <a href="tel:+88${CONTACT.phone}">${CONTACT.phone}</a>
                </div>
              </div>

              <!-- COD Notice -->
              <div style="margin-top:1.25rem;padding:0.75rem 1rem;background:rgba(255,255,255,0.08);border-radius:10px;border:1px solid rgba(255,255,255,0.12);">
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.6);margin-bottom:0.25rem;text-transform:uppercase;letter-spacing:0.06em;">Payment</div>
                <div style="font-size:0.875rem;font-weight:600;color:#FDE68A;">💵 Cash on Delivery / Pickup Only</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:0.25rem;">No bKash, Nagad or Card payment</div>
              </div>
            </div>

          </div><!-- /.footer-grid -->
        </div><!-- /.container -->

        <!-- Footer Bottom Bar -->
        <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0;">
          <div class="container">
            <div class="footer-bottom">
              <p class="footer-copyright">${CONTACT.copyright}</p>
              <ul class="footer-bottom-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="${resolvePath('/pages/faq.html')}">Help &amp; FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  /* -----------------------------------------------------------------------
     SCROLL TO TOP BUTTON
  ----------------------------------------------------------------------- */
  function buildScrollTopBtn() {
    return `
      <button
        class="scroll-top-btn"
        id="scrollTopBtn"
        onclick="window.scrollTo({top:0,behavior:'smooth'})"
        aria-label="Scroll to top"
        title="Back to top"
      >
        ↑
      </button>
    `;
  }

  function setupScrollTopBtn() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    const handler = () => {
      btn.classList.toggle('visible', window.scrollY > 300);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
  }

  /* -----------------------------------------------------------------------
     SCROLL REVEAL OBSERVER
  ----------------------------------------------------------------------- */
  function setupScrollReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      els.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(el => observer.observe(el));
  }

  /* -----------------------------------------------------------------------
     TOAST NOTIFICATION SYSTEM (injected globally)
  ----------------------------------------------------------------------- */
  function injectToastContainer() {
    if (document.getElementById('toastContainer')) return;
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  window.CampusPrint = window.CampusPrint || {};
  window.CampusPrint.toast = {
    /**
     * Show a toast notification.
     * @param {string} title   - Bold title text
     * @param {string} message - Smaller body text
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {number}  duration - ms before auto-close (default 4000)
     */
    show(title, message = '', type = 'info', duration = 4000) {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const icons = {
        success: '✅',
        error:   '❌',
        warning: '⚠️',
        info:    'ℹ️',
      };

      const id = 'toast_' + Date.now();
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.id = id;
      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" onclick="CampusPrint.toast.close('${id}')" aria-label="Close">×</button>
      `;

      container.appendChild(toast);

      if (duration > 0) {
        setTimeout(() => this.close(id), duration);
      }
    },

    close(id) {
      const toast = document.getElementById(id);
      if (!toast) return;
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    },

    success(title, msg, duration) { this.show(title, msg, 'success', duration); },
    error(title, msg, duration)   { this.show(title, msg, 'error',   duration); },
    warning(title, msg, duration) { this.show(title, msg, 'warning', duration); },
    info(title, msg, duration)    { this.show(title, msg, 'info',    duration); },
  };

  /* -----------------------------------------------------------------------
     INIT
  ----------------------------------------------------------------------- */
  function initFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) {
      console.warn('[CampusPrint] #footer-placeholder not found.');
      return;
    }

    // Inject footer
    placeholder.innerHTML = buildFooter();

    // Inject scroll-to-top button (into body)
    const scrollBtnWrap = document.createElement('div');
    scrollBtnWrap.innerHTML = buildScrollTopBtn();
    document.body.appendChild(scrollBtnWrap.firstElementChild);

    // Inject toast container
    injectToastContainer();

    // Setup behaviours
    setupScrollTopBtn();
    setupScrollReveal();
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }

})();
