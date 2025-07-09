<?php

$data = json_decode(file_get_contents('php://input'), true);
$orderID = $data['orderID'];
$clientId = 'AVyilJ6eWAp302gUQQDI6HVO19xtLy7OGAp7ZUDRwmKY__jhoV6M-Xvdb3-raWXW2uX7wLtLtEbj-nh4';
$clientSecret = 'EA6aWvSedTU2peoR7zMfdGY23CPEakYbDO4-DTNXSqGXBo_M1PIWLJd0rshmFrXKStV2avtfdmPSS2ih';
// Fetch access token (same as above)
$ch = curl_init('https://api-m.sandbox.paypal.com/v1/oauth2/token');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_USERPWD => "$clientId:$clientSecret",
  CURLOPT_POSTFIELDS => "grant_type=client_credentials"
]);
$res = curl_exec($ch);
curl_close($ch);
$token = json_decode($res, true)['access_token'];
// Capture the order
$ch = curl_init("https://api-m.sandbox.paypal.com/v2/checkout/orders/$orderID/capture");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "Authorization: Bearer $token"
  ]
]);
$res = curl_exec($ch);
curl_close($ch);
echo $res; // returns capture details JSON

// After capturing the order with PayPal, save the order and items to the database

require_once(__DIR__ . '/config.php');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get user ID from session (adjust if your session structure is different)
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

// Parse PayPal capture response
$paypal_response = json_decode($res, true);

// Get order details from PayPal response
$paypal_order_id = $paypal_response['id'] ?? null;
$status = $paypal_response['status'] ?? 'Pending';
$order_date = date('Y-m-d H:i:s');
$payment_method = 'PayPal';
$payment_details = $paypal_response['payer']['email_address'] ?? '';

// Fetch cart items for this user from the database
$database = new Database();
$db = $database->getConnection();

$cart_query = "SELECT c.product_id, c.quantity, p.name, p.price, p.image_path FROM Cart c JOIN Products p ON c.product_id = p.product_id WHERE c.user_id = :user_id";
$cart_stmt = $db->prepare($cart_query);
$cart_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$cart_stmt->execute();
$cart_items = $cart_stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$cart_items || count($cart_items) === 0) {
    echo json_encode(['success' => false, 'message' => 'No items in cart.']);
    exit;
}

// Calculate totals
$items_total = 0;
foreach ($cart_items as $item) {
    $items_total += $item['price'] * $item['quantity'];
}
$shipping_cost = 0.00; // Set as needed
$tax = 0.00; // Set as needed
$discount = 0.00; // Set as needed
$grand_total = $items_total + $shipping_cost + $tax - $discount;

// Insert order into Orders table
$order_sql = "INSERT INTO Orders (user_id, paypal_order_id, status, order_date, payment_method, payment_details, items_total, shipping_cost, tax, discount, grand_total, raw_paypal_response) VALUES (:user_id, :paypal_order_id, :status, :order_date, :payment_method, :payment_details, :items_total, :shipping_cost, :tax, :discount, :grand_total, :raw_paypal_response)";
$order_stmt = $db->prepare($order_sql);
$order_stmt->execute([
    ':user_id' => $user_id,
    ':paypal_order_id' => $paypal_order_id,
    ':status' => $status,
    ':order_date' => $order_date,
    ':payment_method' => $payment_method,
    ':payment_details' => $payment_details,
    ':items_total' => $items_total,
    ':shipping_cost' => $shipping_cost,
    ':tax' => $tax,
    ':discount' => $discount,
    ':grand_total' => $grand_total,
    ':raw_paypal_response' => json_encode($paypal_response)
]);
$order_id = $db->lastInsertId();

// Insert each cart item into order_items
$item_sql = "INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, quantity, subtotal) VALUES (:order_id, :product_id, :product_name, :product_image, :product_price, :quantity, :subtotal)";
$item_stmt = $db->prepare($item_sql);
foreach ($cart_items as $item) {
    $item_stmt->execute([
        ':order_id' => $order_id,
        ':product_id' => $item['product_id'],
        ':product_name' => $item['name'],
        ':product_image' => $item['image_path'],
        ':product_price' => $item['price'],
        ':quantity' => $item['quantity'],
        ':subtotal' => $item['price'] * $item['quantity']
    ]);
}

// Clear the user's cart
$clear_cart_sql = "DELETE FROM Cart WHERE user_id = :user_id";
$clear_cart_stmt = $db->prepare($clear_cart_sql);
$clear_cart_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$clear_cart_stmt->execute();

// Return the original PayPal response plus order_id
$paypal_response['local_order_id'] = $order_id;
echo json_encode($paypal_response);
