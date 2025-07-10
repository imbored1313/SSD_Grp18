<?php
// ===== php/delete_cart_item.php =====
require_once(__DIR__ . '/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

logSessionDebug("=== DELETE CART ITEM REQUEST ===");

try {
    // Check authentication
    $user = requireAuthentication();
    $user_id = $user['user_id'];
    
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($input['product_id'] ?? 0);
    
    if ($product_id <= 0) {
        throw new Exception("Invalid product ID");
    }
    
    logSessionDebug("Deleting cart item", [
        'user_id' => $user_id,
        'product_id' => $product_id
    ]);
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get product name for response
    $productQuery = "SELECT name FROM Products WHERE product_id = :product_id";
    $productStmt = $db->prepare($productQuery);
    $productStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $productStmt->execute();
    $product = $productStmt->fetch();
    
    // Delete cart item
    $deleteQuery = "DELETE FROM Cart WHERE user_id = :user_id AND product_id = :product_id";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $deleteStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $deleteStmt->execute();
    
    if ($deleteStmt->rowCount() == 0) {
        throw new Exception("Cart item not found");
    }
    
    logSessionDebug("✅ Cart item deleted successfully");
    
    echo json_encode([
        'success' => true,
        'message' => 'Item removed from cart successfully',
        'product_name' => $product ? $product['name'] : 'Unknown product'
    ]);
    
} catch (Exception $e) {
    error_log("Delete cart item error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to remove item from cart'
    ]);
}

?>