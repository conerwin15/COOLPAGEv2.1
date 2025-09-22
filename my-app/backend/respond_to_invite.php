<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
$action = isset($data['action']) ? $data['action'] : '';

if (!$group_id || !$user_id || !in_array($action, ['accept', 'decline'])) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid input.']);
    exit;
}

$status = $action === 'accept' ? 'accepted' : 'declined';

$sql = "UPDATE group_members SET status = ? WHERE group_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sii", $status, $group_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => "Invite has been $status."]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update invite status.']);
}

$stmt->close();
$conn->close();
?>