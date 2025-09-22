<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

// ✅ Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$target_id = intval($data['target_id'] ?? 0);  // post or comment ID
$user_id   = intval($data['user_id'] ?? 0);    // user ID
$target_type = trim($data['target_type'] ?? 'post'); // "post" or "comment"

if ($target_id <= 0 || $user_id <= 0 || empty($target_type)) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// ✅ Check if like exists
$stmt = $conn->prepare("SELECT id FROM likes WHERE target_id = ? AND user_id = ? AND target_type = ?");
$stmt->bind_param("iis", $target_id, $user_id, $target_type);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // ✅ Unlike (delete row)
    $stmt = $conn->prepare("DELETE FROM likes WHERE target_id = ? AND user_id = ? AND target_type = ?");
    $stmt->bind_param("iis", $target_id, $user_id, $target_type);
    $stmt->execute();
    echo json_encode(["status" => "success", "message" => "Like removed"]);
} else {
    // ✅ Like (insert row)
    $stmt = $conn->prepare("INSERT INTO likes (user_id, target_id, target_type, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iis", $user_id, $target_id, $target_type);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Like added"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add like"]);
    }
}

$stmt->close();
$conn->close();
?>
