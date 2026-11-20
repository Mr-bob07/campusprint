<?php
/**
 * CampusPrint - API: Admin Shop Approval / Rejection
 * Method: POST
 * Body: { shop_id, action: 'approve' | 'reject', review_notes? }
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$shopId = (int)($input['shop_id'] ?? 0);
$action = trim($input['action'] ?? '');
$notes  = trim($input['review_notes'] ?? '');

if ($shopId <= 0 || !in_array($action, ['approve', 'reject'], true)) {
    jsonResponse(false, 'Valid shop ID and action (approve or reject) are required.', null, 400);
}

$pdo = getDBConnection();

if ($pdo === null) {
    jsonResponse(true, "Shop #{$shopId} has been successfully {$action}d (Demo Mode).");
}

try {
    $newStatus = ($action === 'approve') ? 'approved' : 'rejected';

    $pdo->beginTransaction();

    // 1. Update shop verification status
    $stmt = $pdo->prepare("UPDATE shops SET verification_status = :status WHERE id = :sid");
    $stmt->execute([':status' => $newStatus, ':sid' => $shopId]);

    // 2. Update trade license review log
    $licStmt = $pdo->prepare("UPDATE trade_licenses SET review_notes = :notes WHERE shop_id = :sid");
    $licStmt->execute([':notes' => $notes, ':sid' => $shopId]);

    $pdo->commit();

    jsonResponse(true, "Shop #{$shopId} verification status updated to " . strtoupper($newStatus));

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'Failed to update shop status: ' . $e->getMessage(), null, 500);
}
