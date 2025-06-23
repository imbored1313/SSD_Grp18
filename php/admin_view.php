<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>ElectraEdge Database Contents</h2>";

// Users table
echo "<h3>Users</h3>";
$stmt = $db->query("SELECT user_id, username, email, phone, first_name, last_name, role, is_verified, created_at, password_hash FROM Users");
echo "<table border='1'><tr><th>ID</th><th>Username</th><th>Email</th><th>Phone</th><th>First Name</th><th>Last Name</th><th>Role</th><th>Verified</th><th>Created</th><th>Password Hash</th></tr>";
while ($row = $stmt->fetch()) {
    echo "<tr><td>{$row['user_id']}</td><td>{$row['username']}</td><td>{$row['email']}</td><td>{$row['phone']}</td><td>{$row['first_name']}</td><td>{$row['last_name']}</td><td>{$row['role']}</td><td>{$row['is_verified']}</td><td>{$row['created_at']}</td><td>" . substr($row['password_hash'], 0, 20) . "...</td></tr>";
}
echo "</table>";

// Audit Logs
echo "<h3>Audit Logs</h3>";
$stmt = $db->query("SELECT * FROM AuditLogs ORDER BY timestamp DESC LIMIT 10");
echo "<table border='1'><tr><th>Log ID</th><th>User ID</th><th>Action</th><th>Timestamp</th><th>IP</th></tr>";
while ($row = $stmt->fetch()) {
    echo "<tr><td>{$row['log_id']}</td><td>{$row['user_id']}</td><td>{$row['action']}</td><td>{$row['timestamp']}</td><td>{$row['ip_addr']}</td></tr>";
}
echo "</table>";

// Products table
echo "<h3>Products</h3>";
$stmt = $db->query("SELECT product_id, name, description, price, stock, image_path, added_by FROM Products");
echo "<table border='1'>
<tr>
  <th>ID</th>
  <th>Name</th>
  <th>Description</th>
  <th>Price</th>
  <th>Stock</th>
  <th>Image Path</th>
  <th>Added By</th>
</tr>";
while ($row = $stmt->fetch()) {
    echo "<tr>
      <td>{$row['product_id']}</td>
      <td>{$row['name']}</td>
      <td>{$row['description']}</td>
      <td>{$row['price']}</td>
      <td>{$row['stock']}</td>
      <td>{$row['image_path']}</td>
      <td>{$row['added_by']}</td>
    </tr>";
}
echo "</table>";

?>