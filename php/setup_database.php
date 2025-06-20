<?php
// setup_database.php - Updated for your schema
require_once 'config.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("❌ Database connection failed!");
    }

    // Create Users table (with username and email)
    $usersTable = "
    CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(20),
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME NULL,
        INDEX idx_email (email),
        INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Create Sessions table
    $sessionsTable = "
    CREATE TABLE IF NOT EXISTS Sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expiry_time DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Create AuditLogs table
    $auditTable = "
    CREATE TABLE IF NOT EXISTS AuditLogs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        target_id INT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_addr VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_timestamp (timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Create Products table
    $productsTable = "
    CREATE TABLE IF NOT EXISTS Products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        image_path VARCHAR(255),
        added_by INT,
        FOREIGN KEY (added_by) REFERENCES Users(user_id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_price (price)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Create Orders table
    $ordersTable = "
    CREATE TABLE IF NOT EXISTS Orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'paid', 'shipped', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Create Reviews table
    $reviewsTable = "
    CREATE TABLE IF NOT EXISTS Reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating TINYINT(1) CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_product_id (product_id),
        INDEX idx_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    // Execute table creation
    $db->exec($usersTable);
    echo "✅ Users table created successfully!<br>";
    
    $db->exec($sessionsTable);
    echo "✅ Sessions table created successfully!<br>";
    
    $db->exec($auditTable);
    echo "✅ AuditLogs table created successfully!<br>";
    
    $db->exec($productsTable);
    echo "✅ Products table created successfully!<br>";
    
    $db->exec($ordersTable);
    echo "✅ Orders table created successfully!<br>";
    
    $db->exec($reviewsTable);
    echo "✅ Reviews table created successfully!<br>";
    
    echo "<br><strong>🎉 All database tables created successfully!</strong><br>";
    echo "<br>Database Schema Implemented:<br>";
    echo "- Users (authentication)<br>";
    echo "- Sessions (secure session management)<br>";
    echo "- AuditLogs (security tracking)<br>";
    echo "- Products (e-commerce catalog)<br>";
    echo "- Orders (purchase tracking)<br>";
    echo "- Reviews (product reviews)<br>";
    echo "<br>You can now:<br>";
    echo "1. Test registration at: <a href='register.html'>register.html</a><br>";
    echo "2. Test login at: <a href='login.html'>login.html</a><br>";

} catch (Exception $e) {
    echo "❌ Error creating database tables: " . $e->getMessage();
}
?>