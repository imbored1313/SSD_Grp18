<?php
session_start();
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    header('Location: error.html?code=403');
    exit;
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
                <li><a href="admin_orders.php" class="active"><i class="fas fa-users me-2"></i>Orders</a></li>
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

