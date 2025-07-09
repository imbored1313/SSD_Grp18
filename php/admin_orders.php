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

    // Get all orders with user and items
    $ordersStmt = $db->query("
        SELECT o.*, u.username, u.email
        FROM Orders o
        JOIN Users u ON o.user_id = u.user_id
        ORDER BY o.order_date DESC
    ");
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $order_id = $order['order_id'];
        $itemsStmt = $db->prepare("
            SELECT oi.*, p.name AS product_name, p.image_path AS product_image, p.price AS product_price
            FROM OrderItems oi
            JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        ");
        $itemsStmt->execute([$order_id]);
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}