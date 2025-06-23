<?php
// config.php - Updated for your database schema
class Database {
    private $host = 'localhost';
    private $db_name = 'electraedge';
    private $username = 'user';
    private $password = 'SSD@group18';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                                $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }
        return $this->conn;
    }
}

// Security functions
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validatePassword($password) {
    if (strlen($password) < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!preg_match("/[A-Z]/", $password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!preg_match("/[a-z]/", $password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!preg_match("/[0-9]/", $password)) {
        return "Password must contain at least one digit";
    }
    if (!preg_match("/[!@#$%^&*(),.?\":{}|<>]/", $password)) {
        return "Password must contain at least one special character";
    }
    return true;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Start session securely
session_start();
session_regenerate_id(true);
?>

hello