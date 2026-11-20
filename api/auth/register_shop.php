<?php
/**
 * CampusPrint - API: Shop Owner & Shop Registration
 * Method: POST (multipart/form-data for trade license upload)
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

// Receive form data
$ownerName = trim($_POST['owner_name'] ?? '');
$phone     = trim($_POST['phone'] ?? '');
$email     = trim($_POST['email'] ?? '');
$nidNumber = trim($_POST['nid_number'] ?? '');
$password  = trim($_POST['password'] ?? '');

$shopName    = trim($_POST['shop_name'] ?? '');
$locationId  = (int)($_POST['shop_location_id'] ?? 1);
$shopAddress = trim($_POST['address'] ?? '');
$shopPhone   = trim($_POST['shop_phone'] ?? $phone);
$shopEmail   = trim($_POST['shop_email'] ?? $email);
$licenseNo   = trim($_POST['trade_license_number'] ?? '');

if (empty($ownerName) || empty($email) || empty($nidNumber) || empty($shopName) || empty($licenseNo)) {
    jsonResponse(false, 'All required owner and shop fields must be provided.', null, 400);
}

// Handle Trade License File Upload
$uploadedDocPath = 'uploads/licenses/sample_trade_license.pdf';
if (isset($_FILES['trade_license_doc']) && $_FILES['trade_license_doc']['error'] === UPLOAD_ERR_OK) {
    $fileTmp  = $_FILES['trade_license_doc']['tmp_name'];
    $fileName = basename($_FILES['trade_license_doc']['name']);
    $fileExt  = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    $allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!in_array($fileExt, $allowedExts, true)) {
        jsonResponse(false, 'Invalid file type. Only PDF or JPG/PNG images are allowed.', null, 400);
    }

    $destFolder = __DIR__ . '/../../uploads/licenses/';
    if (!is_dir($destFolder)) {
        mkdir($destFolder, 0777, true);
    }
    $newFileName = 'license_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExt;
    if (move_uploaded_file($fileTmp, $destFolder . $newFileName)) {
        $uploadedDocPath = 'uploads/licenses/' . $newFileName;
    }
}

$pdo = getDBConnection();

if ($pdo === null) {
    // Demo Mode Response
    jsonResponse(true, 'Shop registered successfully (Demo Mode)! Status: Pending Verification.', [
        'shop_name' => $shopName,
        'verification_status' => 'pending'
    ], 201);
}

try {
    $pdo->beginTransaction();

    // 1. Create User
    $hashedPassword = password_hash($password ?: 'owner1234', PASSWORD_BCRYPT);
    $userStmt = $pdo->prepare("INSERT INTO users (email, password, phone, role) VALUES (:email, :password, :phone, 'shop_owner')");
    $userStmt->execute([
        ':email'    => $email,
        ':password' => $hashedPassword,
        ':phone'    => $phone
    ]);
    $ownerId = (int)$pdo->lastInsertId();

    // 2. Insert into shop_owners (confidential NID)
    $ownerStmt = $pdo->prepare("INSERT INTO shop_owners (user_id, owner_name, nid_number) VALUES (:uid, :name, :nid)");
    $ownerStmt->execute([
        ':uid'  => $ownerId,
        ':name' => $ownerName,
        ':nid'  => $nidNumber
    ]);

    // 3. Insert into shops table (Status = pending)
    $shopStmt = $pdo->prepare("INSERT INTO shops (owner_id, name, shop_location_id, address, phone, email, verification_status) VALUES (:oid, :name, :loc, :addr, :phone, :email, 'pending')");
    $shopStmt->execute([
        ':oid'   => $ownerId,
        ':name'  => $shopName,
        ':loc'   => $locationId,
        ':addr'  => $shopAddress,
        ':phone' => $shopPhone,
        ':email' => $shopEmail
    ]);
    $shopId = (int)$pdo->lastInsertId();

    // 4. Default Shop Pricing
    $pricingStmt = $pdo->prepare("INSERT INTO shop_pricing (shop_id) VALUES (:sid)");
    $pricingStmt->execute([':sid' => $shopId]);

    // 5. Insert trade license
    $licStmt = $pdo->prepare("INSERT INTO trade_licenses (shop_id, license_number, document_path) VALUES (:sid, :lic, :doc)");
    $licStmt->execute([
        ':sid' => $shopId,
        ':lic' => $licenseNo,
        ':doc' => $uploadedDocPath
    ]);

    $pdo->commit();

    jsonResponse(true, 'Shop registration submitted! Admin will verify your trade license credentials.', [
        'shop_id'   => $shopId,
        'shop_name' => $shopName,
        'status'    => 'pending'
    ], 201);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'Shop registration failed: ' . $e->getMessage(), null, 500);
}
