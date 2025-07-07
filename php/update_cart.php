<?php
// ===== php/update_cart.php - PDO VERSION =====
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
$quantity = $data['quantity'];

if ($quantity < 1) {
    echo json_encode(['success' => false, 'message' => 'Quantity must be at least 1']);
    exit;
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
    
    if ($stmt->execute([$quantity, $user_id, $product_id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update cart']);
    }
} catch (Exception $e) {
    error_log("Update cart error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to update cart']);
}
?>