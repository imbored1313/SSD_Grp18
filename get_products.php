<?php

require_once __DIR__ . '/php/config.php';

$database = new Database();
$conn = $database->getConnection();

$sql = "SELECT product_id, name, description, price, stock, image_path FROM Products";
$stmt = $conn->prepare($sql);
$stmt->execute();
$products = $stmt->fetchAll();

header('Content-Type: application/json');
echo json_encode($products);
