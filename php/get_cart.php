<?php
// php/get_cart.php - MySQL schema specific version
require_once(__DIR__ . '/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

logSessionDebug("=== GET CART REQUEST START ===");
logSessionDebug("Request method: " . $_SERVER['REQUEST_METHOD']);
logSessionDebug("Request URI: " . $_SERVER['REQUEST_URI']);

try {
    // Check if user is authenticated
    $user = getUserFromSession();
    
    if (!$user || !isset($user['user_id'])) {
        logSessionDebug("❌ No authenticated user found");
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required - please log in',
            'redirect' => 'login.html',
            'debug' => [
                'session_status' => session_status(),
                'session_id' => session_id(),
                'has_session_data' => !empty($_SESSION),
                'session_contents' => $_SESSION
            ]
        ]);
        exit;
    }
    
    $user_id = $user['user_id'];
    logSessionDebug("✅ Authenticated user: " . $user_id . " (" . $user['username'] . ")");
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    logSessionDebug("✅ Database connection established");
    
    // Query cart items using exact MySQL schema
    // Cart table: id, user_id, product_id, quantity
    // Products table: product_id, name, description, price, stock, image_path, added_by
    $query = "SELECT 
                c.id as cart_id,
                c.user_id,
                c.product_id, 
                c.quantity,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image_path,
                (p.price * c.quantity) as item_total
              FROM Cart c 
              JOIN Products p ON c.product_id = p.product_id 
              WHERE c.user_id = :user_id 
              ORDER BY c.id DESC";
    
    logSessionDebug("Cart query: " . $query);
    logSessionDebug("User ID parameter: " . $user_id);
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    logSessionDebug("✅ Cart query executed, found " . count($cartItems) . " items");
    
    if (count($cartItems) > 0) {
        logSessionDebug("Cart items found", $cartItems);
    }
    
    // Calculate totals
    $cartCount = 0;
    $cartTotal = 0;
    
    foreach ($cartItems as &$item) {
        $cartCount += intval($item['quantity']);
        $cartTotal += floatval($item['item_total']);
        
        // Ensure image path is correct
        if (!empty($item['image_path'])) {
            // Check if it's already a full URL or proper path
            if (!str_starts_with($item['image_path'], 'http') && 
                !str_starts_with($item['image_path'], '/uploads/')) {
                $item['image_path'] = '/uploads/products/' . basename($item['image_path']);
            }
        } else {
            $item['image_path'] = '/assets/images/no-image.jpg';
        }
        
        // Ensure numeric values are properly typed
        $item['price'] = floatval($item['price']);
        $item['quantity'] = intval($item['quantity']);
        $item['item_total'] = floatval($item['item_total']);
        $item['stock'] = intval($item['stock']);
        $item['product_id'] = intval($item['product_id']);
        $item['cart_id'] = intval($item['cart_id']);
        
        // Add stock availability info
        $item['in_stock'] = $item['stock'] > 0;
        $item['low_stock'] = $item['stock'] < 10;
    }
    
    logSessionDebug("✅ Cart totals calculated", [
        'item_count' => count($cartItems),
        'total_quantity' => $cartCount,
        'total_amount' => $cartTotal
    ]);
    
    echo json_encode([
        'success' => true,
        'cart' => $cartItems,
        'cartCount' => $cartCount,
        'cartTotal' => $cartTotal,
        'user_id' => $user_id,
        'username' => $user['username'],
        'timestamp' => time(),
        'debug' => [
            'query_used' => $query,
            'mysql_schema' => true
        ]
    ]);
    
} catch (Exception $e) {
    logSessionDebug("❌ Cart loading error: " . $e->getMessage());
    logSessionDebug("❌ Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load cart: ' . $e->getMessage(),
        'error' => $e->getMessage(),
        'debug' => [
            'user_session' => getUserFromSession(),
            'session_data' => $_SESSION
        ]
    ]);
}

logSessionDebug("=== GET CART REQUEST END ===");
?>