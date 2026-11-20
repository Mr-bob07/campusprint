/**
 * CampusPrint - Find Shops Logic (js/find-shops.js)
 * Implements strict location matching based on Predefined IDs:
 * - Checks shop physical location (shop_location_id) OR shop delivery areas (delivery_areas.location_id)
 * - Sorts by recommended, lowest price, highest rating, and prep time
 */

(function () {
  'use strict';

  // Read URL query parameters
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      location_id: params.get('location_id') || '',
      q: params.get('q') || ''
    };
  }

  // Populate location dropdown
  function populateLocationDropdown() {
    const select = document.getElementById('filterLocation');
    if (!select || select.options.length > 1) return;

    if (typeof window.CP_LOCATIONS !== 'undefined') {
      window.CP_LOCATIONS.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = `${loc.name} (${loc.code})`;
        select.appendChild(opt);
      });
    }
  }

  // Filter and Sort shops
  window.applyFilters = function () {
    const locId = document.getElementById('filterLocation').value;
    const searchVal = document.getElementById('shopSearchInput').value.toLowerCase().trim();
    const openOnly = document.getElementById('filterOpenNow').checked;
    const minRating = parseFloat(document.getElementById('filterRating').value) || 0;
    const sortBy = document.getElementById('sortBy').value;

    // Selected services
    const selectedServices = Array.from(document.querySelectorAll('.service-checkbox:checked')).map(cb => cb.value);

    let shops = (typeof window.CP_SHOPS !== 'undefined') ? [...window.CP_SHOPS] : [];

    // Filter by location
    if (locId) {
      const targetLocId = parseInt(locId, 10);
      shops = shops.filter(shop => {
        const isPhysicallyLocated = shop.shop_location_id === targetLocId;
        const deliversToArea = shop.delivery_areas.some(area => area.location_id === targetLocId);
        return isPhysicallyLocated || deliversToArea;
      });

      // Show active location banner
      const locObj = window.CP_LOCATIONS.find(l => l.id === targetLocId);
      const notice = document.getElementById('activeLocationNotice');
      const noticeText = document.getElementById('activeLocationText');
      if (notice && noticeText && locObj) {
        noticeText.textContent = locObj.name;
        notice.style.display = 'flex';
      }
    } else {
      const notice = document.getElementById('activeLocationNotice');
      if (notice) notice.style.display = 'none';
    }

    // Filter by search text
    if (searchVal) {
      shops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchVal) ||
        shop.address.toLowerCase().includes(searchVal) ||
        shop.services.some(s => s.toLowerCase().includes(searchVal))
      );
    }

    // Filter by Open Now
    if (openOnly) {
      shops = shops.filter(shop => shop.is_open);
    }

    // Filter by Minimum Rating
    if (minRating > 0) {
      shops = shops.filter(shop => shop.rating >= minRating);
    }

    // Filter by Services
    if (selectedServices.length > 0) {
      shops = shops.filter(shop => 
        selectedServices.every(service => shop.services.includes(service))
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      shops.sort((a, b) => a.pricing.bw_a4_single - b.pricing.bw_a4_single);
    } else if (sortBy === 'rating_desc') {
      shops.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'speed') {
      shops.sort((a, b) => parseInt(a.prep_time, 10) - parseInt(b.prep_time, 10));
    } else {
      // Recommended: featured first, then rating
      shops.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
    }

    renderShopsList(shops);
  };

  // Reset all filters
  window.resetFilters = function () {
    document.getElementById('filterLocation').value = '';
    document.getElementById('shopSearchInput').value = '';
    document.getElementById('filterOpenNow').checked = false;
    document.getElementById('filterRating').value = '0';
    document.querySelectorAll('.service-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('sortBy').value = 'recommended';
    window.history.replaceState({}, document.title, window.location.pathname);
    applyFilters();
  };

  // Render cards
  function renderShopsList(shops) {
    const container = document.getElementById('shopsGridContainer');
    const countEl = document.getElementById('shopCount');
    if (countEl) countEl.textContent = shops.length;

    if (!container) return;

    if (shops.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; background: white; border-radius: 1rem; border: 1px dashed var(--color-border); padding: 3rem 1rem;">
          <div class="empty-state-icon">🏪</div>
          <h3>No Printing Shops Found</h3>
          <p>No shops match your chosen location or filters. Try choosing "All Locations" or clear some filter checkboxes.</p>
          <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = shops.map(shop => {
      const statusBadge = shop.is_open 
        ? `<span class="status-badge status-ready">Open</span>`
        : `<span class="status-badge status-cancelled">Closed</span>`;

      const tagsHtml = shop.services.slice(0, 3).map(service => 
        `<span class="tag">${service}</span>`
      ).join('');

      return `
        <div class="shop-card" onclick="window.location.href='shop-details.html?id=${shop.id}'">
          <div class="shop-card-image-placeholder">🖨️</div>
          <div class="shop-card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.4rem;">
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
              <a href="shop-details.html?id=${shop.id}" class="btn btn-primary btn-sm" onclick="event.stopPropagation()">View Details</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateLocationDropdown();
    const query = getQueryParams();
    if (query.location_id) {
      const locSelect = document.getElementById('filterLocation');
      if (locSelect) locSelect.value = query.location_id;
    }
    if (query.q) {
      const searchInput = document.getElementById('shopSearchInput');
      if (searchInput) searchInput.value = decodeURIComponent(query.q);
    }
    applyFilters();
  });
})();
