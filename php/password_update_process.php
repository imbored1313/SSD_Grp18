<?php

require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $code = sanitizeInput($_POST['code'] ?? '');
    $newPassword = $_POST['newPassword'] ?? '';

    // Validate input
    if (empty($code) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'Code and new password are required']);
        exit;
    }

    // Check if session has reset data
    if (!isset($_SESSION['reset_code']) || !isset($_SESSION['reset_email']) || !isset($_SESSION['reset_expires'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No active reset session. Please request a new code.']);
        exit;
    }

    // Track incorrect attempts per session
    if (!isset($_SESSION['code_attempts'])) {
        $_SESSION['code_attempts'] = 0;
    }
    if ($_SESSION['code_attempts'] >= 5) {
        unset($_SESSION['reset_code'], $_SESSION['reset_email'], $_SESSION['reset_user_id'], $_SESSION['reset_expires']);
        http_response_code(429);
        echo json_encode(['error' => 'Too many incorrect attempts. Please request a new code.']);
        exit;
    }

    // Check if code is expired
    if (time() > $_SESSION['reset_expires']) {
        // Clear session
        unset($_SESSION['reset_code'], $_SESSION['reset_email'], $_SESSION['reset_user_id'], $_SESSION['reset_expires'], , $_SESSION['code_attempts']);
        http_response_code(400);
        echo json_encode(['error' => 'Reset code has expired. Please request a new one.']);
        exit;
    }

    // Verify code
    if ($code !== $_SESSION['reset_code']) {
        $_SESSION['code_attempts'] += 1;
        http_response_code(400);
        echo json_encode(['error' => 'Invalid verification code']);
        exit;
    }

    // Validate new password
    $passwordValidation = validatePassword($newPassword);
    if ($passwordValidation !== true) {
        http_response_code(400);
        echo json_encode(['error' => $passwordValidation]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Hash new password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password in database
    $updateQuery = "UPDATE Users SET password_hash = :password_hash WHERE user_id = :user_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':password_hash', $passwordHash);
    $updateStmt->bindParam(':user_id', $_SESSION['reset_user_id']);

    if ($updateStmt->execute()) {
        // Log successful password reset
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'PASSWORD_RESET_COMPLETED', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $_SESSION['reset_user_id']);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();

        // Clear session data
        unset($_SESSION['reset_code'], $_SESSION['reset_email'], $_SESSION['reset_user_id'], $_SESSION['reset_expires'], $_SESSION['code_attempts']);

        echo json_encode([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update password']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
