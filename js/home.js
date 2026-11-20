/**
 * CampusPrint - Homepage Controller (js/home.js)
 * Manages:
 * - Dynamic rendering of Featured Shops
 * - Location search bar actions
 * - FAQ accordion toggles
 */

(function () {
  'use strict';

  // Toggle FAQ Accordion
  window.toggleFaq = function (button) {
    const item = button.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');

    // Close other open faqs
    document.querySelectorAll('.faq-item.open').forEach(el => {
      if (el !== item) el.classList.remove('open');
    });

    item.classList.toggle('open', !isOpen);
  };

  // Location search from hero section
  window.heroSearch = function () {
    const locSelect = document.getElementById('heroLocation');
    const searchInput = document.getElementById('heroSearch');

    const locId = locSelect ? locSelect.value : '';
    const query = searchInput ? encodeURIComponent(searchInput.value.trim()) : '';

    let url = 'pages/find-shops.html?';
    if (locId) url += `location_id=${locId}&`;
    if (query) url += `q=${query}&`;

    window.location.href = url.replace(/[&?]$/, '');
  };

  // Quick search button click (e.g. Daffodil Smart City pill)
  window.quickSearch = function (locationId) {
    window.location.href = `pages/find-shops.html?location_id=${locationId}`;
  };

  // Render featured shops
  function renderFeaturedShops() {
    const container = document.getElementById('featuredShopsGrid');
    if (!container) return;

    const shops = (typeof window.CP_SHOPS !== 'undefined') ? window.CP_SHOPS : [];
    const featured = shops.filter(s => s.featured);

    if (featured.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No featured shops found.</p></div>`;
      return;
    }

    container.innerHTML = featured.map(shop => {
      const statusBadge = shop.is_open 
        ? `<span class="status-badge status-ready">Open Now</span>`
        : `<span class="status-badge status-cancelled">Closed</span>`;

      const tagsHtml = shop.services.slice(0, 3).map(service => 
        `<span class="tag">${service}</span>`
      ).join('');

      return `
        <div class="shop-card reveal" onclick="window.location.href='pages/shop-details.html?id=${shop.id}'">
          <div class="shop-card-image-placeholder">🖨️</div>
          <div class="shop-card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
              <h3 class="shop-card-name">${shop.name}</h3>
              ${statusBadge}
            </div>
            <div class="shop-card-address">
              <span>📍</span> <span>${shop.address}</span>
            </div>
            <div class="shop-card-meta">
              <div class="shop-card-rating">
                <span class="stars">★★★★★</span>
                <span>${shop.rating}</span>
                <span class="text-muted">(${shop.total_reviews})</span>
              </div>
              <div class="shop-card-price">
                B&W from <strong>৳${shop.pricing.bw_a4_single.toFixed(2)}</strong>
              </div>
            </div>
            <div class="shop-card-tags">
              ${tagsHtml}
            </div>
            <div class="shop-card-footer">
              <span class="text-sm text-muted">⏱️ ${shop.prep_time}</span>
              <a href="pages/shop-details.html?id=${shop.id}" class="btn btn-primary btn-sm" onclick="event.stopPropagation()">View Shop</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Populate hero location select dynamically if empty
  function populateLocations() {
    const locSelect = document.getElementById('heroLocation');
    if (!locSelect || locSelect.options.length > 1) return;

    if (typeof window.CP_LOCATIONS !== 'undefined') {
      window.CP_LOCATIONS.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = loc.name;
        locSelect.appendChild(opt);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateLocations();
    renderFeaturedShops();
  });
})();
