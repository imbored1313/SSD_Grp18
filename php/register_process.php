<?php

// register_process.php - Updated with username and email
require_once 'config.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
// Get and sanitize input
    $username = sanitizeInput($_POST['username'] ?? '');
    $firstName = sanitizeInput($_POST['firstName'] ?? '');
    $lastName = sanitizeInput($_POST['lastName'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $terms = isset($_POST['terms']);
// Validate input
    $errors = [];
    if (empty($username)) {
        $errors['username'] = 'Username is required';
    } elseif (strlen($username) < 3) {
        $errors['username'] = 'Username must be at least 3 characters';
    } elseif (!preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
        $errors['username'] = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    if (empty($firstName)) {
        $errors['firstName'] = 'First name is required';
    }

    if (empty($lastName)) {
        $errors['lastName'] = 'Last name is required';
    }

    if (empty($email)) {
        $errors['email'] = 'Email is required';
    } elseif (!validateEmail($email)) {
        $errors['email'] = 'Invalid email format';
    }

    if (empty($password)) {
        $errors['password'] = 'Password is required';
    } else {
        $passwordValidation = validatePassword($password);
        if ($passwordValidation !== true) {
            $errors['password'] = $passwordValidation;
        }
    }

    if ($password !== $confirmPassword) {
        $errors['confirmPassword'] = 'Passwords do not match';
    }

    if (!$terms) {
        $errors['terms'] = 'You must agree to the terms';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['errors' => $errors]);
        exit;
    }

    // Database connection
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    // Check if username or email already exists
    $checkQuery = "SELECT user_id FROM Users WHERE email = :email OR username = :username";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->bindParam(':username', $username);
    $checkStmt->execute();
    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Username or email already exists']);
        exit;
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
// Insert user
    $insertQuery = "INSERT INTO Users (username, email, password_hash, first_name, last_name, phone, role, is_verified, created_at) 
                    VALUES (:username, :email, :password_hash, :first_name, :last_name, :phone, 'user', FALSE, NOW())";
    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->bindParam(':username', $username);
    $insertStmt->bindParam(':email', $email);
    $insertStmt->bindParam(':password_hash', $passwordHash);
    $insertStmt->bindParam(':first_name', $firstName);
    $insertStmt->bindParam(':last_name', $lastName);
    $insertStmt->bindParam(':phone', $phone);
    if ($insertStmt->execute()) {
        $userId = $db->lastInsertId();
    // Log successful registration in AuditLogs
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'USER_REGISTERED', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $userId);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user_id' => $userId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
// NEW (SECURE):
} catch (Exception $e) {
    // SECURE FIX: Log error details server-side only, don't expose to client
    error_log("Registration error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed']);
}
