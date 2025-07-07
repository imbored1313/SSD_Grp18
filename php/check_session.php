<?php
// php/check_session.php - MySQL schema specific version
require_once(__DIR__ . '/config.php');

// Set proper headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

logSessionDebug("=== SESSION CHECK REQUEST START ===");
logSessionDebug("Request Method: " . $_SERVER['REQUEST_METHOD']);
logSessionDebug("Request URI: " . $_SERVER['REQUEST_URI']);
logSessionDebug("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'));
logSessionDebug("Remote IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'));

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
        logSessionDebug("✅ Valid session found for user: " . $user['username']);
        
        // Verify session against database using exact MySQL schema
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            if ($db) {
                // Check if user still exists and is active using exact Users table schema
                // Users table: user_id, username, email, password_hash, first_name, last_name, phone, role, is_verified, created_at, last_login
                $query = "SELECT user_id, username, email, first_name, last_name, phone, role, is_verified, last_login
                         FROM Users 
                         WHERE user_id = :user_id";
                
                logSessionDebug("User verification query: " . $query);
                
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
                    
                    // Optional: Check if session token exists and is valid in Sessions table
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
                                logSessionDebug("⚠️ Session token expired");
                            }
                        }
                    } catch (Exception $tokenError) {
                        logSessionDebug("⚠️ Could not check session token: " . $tokenError->getMessage());
                        // Don't fail the session check for token validation errors
                    }
                    
                    logSessionDebug("✅ Session verified against database for user: " . $dbUser['username']);
                    
                    echo json_encode([
                        'success' => true,
                        'user' => $userData,
                        'timestamp' => time(),
                        'session_id' => session_id(),
                        'verified_against_db' => true,
                        'session_token_valid' => $sessionTokenValid,
                        'mysql_schema' => true
                    ]);
                } else {
                    // User no longer exists in database, invalidate session
                    logSessionDebug("❌ User no longer exists in database, invalidating session");
                    clearUserSession();
                    
                    echo json_encode([
                        'success' => false,
                        'message' => 'User account no longer exists',
                        'session_id' => session_id(),
                        'session_cleared' => true
                    ]);
                }
            } else {
                // Database connection failed, but don't invalidate session
                logSessionDebug("⚠️ Database connection failed, but keeping session");
                
                echo json_encode([
                    'success' => true,
                    'user' => $user,
                    'timestamp' => time(),
                    'session_id' => session_id(),
                    'verified_against_db' => false,
                    'db_error' => 'Database connection failed'
                ]);
            }
        } catch (Exception $dbError) {
            // Database error, but don't invalidate session
            logSessionDebug("⚠️ Database verification failed, but keeping session: " . $dbError->getMessage());
            
            echo json_encode([
                'success' => true,
                'user' => $user,
                'timestamp' => time(),
                'session_id' => session_id(),
                'verified_against_db' => false,
                'db_error' => $dbError->getMessage()
            ]);
        }
    } else {
        logSessionDebug("❌ No valid session data found");
        
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in',
            'timestamp' => time(),
            'session_id' => session_id(),
            'session_data' => $_SESSION // For debugging
        ]);
    }

} catch (Exception $e) {
    logSessionDebug("❌ Exception in session check: " . $e->getMessage());
    logSessionDebug("❌ Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => 'An error occurred while checking session: ' . $e->getMessage(),
        'timestamp' => time()
    ]);
}

logSessionDebug("=== SESSION CHECK REQUEST END ===");
?>