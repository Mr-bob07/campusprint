<?php
/**
 * CampusPrint - API: Update Order Status
 * Method: POST
 * Body: { order_id, new_status, shop_id }
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$orderId   = trim($input['order_id'] ?? '');
$newStatus = trim($input['new_status'] ?? '');
$shopId    = (int)($input['shop_id'] ?? 1);

$validStatuses = ['pending', 'accepted', 'processing', 'ready', 'completed', 'cancelled'];

if (empty($orderId) || !in_array($newStatus, $validStatuses, true)) {
    jsonResponse(false, 'Invalid order ID or status provided.', null, 400);
}

$pdo = getDBConnection();

if ($pdo === null) {
    jsonResponse(true, "Order #{$orderId} status updated to {$newStatus} (Demo Mode).");
}

try {
    // Strict Vendor Isolation: verify that the order belongs to this shop
    $checkStmt = $pdo->prepare("SELECT id, shop_id, order_status FROM orders WHERE id = :oid LIMIT 1");
    $checkStmt->execute([':oid' => $orderId]);
    $order = $checkStmt->fetch();

    if (!$order) {
        jsonResponse(false, 'Order not found.', null, 404);
    }

    if ((int)$order['shop_id'] !== $shopId) {
        jsonResponse(false, 'Forbidden. This shop does not own this order record.', null, 403);
    }

    $updateStmt = $pdo->prepare("UPDATE orders SET order_status = :status WHERE id = :oid");
    $updateStmt->execute([':status' => $newStatus, ':oid' => $orderId]);

    jsonResponse(true, "Order #{$orderId} updated to " . strtoupper($newStatus), [
        'order_id' => $orderId,
        'status'   => $newStatus
    ]);

} catch (PDOException $e) {
    jsonResponse(false, 'Failed to update order status: ' . $e->getMessage(), null, 500);
}
