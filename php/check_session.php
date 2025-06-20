<?php
// check_session.php - Check if user is logged in
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

try {
    // Check if user is logged in
    if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
        // User is logged in, return user data
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'email' => $_SESSION['email'] ?? '',
                'first_name' => $_SESSION['first_name'] ?? '',
                'last_name' => $_SESSION['last_name'] ?? '',
                'phone' => $_SESSION['phone'] ?? ''
            ]
        ]);
    } else {
        // User is not logged in
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in'
        ]);
    }
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>