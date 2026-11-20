<?php
/**
 * CampusPrint - API: User Logout
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';

if (session_status() === PHP_SESSION_ACTIVE) {
    $_SESSION = [];
    session_destroy();
}

jsonResponse(true, 'Logged out successfully.');
