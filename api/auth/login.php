<?php
/**
 * CampusPrint - API: User Login
 * Method: POST
 * Body: { email, password }
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}

// Receive JSON or Form-data
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    jsonResponse(false, 'Email and password are required.', null, 400);
}

$pdo = getDBConnection();

// Fallback to demo login if MySQL is not currently running on host
if ($pdo === null) {
    if ($email === 'student@diu.edu.bd') {
        $user = ['id' => 101, 'email' => $email, 'role' => 'customer', 'name' => 'Tanzim Ahmed'];
        $_SESSION['cp_user'] = $user;
        jsonResponse(true, 'Login successful (Demo Mode)', $user);
    } elseif ($email === 'smartprint.diu@gmail.com') {
        $user = ['id' => 201, 'email' => $email, 'role' => 'shop_owner', 'name' => 'Md. Rafiqul Islam', 'shop_id' => 1];
        $_SESSION['cp_user'] = $user;
        jsonResponse(true, 'Login successful (Demo Mode)', $user);
    } elseif ($email === 'admin@campusprint.com') {
        $user = ['id' => 1, 'email' => $email, 'role' => 'admin', 'name' => 'Platform Administrator'];
        $_SESSION['cp_user'] = $user;
        jsonResponse(true, 'Login successful (Demo Mode)', $user);
    } else {
        jsonResponse(false, 'Database connection offline. Please test with demo credentials or start XAMPP MySQL.', null, 503);
    }
}

try {
    // Prepared statement: check user
    $stmt = $pdo->prepare("SELECT id, email, password, phone, role, is_active FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(false, 'Invalid email or password.', null, 401);
    }

    if ((int)$user['is_active'] !== 1) {
        jsonResponse(false, 'Account is suspended. Please contact platform admin.', null, 403);
    }

    // Fetch role-specific details
    $userData = [
        'id'    => (int)$user['id'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role'  => $user['role'],
        'name'  => $user['email']
    ];

    if ($user['role'] === 'customer') {
        $custStmt = $pdo->prepare("SELECT full_name, university_name, department, delivery_address FROM customers WHERE user_id = :uid");
        $custStmt->execute([':uid' => $user['id']]);
        $cust = $custStmt->fetch();
        if ($cust) {
            $userData['name'] = $cust['full_name'];
            $userData['university'] = $cust['university_name'];
            $userData['department'] = $cust['department'];
            $userData['delivery_address'] = $cust['delivery_address'];
        }
    } elseif ($user['role'] === 'shop_owner') {
        $shopStmt = $pdo->prepare("SELECT s.id as shop_id, s.name as shop_name, so.owner_name FROM shop_owners so LEFT JOIN shops s ON s.owner_id = so.user_id WHERE so.user_id = :uid LIMIT 1");
        $shopStmt->execute([':uid' => $user['id']]);
        $shopInfo = $shopStmt->fetch();
        if ($shopInfo) {
            $userData['name'] = $shopInfo['owner_name'];
            $userData['shop_id'] = $shopInfo['shop_id'] ? (int)$shopInfo['shop_id'] : null;
            $userData['shop_name'] = $shopInfo['shop_name'];
        }
    }

    $_SESSION['cp_user'] = $userData;
    jsonResponse(true, 'Login successful!', $userData);

} catch (PDOException $e) {
    jsonResponse(false, 'Database query error: ' . $e->getMessage(), null, 500);
}
