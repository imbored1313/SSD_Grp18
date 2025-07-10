<?php
// SAFE DEBUG MODE
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Show PHP errors as JSON output for browser
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "PHP Error: $errstr in $errfile on line $errline"
    ]);
    exit;
});

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
    exit;
});

// --- START NORMAL LOGIC ---
require_once(__DIR__ . '/config.php');
header('Content-Type: application/json');

$user = getUserFromSession();

if (!$user || !isset($user['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated',
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$user_id = $user['user_id'];

$query = "SELECT 
            c.id AS cart_id, c.user_id, c.product_id, c.quantity,
            p.name, p.description, p.price, p.stock, p.image_path
          FROM Cart c
          JOIN Products p ON c.product_id = p.product_id
          WHERE c.user_id = :user_id";

$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();

$cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calculate total & format
$cartTotal = 0;
foreach ($cartItems as &$item) {
    $item['quantity'] = (int)$item['quantity'];
    $item['price'] = (float)$item['price'];
    $item['item_total'] = $item['quantity'] * $item['price'];
    $cartTotal += $item['item_total'];
}

echo json_encode([
    'success' => true,
    'cart' => $cartItems,
    'cartCount' => count($cartItems),
    'cartTotal' => $cartTotal,
]);
