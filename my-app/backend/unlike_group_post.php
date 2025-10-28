<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

$user_id     = $_POST['user_id'] ?? null;
$group_id    = $_POST['group_id'] ?? null;
$target_id   = $_POST['target_id'] ?? null;
$target_type = $_POST['target_type'] ?? 'post';

if (!$user_id || !$group_id || !$target_id || !$target_type) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

if ($target_type === 'reply') {
    $stmt = $conn->prepare("DELETE FROM group_reply_likes WHERE user_id = ? AND reply_id = ? AND group_id = ?");
    $stmt->bind_param("iii", $user_id, $target_id, $group_id);
} else {
    $stmt = $conn->prepare("DELETE FROM group_post_likes WHERE user_id = ? AND target_id = ? AND target_type = ? AND group_id = ?");
    $stmt->bind_param("iisi", $user_id, $target_id, $target_type, $group_id);
}

$stmt->execute();
echo json_encode(['success' => $stmt->affected_rows > 0, 'message' => $stmt->affected_rows > 0 ? 'Unliked' : 'Like not found']);
$conn->close();
?>
