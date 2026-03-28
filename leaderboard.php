<?php
header('Content-Type: application/json');
require_once 'db.php';

$pdo = getDB();

// Get top 20 scores (best score per user)
$stmt = $pdo->query('
    SELECT u.username,
           MAX(s.score) AS score,
           DATE(MAX(s.played_at)) AS date
    FROM scores s
    JOIN users u ON u.id = s.user_id
    GROUP BY s.user_id, u.username
    ORDER BY score DESC
    LIMIT 20
');

$rows = $stmt->fetchAll();

echo json_encode($rows);
