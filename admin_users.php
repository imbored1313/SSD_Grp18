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
</head>
<body>
  <div class="admin-dashboard">
    <aside class="admin-sidebar">
      <ul class="admin-nav">
        <li><a href="admin_dashboard.html">Dashboard</a></li>
        <li><a href="admin_products.php">Products</a></li>
        <li><a href="admin_users.php" class="active">Users</a></li>
      </ul>
    </aside>

    <main class="admin-content">
      <div class="admin-header">
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
