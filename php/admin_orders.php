<?php
require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);

// Admin check
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

try {
    $db = (new Database())->getConnection();

    // Get all orders from the orders table
    $ordersStmt = $db->query("
        SELECT *
        FROM Orders
        ORDER BY order_date DESC
    ");
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);

    // Add empty items array and basic user info for display
    foreach ($orders as &$order) {
        $order['items'] = []; // Empty items for now since we don't have OrderItems table
        $order['username'] = 'User ' . $order['user_id']; // Mock username
        $order['email'] = 'user' . $order['user_id'] . '@example.com'; // Mock email
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>