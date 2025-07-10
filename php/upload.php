<?php

require_once(__DIR__ . '/config.php');
session_start();
if ($oldCsrfToken !== null) {
    $_SESSION['csrf_token'] = $oldCsrfToken;
}
session_regenerate_id(true);
if ($oldCsrfToken !== null) {
    $_SESSION['csrf_token'] = $oldCsrfToken;
}
// CSRF Token Check
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

// Admin check
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

// File upload settings
$uploadDir = "/var/www/html/uploads/";
$uploadPath = $uploadDir . "product_" . uniqid() . ".png";
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 2 * 1024 * 1024;
// 2MB

header('Content-Type: application/json');
try {
// Verify upload directory
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Failed to create upload directory. Check permissions.');
        }
    }

    if (!is_writable($uploadDir)) {
        throw new Exception('Upload directory is not writable. CHMOD to 755 or 775.');
    }

    // Check if file was uploaded
    if (empty($_FILES['productImage'])) {
        throw new Exception('No file uploaded or upload exceeded post_max_size');
    }

    $file = $_FILES['productImage'];
// Verify upload was successful
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $phpFileUploadErrors = [
            0 => 'There is no error, the file uploaded with success',
            1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
            2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
            3 => 'The uploaded file was only partially uploaded',
            4 => 'No file was uploaded',
            6 => 'Missing a temporary folder',
            7 => 'Failed to write file to disk.',
            8 => 'A PHP extension stopped the file upload.',
        ];
        throw new Exception($phpFileUploadErrors[$file['error']]);
    }

    // Validate file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mime, $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPG, PNG, and GIF are allowed.');
    }

    // Validate file size
    if ($file['size'] > $maxSize) {
        throw new Exception('File too large. Max size is 2MB.');
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('product_', true) . '.' . strtolower($extension);
    $destination = $uploadDir . $filename;
// Move the file with error handling
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        $error = error_get_last();
        throw new Exception('Failed to move uploaded file: ' . ($error['message'] ?? 'Unknown error'));
    }

    // Return relative path for web access
    $webPath = 'uploads/' . $filename;
    echo json_encode([
        'success' => true,
        'imagePath' => $webPath
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
