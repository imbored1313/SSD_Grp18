<?php
// ===== php/clear_cart.php =====
require_once(__DIR__ . '/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

logSessionDebug("=== CLEAR CART REQUEST ===");

try {
    // Check authentication
    $user = requireAuthentication();
    $user_id = $user['user_id'];
    
    logSessionDebug("Clearing cart for user: " . $user_id);
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Delete all cart items for user
    $deleteQuery = "DELETE FROM Cart WHERE user_id = :user_id";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $deleteStmt->execute();
    
    $deletedItems = $deleteStmt->rowCount();
    
    logSessionDebug("✅ Cart cleared successfully", ['deleted_items' => $deletedItems]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart cleared successfully',
        'deleted_items' => $deletedItems
    ]);
    
} catch (Exception $e) {
    logSessionDebug("❌ Clear cart error: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

?>