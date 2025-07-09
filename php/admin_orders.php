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

    // First, let's check what tables actually exist
    $tablesStmt = $db->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Check if we have the required tables
    $hasUsers = in_array('users', $tables) || in_array('Users', $tables);
    $hasOrders = in_array('orders', $tables) || in_array('Orders', $tables);
    $hasOrderItems = in_array('orderitems', $tables) || in_array('OrderItems', $tables) || in_array('order_items', $tables);
    
    if (!$hasOrders) {
        throw new Exception("Orders table not found");
    }
    
    // Try different table name variations
    $ordersTable = in_array('orders', $tables) ? 'orders' : 'Orders';
    $usersTable = in_array('users', $tables) ? 'users' : 'Users';
    
    if ($hasOrderItems) {
        // Full query with order items
        $orderItemsTable = in_array('orderitems', $tables) ? 'orderitems' : 
                          (in_array('OrderItems', $tables) ? 'OrderItems' : 'order_items');
        
        // Get all orders with user and items
        $ordersStmt = $db->query("
            SELECT o.*, u.username, u.email
            FROM $ordersTable o
            JOIN $usersTable u ON o.user_id = u.user_id
            ORDER BY o.order_date DESC
        ");
        $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            $order_id = $order['order_id'];
            $itemsStmt = $db->prepare("
                SELECT oi.*, p.name AS product_name, p.image_path AS product_image, p.price AS product_price
                FROM $orderItemsTable oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            ");
            $itemsStmt->execute([$order_id]);
            $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } else {
        // Simplified query - just orders without items breakdown
        if ($hasUsers) {
            $ordersStmt = $db->query("
                SELECT o.*, u.username, u.email
                FROM $ordersTable o
                JOIN $usersTable u ON o.user_id = u.user_id
                ORDER BY o.order_date DESC
            ");
        } else {
            $ordersStmt = $db->query("
                SELECT *
                FROM $ordersTable
                ORDER BY order_date DESC
            ");
        }
        
        $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add empty items array for consistency
        foreach ($orders as &$order) {
            $order['items'] = [];
        }
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>