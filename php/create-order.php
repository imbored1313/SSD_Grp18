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

    // FIX: Validate and sanitize PayPal response before output
    $paypalData = json_decode($orderResponse, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid response from PayPal');
    }

    // Validate that we got expected PayPal response structure
    if (!isset($paypalData['id']) || !isset($paypalData['status'])) {
        throw new Exception('Unexpected PayPal response format');
    }

    // Only return sanitized, expected fields to prevent XSS
    $safeResponse = [
        'id' => $paypalData['id'],
        'status' => $paypalData['status'],
        'links' => []
    ];

    // Sanitize links if they exist
    if (isset($paypalData['links']) && is_array($paypalData['links'])) {
        foreach ($paypalData['links'] as $link) {
            if (isset($link['href']) && isset($link['rel'])) {
                // Validate URL format and ensure it's from PayPal
                if (
                    filter_var($link['href'], FILTER_VALIDATE_URL) &&
                    (strpos($link['href'], 'paypal.com') !== false || strpos($link['href'], 'sandbox.paypal.com') !== false)
                ) {
                    $safeResponse['links'][] = [
                        'href' => $link['href'],
                        'rel' => htmlspecialchars($link['rel'], ENT_QUOTES, 'UTF-8'),
                        'method' => isset($link['method']) ? htmlspecialchars($link['method'], ENT_QUOTES, 'UTF-8') : 'GET'
                    ];
                }
            }
        }
    }

    // Set proper content type header
    header('Content-Type: application/json');
    echo json_encode($safeResponse);
} catch (Exception $e) {
    error_log("PayPal order creation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Order creation failed']);
}
