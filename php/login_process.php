<?php

// login_process.php - Fixed session management
require_once(__DIR__ . '/config.php');
ensureSessionStarted();
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $usernameOrEmail = sanitizeInput($_POST['username'] ?? $_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    if (empty($usernameOrEmail) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username/email and password are required']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    // Get user from Users table (check both username and email)
    $query = "SELECT user_id, username, email, password_hash, first_name, last_name, role, is_verified 
              FROM Users WHERE (email = :identifier OR username = :identifier)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':identifier', $usernameOrEmail);
    $stmt->execute();
    $user = $stmt->fetch();
    if (!$user) {
    // Log failed attempt
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (NULL, 'LOGIN_FAILED_USER_NOT_FOUND', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    // Verify password
    if (password_verify($password, $user['password_hash'])) {
// Update last login
        $updateQuery = "UPDATE Users SET last_login = NOW() WHERE user_id = :user_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':user_id', $user['user_id']);
        $updateStmt->execute();
// Store user data in session array (consistent structure)
        $_SESSION['user'] = [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['role'],
            'is_verified' => $user['is_verified']
        ];
// Also store individual session variables for backward compatibility
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['is_verified'] = $user['is_verified'];

// Debug logging
        error_log("Login successful - Session ID: " . session_id());
        error_log("Login successful - Session data: " . print_r($_SESSION, true));

// Create session record in Sessions table
        $sessionToken = bin2hex(random_bytes(32));
        $expiryTime = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $sessionId = session_id();
        $userId = $user['user_id'];
        $sessionQuery = "INSERT INTO Sessions (session_id, user_id, token, expiry_time, is_active) 
                         VALUES (:session_id, :user_id, :token, :expiry_time, TRUE)
                         ON DUPLICATE KEY UPDATE token = :token, expiry_time = :expiry_time, is_active = TRUE, user_id = :user_id";
        $sessionStmt = $db->prepare($sessionQuery);
        $sessionStmt->bindParam(':session_id', $sessionId);
        $sessionStmt->bindParam(':user_id', $userId);
        $sessionStmt->bindParam(':token', $sessionToken);
        $sessionStmt->bindParam(':expiry_time', $expiryTime);
        $sessionStmt->execute();
// Log successful login
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'LOGIN_SUCCESS', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $user['user_id']);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
// Log session creation for debugging
        error_log("Session created for user: " . $user['username'] . ", Session ID: " . session_id());
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'user_id' => $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'is_verified' => $user['is_verified']
            ]
        ]);
    } else {
    // Log failed attempt
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'LOGIN_FAILED_INVALID_PASSWORD', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $user['user_id']);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
} catch (Exception $e) {
    error_log("Login process error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
