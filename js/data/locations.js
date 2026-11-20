/**
 * CampusPrint - Predefined Locations Data
 * Crucial Rule: Strict ID-based location matching, distinguishing between:
 * - physical shop location (shop_location_id)
 * - delivery coverage areas (delivery_area_ids)
 */

const CP_LOCATIONS = [
  { id: 1, name: "Daffodil Smart City", code: "DSC", district: "Dhaka", default_delivery_charge: 20 },
  { id: 2, name: "Ashulia", code: "ASH", district: "Dhaka", default_delivery_charge: 30 },
  { id: 3, name: "Baipayl", code: "BAI", district: "Dhaka", default_delivery_charge: 40 },
  { id: 4, name: "Savar", code: "SAV", district: "Dhaka", default_delivery_charge: 50 },
  { id: 5, name: "Hall Area (DIU Campus)", code: "HALL", district: "Dhaka", default_delivery_charge: 15 },
  { id: 6, name: "Model Town", code: "MT", district: "Dhaka", default_delivery_charge: 25 }
];

if (typeof window !== 'undefined') {
  window.CP_LOCATIONS = CP_LOCATIONS;
}
