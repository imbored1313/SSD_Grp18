<?php
require_once(__DIR__ . '/config.php');
ensureSessionStarted();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

try {
    // Check if user session exists - try array format first
    if (isset($_SESSION['user']) && isset($_SESSION['user']['user_id'])) {
        // User data stored in array format
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
    } else if (isset($_SESSION['user_id'])) {
        // Fallback: User data stored in individual session variables
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
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>