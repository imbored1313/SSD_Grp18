<?php
session_start();
require_once 'config.php';
if ($action == 'currentUser') {
    echo json_encode($_SESSION['user']);
    exit;
}


// ✅ Check: Only admin allowed
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$action = $_GET['action'] ?? '';

header('Content-Type: application/json');  // Always set JSON header

if ($action == 'list') {
    $stmt = $db->query("SELECT user_id, username, email, first_name, last_name, role, is_verified, created_at FROM Users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} elseif ($action == 'delete') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM Users WHERE user_id = ?");
        $success = $stmt->execute([$id]);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing user ID']);
    }
} elseif ($action == 'changerole') {
    $id = $_GET['id'] ?? null;
    $role = $_GET['role'] ?? null;
    if ($id && $role) {
        $stmt = $db->prepare("UPDATE Users SET role = ? WHERE user_id = ?");
        $success = $stmt->execute([$role, $id]);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
