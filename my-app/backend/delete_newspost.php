<?php
// delete_newspost.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

// Get ID from query string
parse_str($_SERVER['QUERY_STRING'], $query);
$id = $query['id'] ?? '';

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'Post ID is required']);
    exit;
}

// Delete associated media
$stmtMedia = $conn->prepare("SELECT media_url FROM newspost_media WHERE post_id = ?");
$stmtMedia->bind_param("i", $id);
$stmtMedia->execute();
$resultMedia = $stmtMedia->get_result();
while ($row = $resultMedia->fetch_assoc()) {
    if (file_exists($row['media_url'])) unlink($row['media_url']);
}
$stmtMedia->close();

// Delete media entries
$stmtDeleteMedia = $conn->prepare("DELETE FROM newspost_media WHERE post_id = ?");
$stmtDeleteMedia->bind_param("i", $id);
$stmtDeleteMedia->execute();
$stmtDeleteMedia->close();

// Delete post
$stmtPost = $conn->prepare("DELETE FROM newspost WHERE id = ?");
$stmtPost->bind_param("i", $id);
$stmtPost->execute();
$success = $stmtPost->affected_rows > 0;
$stmtPost->close();
$conn->close();

echo json_encode([
    'success' => $success,
    'message' => $success ? 'Post deleted' : 'Failed to delete post'
]);
?>
