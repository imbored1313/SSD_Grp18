<?php
$host = '127.0.0.1';      // Your local forwarded host
$port = 3307;             // Local port you used in ssh -L
$user = 'user';           // MySQL username (from screenshot)
$pass = 'SSD@group18'; // Replace with actual password
$dbname = 'electraedge';  // Default schema

$conn = new mysqli($host, $user, $pass, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully!";
?>
