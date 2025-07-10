<?php
require_once(__DIR__ . '/config.php');
session_start();
session_regenerate_id(true);

if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
if ($action !== 'list') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

try {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $pageSize = 15;
    $offset = ($page - 1) * $pageSize;

    $database = new Database();
    $db = $database->getConnection();

    $totalStmt = $db->query("SELECT COUNT(*) FROM AuditLogs");
    $totalLogs = $totalStmt->fetchColumn();

    $stmt = $db->prepare("
        SELECT a.*, u.username 
        FROM AuditLogs a 
        LEFT JOIN Users u ON a.user_id = u.user_id 
        ORDER BY a.timestamp DESC 
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $targetTimezone = new DateTimeZone('Asia/Singapore');
    foreach ($logs as &$log) {
        if (!empty($log['timestamp'])) {
            $utcTime = new DateTime($log['timestamp'], new DateTimeZone('UTC'));
            $utcTime->setTimezone($targetTimezone);
            $log['timestamp'] = $utcTime->format('Y-m-d H:i:s');
        }
    }

    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'total' => (int)$totalLogs,
        'page' => $page,
        'pageSize' => $pageSize
    ]);
} catch (Exception $e) {
    error_log("Admin dashboard error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Dashboard operation failed']);
}
