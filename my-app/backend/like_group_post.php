<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    exit(0);
}
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

// Input
$user_id     = $_POST['user_id']     ?? null;
$group_id    = $_POST['group_id']    ?? null;
$target_id   = $_POST['target_id']   ?? null;
$target_type = $_POST['target_type'] ?? 'post';
$created_at  = date('Y-m-d H:i:s');

if (!$user_id || !$group_id || !$target_id || !$target_type) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

try {
    if ($target_type === 'reply') {
        // Check if already liked
        $check = $conn->prepare("SELECT id FROM group_reply_likes WHERE user_id = ? AND reply_id = ?");
        $check->bind_param("ii", $user_id, $target_id);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Already liked']);
            exit;
        }

        $insert = $conn->prepare("INSERT INTO group_reply_likes (user_id, reply_id, group_id, created_at) VALUES (?, ?, ?, ?)");
        $insert->bind_param("iiis", $user_id, $target_id, $group_id, $created_at);
    } else {
        // Check if already liked
        $check = $conn->prepare("SELECT id FROM group_post_likes WHERE user_id = ? AND target_id = ? AND target_type = ? AND group_id = ?");
        $check->bind_param("iisi", $user_id, $target_id, $target_type, $group_id);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Already liked']);
            exit;
        }

        $insert = $conn->prepare("INSERT INTO group_post_likes (user_id, target_id, target_type, created_at, group_id) VALUES (?, ?, ?, ?, ?)");
        $insert->bind_param("iissi", $user_id, $target_id, $target_type, $created_at, $group_id);
    }

    $insert->execute();

    if ($insert->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Liked']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Insert failed']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

$conn->close();
