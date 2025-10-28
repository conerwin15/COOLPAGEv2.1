<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include 'db.php';

$post_id = intval($_GET['post_id'] ?? 0);

if (!$post_id) {
    echo json_encode(['success' => false, 'message' => 'Missing post_id']);
    exit;
}

$replies = [];

// Get all replies for the post
$stmt = $conn->prepare("SELECT id, user_id, group_id, content, username, country, created_at FROM group_post_replies WHERE post_id = ? ORDER BY created_at ASC");
$stmt->bind_param("i", $post_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $reply_id = $row['id'];

    // Fetch any media for this reply
    $media_stmt = $conn->prepare("SELECT media_url, media_type FROM group_reply_media WHERE reply_id = ?");
    $media_stmt->bind_param("i", $reply_id);
    $media_stmt->execute();
    $media_result = $media_stmt->get_result();

    $media = [];
    while ($media_row = $media_result->fetch_assoc()) {
        $media[] = [
            'media_url' => $media_row['media_url'],
            'media_type' => $media_row['media_type'],
        ];
    }

    $replies[] = [
        'id' => $reply_id,
        'user_id' => $row['user_id'],
        'group_id' => $row['group_id'],
        'content' => $row['content'],
        'username' => $row['username'],
        'country' => $row['country'],
        'created_at' => $row['created_at'],
        'media' => $media,
    ];

    $media_stmt->close();
}

$stmt->close();

echo json_encode(['success' => true, 'replies' => $replies]);
