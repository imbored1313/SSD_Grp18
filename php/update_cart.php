<?php
// ===== php/update_cart.php =====
require_once(__DIR__ . '/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

logSessionDebug("=== UPDATE CART REQUEST ===");

try {
    // Check authentication
    $user = requireAuthentication();
    $user_id = $user['user_id'];
    
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($input['product_id'] ?? 0);
    $quantity = intval($input['quantity'] ?? 1);
    
    if ($product_id <= 0) {
        throw new Exception("Invalid product ID");
    }
    
    if ($quantity < 0) {
        throw new Exception("Invalid quantity");
    }
    
    logSessionDebug("Updating cart item", [
        'user_id' => $user_id,
        'product_id' => $product_id,
        'quantity' => $quantity
    ]);
    
    $database = new Database();
    $db = $database->getConnection();
    
    // If quantity is 0, delete the item
    if ($quantity == 0) {
        $deleteQuery = "DELETE FROM Cart WHERE user_id = :user_id AND product_id = :product_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $deleteStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $deleteStmt->execute();
        
        logSessionDebug("✅ Removed cart item (quantity = 0)");
        
        echo json_encode([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
        exit;
    }
    
    // Check product stock
    $productQuery = "SELECT name, stock FROM Products WHERE product_id = :product_id";
    $productStmt = $db->prepare($productQuery);
    $productStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $productStmt->execute();
    $product = $productStmt->fetch();
    
    if (!$product) {
        throw new Exception("Product not found");
    }
    
    if ($product['stock'] < $quantity) {
        throw new Exception("Not enough stock available. Only " . $product['stock'] . " items left.");
    }
    
    // Update cart item
    $updateQuery = "UPDATE Cart SET quantity = :quantity WHERE user_id = :user_id AND product_id = :product_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $updateStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $updateStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $updateStmt->execute();
    
    if ($updateStmt->rowCount() == 0) {
        throw new Exception("Cart item not found");
    }
    
    logSessionDebug("✅ Cart item updated successfully");
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart updated successfully',
        'product_name' => $product['name']
    ]);
    
} catch (Exception $e) {
    logSessionDebug("❌ Update cart error: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

?>