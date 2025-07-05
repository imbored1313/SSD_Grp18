<?php
$data = json_decode(file_get_contents('php://input'), true);
$orderID = $data['orderID'];
$clientId = 'AVyilJ6eWAp302gUQQDI6HVO19xtLy7OGAp7ZUDRwmKY__jhoV6M-Xvdb3-raWXW2uX7wLtLtEbj-nh4';
$clientSecret = 'EA6aWvSedTU2peoR7zMfdGY23CPEakYbDO4-DTNXSqGXBo_M1PIWLJd0rshmFrXKStV2avtfdmPSS2ih';

// Fetch access token (same as above)
$ch = curl_init('https://api-m.sandbox.paypal.com/v1/oauth2/token');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_USERPWD => "$clientId:$clientSecret",
  CURLOPT_POSTFIELDS => "grant_type=client_credentials"
]);
$res = curl_exec($ch);
curl_close($ch);
$token = json_decode($res, true)['access_token'];

// Capture the order
$ch = curl_init("https://api-m.sandbox.paypal.com/v2/checkout/orders/$orderID/capture");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "Authorization: Bearer $token"
  ]
]);
$res = curl_exec($ch);
curl_close($ch);

echo $res; // returns capture details JSON
