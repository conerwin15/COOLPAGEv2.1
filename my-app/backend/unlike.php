<?php
// Handle CORS preflight (for OPTIONS requests)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    exit(0);
}

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Database connection
require 'db.php';

// Get POST data
$user_id = $_POST['user_id'] ?? null;
$target_id = $_POST['target_id'] ?? null;
$target_type = $_POST['target_type'] ?? null;

// Validate input
if (!$user_id || !$target_id || !$target_type) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Perform delete
$stmt = $conn->prepare("DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?");
$stmt->bind_param("iis", $user_id, $target_id, $target_type);
$success = $stmt->execute();
$stmt->close();

// Respond
echo json_encode(['success' => $success]);
?>
