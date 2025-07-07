<?php
// php/get_cart.php - CORRECTED for your exact database schema
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once(__DIR__ . '/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

try {
    logSessionDebug("=== GET CART REQUEST START ===");
    logSessionDebug("Request method: " . $_SERVER['REQUEST_METHOD']);
    
    // Check if user is authenticated
    $user = getUserFromSession();
    
    if (!$user || !isset($user['user_id'])) {
        logSessionDebug("❌ No authenticated user found");
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
    logSessionDebug("✅ Authenticated user: " . $user_id . " (" . ($user['username'] ?? 'Unknown') . ")");
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    logSessionDebug("✅ Database connection established");
    
    // Query cart items using your EXACT database schema
    // Cart: id, user_id, product_id, quantity
    // Products: product_id, name, description, price, stock, image_path, added_by
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
    
    // Calculate totals and clean data
    $cartCount = 0;
    $cartTotal = 0;
    
    foreach ($cartItems as &$item) {
        // Ensure proper data types
        $item['cart_id'] = intval($item['cart_id']);
        $item['product_id'] = intval($item['product_id']);
        $item['user_id'] = intval($item['user_id']);
        $item['quantity'] = intval($item['quantity']);
        $item['price'] = floatval($item['price']);
        $item['stock'] = intval($item['stock']);
        $item['item_total'] = floatval($item['item_total']);
        
        // Calculate totals
        $cartCount += $item['quantity'];
        $cartTotal += $item['item_total'];
        
        // Handle image path
        if (!empty($item['image_path'])) {
            // Check if it's already a proper path
            if (!str_starts_with($item['image_path'], 'http') && 
                !str_starts_with($item['image_path'], '/uploads/')) {
                $item['image_path'] = '/uploads/products/' . basename($item['image_path']);
            }
        } else {
            $item['image_path'] = '/assets/images/no-image.jpg';
        }
        
        // Ensure description exists
        if (empty($item['description'])) {
            $item['description'] = 'No description available';
        }
        
        // Add stock status flags
        $item['in_stock'] = $item['stock'] > 0;
        $item['low_stock'] = $item['stock'] < 10;
    }
    
    logSessionDebug("✅ Cart totals calculated", [
        'item_count' => count($cartItems),
        'total_quantity' => $cartCount,
        'total_amount' => $cartTotal
    ]);
    
    // Return successful response
    echo json_encode([
        'success' => true,
        'cart' => $cartItems,
        'cartCount' => $cartCount,
        'cartTotal' => $cartTotal,
        'user_id' => $user_id,
        'username' => $user['username'] ?? 'Unknown',
        'timestamp' => time(),
        'debug' => [
            'query_used' => $query,
            'schema_matched' => true,
            'database_schema' => 'Cart(id,user_id,product_id,quantity) + Products(product_id,name,description,price,stock,image_path,added_by)'
        ]
    ]);
    
} catch (PDOException $e) {
    logSessionDebug("❌ Database error: " . $e->getMessage());
    error_log("Cart PDO Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage(),
        'debug' => [
            'error_type' => 'PDOException',
            'error_code' => $e->getCode(),
            'user_session' => getUserFromSession()
        ]
    ]);
    
} catch (Exception $e) {
    logSessionDebug("❌ General error: " . $e->getMessage());
    error_log("Cart General Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load cart: ' . $e->getMessage(),
        'error' => $e->getMessage(),
        'debug' => [
            'error_type' => 'Exception',
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'user_session' => getUserFromSession()
        ]
    ]);
}

logSessionDebug("=== GET CART REQUEST END ===");
?>