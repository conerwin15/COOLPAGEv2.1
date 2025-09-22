<?php
// your-backend-create-nested-reply-script.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php'; // Include your database connection file

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method. Only POST is allowed.']);
    exit;
}

// Get data from POST request
$postId = $_POST['post_id'] ?? null;
$userId = $_POST['user_id'] ?? null;
$content = $_POST['content'] ?? null;
$parentReplyId = $_POST['parent_reply_id'] ?? null; // New field

// Validate input
if (!$postId || !is_numeric($postId) || !$userId || !is_numeric($userId) || empty($content)) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid data: post_id, user_id, or content.']);
    exit;
}

// Parent reply ID is optional, but if provided, it must be numeric
if ($parentReplyId !== null && !is_numeric($parentReplyId)) {
    echo json_encode(['success' => false, 'message' => 'Invalid parent_reply_id.']);
    exit;
}

if (!$conn || $conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$insertReply = $conn->prepare("INSERT INTO replies (post_id, user_id, content, parent_reply_id, created_at) VALUES (?, ?, ?, ?, NOW())");

if (!$insertReply) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare insert statement: ' . $conn->error]);
    $conn->close();
    exit;
}

// Bind parameters, handling parent_reply_id as an integer or NULL
$insertReply->bind_param("iisi", $postId, $userId, $content, $parentReplyId); // "iisi" for integer, integer, string, integer

$insertReply->execute();

if ($insertReply->affected_rows > 0) {
    $newReplyId = $conn->insert_id; // Get the ID of the newly inserted reply
    // Optionally fetch the full new reply to send back to the frontend
    // For simplicity, we just send a success message and the new ID
    echo json_encode([
        'success' => true,
        'message' => 'Reply added successfully.',
        'newReplyId' => $newReplyId
        // You might want to fetch and return the full new reply object here
        // to help the frontend update its state without a full refresh.
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add reply.']);
}

$insertReply->close();
$conn->close();
exit;
?>