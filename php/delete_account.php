<?php

require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);

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
    
    // Get the password for verification
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    
    if (empty($confirmPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password confirmation is required']);
        exit;
    }
    
    // Verify user's password before deletion
    $passQuery = "SELECT password_hash, email FROM Users WHERE user_id = :user_id";
    $passStmt = $db->prepare($passQuery);
    $passStmt->bindParam(':user_id', $userId);
    $passStmt->execute();
    $userData = $passStmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData || !password_verify($confirmPassword, $userData['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Incorrect password']);
        exit;
    }

    // Start transaction for safe deletion
    $db->beginTransaction();
    
    try {
        // Log the account deletion before deleting
        $logQuery = "INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                     VALUES (:user_id, 'ACCOUNT_DELETED', NOW(), :ip_addr)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(':user_id', $userId);
        $logStmt->bindParam(':ip_addr', $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        
        // Delete from related tables first (if they exist)
        // Add more DELETE statements here if you have other tables referencing Users
        
        // Example: Delete user orders (if you have an Orders table)
        // $deleteOrdersQuery = "DELETE FROM Orders WHERE user_id = :user_id";
        // $deleteOrdersStmt = $db->prepare($deleteOrdersQuery);
        // $deleteOrdersStmt->bindParam(':user_id', $userId);
        // $deleteOrdersStmt->execute();
        
        // Example: Delete user cart items (if you have a Cart table)
        // $deleteCartQuery = "DELETE FROM Cart WHERE user_id = :user_id";
        // $deleteCartStmt = $db->prepare($deleteCartQuery);
        // $deleteCartStmt->bindParam(':user_id', $userId);
        // $deleteCartStmt->execute();
        

        // Delete the user account
        $deleteUserQuery = "DELETE FROM Users WHERE user_id = :user_id";
        $deleteUserStmt = $db->prepare($deleteUserQuery);
        $deleteUserStmt->bindParam(':user_id', $userId);
        $deleteUserStmt->execute();
        
        // Check if deletion was successful
        if ($deleteUserStmt->rowCount() === 0) {
            throw new Exception('Failed to delete user account');
        }
        
        // Commit the transaction
        $db->commit();
        
        // Destroy the session
        session_destroy();
        
        echo json_encode([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Delete account error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to delete account'
    ]);
}
?>