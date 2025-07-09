<?php
session_start();
    header('Location: error.html?code=403');
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
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin - All Orders</title>
    <link rel="stylesheet" href="website.css">
</head>
<body>
    <div class="admin-dashboard">
        <aside class="admin-sidebar gradient-bg">
            <ul class="admin-nav">
                <li><a href="admin_dashboard.php"><i class="fas fa-chart-line me-2"></i>Dashboard</a></li>
                <li><a href="admin_products.php"><i class="fas fa-box-open me-2"></i>Products</a></li>
                <li><a href="admin_users.php"><i class="fas fa-users me-2"></i>Users</a></li>
                <li><a href="get_all_orders.php" class="active"><i class="fas fa-users me-2"></i>Orders</a></li>
            </ul>
        </aside>

        <main class="admin-content">
            <h2>All Orders</h2>
            <div id="orders-list">
                <!-- Orders will be loaded here -->
            </div>
        </main>
    </div>

    <script src="js/admin_order.js"></script>
</body>
</html>

