<?php
session_start();
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    header('Location: index.html');
    exit;
}

require_once(__DIR__ . '/config.php');
$database = new Database();
$db = $database->getConnection();

$perPage = 50;
$page = isset($_GET['page']) && is_numeric($_GET['page']) && $_GET['page'] > 0 ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $perPage;

// --- Filter Logic ---
$filterUsername = trim($_GET['username'] ?? '');
$filterAction   = trim($_GET['action'] ?? '');
$filterDate     = trim($_GET['date'] ?? ''); // Format: YYYY-MM-DD

$where = [];
$params = [];

if ($filterUsername !== '') {
    $where[] = 'u.username LIKE :username';
    $params[':username'] = "%$filterUsername%";
}
if ($filterAction !== '') {
    $where[] = 'a.action LIKE :action';
    $params[':action'] = "%$filterAction%";
}
if ($filterDate !== '') {
    $where[] = 'DATE(a.timestamp) = :date';
    $params[':date'] = $filterDate;
}

$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

// --- Get Total Rows (with filters) ---
$countSql = "SELECT COUNT(*) FROM AuditLogs a LEFT JOIN Users u ON a.user_id = u.user_id $whereSql";
$countStmt = $db->prepare($countSql);
foreach ($params as $key => $val) $countStmt->bindValue($key, $val);
$countStmt->execute();
$totalRows = (int)$countStmt->fetchColumn();
$totalPages = (int)ceil($totalRows / $perPage);

// --- Get Logs (with filters, pagination) ---
$sql = "SELECT a.*, u.username 
        FROM AuditLogs a
        LEFT JOIN Users u ON a.user_id = u.user_id
        $whereSql
        ORDER BY a.timestamp DESC
        LIMIT :perPage OFFSET :offset";
$stmt = $db->prepare($sql);
foreach ($params as $key => $val) $stmt->bindValue($key, $val);
$stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$auditLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

// For retaining filter in URL/query
function filter_query($extra = []) {
    $query = $_GET;
    unset($query['page']); // Remove page unless it's set by pagination
    $query = array_merge($query, $extra);
    return '?' . http_build_query($query);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="website.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="admin-dashboard">
        <aside class="admin-sidebar">
            <ul class="admin-nav">
                <li><a href="admin_dashboard.php" class="active">Dashboard</a></li>
                <li><a href="admin_products.php">Products</a></li>
                <li><a href="admin_users.php">Users</a></li>
            </ul>
        </aside>
        <div class="container mt-5">
            <h1>👋 Welcome to the Admin Dashboard</h1>
            <a href="index.html" class="btn btn-primary">Back to Home</a>

            <h2 class="mt-5">Recent Audit Logs</h2>
            <!-- Filter Form -->
            <form class="row g-3 mb-4" method="get" action="">
                <div class="col-md-3">
                    <input type="text" class="form-control" name="username" placeholder="Filter by Username" value="<?= htmlspecialchars($filterUsername) ?>">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control" name="action" placeholder="Filter by Action" value="<?= htmlspecialchars($filterAction) ?>">
                </div>
                <div class="col-md-3">
                    <input type="date" class="form-control" name="date" value="<?= htmlspecialchars($filterDate) ?>">
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-success w-100">Filter</button>
                </div>
                <div class="col-md-1">
                    <a href="admin_dashboard.php" class="btn btn-secondary w-100">Reset</a>
                </div>
            </form>
            <div class="table-responsive">
                <table class="table table-striped table-bordered align-middle">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Admin Username</th>
                            <th>Action</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($auditLogs as $log): ?>
                            <tr>
                                <td><?= htmlspecialchars($log['timestamp']) ?></td>
                                <td><?= htmlspecialchars($log['username'] ?? 'N/A') ?></td>
                                <td><?= htmlspecialchars($log['action']) ?></td>
                                <td><?= htmlspecialchars($log['ip_addr']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (!$auditLogs): ?>
                            <tr><td colspan="4" class="text-center">No logs found for selected filters.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            <!-- Pagination Controls -->
            <nav>
                <ul class="pagination justify-content-center">
                    <?php if ($page > 1): ?>
                        <li class="page-item">
                            <a class="page-link" href="<?= filter_query(['page' => $page-1]) ?>">Previous</a>
                        </li>
                    <?php else: ?>
                        <li class="page-item disabled"><span class="page-link">Previous</span></li>
                    <?php endif; ?>

                    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <li class="page-item<?= ($i == $page) ? ' active' : '' ?>">
                            <a class="page-link" href="<?= filter_query(['page' => $i]) ?>"><?= $i ?></a>
                        </li>
                    <?php endfor; ?>

                    <?php if ($page < $totalPages): ?>
                        <li class="page-item">
                            <a class="page-link" href="<?= filter_query(['page' => $page+1]) ?>">Next</a>
                        </li>
                    <?php else: ?>
                        <li class="page-item disabled"><span class="page-link">Next</span></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </div>
</body>
</html>
