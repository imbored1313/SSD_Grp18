<?php
// verify_2fa.php - Verifies 2FA code for login
require_once(__DIR__ . '/config.php');
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$code = $_POST['code'] ?? '';

if (empty($code) || !isset($_SESSION['2fa_code'], $_SESSION['2fa_user_id'], $_SESSION['2fa_expires'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '2FA code not found or expired. Please login again.']);
    exit;
}

if (time() > $_SESSION['2fa_expires']) {
    unset($_SESSION['2fa_code'], $_SESSION['2fa_user_id'], $_SESSION['2fa_expires'], $_SESSION['2fa_verified']);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '2FA code expired. Please login again.']);
    exit;
}

if ($code !== $_SESSION['2fa_code']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid 2FA code.']);
    exit;
}

// Fetch user info from DB
$database = new Database();
$db = $database->getConnection();
$userId = $_SESSION['2fa_user_id'];
$query = "SELECT user_id, username, email, first_name, last_name, role, is_verified FROM Users WHERE user_id = :user_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $userId);
$stmt->execute();
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not found.']);
    exit;
}

// Establish session (login complete)
$_SESSION['user'] = [
    'user_id' => $user['user_id'],
    'username' => $user['username'],
    'email' => $user['email'],
    'first_name' => $user['first_name'],
    'last_name' => $user['last_name'],
    'role' => $user['role'],
    'is_verified' => $user['is_verified']
];

// Create session record in Sessions table
$sessionToken = bin2hex(random_bytes(32));
$expiryTime = date('Y-m-d H:i:s', strtotime('+1 hour'));
$sessionId = session_id();
$sessionQuery = "INSERT INTO Sessions (session_id, user_id, token, expiry_time, is_active) 
                 VALUES (:session_id, :user_id, :token, :expiry_time, TRUE)
                 ON DUPLICATE KEY UPDATE token = :token, expiry_time = :expiry_time, is_active = TRUE, user_id = :user_id";
$sessionStmt = $db->prepare($sessionQuery);
$sessionStmt->bindParam(':session_id', $sessionId);
$sessionStmt->bindParam(':user_id', $user['user_id']);
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

// Invalidate 2FA code
unset($_SESSION['2fa_code'], $_SESSION['2fa_user_id'], $_SESSION['2fa_expires'], $_SESSION['2fa_verified']);

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