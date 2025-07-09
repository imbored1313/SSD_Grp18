<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

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

$order_id = null;
if (isset($_GET['order_id'])) {
    $order_id = intval($_GET['order_id']);
} elseif (isset($_POST['order_id'])) {
    $order_id = intval($_POST['order_id']);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($order_id) {
        // Fetch a single order and its items
        $order_sql = "SELECT * FROM Orders WHERE order_id = :order_id AND user_id = :user_id";
        $order_stmt = $db->prepare($order_sql);
        $order_stmt->execute([':order_id' => $order_id, ':user_id' => $user_id]);
        $order = $order_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found.']);
            exit;
        }
        
        // Get order items
        $items_sql = "SELECT * FROM order_items WHERE order_id = :order_id";
        $items_stmt = $db->prepare($items_sql);
        $items_stmt->execute([':order_id' => $order_id]);
        $order['items'] = $items_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'order' => $order]);
        exit;
    } else {
        // Fetch all orders for the user
        $orders_sql = "SELECT 
            order_id,
            user_id,
            order_date,
            status,
            total_amount,
            paypal_order_id,
            shipping_name,
            shipping_address,
            shipping_method,
            shipping_tracking_number,
            shipping_carrier,
            shipping_eta,
            billing_address,
            payment_method,
            payment_details,
            items_total,
            shipping_cost,
            tax,
            discount,
            notes
        FROM Orders 
        WHERE user_id = :user_id 
        ORDER BY order_date DESC";
        
        $orders_stmt = $db->prepare($orders_sql);
        $orders_stmt->execute([':user_id' => $user_id]);
        $orders = $orders_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // For each order, fetch its items
        foreach ($orders as &$order) {
            $items_sql = "SELECT 
                id,
                order_id,
                product_id,
                product_name,
                product_image,
                product_price,
                quantity,
                subtotal
            FROM order_items 
            WHERE order_id = :order_id";
            
            $items_stmt = $db->prepare($items_sql);
            $items_stmt->execute([':order_id' => $order['order_id']]);
            $order['items'] = $items_stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        exit;
    }
} catch (PDOException $e) {
    error_log("Database error in get_orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit;
} catch (Exception $e) {
    error_log("General error in get_orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()]);
    exit;
}
?>