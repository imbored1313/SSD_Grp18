<?php
require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);

if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$action = $_GET['action'] ?? '';
if ($action !== 'list') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->query("
        SELECT a.log_id, a.action, a.ip_addr, a.timestamp, u.username
        FROM AuditLogs a
        LEFT JOIN Users u ON a.user_id = u.user_id
        ORDER BY a.timestamp DESC
        LIMIT 100
    ");

    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
