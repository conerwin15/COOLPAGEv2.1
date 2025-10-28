<?php
// Handle CORS preflight (for OPTIONS requests)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    exit(0);
}

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Include database connection
require 'db.php';

// Extract POST data
$user_id = $_POST['user_id'] ?? null;
$target_id = $_POST['target_id'] ?? null;
$target_type = $_POST['target_type'] ?? null;
$created_at = date('Y-m-d H:i:s');

// Validate input
if (!$user_id || !$target_id || !$target_type) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

// Check for existing like to prevent duplicates
$check = $conn->prepare("SELECT id FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?");
$check->bind_param("iis", $user_id, $target_id, $target_type);
$check->execute();
$result = $check->get_result();
if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Already liked']);
    $check->close();
    exit;
}
$check->close();

// Insert new like
$insert = $conn->prepare("INSERT INTO likes (user_id, target_id, target_type, created_at) VALUES (?, ?, ?, ?)");
$insert->bind_param("iiss", $user_id, $target_id, $target_type, $created_at);
$insert->execute();

// Response
if ($insert->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to like']);
}

// Cleanup
$insert->close();
$conn->close();
?>
