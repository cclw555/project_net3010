<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'breakout_game');
define('DB_USER', 'root');
define('DB_PASS', '');

function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed.'
        ]);
        exit;
    }

    $conn->set_charset('utf8mb4');

    return $conn;
}
?>