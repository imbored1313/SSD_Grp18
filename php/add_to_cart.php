<?php
// ===== php/add_to_cart.php =====
require_once(__DIR__ . '/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

logSessionDebug("=== ADD TO CART REQUEST ===");

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
    
    if ($quantity <= 0) {
        $quantity = 1;
    }
    
    logSessionDebug("Adding to cart", [
        'user_id' => $user_id,
        'product_id' => $product_id,
        'quantity' => $quantity
    ]);
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if product exists and get stock
    $productQuery = "SELECT product_id, name, stock FROM Products WHERE product_id = :product_id";
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
    
    // Check if item already exists in cart
    $checkQuery = "SELECT id, quantity FROM Cart WHERE user_id = :user_id AND product_id = :product_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $checkStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $checkStmt->execute();
    $existingItem = $checkStmt->fetch();
    
    if ($existingItem) {
        // Update existing cart item
        $newQuantity = $existingItem['quantity'] + $quantity;
        
        if ($newQuantity > $product['stock']) {
            throw new Exception("Cannot add more items. Maximum available: " . $product['stock']);
        }
        
        $updateQuery = "UPDATE Cart SET quantity = :quantity WHERE id = :cart_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':quantity', $newQuantity, PDO::PARAM_INT);
        $updateStmt->bindParam(':cart_id', $existingItem['id'], PDO::PARAM_INT);
        $updateStmt->execute();
        
        logSessionDebug("✅ Updated existing cart item", ['cart_id' => $existingItem['id'], 'new_quantity' => $newQuantity]);
    } else {
        // Add new cart item
        $insertQuery = "INSERT INTO Cart (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
        $insertStmt->execute();
        
        logSessionDebug("✅ Added new cart item", ['product_id' => $product_id, 'quantity' => $quantity]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Product added to cart successfully',
        'product_name' => $product['name']
    ]);
    
} catch (Exception $e) {
    error_log("Add to cart error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to add item to cart'
    ]);
}

?>