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
  <meta charset="UTF-8" />
  <title>Admin User Management</title>
  <link rel="stylesheet" href="website.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="admin-dashboard">
    <aside class="admin-sidebar gradient-bg">
      <ul class="admin-nav">
        <li><a href="admin_dashboard.php"><i class="fas fa-chart-line me-2"></i>Dashboard</a></li>
        <li><a href="admin_products.php"><i class="fas fa-box-open me-2"></i>Products</a></li>
        <li><a href="admin_users.php" class="active"><i class="fas fa-users me-2"></i>Users</a></li>
        <li><a href="get_all_orders.php"><i class="fas fa-users me-2"></i>Orders</a></li>
      </ul>
    </aside>
    <main class="admin-content">
      <div class="admin-header mb-4">
        <h1>Manage Users</h1>
      </div>
      <div class="data-table">
        <table class="table" id="usersTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </main>
  </div>
  <script src="js/admin_users.js"></script>
</body>
</html>
