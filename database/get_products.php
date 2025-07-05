<?php
require 'db_connect.php';

$sql = "SELECT product_id, name, description, price, stock, image_path FROM products";
$res = mysqli_query($conn, $sql);

$products = [];
if ($res) {
  while ($r = mysqli_fetch_assoc($res)) {
    $products[] = $r;
  }
}
mysqli_close($conn);

header('Content-Type: application/json');
echo json_encode($products);
