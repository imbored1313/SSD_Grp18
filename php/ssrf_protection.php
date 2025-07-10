<?php

/**
 * SSRF Prevention Functions
 * Add these functions to your application to prevent SSRF attacks
 */

/**
 * Validates if a URL is safe to make requests to
 * @param string $url The URL to validate
 * @return bool True if URL is safe, false otherwise
 */
function isUrlSafe($url) {
    // Parse the URL
    $parsed = parse_url($url);
    
    if (!$parsed || !isset($parsed['scheme']) || !isset($parsed['host'])) {
        return false;
    }
    
    // Only allow HTTP and HTTPS protocols
    if (!in_array(strtolower($parsed['scheme']), ['http', 'https'])) {
        return false;
    }
    
    // Get the IP address of the host
    $ip = gethostbyname($parsed['host']);
    
    // Block private/internal IP ranges
    if (isPrivateIP($ip)) {
        return false;
    }
    
    // Block localhost variations
    $blockedHosts = [
        'localhost', '127.0.0.1', '::1', '0.0.0.0',
        'local', 'internal', 'private'
    ];
    
    foreach ($blockedHosts as $blocked) {
        if (stripos($parsed['host'], $blocked) !== false) {
            return false;
        }
    }
    
    return true;
}

/**
 * Checks if an IP address is in a private/internal range
 * @param string $ip The IP address to check
 * @return bool True if IP is private/internal
 */
function isPrivateIP($ip) {
    // Convert to long integer for range checking
    $longIp = ip2long($ip);
    
    if ($longIp === false) {
        return true; // Invalid IP, consider it unsafe
    }
    
    // Private IP ranges (RFC 1918)
    $privateRanges = [
        ['10.0.0.0', '10.255.255.255'],         // 10.0.0.0/8
        ['172.16.0.0', '172.31.255.255'],       // 172.16.0.0/12
        ['192.168.0.0', '192.168.255.255'],     // 192.168.0.0/16
        ['127.0.0.0', '127.255.255.255'],       // Loopback
        ['169.254.0.0', '169.254.255.255'],     // Link-local
        ['224.0.0.0', '255.255.255.255']        // Multicast/Reserved
    ];
    
    foreach ($privateRanges as $range) {
        $start = ip2long($range[0]);
        $end = ip2long($range[1]);
        
        if ($longIp >= $start && $longIp <= $end) {
            return true;
        }
    }
    
    return false;
}

/**
 * Whitelist-based URL validation (recommended approach)
 * @param string $url The URL to validate
 * @param array $allowedDomains Array of allowed domains
 * @return bool True if URL domain is whitelisted
 */
function isUrlWhitelisted($url, $allowedDomains = []) {
    $parsed = parse_url($url);
    
    if (!$parsed || !isset($parsed['host'])) {
        return false;
    }
    
    // Default allowed domains for PayPal API (based on your code)
    if (empty($allowedDomains)) {
        $allowedDomains = [
            'api-m.sandbox.paypal.com',
            'api-m.paypal.com',
            'api.paypal.com',
            'api.sandbox.paypal.com'
        ];
    }
    
    $host = strtolower($parsed['host']);
    
    foreach ($allowedDomains as $domain) {
        if ($host === strtolower($domain)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Secure wrapper for curl_exec with SSRF protection
 * @param string $url The URL to request
 * @param array $options Additional curl options
 * @param array $allowedDomains Whitelist of allowed domains
 * @return string|false The response or false on failure
 */
function secureCurlExec($url, $options = [], $allowedDomains = []) {
    // Validate URL using whitelist approach (most secure)
    if (!isUrlWhitelisted($url, $allowedDomains)) {
        throw new Exception("URL not in whitelist: " . $url);
    }
    
    // Additional safety check
    if (!isUrlSafe($url)) {
        throw new Exception("Unsafe URL detected: " . $url);
    }
    
    // Initialize curl
    $ch = curl_init();
    
    // Set secure default options
    $defaultOptions = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,  // Don't follow redirects
        CURLOPT_MAXREDIRS => 0,          // No redirects
        CURLOPT_TIMEOUT => 30,           // 30 second timeout
        CURLOPT_CONNECTTIMEOUT => 10,    // 10 second connection timeout
        CURLOPT_SSL_VERIFYPEER => true,  // Verify SSL certificates
        CURLOPT_SSL_VERIFYHOST => 2,     // Verify SSL hostname
        CURLOPT_USERAGENT => 'SecureApp/1.0', // Set user agent
        CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS, // Only HTTP/HTTPS
    ];
    
    // Merge with provided options
    $curlOptions = array_merge($defaultOptions, $options);
    
    curl_setopt_array($ch, $curlOptions);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($response === false || !empty($error)) {
        throw new Exception("cURL error: " . $error);
    }
    
    // Check for successful HTTP response
    if ($httpCode < 200 || $httpCode >= 300) {
        throw new Exception("HTTP error: " . $httpCode);
    }
    
    return $response;
}

// Example usage in your existing code:
// Replace this vulnerable code:
// $res = curl_exec($ch);

// With this secure version:
/*
try {
    $allowedDomains = ['api-m.sandbox.paypal.com', 'api-m.paypal.com'];
    $res = secureCurlExec($url, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $postData
    ], $allowedDomains);
} catch (Exception $e) {
    error_log("SSRF protection blocked request: " . $e->getMessage());
    // Handle error appropriately
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}
*/

?>