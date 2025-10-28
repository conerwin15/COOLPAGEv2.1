<?php
// delete_reply.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include your database connection file
require 'db.php'; // This file should contain: $conn = new mysqli(...)

// Ensure the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method. Only POST is allowed.']);
    exit;
}

// Get the reply_id and group_id from the POST data
$replyId = $_POST['reply_id'] ?? null;
$groupId = $_POST['group_id'] ?? null;

// Validate incoming data
if (!$replyId || !is_numeric($replyId) || !$groupId || !is_numeric($groupId)) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid reply ID or group ID.']);
    exit;
}

// Check for database connection
if (!$conn || $conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Prepare and execute the DELETE statement
// It now also checks the group_id for added security and data integrity
$deleteReply = $conn->prepare("DELETE FROM group_post_replies WHERE id = ? AND group_id = ?");

if (!$deleteReply) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare delete statement: ' . $conn->error]);
    $conn->close();
    exit;
}

$deleteReply->bind_param("ii", $replyId, $groupId); // "i" for integer type
$deleteReply->execute();

// Check if any row was affected
if ($deleteReply->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Reply deleted successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Reply not found or already deleted.']);
}

// Close the statement and connection
$deleteReply->close();
$conn->close();
exit;
?>