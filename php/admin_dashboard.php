<?php

session_start();
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    header('Location: index.html');
// or a user dashboard page
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <link rel="stylesheet" href="website.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="admin-dashboard">
        <aside class="admin-sidebar">
            <ul class="admin-nav">
                <li><a href="admin_dashboard.php" class="active">Dashboard</a></li>
                <li><a href="admin_products.php">Products</a></li>
                <li><a href="admin_users.php">Users</a></li>
            </ul>
        </aside>
    <div class="container mt-5">
        <h1>👋 Welcome to the Admin Dashboard</h1>
        <a href="index.html" class="btn btn-primary">Back to Home</a>
    </div>
</body>
</html>
