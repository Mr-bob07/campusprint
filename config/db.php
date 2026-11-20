<?php
/**
 * CampusPrint - Database Connection & Security Helper
 * Configured for XAMPP MySQL (Default user 'root' with empty password)
 */

declare(strict_types=1);

// Prevent direct script execution if accessed outside API
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// XAMPP Default DB Config
const DB_HOST = '127.0.0.1';
const DB_NAME = 'campusprint';
const DB_USER = 'root';
const DB_PASS = '';
const DB_CHAR = 'utf8mb4';

/**
 * Get PDO Database Connection Singleton
 */
function getDBConnection(): ?PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHAR;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // In development or when MySQL is not started in XAMPP
            return null;
        }
    }

    return $pdo;
}

/**
 * Send JSON Response
 */
function jsonResponse(bool $success, string $message, $data = null, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Authentication Helper
 */
function getCurrentUser(): ?array {
    return $_SESSION['cp_user'] ?? null;
}

function requireAuth(?string $allowedRole = null): array {
    $user = getCurrentUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized. Please login.', null, 401);
    }

    if ($allowedRole !== null && $user['role'] !== $allowedRole) {
        jsonResponse(false, 'Forbidden. Insufficient permissions.', null, 403);
    }

    return $user;
}
