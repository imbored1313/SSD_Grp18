<?php

require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);
// change_password.php - Change user password in database

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

// CSRF Token Check
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

try {
// Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }

    $userId = $_SESSION['user']['user_id'];
// Get input data
    $currentPassword = $_POST['currentPassword'] ?? '';
    $newPassword = $_POST['newPassword'] ?? '';
    $confirmNewPassword = $_POST['confirmNewPassword'] ?? '';
// Validate input
    if (empty($currentPassword) || empty($newPassword) || empty($confirmNewPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'All password fields are required']);
        exit;
    }

    if ($newPassword !== $confirmNewPassword) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'New passwords do not match']);
        exit;
    }

    // Validate new password strength
    $passwordValidation = validatePassword($newPassword);
    if ($passwordValidation !== true) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $passwordValidation]);
        exit;
    }

    // Get current password hash from database
    $query = "SELECT password_hash FROM Users WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
        exit;
    }

    // Hash new password
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
// Update password in database
    $updateQuery = "UPDATE Users SET password_hash = :password_hash WHERE user_id = :user_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':password_hash', $newPasswordHash);
    $updateStmt->bindParam(':user_id', $userId);
    if ($updateStmt->execute()) {
    // Log the password change
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'PASSWORD_CHANGED', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $userId);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        echo json_encode([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update password']);
    }
} catch (Exception $e) {
    error_log("Change password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
