<?php

// Set secure session cookie parameters for local development
session_set_cookie_params([
    'lifetime' => 3600, // 1 hour session lifetime
    'path' => '/',
    'domain' => null, // Use null for localhost to ensure proper cookie handling
    'secure' => false, // Set to true if using HTTPS
    'httponly' => true,
    'samesite' => 'Lax' // Use Lax for local development
]);

// config.php - Updated for your database schema
class Database
{
    private $host = 'db';
    private $db_name = 'electraedge';
    private $username = 'user';
    private $password = 'password';
    private $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }
        return $this->conn;
    }
}

// Security functions
function sanitizeInput($data)
{

    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validatePassword($password)
{

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

function validateEmail($email)
{

    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Start session securely (call this function in scripts that need a session)
function ensureSessionStarted()
{

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
        // Only regenerate session ID if it's a new session
        if (!isset($_SESSION['initialized'])) {
            session_regenerate_id(true);
            $_SESSION['initialized'] = true;
        }
    }
}
