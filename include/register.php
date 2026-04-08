<?php
header('Content-Type: application/json');
require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

// Validate
if (strlen($username) < 2 || strlen($username) > 20) {
    echo json_encode([
        'success' => false,
        'message' => 'Username must be 2-20 characters.'
    ]);
    exit;
}

if (strlen($password) < 4) {
    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 4 characters.'
    ]);
    exit;
}

$conn = getDB();

// Check if username exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database query preparation failed.'
    ]);
    exit;
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->fetch_assoc()) {
    echo json_encode([
        'success' => false,
        'message' => 'Username already taken.'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();

// Create user
$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database query preparation failed.'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("ss", $username, $hash);
$stmt->execute();

$userId = $conn->insert_id;

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$userId,
        'username' => $username
    ]
]);

$stmt->close();
$conn->close();
?>