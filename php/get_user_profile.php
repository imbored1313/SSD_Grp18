<?php
require_once(__DIR__ . '/config.php');
ensureSessionStarted();
// get_user_profile.php - Fetch user profile data from database

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

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

    // Get user profile data from database
    $query = "SELECT user_id, username, email, first_name, last_name, phone
              FROM Users WHERE user_id = :user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();

    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    // Return user profile data
    echo json_encode([
        'success' => true,
        'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'first_name' => $user['first_name'] ?? '',
            'last_name' => $user['last_name'] ?? '',
            'phone' => $user['phone'] ?? ''
        ]
    ]);

} catch (Exception $e) {
    error_log("Get profile error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>