<?php
// ===== php/delete_cart_item.php - PDO VERSION =====
require_once(__DIR__ . '/config.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

if (!isset($_SESSION['user']['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user']['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
$product_id = $data['product_id'];

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("DELETE FROM Cart WHERE user_id = ? AND product_id = ?");
    
    if ($stmt->execute([$user_id, $product_id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to remove item']);
    }
} catch (Exception $e) {
    error_log("Delete cart item error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to remove item']);
}
?>