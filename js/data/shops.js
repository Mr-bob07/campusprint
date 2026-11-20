/**
 * CampusPrint - Verified & Demo Printing Shops Data
 * Enforces business rules:
 * - Each shop has independent pricing for B&W, Color, A4, A3, Binding, Lamination
 * - Physical location vs delivery areas
 * - Specific loyalty points accrual rules (e.g. 1, 1.5, or 2 points per ৳10 spent)
 * - Discount levels (5,000 points = 5%, 10,000 points = 10%)
 */

const CP_SHOPS = [
  {
    id: 1,
    name: "Smart Print Point",
    tagline: "Fastest thesis & assignment printing inside campus",
    owner_name: "Md. Rafiqul Islam",
    shop_location_id: 1, // Daffodil Smart City
    address: "Gate 1, Daffodil Smart City, Ashulia",
    phone: "01711223344",
    email: "smartprint.diu@gmail.com",
    opening_hours: "8:00 AM - 10:00 PM",
    is_open: true,
    rating: 4.9,
    total_reviews: 142,
    prep_time: "20-30 mins",
    featured: true,
    verified: true,
    loyalty_rate_per_10tk: 2.0, // 2 points per 10 Tk
    delivery_areas: [
      { location_id: 1, charge: 20 }, // Daffodil Smart City
      { location_id: 2, charge: 30 }, // Ashulia
      { location_id: 5, charge: 15 }  // Hall Area
    ],
    pricing: {
      bw_a4_single: 1.50,
      bw_a4_double: 2.50,
      color_a4_single: 5.00,
      color_a4_double: 8.00,
      bw_a3_single: 6.00,
      color_a3_single: 15.00,
      binding_spiral: 25.00,
      binding_tape: 15.00,
      binding_hardcover: 120.00,
      lamination_a4: 12.00,
      lamination_a3: 25.00
    },
    services: ["B&W Print", "Color Print", "Spiral Binding", "Tape Binding", "Hardcover Thesis", "Lamination", "Urgent Print"]
  },
  {
    id: 2,
    name: "Campus Xerox & Digital Lab",
    tagline: "Quality color prints, poster & engineering drawing",
    owner_name: "Kamrul Hasan",
    shop_location_id: 5, // Hall Area
    address: "Opposite Yunus Khan Scholar Garden, DIU",
    phone: "01819887766",
    email: "campuszerox.lab@gmail.com",
    opening_hours: "8:30 AM - 11:00 PM",
    is_open: true,
    rating: 4.8,
    total_reviews: 98,
    prep_time: "25-35 mins",
    featured: true,
    verified: true,
    loyalty_rate_per_10tk: 1.5, // 1.5 points per 10 Tk
    delivery_areas: [
      { location_id: 5, charge: 10 }, // Hall Area
      { location_id: 1, charge: 20 }, // Daffodil Smart City
      { location_id: 2, charge: 30 }, // Ashulia
      { location_id: 6, charge: 25 }  // Model Town
    ],
    pricing: {
      bw_a4_single: 1.50,
      bw_a4_double: 2.20,
      color_a4_single: 4.50,
      color_a4_double: 7.50,
      bw_a3_single: 5.00,
      color_a3_single: 14.00,
      binding_spiral: 20.00,
      binding_tape: 15.00,
      binding_hardcover: 110.00,
      lamination_a4: 10.00,
      lamination_a3: 20.00
    },
    services: ["B&W Print", "Color Print", "Spiral Binding", "Tape Binding", "A3 Drawing", "Lamination"]
  },
  {
    id: 3,
    name: "Ashulia Quick Prints",
    tagline: "Budget-friendly bulk copy and binding specialist",
    owner_name: "Tanvir Ahmed",
    shop_location_id: 2, // Ashulia
    address: "Boro Ashulia Main Road, Near Bus Stand",
    phone: "01912345678",
    email: "ashuliaquickprint@gmail.com",
    opening_hours: "9:00 AM - 9:30 PM",
    is_open: true,
    rating: 4.7,
    total_reviews: 76,
    prep_time: "30-45 mins",
    featured: true,
    verified: true,
    loyalty_rate_per_10tk: 1.0, // 1 point per 10 Tk
    delivery_areas: [
      { location_id: 2, charge: 25 }, // Ashulia
      { location_id: 1, charge: 30 }, // Daffodil Smart City
      { location_id: 3, charge: 40 }, // Baipayl
      { location_id: 6, charge: 25 }  // Model Town
    ],
    pricing: {
      bw_a4_single: 1.25,
      bw_a4_double: 2.00,
      color_a4_single: 5.00,
      color_a4_double: 8.50,
      bw_a3_single: 5.50,
      color_a3_single: 16.00,
      binding_spiral: 20.00,
      binding_tape: 12.00,
      binding_hardcover: 130.00,
      lamination_a4: 10.00,
      lamination_a3: 20.00
    },
    services: ["B&W Print", "Color Print", "Spiral Binding", "Tape Binding", "Lamination", "Bulk Printing"]
  },
  {
    id: 4,
    name: "Baipayl Digital Press",
    tagline: "Industrial speed printing, poster & brochure",
    owner_name: "Jashim Uddin",
    shop_location_id: 3, // Baipayl
    address: "Baipayl Tri-junction, Savar, Dhaka",
    phone: "01678112233",
    email: "baipayl.press@gmail.com",
    opening_hours: "9:00 AM - 10:00 PM",
    is_open: false,
    rating: 4.6,
    total_reviews: 54,
    prep_time: "40-50 mins",
    featured: false,
    verified: true,
    loyalty_rate_per_10tk: 1.0,
    delivery_areas: [
      { location_id: 3, charge: 30 }, // Baipayl
      { location_id: 2, charge: 40 }, // Ashulia
      { location_id: 4, charge: 40 }  // Savar
    ],
    pricing: {
      bw_a4_single: 1.30,
      bw_a4_double: 2.20,
      color_a4_single: 4.80,
      color_a4_double: 8.00,
      bw_a3_single: 5.00,
      color_a3_single: 15.00,
      binding_spiral: 25.00,
      binding_tape: 15.00,
      binding_hardcover: 115.00,
      lamination_a4: 12.00,
      lamination_a3: 22.00
    },
    services: ["B&W Print", "Color Print", "Spiral Binding", "Lamination", "Brochure Print"]
  },
  {
    id: 5,
    name: "Savar City Graphics & Copy",
    tagline: "Professional thesis binding & high resolution printing",
    owner_name: "Shahadat Hossain",
    shop_location_id: 4, // Savar
    address: "Thana Road, Savar Bazar, Dhaka",
    phone: "01723998877",
    email: "savarcopy@gmail.com",
    opening_hours: "8:00 AM - 9:00 PM",
    is_open: true,
    rating: 4.7,
    total_reviews: 82,
    prep_time: "35-50 mins",
    featured: false,
    verified: true,
    loyalty_rate_per_10tk: 1.5,
    delivery_areas: [
      { location_id: 4, charge: 30 }, // Savar
      { location_id: 3, charge: 40 }, // Baipayl
      { location_id: 1, charge: 50 }  // Daffodil Smart City
    ],
    pricing: {
      bw_a4_single: 1.40,
      bw_a4_double: 2.30,
      color_a4_single: 5.00,
      color_a4_double: 8.00,
      bw_a3_single: 6.00,
      color_a3_single: 16.00,
      binding_spiral: 22.00,
      binding_tape: 14.00,
      binding_hardcover: 100.00,
      lamination_a4: 10.00,
      lamination_a3: 20.00
    },
    services: ["B&W Print", "Color Print", "Hardcover Thesis", "Spiral Binding", "Lamination"]
  }
];

if (typeof window !== 'undefined') {
  window.CP_SHOPS = CP_SHOPS;
}
