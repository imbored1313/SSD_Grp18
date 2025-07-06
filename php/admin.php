<?php

require_once 'config.php';
$database = new Database();
$db = $database->getConnection();
// Create a secure hash of your chosen password
$plainPassword = 'admin';
$hash = password_hash($plainPassword, PASSWORD_DEFAULT);
$stmt = $db->prepare("INSERT INTO Users (username, email, first_name, last_name, role, is_verified, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
$success = $stmt->execute(['admin', 'admin@electraedge.com', 'Admin', 'User', 'admin', 1, $hash]);
if ($success) {
    echo "Admin user created successfully.";
} else {
    echo "Failed to create admin user.";
}
