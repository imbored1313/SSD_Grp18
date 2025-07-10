<?php
// php/check_session.php - Secure version without information exposure
require_once(__DIR__ . '/config.php');

// Set proper headers
header('Content-Type: application/json');
// Only allow requests from your trusted frontend origin (adjust as needed)
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
// Update trusted origins to include your real frontend domain
$trusted_origins = [
    'https://electraedge.xyz',           // Production domain
    'http://electraedge.xyz',            // In case of non-https access
    'http://localhost:3000',             // Local dev
    'http://localhost'                   // Plain localhost
];
if (in_array($allowed_origin, $trusted_origins)) {
    header('Access-Control-Allow-Origin: ' . $allowed_origin);
} else {
    // Optionally, do not set the header or set to a safe default
    header('Access-Control-Allow-Origin: https://your-frontend-domain.com');
}
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Secure logging - only in development mode
function secureLog($message) {
    if (defined('DEVELOPMENT_MODE') && DEVELOPMENT_MODE === true) {
        error_log("[SESSION_CHECK] " . $message);
    }
}

secureLog("Session check request from " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'));

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

    // Get user from session using unified function
    $user = getUserFromSession();
    
    if ($user && isset($user['user_id'])) {
        secureLog("Valid session found for user: " . $user['username']);
        
        // Verify session against database
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            if ($db) {
                // Check if user still exists and is active
                $query = "SELECT user_id, username, email, first_name, last_name, phone, role, is_verified, last_login
                         FROM Users 
                         WHERE user_id = :user_id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':user_id', $user['user_id'], PDO::PARAM_INT);
                $stmt->execute();
                $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($dbUser) {
                    // Update user data with latest from database
                    $userData = [
                        'user_id' => intval($dbUser['user_id']),
                        'username' => $dbUser['username'],
                        'email' => $dbUser['email'],
                        'first_name' => $dbUser['first_name'] ?? '',
                        'last_name' => $dbUser['last_name'] ?? '',
                        'phone' => $dbUser['phone'] ?? '',
                        'role' => $dbUser['role'] ?? 'user',
                        'is_verified' => boolval($dbUser['is_verified']),
                        'last_login' => $dbUser['last_login']
                    ];
                    
                    // Update session with fresh data
                    setUserSession($userData);
                    
                    // Optional: Check if session token exists and is valid
                    $sessionTokenValid = true;
                    try {
                        $tokenQuery = "SELECT session_id, expiry_time FROM Sessions 
                                      WHERE user_id = :user_id AND is_active = 1 
                                      ORDER BY session_id DESC LIMIT 1";
                        $tokenStmt = $db->prepare($tokenQuery);
                        $tokenStmt->bindParam(':user_id', $user['user_id'], PDO::PARAM_INT);
                        $tokenStmt->execute();
                        $sessionRecord = $tokenStmt->fetch(PDO::FETCH_ASSOC);
                        
                        if ($sessionRecord) {
                            $expiryTime = strtotime($sessionRecord['expiry_time']);
                            if ($expiryTime < time()) {
                                $sessionTokenValid = false;
                                secureLog("Session token expired for user: " . $user['username']);
                            }
                        }
                    } catch (Exception $tokenError) {
                        // Log error securely without exposing details
                        secureLog("Session token validation failed: " . $tokenError->getMessage());
                        // Don't fail the session check for token validation errors
                    }
                    
                    secureLog("Session verified against database for user: " . $dbUser['username']);
                    
                    // Return success response WITHOUT exposing internal details
                    echo json_encode([
                        'success' => true,
                        'user' => $userData,
                        'timestamp' => time(),
                        'verified' => true
                    ]);
                } else {
                    // User no longer exists in database, invalidate session
                    secureLog("User no longer exists, invalidating session for user_id: " . $user['user_id']);
                    clearUserSession();
                    
                    echo json_encode([
                        'success' => false,
                        'message' => 'Session expired'
                    ]);
                }
            } else {
                // Database connection failed, but don't expose details
                secureLog("Database connection failed during session check");
                
                // Return session data without DB verification (graceful degradation)
                echo json_encode([
                    'success' => true,
                    'user' => $user,
                    'timestamp' => time(),
                    'verified' => false
                ]);
            }
        } catch (Exception $dbError) {
            // Database error - log securely, don't expose details
            secureLog("Database verification failed: " . $dbError->getMessage());
            
            // Return session data without DB verification (graceful degradation)
            echo json_encode([
                'success' => true,
                'user' => $user,
                'timestamp' => time(),
                'verified' => false
            ]);
        }
    } else {
        secureLog("No valid session data found");
        
        // Clean response without exposing session contents
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in',
            'timestamp' => time()
        ]);
    }

} catch (Exception $e) {
    // Log error securely without exposing details
    secureLog("Exception in session check: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}

secureLog("Session check request completed");
?>