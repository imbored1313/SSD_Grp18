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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="website.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="admin-dashboard">
    <aside class="admin-sidebar gradient-bg">
        <ul class="admin-nav">
            <li><a href="admin_dashboard.php" class="active"><i class="fas fa-chart-line me-2"></i>Dashboard</a></li>
            <li><a href="admin_products.php"><i class="fas fa-box-open me-2"></i>Products</a></li>
            <li><a href="admin_users.php"><i class="fas fa-users me-2"></i>Users</a></li>
        </ul>
    </aside>
    <main class="admin-content">
        <div class="admin-header mb-4">
            <h1>Audit Logs</h1>
            <p>Review all administrative and user-triggered actions across the system.</p>
        </div>

        <div class="data-table">
            <table class="table table-bordered table-striped" id="logsTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <nav aria-label="Page navigation" class="mt-3 text-center">
                <ul class="pagination justify-content-center" id="pagination"></ul>
            </nav>
        </div>
    </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/admin_dashboard.js"></script>
</body>
</html>
