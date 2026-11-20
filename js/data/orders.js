/**
 * CampusPrint - Orders Data (js/data/orders.js)
 * Status lifecycle:
 * - pending: Placed by student, waiting for shop owner acceptance
 * - accepted: Accepted by shop owner
 * - processing: Currently printing / binding
 * - ready: Ready for pickup or out for delivery
 * - completed: Delivered / Picked up
 * - cancelled: Cancelled / Rejected
 *
 * Payment Status:
 * - unpaid / cod_pending: Cash on Delivery not yet received
 * - paid: Verified cash received by shop owner
 */

const CP_ORDERS = [
  {
    id: "CP-1042",
    customer_id: 101,
    customer_name: "Tanzim Ahmed",
    customer_phone: "01712345678",
    shop_id: 1, // Smart Print Point
    shop_name: "Smart Print Point",
    document_name: "CSE412_Computer_Networks_Thesis.pdf",
    print_type: "bw", // bw | color
    paper_size: "A4",
    print_side: "double",
    pages: 48,
    copies: 2,
    binding: "Spiral Binding",
    lamination: "None",
    delivery_type: "home_delivery", // self_pickup | home_delivery
    delivery_area_id: 1, // Daffodil Smart City
    delivery_address: "DSC Hall 3, Room 402, Daffodil Smart City",
    printing_cost: 120.00,
    binding_cost: 50.00,
    lamination_cost: 0.00,
    delivery_charge: 20.00,
    discount: 0.00,
    total_payable: 190.00,
    payment_method: "COD",
    payment_status: "paid", // strictly verified paid
    order_status: "completed",
    loyalty_points_earned: 38, // 190 / 10 * 2 = 38 points
    created_at: "2026-11-18 10:30 AM"
  },
  {
    id: "CP-1049",
    customer_id: 101,
    customer_name: "Tanzim Ahmed",
    customer_phone: "01712345678",
    shop_id: 1,
    shop_name: "Smart Print Point",
    document_name: "Algorithms_Lab_Report_04.pdf",
    print_type: "color",
    paper_size: "A4",
    print_side: "single",
    pages: 12,
    copies: 1,
    binding: "Tape Binding",
    lamination: "None",
    delivery_type: "self_pickup",
    delivery_area_id: null,
    delivery_address: "Pickup at Smart Print Point counter",
    printing_cost: 60.00,
    binding_cost: 15.00,
    lamination_cost: 0.00,
    delivery_charge: 0.00,
    discount: 0.00,
    total_payable: 75.00,
    payment_method: "COD",
    payment_status: "unpaid",
    order_status: "ready", // ready for pickup
    loyalty_points_earned: 0, // 0 until completed and paid!
    created_at: "2026-11-20 01:15 PM"
  },
  {
    id: "CP-1035",
    customer_id: 101,
    customer_name: "Tanzim Ahmed",
    customer_phone: "01712345678",
    shop_id: 2, // Campus Xerox & Digital Lab
    shop_name: "Campus Xerox & Digital Lab",
    document_name: "Engineering_Drawing_Sheet.pdf",
    print_type: "color",
    paper_size: "A3",
    print_side: "single",
    pages: 4,
    copies: 1,
    binding: "None",
    lamination: "A3 Lamination",
    delivery_type: "home_delivery",
    delivery_area_id: 5, // Hall Area
    delivery_address: "Opposite Yunus Khan Scholar Garden",
    printing_cost: 56.00,
    binding_cost: 0.00,
    lamination_cost: 20.00,
    delivery_charge: 10.00,
    discount: 0.00,
    total_payable: 86.00,
    payment_method: "COD",
    payment_status: "paid",
    order_status: "completed",
    loyalty_points_earned: 12, // 86 / 10 * 1.5 = 12 points
    created_at: "2026-11-15 04:45 PM"
  }
];

if (typeof window !== 'undefined') {
  // Load existing orders from localStorage if available, otherwise initialize with CP_ORDERS
  const saved = localStorage.getItem('cp_orders');
  if (saved) {
    try {
      window.CP_ORDERS = JSON.parse(saved);
    } catch (e) {
      window.CP_ORDERS = CP_ORDERS;
      localStorage.setItem('cp_orders', JSON.stringify(CP_ORDERS));
    }
  } else {
    window.CP_ORDERS = CP_ORDERS;
    localStorage.setItem('cp_orders', JSON.stringify(CP_ORDERS));
  }
}
