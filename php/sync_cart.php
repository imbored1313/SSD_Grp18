<?php
// ===== php/sync_cart.php - PDO VERSION =====
require_once(__DIR__ . '/config.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

if (!isset($_SESSION['user']['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user']['user_id'];
$cartItems = $data['cart'] ?? [];

try {
    $database = new Database();
    $conn = $database->getConnection();

    foreach ($cartItems as $item) {
        $productId = $item['product_id'];
        $qty = $item['quantity'];

        // Check if item exists
        $checkStmt = $conn->prepare("SELECT id FROM Cart WHERE user_id = ? AND product_id = ?");
        $checkStmt->execute([$user_id, $productId]);
        
        if ($checkStmt->fetch()) {
            // Update existing
            $updateStmt = $conn->prepare("UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $updateStmt->execute([$qty, $user_id, $productId]);
        } else {
            // Insert new
            $insertStmt = $conn->prepare("INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $insertStmt->execute([$user_id, $productId, $qty]);
        }
    }

    echo json_encode(['success' => true, 'message' => 'Cart synced successfully']);

} catch (Exception $e) {
    error_log("Cart sync error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to sync cart']);
}
?>