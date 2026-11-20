/**
 * CampusPrint - Place Order & Live Price Calculator (js/place-order.js)
 * Enforces business rules:
 * - Printing Cost = Shop Rate × Pages × Copies
 * - Total Payable = Printing Cost + Services + Delivery Charge - Discount
 * - Only uses selected shop's individual rates
 * - Self pickup = ৳0
 * - Home delivery charge based on selected shop's delivery_areas
 */

(function () {
  'use strict';

  let currentShop = null;
  let selectedPdfFileName = "My_Uploaded_Document.pdf";

  function getQueryShopId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('shop_id'), 10) || 1;
  }

  // Populate Shop Selection Dropdown
  function populateShopsDropdown() {
    const select = document.getElementById('selectedShopSelect');
    if (!select) return;

    const shops = (typeof window.CP_SHOPS !== 'undefined') ? window.CP_SHOPS : [];
    const targetShopId = getQueryShopId();

    select.innerHTML = shops.map(shop => 
      `<option value="${shop.id}" ${shop.id === targetShopId ? 'selected' : ''}>${shop.name} (${shop.address})</option>`
    ).join('');

    onShopChange();
  }

  // When selected shop changes
  window.onShopChange = function () {
    const select = document.getElementById('selectedShopSelect');
    if (!select) return;

    const shopId = parseInt(select.value, 10);
    const shops = (typeof window.CP_SHOPS !== 'undefined') ? window.CP_SHOPS : [];
    currentShop = shops.find(s => s.id === shopId) || shops[0];

    // Update shop name in summary
    const summaryNameEl = document.getElementById('summaryShopName');
    if (summaryNameEl && currentShop) {
      summaryNameEl.textContent = currentShop.name;
    }

    // Populate Delivery Areas for this shop
    populateDeliveryAreasForShop(currentShop);

    // Recalculate price with new shop rates
    calculateLivePrice();
  };

  // Populate delivery areas specific to this shop
  function populateDeliveryAreasForShop(shop) {
    const areaSelect = document.getElementById('deliveryAreaSelect');
    if (!areaSelect || !shop) return;

    const locations = (typeof window.CP_LOCATIONS !== 'undefined') ? window.CP_LOCATIONS : [];

    if (!shop.delivery_areas || shop.delivery_areas.length === 0) {
      areaSelect.innerHTML = `<option value="">This shop only offers Self-Pickup</option>`;
      return;
    }

    areaSelect.innerHTML = shop.delivery_areas.map(da => {
      const loc = locations.find(l => l.id === da.location_id);
      const name = loc ? loc.name : `Area #${da.location_id}`;
      return `<option value="${da.location_id}" data-charge="${da.charge}">${name} (+৳${da.charge})</option>`;
    }).join('');

    updateDeliveryChargeHint();
  }

  function updateDeliveryChargeHint() {
    const areaSelect = document.getElementById('deliveryAreaSelect');
    const hint = document.getElementById('deliveryChargeHint');
    if (!areaSelect || !hint) return;

    const selectedOption = areaSelect.options[areaSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.charge) {
      hint.textContent = `Delivery charge for this area: ৳${selectedOption.dataset.charge}`;
    } else {
      hint.textContent = '';
    }
  }

  // Delivery radio toggle
  window.onDeliveryTypeChange = function () {
    const isHome = document.getElementById('delivHome').checked;
    const homeGroup = document.getElementById('homeDeliveryAreaGroup');
    if (homeGroup) {
      homeGroup.style.display = isHome ? 'block' : 'none';
    }
    calculateLivePrice();
  };

  // File upload change
  window.onFileSelected = function (input) {
    if (input.files && input.files[0]) {
      selectedPdfFileName = input.files[0].name;
      document.getElementById('pdfStatusText').innerHTML = `Selected: <strong>${selectedPdfFileName}</strong>`;
    }
  };

  // LIVE PRICE CALCULATOR CORE FORMULA
  window.calculateLivePrice = function () {
    if (!currentShop) return;

    const printType = document.getElementById('printType').value; // bw | color
    const paperSize = document.getElementById('paperSize').value; // A4 | A3
    const printSide = document.querySelector('input[name="print_side"]:checked').value; // single | double
    const pages = Math.max(1, parseInt(document.getElementById('pageCount').value, 10) || 1);
    const copies = Math.max(1, parseInt(document.getElementById('copyCount').value, 10) || 1);
    const binding = document.getElementById('bindingOption').value; // none | spiral | tape | hardcover
    const lamination = document.getElementById('laminationOption').value; // none | lamination_a4 | lamination_a3
    const isHomeDelivery = document.getElementById('delivHome').checked;

    // 1. Determine Per-Page Rate from selected shop
    let rateKey = `${printType}_${paperSize.toLowerCase()}_${printSide}`;
    // If A3 double is requested but only single exists in model, default to 2x single
    let perPageRate = currentShop.pricing[rateKey];
    if (!perPageRate) {
      if (paperSize === 'A3') {
        perPageRate = (currentShop.pricing[`${printType}_a3_single`] || 5.0) * (printSide === 'double' ? 1.8 : 1.0);
      } else {
        perPageRate = currentShop.pricing.bw_a4_single;
      }
    }

    // 2. Printing Cost = Rate × Pages × Copies
    const printingCost = perPageRate * pages * copies;

    // 3. Binding Cost
    let bindingCost = 0;
    let bindingLabel = '';
    if (binding === 'spiral') {
      bindingCost = (currentShop.pricing.binding_spiral || 25) * copies;
      bindingLabel = `Spiral Binding (${copies} copies)`;
    } else if (binding === 'tape') {
      bindingCost = (currentShop.pricing.binding_tape || 15) * copies;
      bindingLabel = `Tape Binding (${copies} copies)`;
    } else if (binding === 'hardcover') {
      bindingCost = (currentShop.pricing.binding_hardcover || 120) * copies;
      bindingLabel = `Hardcover Thesis Book (${copies} copies)`;
    }

    // 4. Lamination Cost
    let laminationCost = 0;
    let laminationLabel = '';
    if (lamination === 'lamination_a4') {
      laminationCost = (currentShop.pricing.lamination_a4 || 10) * copies;
      laminationLabel = `A4 Lamination (${copies} cover sheets)`;
    } else if (lamination === 'lamination_a3') {
      laminationCost = (currentShop.pricing.lamination_a3 || 20) * copies;
      laminationLabel = `A3 Lamination (${copies} sheets)`;
    }

    // 5. Delivery Charge
    let deliveryCharge = 0;
    let deliveryLabel = 'Self Pickup (At Shop)';
    if (isHomeDelivery) {
      const areaSelect = document.getElementById('deliveryAreaSelect');
      const selectedOpt = areaSelect ? areaSelect.options[areaSelect.selectedIndex] : null;
      if (selectedOpt && selectedOpt.dataset.charge) {
        deliveryCharge = parseFloat(selectedOpt.dataset.charge) || 0;
        deliveryLabel = `Home Delivery (${selectedOpt.text.split('(')[0].trim()})`;
      } else {
        deliveryCharge = 20;
        deliveryLabel = 'Home Delivery';
      }
      updateDeliveryChargeHint();
    }

    // 6. Discount (0 for fresh orders)
    const discount = 0;

    // 7. Final Total Payable
    const totalPayable = printingCost + bindingCost + laminationCost + deliveryCharge - discount;

    // 8. Update UI summary
    const typeLabel = printType === 'bw' ? 'B&W' : 'Color';
    const sideLabel = printSide === 'single' ? 'Single' : 'Double';
    document.getElementById('summaryPrintingDesc').textContent = `${typeLabel} ${paperSize} ${sideLabel} (${pages} pgs × ${copies} set${copies > 1 ? 's' : ''})`;
    document.getElementById('summaryPrintingCost').textContent = `৳${printingCost.toFixed(2)}`;

    // Binding line
    const bindingLine = document.getElementById('summaryBindingLine');
    if (bindingCost > 0) {
      document.getElementById('summaryBindingDesc').textContent = bindingLabel;
      document.getElementById('summaryBindingCost').textContent = `৳${bindingCost.toFixed(2)}`;
      bindingLine.style.display = 'flex';
    } else {
      bindingLine.style.display = 'none';
    }

    // Lamination line
    const laminationLine = document.getElementById('summaryLaminationLine');
    if (laminationCost > 0) {
      document.getElementById('summaryLaminationDesc').textContent = laminationLabel;
      document.getElementById('summaryLaminationCost').textContent = `৳${laminationCost.toFixed(2)}`;
      laminationLine.style.display = 'flex';
    } else {
      laminationLine.style.display = 'none';
    }

    // Delivery line
    document.getElementById('summaryDeliveryDesc').textContent = deliveryLabel;
    document.getElementById('summaryDeliveryCost').textContent = `৳${deliveryCharge.toFixed(2)}`;

    // Total line
    document.getElementById('summaryTotalPayable').textContent = `৳${totalPayable.toFixed(2)}`;

    // Forecast loyalty points
    const pointsRate = currentShop.loyalty_rate_per_10tk || 1.0;
    const estimatedPoints = Math.floor((totalPayable / 10) * pointsRate);
    document.getElementById('forecastPoints').textContent = `${estimatedPoints} points`;
  };

  // Check Student Authentication
  function checkStudentAuth() {
    let session = null;
    try {
      const raw = localStorage.getItem('cp_session');
      session = raw ? JSON.parse(raw) : null;
    } catch (e) {}

    if (!session || session.role !== 'customer') {
      const shopId = getQueryShopId();
      alert("🔒 Student Login Required!\n\nYou must be signed in with a student account to upload files and place printing orders.\n\nRedirecting you to the student login page...");
      window.location.href = `login.html?redirect=place-order.html&shop_id=${shopId}`;
      return false;
    }
    return true;
  }

  // Handle Order Submit
  window.handlePlaceOrder = function (e) {
    e.preventDefault();

    let session = null;
    try {
      const raw = localStorage.getItem('cp_session');
      session = raw ? JSON.parse(raw) : null;
    } catch (e) {}

    if (!session || session.role !== 'customer') {
      alert("🔒 Please log in as a student to place an order.");
      const shopId = currentShop ? currentShop.id : 1;
      window.location.href = `login.html?redirect=place-order.html&shop_id=${shopId}`;
      return;
    }

    if (!currentShop) {
      alert("Please select a shop first.");
      return;
    }

    const isHome = document.getElementById('delivHome').checked;
    const areaSelect = document.getElementById('deliveryAreaSelect');
    const areaId = isHome && areaSelect ? parseInt(areaSelect.value, 10) : null;
    const address = isHome ? (document.getElementById('deliveryAddress').value || "Hostel Address") : `Pickup at ${currentShop.name}`;

    const orderId = "CP-" + Math.floor(1000 + Math.random() * 9000);
    const pages = parseInt(document.getElementById('pageCount').value, 10);
    const copies = parseInt(document.getElementById('copyCount').value, 10);
    const totalAmount = parseFloat(document.getElementById('summaryTotalPayable').textContent.replace('৳', ''));

    const newOrder = {
      id: orderId,
      customer_id: session.id,
      customer_name: session.name,
      customer_phone: document.getElementById('customerPhone').value,
      shop_id: currentShop.id,
      shop_name: currentShop.name,
      document_name: selectedPdfFileName,
      print_type: document.getElementById('printType').value,
      paper_size: document.getElementById('paperSize').value,
      print_side: document.querySelector('input[name="print_side"]:checked').value,
      pages: pages,
      copies: copies,
      binding: document.getElementById('bindingOption').value,
      lamination: document.getElementById('laminationOption').value,
      delivery_type: isHome ? 'home_delivery' : 'self_pickup',
      delivery_area_id: areaId,
      delivery_address: address,
      total_payable: totalAmount,
      payment_method: "COD",
      payment_status: "unpaid",
      order_status: "pending",
      loyalty_points_earned: 0,
      created_at: new Date().toLocaleString()
    };

    // Save to localStorage
    let orders = [];
    try {
      const saved = localStorage.getItem('cp_orders');
      if (saved) orders = JSON.parse(saved);
    } catch (err) {}
    orders.unshift(newOrder);
    localStorage.setItem('cp_orders', JSON.stringify(orders));

    // Redirect to tracking page
    alert(`🎉 Order #${orderId} placed successfully with ${currentShop.name}!\nPayment: Cash on Delivery / Pickup (৳${totalAmount.toFixed(2)}).`);
    window.location.href = `track-order.html?order_id=${orderId}`;
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!checkStudentAuth()) return;
    populateShopsDropdown();
  });
})();
