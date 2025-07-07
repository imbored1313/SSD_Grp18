<?php
// ===== php/get_cart.php - PDO VERSION =====
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

try {
    $database = new Database();
    $conn = $database->getConnection();

    $sql = "SELECT c.product_id, c.quantity, p.name, p.price, p.image_path, p.description
            FROM Cart c
            JOIN Products p ON c.product_id = p.product_id
            WHERE c.user_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$user_id]);
    $results = $stmt->fetchAll();

    $data = [];
    $totalQuantity = 0;

    foreach ($results as $row) {
        $data[] = $row;
        $totalQuantity += $row['quantity'];
    }

    echo json_encode([
        'success' => true,
        'cart' => $data,
        'cartCount' => $totalQuantity
    ]);

} catch (Exception $e) {
    error_log("Get cart error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to load cart']);
}
?>