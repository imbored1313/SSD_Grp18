<?php
// logout.php - Fixed to work with your session structure
session_start();

require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Check if user is logged in - your structure uses $_SESSION['user']
    if (isset($_SESSION['user']) && isset($_SESSION['user']['user_id'])) {
        $database = new Database();
        $db = $database->getConnection();
        
        if (!$db) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed']);
            exit;
        }
        
        $userId = $_SESSION['user']['user_id'];
        $username = $_SESSION['user']['username'] ?? 'Unknown';
        
        // Deactivate session in database
        $updateSessionQuery = "UPDATE Sessions SET is_active = FALSE WHERE session_id = :session_id";
        $updateStmt = $db->prepare($updateSessionQuery);
        $updateStmt->bindParam(':session_id', session_id());
        $updateStmt->execute();
        
        // Log the logout
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'LOGOUT', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $userId);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        
        // Clear session data
        session_unset();
        session_destroy();
        
        // Start a new session to clear any remaining data
        session_start();
        session_regenerate_id(true);
        
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
        
        // Log the event
        error_log("User logout: $username at " . date('Y-m-d H:i:s'));
        
    } else {
        // User was not logged in
        echo json_encode([
            'success' => false,
            'message' => 'User was not logged in'
        ]);
    }
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>