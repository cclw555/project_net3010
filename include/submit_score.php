<?php
header('Content-Type: application/json');
require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$userId = (int)($input['user_id'] ?? 0);
$score  = (int)($input['score'] ?? 0);

if ($userId <= 0 || $score < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data.'
    ]);
    exit;
}

$conn = getDB();

// Verify user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database query preparation failed.'
    ]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if (!$result->fetch_assoc()) {
    echo json_encode([
        'success' => false,
        'message' => 'User not found.'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();

// Insert score
$stmt = $conn->prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database query preparation failed.'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("ii", $userId, $score);
$stmt->execute();

echo json_encode([
    'success' => true
]);

$stmt->close();
$conn->close();
?>