<?php
// improved_logout.php - Enhanced logout with proper database session cleanup

require_once(__DIR__ . '/config.php');
session_start();
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
    $sessionId = session_id();
    $userId = null;
    $username = 'Unknown';
    
    // Get user info before destroying session
    if (isset($_SESSION['user']) && isset($_SESSION['user']['user_id'])) {
        $userId = $_SESSION['user']['user_id'];
        $username = $_SESSION['user']['username'] ?? 'Unknown';
    } elseif (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
        $username = $_SESSION['username'] ?? 'Unknown';
    }
    
    if ($userId) {
        $database = new Database();
        $db = $database->getConnection();
        
        if ($db) {
            // STEP 1: Deactivate current session in database
            $updateSessionQuery = "UPDATE Sessions SET is_active = FALSE WHERE session_id = :session_id AND user_id = :user_id";
            $updateStmt = $db->prepare($updateSessionQuery);
            $updateStmt->bindParam(':session_id', $sessionId);
            $updateStmt->bindParam(':user_id', $userId);
            $updateStmt->execute();
            
            $affectedRows = $updateStmt->rowCount();
            if ($affectedRows > 0) {
                error_log("✅ Database session deactivated for user: $username");
            } else {
                error_log("⚠️ No database session found to deactivate for user: $username");
            }
            
            // STEP 2: Optional - Deactivate ALL sessions for this user (uncomment if you want single-device login)
            /*
            $deactivateAllQuery = "UPDATE Sessions SET is_active = FALSE WHERE user_id = :user_id AND is_active = TRUE";
            $deactivateAllStmt = $db->prepare($deactivateAllQuery);
            $deactivateAllStmt->bindParam(':user_id', $userId);
            $deactivateAllStmt->execute();
            */
            
            // STEP 3: Log the logout
            $ipAddr = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                         VALUES (:user_id, 'LOGOUT', NOW(), :ip_addr)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $userId);
            $logStmt->bindParam(':ip_addr', $ipAddr);
            $logStmt->execute();
            
            error_log("✅ Logout logged for user: $username");
        } else {
            error_log("⚠️ Database connection failed during logout");
        }
        
        // STEP 4: Clear PHP session data
        session_unset();
        session_destroy();
        
        // STEP 5: Clear any client-side session storage (sent in response)
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully',
            'clear_storage' => true,  // Signal to client to clear sessionStorage
            'redirect' => 'index.html'
        ]);
        
        error_log("✅ User logout completed: $username at " . date('Y-m-d H:i:s'));
        
    } else {
        // No user session found
        session_unset();
        session_destroy();
        
        echo json_encode([
            'success' => false,
            'message' => 'User was not logged in',
            'clear_storage' => true
        ]);
        
        error_log("⚠️ Logout attempted but no user session found");
    }
    
} catch (Exception $e) {
    error_log("❌ Logout error: " . $e->getMessage());
    
    // Still try to destroy the session even if database operations fail
    session_unset();
    session_destroy();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error during logout',
        'clear_storage' => true
    ]);
}
?>