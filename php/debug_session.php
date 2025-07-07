<?php
// debug_session.php - Use this to debug your session and database
require_once(__DIR__ . '/config.php');

// Set content type
header('Content-Type: text/html; charset=utf-8');

echo "<h1>ElectraEdge Session & Database Debug</h1>";
echo "<style>body { font-family: Arial, sans-serif; margin: 20px; } .success { color: green; } .error { color: red; } .info { color: blue; } .section { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }</style>";

// 1. Check Database Connection
echo "<div class='section'>";
echo "<h2>1. Database Connection Test</h2>";
try {
    $database = new Database();
    $db = $database->getConnection();
    if ($db) {
        echo "<p class='success'>✅ Database connection successful!</p>";
        
        // Test each table
        $tables = ['Users', 'Products', 'Cart', 'Sessions'];
        foreach ($tables as $table) {
            try {
                $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
                $result = $stmt->fetch();
                echo "<p class='success'>✅ Table '$table': {$result['count']} records</p>";
            } catch (Exception $e) {
                echo "<p class='error'>❌ Table '$table': {$e->getMessage()}</p>";
            }
        }
    } else {
        echo "<p class='error'>❌ Database connection failed!</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Database error: " . $e->getMessage() . "</p>";
}
echo "</div>";

// 2. Check Session Status
echo "<div class='section'>";
echo "<h2>2. Session Status</h2>";
echo "<p><strong>Session Status:</strong> " . session_status() . "</p>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Session Data:</strong></p>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

$user = getUserFromSession();
if ($user) {
    echo "<p class='success'>✅ User session found:</p>";
    echo "<pre>" . print_r($user, true) . "</pre>";
} else {
    echo "<p class='info'>ℹ️ No user session found</p>";
}
echo "</div>";

// 3. Test Cart Query (if user is logged in)
if ($user && isset($user['user_id'])) {
    echo "<div class='section'>";
    echo "<h2>3. Cart Query Test</h2>";
    try {
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
                  WHERE c.user_id = :user_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user['user_id'], PDO::PARAM_INT);
        $stmt->execute();
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p class='success'>✅ Cart query successful! Found " . count($cartItems) . " items</p>";
        if (count($cartItems) > 0) {
            echo "<pre>" . print_r($cartItems, true) . "</pre>";
        }
    } catch (Exception $e) {
        echo "<p class='error'>❌ Cart query failed: " . $e->getMessage() . "</p>";
    }
    echo "</div>";
}

// 4. Test Products Query
echo "<div class='section'>";
echo "<h2>4. Products Query Test</h2>";
try {
    $query = "SELECT product_id, name, price, stock FROM Products LIMIT 5";
    $stmt = $db->query($query);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p class='success'>✅ Products query successful! Sample products:</p>";
    echo "<pre>" . print_r($products, true) . "</pre>";
} catch (Exception $e) {
    echo "<p class='error'>❌ Products query failed: " . $e->getMessage() . "</p>";
}
echo "</div>";

// 5. Session Functions Test
echo "<div class='section'>";
echo "<h2>5. Session Functions Test</h2>";
echo "<p><strong>isUserLoggedIn():</strong> " . (isUserLoggedIn() ? "Yes" : "No") . "</p>";
echo "<p><strong>getCurrentUserId():</strong> " . (getCurrentUserId() ?? "None") . "</p>";
echo "<p><strong>getCurrentUsername():</strong> " . (getCurrentUsername() ?? "None") . "</p>";
echo "</div>";

// 6. Create Test Session (if no user is logged in)
if (!$user) {
    echo "<div class='section'>";
    echo "<h2>6. Test Session Creation</h2>";
    echo "<p class='info'>No user logged in. You can manually create a test session by logging in through your login page.</p>";
    echo "<p>Or add some test data to your session:</p>";
    echo "<form method='post'>";
    echo "<button type='submit' name='create_test_session'>Create Test Session</button>";
    echo "</form>";
    
    if (isset($_POST['create_test_session'])) {
        $testUser = [
            'user_id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'first_name' => 'Test',
            'last_name' => 'User',
            'phone' => '123-456-7890',
            'role' => 'user',
            'is_verified' => true
        ];
        
        setUserSession($testUser);
        echo "<p class='success'>✅ Test session created! Refresh page to see results.</p>";
    }
    echo "</div>";
}

// 7. Clear Session
echo "<div class='section'>";
echo "<h2>7. Session Management</h2>";
echo "<form method='post' style='display: inline;'>";
echo "<button type='submit' name='clear_session' onclick='return confirm(\"Clear session?\")'>Clear Session</button>";
echo "</form>";

if (isset($_POST['clear_session'])) {
    clearUserSession();
    echo "<p class='success'>✅ Session cleared! Refresh page to see results.</p>";
}
echo "</div>";

echo "<hr>";
echo "<p><strong>Debug completed at:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>