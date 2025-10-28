<?php
// Show errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$group_id   = $data['group_id']   ?? null;
$user_id    = $data['user_id']    ?? null; // invited user
$invited_by = $data['invited_by'] ?? null;
$invited_at = date('Y-m-d H:i:s');

if (!$group_id || !$user_id || !$invited_by) {
    echo json_encode(['success' => false, 'message' => '❌ Missing parameters']);
    exit;
}

// ✅ Check if already in group or invited
$check = $conn->prepare("SELECT id, status FROM group_members WHERE group_id = ? AND user_id = ?");
$check->bind_param("ii", $group_id, $user_id);
$check->execute();
$result = $check->get_result();

if ($row = $result->fetch_assoc()) {
    if ($row['status'] === 'pending') {
        echo json_encode(['success' => false, 'message' => '⚠️ User already invited.']);
    } elseif ($row['status'] === 'accepted') {
        echo json_encode(['success' => false, 'message' => '✅ User already a member.']);
    } else {
        echo json_encode(['success' => false, 'message' => '⚠️ Invite record already exists.']);
    }
    $check->close();
    exit;
}
$check->close();

// ✅ Insert new invite
$stmt = $conn->prepare("
    INSERT INTO group_members (group_id, user_id, invited_by, status, invited_at)
    VALUES (?, ?, ?, 'pending', ?)
");
$stmt->bind_param("iiis", $group_id, $user_id, $invited_by, $invited_at);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => '✅ User invited successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => '❌ Failed to invite user.']);
}

$stmt->close();
$conn->close();
?>
