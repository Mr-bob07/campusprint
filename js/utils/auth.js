/**
 * CampusPrint - Session & Authentication Simulator (js/utils/auth.js)
 * Manages localStorage session:
 * - cp_session: { id, name, email, role: 'customer' | 'shop_owner' | 'admin', shop_id? }
 * - Pre-seeded demo accounts for instant 1-click test login
 */

(function () {
  'use strict';

  const DEMO_ACCOUNTS = {
    customer: {
      id: 101,
      name: "Tanzim Ahmed",
      email: "student@diu.edu.bd",
      phone: "01712345678",
      university: "Daffodil International University",
      department: "Computer Science & Engineering",
      address: "DSC Hall 3, Ashulia, Dhaka",
      role: "customer"
    },
    shop_owner: {
      id: 201,
      name: "Md. Rafiqul Islam",
      email: "smartprint.diu@gmail.com",
      phone: "01711223344",
      role: "shop_owner",
      shop_id: 1, // Smart Print Point
      shop_name: "Smart Print Point"
    },
    admin: {
      id: 1,
      name: "Platform Administrator",
      email: "admin@campusprint.com",
      role: "admin"
    }
  };

  window.CampusPrint = window.CampusPrint || {};

  window.CampusPrint.auth = {
    // Get current logged-in user
    getSession: function () {
      try {
        const raw = localStorage.getItem('cp_session');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    // Set user session
    setSession: function (userData) {
      localStorage.setItem('cp_session', JSON.stringify(userData));
      if (window.CampusPrint.navbar && typeof window.CampusPrint.navbar.refresh === 'function') {
        window.CampusPrint.navbar.refresh();
      }
    },

    // Quick demo login
    demoLogin: function (role) {
      const user = DEMO_ACCOUNTS[role];
      if (user) {
        this.setSession(user);
        if (window.CampusPrint.toast) {
          CampusPrint.toast.success('Logged in!', `Welcome, ${user.name}`);
        }
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          const shopId = params.get('shop_id');
          const target = redirect ? (shopId ? `${redirect}?shop_id=${shopId}` : redirect) : null;

          if (role === 'customer') {
            if (target) {
              window.location.href = target;
            } else {
              window.location.href = window.location.pathname.includes('/customer/') ? 'dashboard.html' : 'customer/dashboard.html';
            }
          } else if (role === 'shop_owner') {
            window.location.href = window.location.pathname.includes('/shop-owner/') ? 'dashboard.html' : 'shop-owner/dashboard.html';
          } else if (role === 'admin') {
            window.location.href = window.location.pathname.includes('/admin/') ? 'dashboard.html' : 'admin/dashboard.html';
          }
        }, 600);
      }
    },

    // Logout
    logout: function () {
      localStorage.removeItem('cp_session');
      if (window.CampusPrint.toast) {
        CampusPrint.toast.info('Logged Out', 'You have been logged out.');
      }
      setTimeout(() => {
        // Redirect to homepage safely relative to current location
        const depth = window.location.pathname.split('/').filter(Boolean).length;
        const target = depth > 0 ? Array(depth).fill('..').join('/') + '/index.html' : 'index.html';
        window.location.href = target;
      }, 500);
    },

    // Role guard: check if user has access to this dashboard
    requireAuth: function (allowedRoles = []) {
      const session = this.getSession();
      if (!session || (allowedRoles.length > 0 && !allowedRoles.includes(session.role))) {
        alert("Authentication required. Redirecting to login...");
        const depth = window.location.pathname.split('/').filter(Boolean).length;
        const root = depth > 0 ? Array(depth).fill('..').join('/') : '.';
        window.location.href = `${root}/pages/customer/login.html`;
        return false;
      }
      return true;
    }
  };

  // Pre-seed demo accounts into localStorage if empty
  if (!localStorage.getItem('cp_demo_initialized')) {
    localStorage.setItem('cp_demo_initialized', 'true');
  }

})();
