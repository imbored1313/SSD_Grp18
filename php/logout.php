<?php
// logout.php - Handle user logout
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

try {
    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        // Get username before destroying session for logging
        $username = $_SESSION['username'] ?? 'Unknown';
        
        // Destroy session
        session_unset();
        session_destroy();
        
        // Start a new session to clear any remaining data
        session_start();
        session_regenerate_id(true);
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
        
        // Optional: Log the logout event
        error_log("User logout: $username at " . date('Y-m-d H:i:s'));
        
    } else {
        // User was not logged in
        echo json_encode([
            'success' => false,
            'message' => 'User was not logged in'
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