<?php

require_once(__DIR__ . '/config.php');
session_start();
//session_regenerate_id(true);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Debug logging
// Enhanced debug logging
error_log("=== SESSION CHECK DEBUG ===");
error_log("Session ID: " . session_id());
error_log("Session data: " . print_r($_SESSION, true));
error_log("Cookies received: " . print_r($_COOKIE, true));
error_log("Session status: " . session_status());

try {
    // Check if user session exists - try array format first
    if (isset($_SESSION['user']) && isset($_SESSION['user']['user_id'])) {
        // User data stored in array format
        error_log("✅ Found user session in array format: " . $_SESSION['user']['username']);
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user']['user_id'],
                'user_id' => $_SESSION['user']['user_id'],
                'username' => $_SESSION['user']['username'],
                'email' => $_SESSION['user']['email'],
                'first_name' => $_SESSION['user']['first_name'] ?? '',
                'last_name' => $_SESSION['user']['last_name'] ?? '',
                'role' => $_SESSION['user']['role'] ?? '',
                'is_verified' => $_SESSION['user']['is_verified'] ?? false
            ]
        ]);
    } elseif (isset($_SESSION['user_id'])) {
        // Fallback: User data stored in individual session variables
        error_log("✅ Found user session in individual variables: " . ($_SESSION['username'] ?? 'unknown'));
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'user_id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'] ?? '',
                'email' => $_SESSION['email'] ?? '',
                'first_name' => $_SESSION['first_name'] ?? '',
                'last_name' => $_SESSION['last_name'] ?? '',
                'role' => $_SESSION['role'] ?? '',
                'is_verified' => $_SESSION['is_verified'] ?? false
            ]
        ]);
    } else {
        // No session data found
        error_log("❌ No session data found");
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in'
        ]);
    }
} catch (Exception $e) {
    error_log("❌ Exception in session check: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
