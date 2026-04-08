<?php
header('Content-Type: application/json');
require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    echo json_encode([
        'success' => false,
        'message' => 'Please fill in all fields.'
    ]);
    exit;
}

$conn = getDB();

$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");

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
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid username or password.'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$user['id'],
        'username' => $user['username']
    ]
]);

$stmt->close();
$conn->close();
?>