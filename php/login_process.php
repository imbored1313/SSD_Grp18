<?php
// login_process.php - SECURE VERSION
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/email_config.php');
session_start();
session_regenerate_id(true);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $usernameOrEmail = sanitizeInput($_POST['username'] ?? $_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    if (empty($usernameOrEmail) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username/email and password are required']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
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
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        exit;
    }

    // Verify password
    if (password_verify($password, $user['password_hash'])) {
        // Generate 2FA code
        $twoFACode = sprintf('%06d', mt_rand(100000, 999999));
        $_SESSION['2fa_code'] = $twoFACode;
        $_SESSION['2fa_user_id'] = $user['user_id'];
        $_SESSION['2fa_expires'] = time() + 300; // 5 minutes
        $_SESSION['2fa_verified'] = false;

        // SECURITY FIX: Sanitize email content to prevent injection
        $safeEmail = filter_var($user['email'], FILTER_SANITIZE_EMAIL);
        $safeUsername = htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8');

        // Validate email format
        if (!filter_var($safeEmail, FILTER_VALIDATE_EMAIL)) {
            error_log("Invalid email format detected during 2FA: " . $user['email']);
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Authentication failed']);
            exit;
        }

        // Validate username doesn't contain email injection patterns
        if (preg_match('/[\r\n\0]/', $user['username']) || 
            preg_match('/(?:to|cc|bcc|subject|content-type):/i', $user['username'])) {
            error_log("Potential email injection attempt detected: " . $user['username']);
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Authentication failed']);
            exit;
        }

        // Send 2FA code via email with sanitized data
        $emailService = new EmailService();
        $emailSent = $emailService->send2FAEmail($safeEmail, $safeUsername, $twoFACode);
        if (!$emailSent) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to send 2FA code. Please try again.']);
            exit;
        }

        // Respond that 2FA is required
        echo json_encode([
            'success' => false,
            '2fa_required' => true,
            'message' => '2FA code sent to your email. Please enter the code to complete login.'
        ]);
        exit;
    } else {
        // Log failed attempt
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'LOGIN_FAILED_INVALID_PASSWORD', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $user['user_id']);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
} catch (Exception $e) {
    // SECURITY FIX: Log error details server-side only, don't expose to client
    error_log("Login process error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Authentication failed']);
}
?>