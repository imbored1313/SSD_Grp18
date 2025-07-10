<?php
require_once(__DIR__ . '/ssrf_protection.php'); // Include the protection functions

$data = json_decode(file_get_contents('php://input'), true);
$orderID = $data['orderID'];

// Validate orderID
if (empty($orderID) || !preg_match('/^[A-Z0-9]{17}$/', $orderID)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid order ID']);
    exit;
}

$clientId = $_SERVER['PAYPAL_CLIENT_ID'];
$clientSecret = $_SERVER['PAYPAL_CLIENT_SECRET'];

$allowedDomains = [
    'api-m.sandbox.paypal.com',
    'api-m.paypal.com',
    'api.sandbox.paypal.com',
    'api.paypal.com'
];

try {
    // Fetch access token
    $tokenUrl = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
    $tokenResponse = secureCurlExec($tokenUrl, [
        CURLOPT_POST => true,
        CURLOPT_USERPWD => "$clientId:$clientSecret",
        CURLOPT_POSTFIELDS => "grant_type=client_credentials"
    ], $allowedDomains);

    $tokenData = json_decode($tokenResponse, true);
    if (!isset($tokenData['access_token'])) {
        throw new Exception('Failed to get access token');
    }

    $token = $tokenData['access_token'];

    // Capture the order
    $captureUrl = "https://api-m.sandbox.paypal.com/v2/checkout/orders/$orderID/capture";
    $captureResponse = secureCurlExec($captureUrl, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer $token"
        ]
    ], $allowedDomains);

    // After capturing the order with PayPal, save the order and items to the database
    require_once(__DIR__ . '/config.php');

    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Get user ID from session
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'User not logged in.']);
        exit;
    }

    // Parse PayPal capture response
    $paypal_response = json_decode($captureResponse, true);

    // Check if PayPal capture was successful
    if ($paypal_response['status'] !== 'COMPLETED') {
        echo json_encode(['success' => false, 'message' => 'PayPal payment not completed']);
        exit;
    }

    // Get order details from PayPal response
    $paypal_order_id = $paypal_response['id'] ?? null;
    $status = 'paid'; // Set as paid since PayPal completed
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
    $shipping_cost = 0.00;
    $tax = 0.00;
    $discount = 0.00;
    $total_amount = $items_total + $shipping_cost + $tax - $discount; // Use total_amount to match your DB

    try {
        // Insert order into Orders table (using column names that match your database)
        $order_sql = "INSERT INTO Orders (user_id, order_date, status, total_amount, paypal_order_id, shipping_name, shipping_address, shipping_method, shipping_tracking_number, shipping_carrier, shipping_eta, billing_address, payment_method, payment_details, items_total, shipping_cost, tax, discount, notes, raw_paypal_response) VALUES (:user_id, :order_date, :status, :total_amount, :paypal_order_id, :shipping_name, :shipping_address, :shipping_method, :shipping_tracking_number, :shipping_carrier, :shipping_eta, :billing_address, :payment_method, :payment_details, :items_total, :shipping_cost, :tax, :discount, :notes, :raw_paypal_response)";

        $order_stmt = $db->prepare($order_sql);
        $order_stmt->execute([
            ':user_id' => $user_id,
            ':order_date' => $order_date,
            ':status' => $status,
            ':total_amount' => $total_amount,
            ':paypal_order_id' => $paypal_order_id,
            ':shipping_name' => null,
            ':shipping_address' => null,
            ':shipping_method' => null,
            ':shipping_tracking_number' => null,
            ':shipping_carrier' => null,
            ':shipping_eta' => null,
            ':billing_address' => null,
            ':payment_method' => $payment_method,
            ':payment_details' => $payment_details,
            ':items_total' => $items_total,
            ':shipping_cost' => $shipping_cost,
            ':tax' => $tax,
            ':discount' => $discount,
            ':notes' => null,
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

        // Return the PayPal response plus our local order_id
        $paypal_response['local_order_id'] = $order_id;
        echo json_encode($paypal_response);

        //secure version:
    } catch (Exception $e) {
        // SECURE FIX: Log error details server-side only, don't expose to client
        error_log("Database error in capture-order.php: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());

        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Order processing failed'
        ]);
    }
} catch (Exception $e) {
    error_log("PayPal capture error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Payment capture failed']);
}
