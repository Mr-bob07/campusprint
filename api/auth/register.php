<?php
/**
 * CampusPrint - API: Customer / Student Registration
 * Method: POST
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$fullName = trim($input['full_name'] ?? '');
$phone    = trim($input['phone'] ?? '');
$email    = trim($input['email'] ?? '');
$uniName  = trim($input['university_name'] ?? 'Daffodil International University');
$dept     = trim($input['department'] ?? '');
$address  = trim($input['address'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($fullName) || empty($phone) || empty($email) || empty($password)) {
    jsonResponse(false, 'All required fields must be filled.', null, 400);
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters.', null, 400);
}

$pdo = getDBConnection();

if ($pdo === null) {
    // Demo mode fallback
    jsonResponse(true, 'Registration successful (Demo Mode)! You can now login.', [
        'email' => $email,
        'name'  => $fullName,
        'role'  => 'customer'
    ]);
}

try {
    // Check if email already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check->execute([':email' => $email]);
    if ($check->fetch()) {
        jsonResponse(false, 'An account with this email already exists.', null, 409);
    }

    $pdo->beginTransaction();

    // 1. Insert into users table
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $userStmt = $pdo->prepare("INSERT INTO users (email, password, phone, role) VALUES (:email, :password, :phone, 'customer')");
    $userStmt->execute([
        ':email'    => $email,
        ':password' => $hashedPassword,
        ':phone'    => $phone
    ]);
    $userId = (int)$pdo->lastInsertId();

    // 2. Insert into customers table
    $custStmt = $pdo->prepare("INSERT INTO customers (user_id, full_name, university_name, department, delivery_address) VALUES (:uid, :name, :uni, :dept, :addr)");
    $custStmt->execute([
        ':uid'  => $userId,
        ':name' => $fullName,
        ':uni'  => $uniName,
        ':dept' => $dept,
        ':addr' => $address
    ]);

    $pdo->commit();

    $userData = [
        'id'    => $userId,
        'name'  => $fullName,
        'email' => $email,
        'role'  => 'customer'
    ];
    $_SESSION['cp_user'] = $userData;

    jsonResponse(true, 'Registration completed successfully!', $userData, 201);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'Registration failed: ' . $e->getMessage(), null, 500);
}
