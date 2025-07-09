<?php

$data = json_decode(file_get_contents('php://input'), true);
$amount = $data['amount'];
$clientId = 'AVyilJ6eWAp302gUQQDI6HVO19xtLy7OGAp7ZUDRwmKY__jhoV6M-Xvdb3-raWXW2uX7wLtLtEbj-nh4';
$clientSecret = 'EA6aWvSedTU2peoR7zMfdGY23CPEakYbDO4-DTNXSqGXBo_M1PIWLJd0rshmFrXKStV2avtfdmPSS2ih';

// 1. Get access token
$ch = curl_init('https://api-m.sandbox.paypal.com/v1/oauth2/token');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Accept: application/json','Accept-Language: en_US'],
  CURLOPT_USERPWD => "$clientId:$clientSecret",
  CURLOPT_POSTFIELDS => "grant_type=client_credentials"
]);
$res = curl_exec($ch);
curl_close($ch);
$token = json_decode($res, true)['access_token'];

// 2. Create order with SGD currency to match your SDK setup
$orderData = [
  'intent' => 'CAPTURE',
  'purchase_units' => [[
    'amount' => ['currency_code' => 'SGD', 'value' => $amount]  // Changed to SGD
  ]]
];

$ch = curl_init('https://api-m.sandbox.paypal.com/v2/checkout/orders');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "Authorization: Bearer $token"
  ],
  CURLOPT_POSTFIELDS => json_encode($orderData)
]);
$res = curl_exec($ch);
curl_close($ch);
echo $res; // returns full JSON including "id"