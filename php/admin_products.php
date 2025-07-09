<?php

require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);
// Admin check
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$database = new Database();
$db = $database->getConnection();
// Validate action parameter
$allowedActions = ['list', 'create', 'get', 'update', 'delete'];
$action = $_GET['action'] ?? '';
if (!in_array($action, $allowedActions, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

header('Content-Type: application/json');
try {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];

    switch ($action) {
        case 'list':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      $stmt = $db->query("
        SELECT p.*, u.username as added_by_username 
        FROM Products p
        LEFT JOIN Users u ON p.added_by = u.user_id
        ORDER BY p.product_id DESC
    ");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Prepend server address to image paths if they're not already full URLs
            foreach ($products as &$product) {
                if (!empty($product['image_path']) && !filter_var($product['image_path'], FILTER_VALIDATE_URL)) {
                    $product['image_path'] = $protocol . '://' . $host . '/uploads/' . rawurlencode(ltrim(basename($product['image_path']), '/'));
                }
            }

                echo json_encode($products);

            break;
        case 'create':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      $data = json_decode(file_get_contents('php://input'), true);
            $data = array_map('trim', $data);
            $data = array_map(function ($v) {

                return is_string($v) ? trim($v) : $v;
            }, $data);
            $required = ['name', 'price', 'stock'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }

            $stmt = $db->prepare("
        INSERT INTO Products 
        (name, description, price, stock, image_path, added_by) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
            $success = $stmt->execute([
                $data['name'],
                $data['description'] ?? null,
                $data['price'],
                $data['stock'],
                isset($data['image_path']) ? basename($data['image_path']) : null,
                $_SESSION['user']['user_id']
            ]);

            if ($success) {
               // Direct SQL audit log (CREATE)
               $logQuery = 'INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                            VALUES (?, ?, NOW(), ?)';
               $logStmt = $db->prepare($logQuery);
               $logStmt->bindValue(':user_id', $_SESSION['user']['user_id']);
               $logStmt->bindValue(':action', "PRODUCT_CREATE: " . $data['name']);
               $logStmt->bindValue(':ip_addr', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
               $logStmt->execute();
            }

            echo json_encode([
                'success' => $success,
                'product_id' => $db->lastInsertId()
            ]);

            break;
        case 'get':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            if (!$id) {
                throw new Exception('Invalid product ID');
            }

            $stmt = $db->prepare("SELECT * FROM Products WHERE product_id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$product) {
                throw new Exception('Product not found');
            }

        // Prepend full URL to image_path if not a full URL
            if (!empty($product['image_path']) && !filter_var($product['image_path'], FILTER_VALIDATE_URL)) {
                $product['image_path'] = $protocol . '://' . $host . '/uploads/' . rawurlencode(ltrim(basename($product['image_path']), '/'));
            }

            echo json_encode($product);

            break;
        case 'update':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            if (!$id) {
                throw new Exception('Invalid product ID');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $data = array_map('trim', $data);
            $data = array_map(function ($v) {

                return is_string($v) ? trim($v) : $v;
            }, $data);
            $name = $data['name'] ?? null;
            $description = $data['description'] ?? null;
            $price = $data['price'] ?? null;
            $stock = $data['stock'] ?? null;
            $image_path = $data['image_path'] ?? null;
            if (empty($name) || !is_numeric($price) || !is_numeric($stock)) {
                throw new Exception('Invalid input data');
            }

            if (!$image_path) {
    // fallback to existing image if no new image provided
                $stmt = $db->prepare("SELECT image_path FROM Products WHERE product_id = ?");
                $stmt->execute([$id]);
                $existing = $stmt->fetch(PDO::FETCH_ASSOC);
                $image_path = isset($existing['image_path']) ? basename($existing['image_path']) : null;
            }

            $stmt = $db->prepare("
        UPDATE Products SET 
        name = ?, description = ?, price = ?, stock = ?, image_path = ?
        WHERE product_id = ?
    ");
            $success = $stmt->execute([
                $name,
                $description,
                $price,
                $stock,
                $image_path,
                $id
            ]);
            
            if ($success) {
               // Direct SQL audit log (UPDATE)
               $logQuery = 'INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                            VALUES (?, ?, NOW(), ?)';
               $logStmt = $db->prepare($logQuery);
               $logStmt->bindValue(':user_id', $_SESSION['user']['user_id']);
               $logStmt->bindValue(':action', "PRODUCT_UPDATE: " . $data['name']);
               $logStmt->bindValue(':ip_addr', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
               $logStmt->execute();
            }
            
            echo json_encode(['success' => $success]);

            break;
        case 'delete':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            if (!$id) {
                throw new Exception('Invalid product ID');
            }

            $stmt = $db->prepare("DELETE FROM Products WHERE product_id = ?");
            $success = $stmt->execute([$id]);

            
            if ($success) {
               // Direct SQL audit log (DELETE)
               $logQuery = 'INSERT INTO AuditLogs (user_id, action, timestamp, ip_addr) 
                            VALUES (?, ?, NOW(), ?)';
               $logStmt = $db->prepare($logQuery);
               $logStmt->bindValue(':user_id', $_SESSION['user']['user_id']);
               $logStmt->bindValue(':action', "PRODUCT_DELETE: " . $data['name']);
               $logStmt->bindValue(':ip_addr', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
               $logStmt->execute();
            }
            
            echo json_encode(['success' => $success]);

            break;
        default:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
