<?php
/**
 * CampusPrint - API: List Shops with Strict Location Matching
 * Method: GET
 * Query Params: ?location_id=1&sort=price_asc&open_now=1
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

$locationId = !empty($_GET['location_id']) ? (int)$_GET['location_id'] : null;
$sortBy     = $_GET['sort'] ?? 'recommended';
$openNow    = isset($_GET['open_now']) && $_GET['open_now'] === '1';

$pdo = getDBConnection();

// Fallback to static JSON if MySQL is offline
if ($pdo === null) {
    // Return sample approved shops
    jsonResponse(true, 'Shops loaded (Demo Mode)', [
        [
            'id' => 1,
            'name' => 'Smart Print Point',
            'address' => 'Gate 1, Daffodil Smart City, Ashulia',
            'rating' => 4.9,
            'is_open' => true,
            'starting_price' => 1.50
        ],
        [
            'id' => 2,
            'name' => 'Campus Xerox & Digital Lab',
            'address' => 'Opposite Scholar Garden, DIU',
            'rating' => 4.8,
            'is_open' => true,
            'starting_price' => 1.50
        ]
    ]);
}

try {
    $sql = "
        SELECT DISTINCT s.id, s.name, s.tagline, s.shop_location_id, s.address, s.phone, s.email, 
               s.opening_hours, s.prep_time, s.rating, s.total_reviews, s.loyalty_rate_per_10tk, s.is_open,
               p.bw_a4_single, p.color_a4_single, p.binding_spiral, p.lamination_a4
        FROM shops s
        JOIN shop_pricing p ON p.shop_id = s.id
        LEFT JOIN shop_delivery_areas da ON da.shop_id = s.id
        WHERE s.verification_status = 'approved'
    ";

    $params = [];

    // Predefined Location Matching Rule:
    // Matches if shop is physically located in the area OR shop has configured home delivery to that area
    if ($locationId !== null) {
        $sql .= " AND (s.shop_location_id = :locId OR da.location_id = :locIdDeliv)";
        $params[':locId'] = $locationId;
        $params[':locIdDeliv'] = $locationId;
    }

    if ($openNow) {
        $sql .= " AND s.is_open = 1";
    }

    // Sorting
    if ($sortBy === 'price_asc') {
        $sql .= " ORDER BY p.bw_a4_single ASC";
    } elseif ($sortBy === 'rating_desc') {
        $sql .= " ORDER BY s.rating DESC";
    } else {
        $sql .= " ORDER BY s.rating DESC, s.total_reviews DESC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $shops = $stmt->fetchAll();

    jsonResponse(true, 'Shops fetched successfully.', $shops);

} catch (PDOException $e) {
    jsonResponse(false, 'Failed to fetch shops: ' . $e->getMessage(), null, 500);
}
