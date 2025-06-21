<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>ElectraEdge Database Contents</h2>";

// Users table
echo "<h3>Users</h3>";
$stmt = $db->query("SELECT user_id, username, email, first_name, last_name, role, is_verified, created_at, password_hash FROM Users");
echo "<table border='1'><tr><th>ID</th><th>Username</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Role</th><th>Verified</th><th>Created</th><th>Password Hash</th></tr>";
while ($row = $stmt->fetch()) {
    echo "<tr><td>{$row['user_id']}</td><td>{$row['username']}</td><td>{$row['email']}</td><td>{$row['first_name']}</td><td>{$row['last_name']}</td><td>{$row['role']}</td><td>{$row['is_verified']}</td><td>{$row['created_at']}</td><td>" . substr($row['password_hash'], 0, 20) . "...</td></tr>";
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
?>