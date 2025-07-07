<?php
// check_session.php - Improved session management with better error handling

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
error_log("=== SESSION CHECK DEBUG ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Session ID: " . session_id());
error_log("Session Status: " . session_status());
error_log("Session data: " . print_r($_SESSION, true));
error_log("Cookies received: " . print_r($_COOKIE, true));
error_log("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'));
error_log("Remote IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'));

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

    // Check if session exists and has user data
    $sessionValid = false;
    $userData = null;

    // Strategy 1: Check for user data in session array format (preferred)
    if (isset($_SESSION['user']) && is_array($_SESSION['user']) && isset($_SESSION['user']['user_id'])) {
        error_log("✅ Found user session in array format: " . $_SESSION['user']['username']);
        $sessionValid = true;
        $userData = [
            'id' => $_SESSION['user']['user_id'],
            'user_id' => $_SESSION['user']['user_id'],
            'username' => $_SESSION['user']['username'],
            'email' => $_SESSION['user']['email'],
            'first_name' => $_SESSION['user']['first_name'] ?? '',
            'last_name' => $_SESSION['user']['last_name'] ?? '',
            'role' => $_SESSION['user']['role'] ?? 'user',
            'is_verified' => $_SESSION['user']['is_verified'] ?? false
        ];
    }
    // Strategy 2: Check for individual session variables (fallback)
    elseif (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        error_log("✅ Found user session in individual variables: " . ($_SESSION['username'] ?? 'unknown'));
        $sessionValid = true;
        $userData = [
            'id' => $_SESSION['user_id'],
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'email' => $_SESSION['email'] ?? '',
            'first_name' => $_SESSION['first_name'] ?? '',
            'last_name' => $_SESSION['last_name'] ?? '',
            'role' => $_SESSION['role'] ?? 'user',
            'is_verified' => $_SESSION['is_verified'] ?? false
        ];
    }

    if ($sessionValid && $userData) {
        // Optional: Verify session against database
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            if ($db) {
                // Check if user still exists and is active
                $query = "SELECT user_id, username, email, role, is_verified FROM Users WHERE user_id = :user_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':user_id', $userData['user_id']);
                $stmt->execute();
                $dbUser = $stmt->fetch();
                
                if ($dbUser) {
                    // Update user data with latest from database
                    $userData = [
                        'id' => $dbUser['user_id'],
                        'user_id' => $dbUser['user_id'],
                        'username' => $dbUser['username'],
                        'email' => $dbUser['email'],
                        'first_name' => $userData['first_name'], // Keep session data for these
                        'last_name' => $userData['last_name'],   // as they might not be in query
                        'role' => $dbUser['role'],
                        'is_verified' => $dbUser['is_verified']
                    ];
                    
                    error_log("✅ Session verified against database for user: " . $dbUser['username']);
                } else {
                    // User no longer exists in database, invalidate session
                    error_log("❌ User no longer exists in database, invalidating session");
                    session_destroy();
                    $sessionValid = false;
                    $userData = null;
                }
            }
        } catch (Exception $dbError) {
            // Database error, but don't invalidate session
            error_log("⚠️ Database verification failed, but keeping session: " . $dbError->getMessage());
            // Continue with session data we have
        }
    }

    // Return response
    if ($sessionValid && $userData) {
        echo json_encode([
            'success' => true,
            'user' => $userData,
            'timestamp' => time(),
            'session_id' => session_id()
        ]);
    } else {
        error_log("❌ No valid session data found");
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in',
            'timestamp' => time(),
            'session_id' => session_id()
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
    // Log the final response for debugging
    error_log("=== SESSION CHECK COMPLETE ===");
}