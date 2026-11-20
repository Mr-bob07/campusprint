/**
 * CampusPrint - Shop Details Controller (js/shop-details.js)
 */

(function () {
  'use strict';

  function getShopIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'), 10) || 1;
  }

  function init() {
    const shopId = getShopIdFromUrl();
    const shops = (typeof window.CP_SHOPS !== 'undefined') ? window.CP_SHOPS : [];
    const shop = shops.find(s => s.id === shopId) || shops[0];

    if (!shop) {
      alert("Shop not found.");
      window.location.href = "find-shops.html";
      return;
    }

    // Set document title
    document.title = `${shop.name} – CampusPrint`;

    // Render Banner
    const bannerContainer = document.getElementById('shopBannerContent');
    if (bannerContainer) {
      const statusBadge = shop.is_open 
        ? `<span class="status-badge status-ready">Open Now</span>`
        : `<span class="status-badge status-cancelled">Closed</span>`;

      bannerContainer.innerHTML = `
        <div class="shop-avatar-large">🖨️</div>
        <div class="shop-banner-info">
          <div style="display:flex; align-items:center; gap: 10px; flex-wrap:wrap;">
            <h1>${shop.name}</h1>
            ${statusBadge}
          </div>
          <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin-top: 4px;">${shop.tagline}</p>
          <div class="shop-banner-meta">
            <span>📍 ${shop.address}</span>
            <span>⭐ ${shop.rating} (${shop.total_reviews} reviews)</span>
            <span>⏱️ Avg. Prep: ${shop.prep_time}</span>
            <span>🕒 ${shop.opening_hours}</span>
          </div>
        </div>
      `;
    }

    // Render Pricing Table
    const table = document.getElementById('pricingTable');
    if (table && shop.pricing) {
      const p = shop.pricing;
      table.innerHTML = `
        <thead>
          <tr>
            <th>Service / Option</th>
            <th style="text-align:right;">Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>A4 Black & White (Single Side)</td><td class="price">৳${p.bw_a4_single.toFixed(2)}</td></tr>
          <tr><td>A4 Black & White (Double Side)</td><td class="price">৳${p.bw_a4_double.toFixed(2)}</td></tr>
          <tr><td>A4 Color Print (Single Side)</td><td class="price">৳${p.color_a4_single.toFixed(2)}</td></tr>
          <tr><td>A4 Color Print (Double Side)</td><td class="price">৳${p.color_a4_double.toFixed(2)}</td></tr>
          <tr><td>A3 Black & White (Single Side)</td><td class="price">৳${p.bw_a3_single.toFixed(2)}</td></tr>
          <tr><td>A3 Color Print (Single Side)</td><td class="price">৳${p.color_a3_single.toFixed(2)}</td></tr>
          <tr><td>Spiral Binding</td><td class="price">৳${p.binding_spiral.toFixed(2)}</td></tr>
          <tr><td>Tape / Strip Binding</td><td class="price">৳${p.binding_tape.toFixed(2)}</td></tr>
          <tr><td>Hardcover Thesis Book Binding</td><td class="price">৳${p.binding_hardcover.toFixed(2)}</td></tr>
          <tr><td>A4 Lamination</td><td class="price">৳${p.lamination_a4.toFixed(2)}</td></tr>
          <tr><td>A3 Lamination</td><td class="price">৳${p.lamination_a3.toFixed(2)}</td></tr>
        </tbody>
      `;
    }

    // Render Services Tags
    const servicesList = document.getElementById('servicesList');
    if (servicesList && shop.services) {
      servicesList.innerHTML = shop.services.map(s => `<span class="tag">✓ ${s}</span>`).join('');
    }

    // Render Delivery Areas
    const deliveryList = document.getElementById('deliveryAreasList');
    if (deliveryList && shop.delivery_areas) {
      const locations = (typeof window.CP_LOCATIONS !== 'undefined') ? window.CP_LOCATIONS : [];
      let rows = `
        <div class="delivery-item-row" style="background:#F0FDF4; border: 1px solid #BBF7D0;">
          <span><strong>🏬 Self Pickup (At Shop)</strong></span>
          <span style="font-weight:700; color:#10B981;">৳0 (FREE)</span>
        </div>
      `;

      rows += shop.delivery_areas.map(da => {
        const loc = locations.find(l => l.id === da.location_id);
        const name = loc ? loc.name : `Area #${da.location_id}`;
        return `
          <div class="delivery-item-row">
            <span>🏠 Home Delivery to: <strong>${name}</strong></span>
            <span style="font-weight:700; color:var(--color-primary);">৳${da.charge}</span>
          </div>
        `;
      }).join('');

      deliveryList.innerHTML = rows;
    }

    // Set Loyalty Points rate
    const loyaltyEl = document.getElementById('loyaltyRateText');
    if (loyaltyEl && shop.loyalty_rate_per_10tk) {
      loyaltyEl.textContent = `${shop.loyalty_rate_per_10tk} point${shop.loyalty_rate_per_10tk > 1 ? 's' : ''}`;
    }

    // Update Proceed to Order button link based on auth status
    const orderBtn = document.getElementById('orderNowBtn');
    if (orderBtn) {
      let session = null;
      try {
        const raw = localStorage.getItem('cp_session');
        session = raw ? JSON.parse(raw) : null;
      } catch (e) {}

      // Remove any existing note
      const oldNote = document.getElementById('shopAuthNotice');
      if (oldNote) oldNote.remove();

      if (!session) {
        // Guest user - not logged in
        orderBtn.innerHTML = `🔒 Login as Student to Order`;
        orderBtn.href = `customer/login.html?redirect=place-order.html&shop_id=${shop.id}`;
        orderBtn.className = "btn btn-primary btn-full btn-lg mb-2";

        const note = document.createElement('div');
        note.id = 'shopAuthNotice';
        note.style.cssText = 'font-size:0.775rem; color:#64748B; text-align:center; margin-bottom:12px; line-height:1.4;';
        note.innerHTML = `Sign in with your student account to place orders.<br/>New student? <a href="customer/register.html" style="font-weight:600; color:var(--color-primary);">Register here</a>`;
        orderBtn.insertAdjacentElement('afterend', note);
      } else if (session.role === 'customer') {
        // Logged in student
        orderBtn.innerHTML = `🖨️ Proceed to Order (${session.name.split(' ')[0]})`;
        orderBtn.href = `customer/place-order.html?shop_id=${shop.id}`;
        orderBtn.className = "btn btn-primary btn-full btn-lg mb-3";
      } else {
        // Logged in as shop_owner or admin
        orderBtn.innerHTML = `⚠️ Switch to Student Account to Order`;
        orderBtn.href = `customer/login.html?redirect=place-order.html&shop_id=${shop.id}`;
        orderBtn.className = "btn btn-outline btn-full btn-lg mb-2";

        const note = document.createElement('div');
        note.id = 'shopAuthNotice';
        note.style.cssText = 'font-size:0.775rem; color:#D97706; text-align:center; margin-bottom:12px;';
        note.innerHTML = `Currently logged in as <strong>${session.role === 'admin' ? 'Admin' : 'Shop Owner'}</strong>. Print orders require a student account.`;
        orderBtn.insertAdjacentElement('afterend', note);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
