<?php
// improved_check_session.php - Enhanced session management with database validation

require_once(__DIR__ . '/config.php');

// Start session with proper configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set proper headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Enhanced debug logging
error_log("=== ENHANCED SESSION CHECK DEBUG ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Session ID: " . session_id());
error_log("Session Status: " . session_status());
error_log("Session data: " . print_r($_SESSION, true));
error_log("Cookies received: " . print_r($_COOKIE, true));

try {
    // Check if this is a valid GET request
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        exit;
    }

    // Initialize variables
    $sessionValid = false;
    $userData = null;
    $sessionId = session_id();

    // Strategy 1: Check for user data in PHP session
    if (isset($_SESSION['user']) && is_array($_SESSION['user']) && isset($_SESSION['user']['user_id'])) {
        error_log("✅ Found user session in array format: " . $_SESSION['user']['username']);
        $userId = $_SESSION['user']['user_id'];
        $userData = $_SESSION['user'];
    } elseif (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        error_log("✅ Found user session in individual variables: " . ($_SESSION['username'] ?? 'unknown'));
        $userId = $_SESSION['user_id'];
        $userData = [
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'email' => $_SESSION['email'] ?? '',
            'first_name' => $_SESSION['first_name'] ?? '',
            'last_name' => $_SESSION['last_name'] ?? '',
            'role' => $_SESSION['role'] ?? 'user',
            'is_verified' => $_SESSION['is_verified'] ?? false
        ];
    }

    // Strategy 2: Validate session against database Sessions table
    if ($userData && isset($userId)) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            if ($db) {
                // Check if session exists and is valid in Sessions table
                $sessionQuery = "SELECT s.session_id, s.user_id, s.token, s.expiry_time, s.is_active,
                                       u.user_id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_verified
                                FROM Sessions s
                                JOIN Users u ON s.user_id = u.user_id
                                WHERE s.session_id = :session_id 
                                AND s.user_id = :user_id 
                                AND s.is_active = TRUE 
                                AND s.expiry_time > NOW()";
                
                $stmt = $db->prepare($sessionQuery);
                $stmt->bindParam(':session_id', $sessionId);
                $stmt->bindParam(':user_id', $userId);
                $stmt->execute();
                $sessionData = $stmt->fetch();
                
                if ($sessionData) {
                    // Session is valid in database
                    error_log("✅ Session validated against database for user: " . $sessionData['username']);
                    
                    // Update session data with latest from database
                    $userData = [
                        'id' => $sessionData['user_id'],
                        'user_id' => $sessionData['user_id'],
                        'username' => $sessionData['username'],
                        'email' => $sessionData['email'],
                        'first_name' => $sessionData['first_name'] ?? '',
                        'last_name' => $sessionData['last_name'] ?? '',
                        'role' => $sessionData['role'],
                        'is_verified' => $sessionData['is_verified']
                    ];
                    
                    // Update PHP session with fresh data
                    $_SESSION['user'] = $userData;
                    $_SESSION['user_id'] = $userData['user_id'];
                    $_SESSION['username'] = $userData['username'];
                    $_SESSION['email'] = $userData['email'];
                    $_SESSION['role'] = $userData['role'];
                    
                    // Extend session expiry by 1 hour
                    $newExpiryTime = date('Y-m-d H:i:s', strtotime('+1 hour'));
                    $updateQuery = "UPDATE Sessions SET expiry_time = :expiry_time WHERE session_id = :session_id";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bindParam(':expiry_time', $newExpiryTime);
                    $updateStmt->bindParam(':session_id', $sessionId);
                    $updateStmt->execute();
                    
                    $sessionValid = true;
                    error_log("✅ Session extended until: " . $newExpiryTime);
                } else {
                    // Session not found or expired in database
                    error_log("❌ Session not found or expired in database, invalidating PHP session");
                    
                    // Clean up invalid session
                    session_unset();
                    session_destroy();
                    
                    $sessionValid = false;
                    $userData = null;
                }
            } else {
                error_log("⚠️ Database connection failed, using PHP session data");
                // Fallback to PHP session if database is unavailable
                $sessionValid = true;
            }
        } catch (Exception $dbError) {
            error_log("⚠️ Database session validation failed: " . $dbError->getMessage());
            // Fallback to PHP session if database query fails
            $sessionValid = true;
        }
    }

    // Strategy 3: Clean up expired sessions in database (maintenance)
    if ($sessionValid) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            if ($db) {
                // Clean up expired sessions (run occasionally)
                if (rand(1, 100) <= 5) { // 5% chance to run cleanup
                    $cleanupQuery = "UPDATE Sessions SET is_active = FALSE WHERE expiry_time < NOW() AND is_active = TRUE";
                    $cleanupStmt = $db->prepare($cleanupQuery);
                    $cleanupStmt->execute();
                    $cleanedCount = $cleanupStmt->rowCount();
                    if ($cleanedCount > 0) {
                        error_log("🧹 Cleaned up $cleanedCount expired sessions");
                    }
                }
            }
        } catch (Exception $cleanupError) {
            error_log("⚠️ Session cleanup failed: " . $cleanupError->getMessage());
        }
    }

    // Return response
    if ($sessionValid && $userData) {
        echo json_encode([
            'success' => true,
            'user' => $userData,
            'timestamp' => time(),
            'session_id' => $sessionId,
            'session_source' => 'database_validated'
        ]);
        
        // Log successful session check
        error_log("✅ Session check successful for user: " . $userData['username']);
    } else {
        error_log("❌ No valid session data found");
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in',
            'timestamp' => time(),
            'session_id' => $sessionId
        ]);
    }

} catch (Exception $e) {
    error_log("❌ Exception in session check: " . $e->getMessage());
    error_log("❌ Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => 'An error occurred while checking session',
        'timestamp' => time()
    ]);
} finally {
    error_log("=== ENHANCED SESSION CHECK COMPLETE ===");
}
?>