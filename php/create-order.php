<?php
require_once(__DIR__ . '/ssrf_protection.php'); // Include the protection functions

$data = json_decode(file_get_contents('php://input'), true);
$amount = $data['amount'];
$clientId = $_SERVER['PAYPAL_CLIENT_ID'];
$clientSecret = $_SERVER['PAYPAL_CLIENT_SECRET'];

// Validate amount
if (!is_numeric($amount) || $amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid amount']);
    exit;
}

// Define allowed PayPal domains
$allowedDomains = [
    'api-m.sandbox.paypal.com',
    'api-m.paypal.com',
    'api.sandbox.paypal.com',
    'api.paypal.com'
];

try {
    // 1. Get access token - using secure curl wrapper
    $tokenUrl = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
    $tokenResponse = secureCurlExec($tokenUrl, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Accept-Language: en_US'
        ],
        CURLOPT_USERPWD => "$clientId:$clientSecret",
        CURLOPT_POSTFIELDS => "grant_type=client_credentials"
    ], $allowedDomains);
    
    $tokenData = json_decode($tokenResponse, true);
    if (!isset($tokenData['access_token'])) {
        throw new Exception('Failed to get access token');
    }
    
    $token = $tokenData['access_token'];
    
    // 2. Create order with SGD currency
    $orderData = [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'amount' => [
                'currency_code' => 'SGD',
                'value' => number_format($amount, 2, '.', '') // Ensure proper formatting
            ]
        ]]
    ];
    
    $orderUrl = 'https://api-m.sandbox.paypal.com/v2/checkout/orders';
    $orderResponse = secureCurlExec($orderUrl, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer $token"
        ],
        CURLOPT_POSTFIELDS => json_encode($orderData)
    ], $allowedDomains);
    
    echo $orderResponse;
    
} catch (Exception $e) {
    error_log("PayPal order creation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Order creation failed']);
}