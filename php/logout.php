<?php

require_once(__DIR__ . '/config.php');
session_start();
$oldCsrfToken = $_SESSION['csrf_token'] ?? null;
session_regenerate_id(true);
if ($oldCsrfToken !== null) {
    $_SESSION['csrf_token'] = $oldCsrfToken;
}
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// CSRF Token Check
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

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
        $sessionId = session_id();
        $updateSessionQuery = "UPDATE Sessions SET is_active = FALSE WHERE session_id = :session_id";
        $updateStmt = $db->prepare($updateSessionQuery);
        $updateStmt->bindParam(':session_id', $sessionId);
        $updateStmt->execute();
// Log the logout
        $ipAddr = $_SERVER['REMOTE_ADDR'];
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'LOGOUT', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $userId);
        $logStmt->bindParam(':ip_addr', $ipAddr);
        $logStmt->execute();
// Clear session data
        session_unset();
        session_destroy();
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
