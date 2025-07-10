<?php

require_once(__DIR__ . '/config.php');
session_start();
$oldCsrfToken = $_SESSION['csrf_token'] ?? null;
session_regenerate_id(true);
if ($oldCsrfToken !== null) {
    $_SESSION['csrf_token'] = $oldCsrfToken;
}

// CSRF Token Check
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

// Rate Limiting logic for reset request
$now = time();
$lastRequest = $_SESSION['last_reset_request'] ?? 0;

if ($now - $lastRequest < 60) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Too many requests. Try again in 1 minute.']);
    exit;
}

$_SESSION['last_reset_request'] = $now;

require_once 'email_config.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $email = sanitizeInput($_POST['email'] ?? '');
    if (empty($email) || !validateEmail($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid email is required']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
// Check if user exists
    $checkQuery = "SELECT user_id, username FROM Users WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    $user = $checkStmt->fetch();
    if (!$user) {
    // Return error if email doesn't exist
        http_response_code(400);
        echo json_encode(['error' => 'Email address not found in our system']);
        exit;
    }

    // Generate 6-digit code
    $resetCode = sprintf('%06d', mt_rand(100000, 999999));
// Store in session temporarily
    $_SESSION['reset_code'] = $resetCode;
    $_SESSION['reset_email'] = $email;
    $_SESSION['reset_user_id'] = $user['user_id'];
    $_SESSION['reset_expires'] = time() + (15 * 60);
// 15 minutes

    // Send email using Gmail SMTP
    $emailService = new EmailService();
    $emailSent = $emailService->sendPasswordResetEmail($email, $user['username'], $resetCode);
    if ($emailSent) {
    // Log the request
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'PASSWORD_RESET_REQUESTED', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $user['user_id']);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        echo json_encode([
            'success' => true,
            'message' => 'Verification code sent to your email',
            // Remove this debug code in production
            // 'debug_code' => $resetCode
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send email. Please try again.']);
    }
} catch (Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
