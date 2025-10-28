<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php'; // $conn = new mysqli(...)

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$postId = $_POST['post_id'] ?? null;
if (!$postId || !is_numeric($postId)) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid post ID']);
    exit;
}

if (!$conn || $conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

// Step 1: Delete replies tied to this post
$deleteReplies = $conn->prepare("DELETE FROM group_post_replies WHERE post_id = ?");
if (!$deleteReplies) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare delete for replies: ' . $conn->error]);
    exit;
}
$deleteReplies->bind_param("i", $postId);
$deleteReplies->execute();
$deleteReplies->close();

// Step 2: Delete the post itself
$deletePost = $conn->prepare("DELETE FROM group_posts WHERE id = ?");
if (!$deletePost) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare delete for post: ' . $conn->error]);
    exit;
}
$deletePost->bind_param("i", $postId);
$deletePost->execute();

if ($deletePost->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Post and related replies deleted']);
} else {
    echo json_encode(['success' => false, 'message' => 'Post not found or already deleted']);
}
$deletePost->close();
$conn->close();
exit;
