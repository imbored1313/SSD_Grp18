<?php

require_once(__DIR__ . '/config.php');
session_start();
$oldCsrfToken = $_SESSION['csrf_token'] ?? null;
session_regenerate_id(true);
if ($oldCsrfToken !== null) {
    $_SESSION['csrf_token'] = $oldCsrfToken;
}

// update_user_profile.php - Update user profile data in database

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
// Get and sanitize input data
    $firstName = sanitizeInput($_POST['firstName'] ?? '');
    $lastName = sanitizeInput($_POST['lastName'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');

    // Get entered password
    $enteredPassword = $_POST['verifyPassword'] ?? '';

    if (empty($enteredPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password confirmation is required']);
        exit;
    }
    
    // Fetch user's password
    $passQuery = "SELECT password_hash FROM Users WHERE user_id = :user_id";
    $passStmt = $db->prepare($passQuery);
    $passStmt->bindParam(':user_id', $userId);
    $passStmt->execute();
    $stored = $passStmt->fetch(PDO::FETCH_ASSOC);

    if (!$stored || !password_verify($enteredPassword, $stored['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Incorrect password']);
        exit;
    }

// Validate required fields
    if (empty($firstName) || empty($lastName) || empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'First name, last name, and email are required']);
        exit;
    }

    // Validate email format
    if (!validateEmail($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid email format']);
        exit;
    }

    // Check if email is already taken by another user
    $emailCheckQuery = "SELECT user_id FROM Users WHERE email = :email AND user_id != :user_id";
    $emailCheckStmt = $db->prepare($emailCheckQuery);
    $emailCheckStmt->bindParam(':email', $email);
    $emailCheckStmt->bindParam(':user_id', $userId);
    $emailCheckStmt->execute();
    if ($emailCheckStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email is already taken by another user']);
        exit;
    }

    // Update user profile
    $updateQuery = "UPDATE Users SET 
                    first_name = :first_name, 
                    last_name = :last_name, 
                    email = :email, 
                    phone = :phone 
                    WHERE user_id = :user_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':first_name', $firstName);
    $updateStmt->bindParam(':last_name', $lastName);
    $updateStmt->bindParam(':email', $email);
    $updateStmt->bindParam(':phone', $phone);
    $updateStmt->bindParam(':user_id', $userId);
    if ($updateStmt->execute()) {
    // Update session data with new information
        $_SESSION['user']['first_name'] = $firstName;
        $_SESSION['user']['last_name'] = $lastName;
        $_SESSION['user']['email'] = $email;
        $_SESSION['first_name'] = $firstName;
        $_SESSION['last_name'] = $lastName;
        $_SESSION['email'] = $email;
    // Log the profile update
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'PROFILE_UPDATED', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $userId);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'phone' => $phone
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
    }
} catch (Exception $e) {
    error_log("Update profile error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
