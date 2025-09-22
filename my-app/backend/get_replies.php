<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Database configuration
require 'db.php'; // Ensure this file contains your database connection logic

$postId = isset($_GET['postId']) ? intval($_GET['postId']) : 0;
if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid postId."]);
    exit;
}

// Fetch replies
$sql = "SELECT id, post_id, user_id, username, text, created_at 
        FROM replies 
        WHERE post_id = ? 
        ORDER BY created_at ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $postId);
$stmt->execute();
$replyResult = $stmt->get_result();

$replies = [];

while ($reply = $replyResult->fetch_assoc()) {
    $replyId = $reply['id'];

    // Fetch media for this reply
    $mediaQuery = "SELECT media_url, media_type FROM reply_media WHERE reply_id = ?";
    $mediaStmt = $conn->prepare($mediaQuery);
    $mediaStmt->bind_param("i", $replyId);
    $mediaStmt->execute();
    $mediaResult = $mediaStmt->get_result();

    $mediaList = [];
    while ($media = $mediaResult->fetch_assoc()) {
        // Optionally prefix the file path if not a full URL
        if (!preg_match('/^https?:\/\//', $media['media_url'])) {
            $media['media_url'] = 'http://localhost/coolpage/my-app/uploads/' . $media['media_url'];
        }
        $mediaList[] = $media;
    }

    $reply['media'] = $mediaList;
    $replies[] = $reply;

    $mediaStmt->close();
}

echo json_encode([
    "success" => true,
    "replies" => $replies
]);

$stmt->close();
$conn->close();
?>
