<?php
/**
 * CampusPrint - API: Mark Cash on Delivery Payment as Received
 * Method: POST
 * Body: { order_id, shop_id }
 * Strictly enforces:
 * - Order payment_status becomes 'paid'
 * - Customer loyalty points are accredited strictly based on shop's loyalty rate per ৳10
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$orderId = trim($input['order_id'] ?? '');
$shopId  = (int)($input['shop_id'] ?? 1);

if (empty($orderId)) {
    jsonResponse(false, 'Order ID is required.', null, 400);
}

$pdo = getDBConnection();

if ($pdo === null) {
    jsonResponse(true, "Payment for order #{$orderId} marked as PAID (Demo Mode). Customer loyalty points awarded.");
}

try {
    $pdo->beginTransaction();

    // Verify order and shop ownership
    $orderStmt = $pdo->prepare("
        SELECT o.id, o.customer_id, o.shop_id, o.total_payable, o.payment_status, s.loyalty_rate_per_10tk 
        FROM orders o 
        JOIN shops s ON s.id = o.shop_id 
        WHERE o.id = :oid LIMIT 1
    ");
    $orderStmt->execute([':oid' => $orderId]);
    $order = $orderStmt->fetch();

    if (!$order) {
        jsonResponse(false, 'Order not found.', null, 404);
    }

    if ((int)$order['shop_id'] !== $shopId) {
        jsonResponse(false, 'Forbidden. You do not manage this order.', null, 403);
    }

    if ($order['payment_status'] === 'paid') {
        jsonResponse(true, 'Order payment is already marked as paid.', ['order_id' => $orderId]);
    }

    // Calculate loyalty points
    $totalAmount = (float)$order['total_payable'];
    $ratePer10   = (float)$order['loyalty_rate_per_10tk'];
    $pointsEarned = (int)floor(($totalAmount / 10.0) * $ratePer10);

    // 1. Mark order as paid
    $updateOrder = $pdo->prepare("
        UPDATE orders 
        SET payment_status = 'paid', loyalty_points_earned = :pts 
        WHERE id = :oid
    ");
    $updateOrder->execute([':pts' => $pointsEarned, ':oid' => $orderId]);

    // 2. Credit customer loyalty balance for this shop
    $balanceStmt = $pdo->prepare("
        INSERT INTO loyalty_balances (customer_id, shop_id, points_balance)
        VALUES (:cid, :sid, :pts)
        ON DUPLICATE KEY UPDATE points_balance = points_balance + :pts_update
    ");
    $balanceStmt->execute([
        ':cid'        => $order['customer_id'],
        ':sid'        => $order['shop_id'],
        ':pts'        => $pointsEarned,
        ':pts_update' => $pointsEarned
    ]);

    $pdo->commit();

    jsonResponse(true, "Cash payment verified for #{$orderId}! {$pointsEarned} loyalty points awarded to customer.", [
        'order_id'      => $orderId,
        'points_earned' => $pointsEarned,
        'payment_status'=> 'paid'
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'Failed to confirm payment: ' . $e->getMessage(), null, 500);
}
