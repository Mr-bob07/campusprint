<?php
/**
 * CampusPrint - API: Update Shop Individual Pricing
 * Method: POST
 * Body: { shop_id, bw_a4_single, bw_a4_double, color_a4_single, ... }
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$shopId = (int)($input['shop_id'] ?? 1);

$bwA4Single  = (float)($input['bw_a4_single'] ?? 1.50);
$bwA4Double  = (float)($input['bw_a4_double'] ?? 2.50);
$colorA4Single = (float)($input['color_a4_single'] ?? 5.00);
$colorA4Double = (float)($input['color_a4_double'] ?? 8.00);
$bindingSpiral = (float)($input['binding_spiral'] ?? 25.00);
$bindingHardcover = (float)($input['binding_hardcover'] ?? 120.00);

$pdo = getDBConnection();

if ($pdo === null) {
    jsonResponse(true, 'Shop pricing updated successfully (Demo Mode).');
}

try {
    $stmt = $pdo->prepare("
        UPDATE shop_pricing 
        SET bw_a4_single = :b1, bw_a4_double = :b2,
            color_a4_single = :c1, color_a4_double = :c2,
            binding_spiral = :sp, binding_hardcover = :hc
        WHERE shop_id = :sid
    ");

    $stmt->execute([
        ':b1'  => $bwA4Single,
        ':b2'  => $bwA4Double,
        ':c1'  => $colorA4Single,
        ':c2'  => $colorA4Double,
        ':sp'  => $bindingSpiral,
        ':hc'  => $bindingHardcover,
        ':sid' => $shopId
    ]);

    jsonResponse(true, 'Your individual shop pricing has been updated live on the marketplace!');

} catch (PDOException $e) {
    jsonResponse(false, 'Failed to update pricing: ' . $e->getMessage(), null, 500);
}
